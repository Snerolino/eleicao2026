#!/usr/bin/env node
/** FED-21: writer factual Câmara Q1; dry-run por padrão, sem impacto editorial. */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const ROOT = resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const argValue = (name, fallback) => args.find((arg) => arg.startsWith(`${name}=`))?.slice(name.length + 1) || fallback;
const ENVELOPE = resolve(ROOT, argValue('--envelope', 'data/legislative-import/camara/collector-2026-q1/resolved-envelope.json'));
const CATALOG = resolve(ROOT, argValue('--catalog', 'data/legislative-import/camara/collector-2026-q1/resolved-catalog.json'));
const ENV_FILES = [resolve(ROOT, '.env.local'), '/home/lourenco/Projetos/raspador-candidados-2026/.env'];

function loadEnv() {
  const env = {};
  for (const file of ENV_FILES) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      const text = line.trim(); if (!text || text.startsWith('#')) continue;
      const i = text.indexOf('='); if (i < 0) continue;
      env[text.slice(0, i).trim()] = text.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    }
  }
  return env;
}

async function allRows(sb, table, select) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb.from(table).select(select).range(from, from + 999);
    if (error) throw error;
    rows.push(...(data ?? []));
    if ((data ?? []).length < 1000) return rows;
  }
}

function inc() { return { legislative_propositions: 0, proposition_versions: 0, voting_events: 0, legislative_votes: 0 }; }

async function findOrCreate(sb, table, where, row, apply, report) {
  const synthetic = Object.values(where).some((value) => String(value).startsWith('dry-run-'));
  if (!apply && synthetic) {
    report.planned[table] += 1;
    return { ...row, id: `dry-run-${table}-${report.planned[table]}` };
  }
  const { data: existing, error } = await sb.from(table).select('*').match(where).maybeSingle();
  if (error) throw error;
  if (existing) {
    report.existing[table] += 1;
    if (apply) {
      const patch = {};
      for (const [key, value] of Object.entries(row)) if (value !== undefined && value !== null && existing[key] === null) patch[key] = value;
      if (Object.keys(patch).length) {
        const { error: updateError } = await sb.from(table).update(patch).eq('id', existing.id);
        if (updateError) throw updateError;
        report.updated[table] += 1;
      }
    }
    return existing;
  }
  report.planned[table] += 1;
  if (!apply) return { ...row, id: `dry-run-${table}-${report.planned[table]}` };
  const { data, error: insertError } = await sb.from(table).insert(row).select('*').single();
  if (insertError) throw insertError;
  report.inserted[table] += 1;
  return data;
}

async function main() {
  const apply = process.argv.includes('--apply');
  const envelope = JSON.parse(readFileSync(ENVELOPE, 'utf8'));
  const catalog = JSON.parse(readFileSync(CATALOG, 'utf8'));
  const env = loadEnv();
  const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
  const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Credenciais Supabase ausentes');
  const sb = createClient(url, key, { auth: { persist: false } });
  const sourceRows = await allRows(sb, 'source_references', 'id,url');
  const sources = new Map(sourceRows.filter((row) => row.url).map((row) => [row.url, row.id]));
  const report = { mode: apply ? 'apply' : 'dry-run', planned: inc(), inserted: inc(), updated: inc(), existing: inc(), votes_touched: 0, impact_touched: false };
  const eventByExternal = new Map();

  for (const proposition of envelope.propositions) {
    const prop = await findOrCreate(sb, 'legislative_propositions', { house: proposition.house, external_id: proposition.external_id }, {
      house: proposition.house, external_id: proposition.external_id, proposition_type: proposition.proposition_type,
      number: proposition.number, year: proposition.year, title: proposition.title, official_url: proposition.official_url,
    }, apply, report);
    for (const version of proposition.versions ?? []) {
      const versionSource = sources.get(version.source);
      if (!versionSource) throw new Error(`source version ausente: ${version.source}`);
      const v = await findOrCreate(sb, 'proposition_versions', { proposition_id: prop.id, version_key: version.version_key }, {
        proposition_id: prop.id, version_key: version.version_key, version_label: version.version_label,
        text_hash: version.text_hash, source_reference_id: versionSource, effective_from: version.effective_from,
      }, apply, report);
      for (const event of version.voting_events ?? []) {
        const eventSource = sources.get(event.source);
        if (!eventSource) throw new Error(`source event ausente: ${event.source}`);
        const ev = await findOrCreate(sb, 'voting_events', { house: event.house, external_id: event.external_id }, {
          proposition_version_id: v.id, house: event.house, external_id: event.external_id, session_id: event.session_id,
          vote_round: event.vote_round, occurred_at: event.occurred_at, source_reference_id: eventSource,
        }, apply, report);
        eventByExternal.set(event.external_id, ev);
      }
    }
  }

  for (const vote of envelope.votes) {
    const candidateId = catalog.legislatorsToCandidateId[vote.deputy_id];
    if (!candidateId) throw new Error(`candidate FK ausente: ${vote.deputy_id}`);
    const voteSource = sources.get(vote.source);
    if (!voteSource) throw new Error(`source vote ausente: ${vote.source}`);
    const eventExternal = vote.voting_event_id.split(':').pop();
    const event = eventByExternal.get(eventExternal);
    if (!event) throw new Error(`evento ausente: ${eventExternal}`);
    if (!apply && String(event.id).startsWith('dry-run-')) {
      report.planned.legislative_votes += 1;
      continue;
    }
    const existing = await sb.from('legislative_votes').select('*').match({ voting_event_id: event.id, candidate_id: candidateId }).maybeSingle();
    if (existing.error) throw existing.error;
    if (existing.data) {
      report.existing.legislative_votes += 1;
      if (existing.data.value !== vote.value) throw new Error(`conflito factual ${eventExternal}/${vote.deputy_id}: remoto=${existing.data.value}, envelope=${vote.value}`);
      if (apply && existing.data.source_reference_id === null) {
        const { error } = await sb.from('legislative_votes').update({ source_reference_id: voteSource }).eq('id', existing.data.id);
        if (error) throw error;
        report.updated.legislative_votes += 1;
        report.votes_touched += 1;
      }
      continue;
    }
    report.planned.legislative_votes += 1;
    if (apply) {
      const { error } = await sb.from('legislative_votes').insert({ voting_event_id: event.id, candidate_id: candidateId, legislator_id: null, value: vote.value, recorded_at: vote.recorded_at, source_reference_id: voteSource }).select('id').single();
      if (error) throw error;
      report.inserted.legislative_votes += 1;
      report.votes_touched += 1;
    }
  }
  console.log(JSON.stringify(report, null, 2));
}

if (process.argv[1]?.endsWith('apply-camara-q1-resolved.mjs')) main().catch((error) => { console.error(`FED-21 writer: ${error.message}`); process.exitCode = 1; });
