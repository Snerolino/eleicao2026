#!/usr/bin/env node
/** FED-17: backfill somente fontes ALRS com evidência e identidade exatas. */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const ROOT = resolve(import.meta.dirname, '..');
const MANIFEST = resolve(ROOT, 'data/legislative-import/alrs-fed17/recovery-manifest.json');
const ENV_FILES = [resolve(ROOT, '.env.local'), '/home/lourenco/Projetos/raspador-candidados-2026/.env'];
const API = 'https://transparencia.al.rs.gov.br/parlamentares/votos-plenario/pesquisa';
const EVENTS = { alrs_pl134_2023: ['PL', 134, 2023], alrs_pl77_2025: ['PL', 77, 2025] };

export function decodeHtmlAttribute(value) {
  return value.replace(/&quot;|&#34;|&#x22;/gi, '"').replace(/&apos;|&#39;|&#x27;/gi, "'").replace(/&lt;|&#60;|&#x3c;/gi, '<').replace(/&gt;|&#62;|&#x3e;/gi, '>').replace(/&amp;|&#38;|&#x26;/gi, '&').replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16))).replace(/&#([0-9]+);/g, (_, decimal) => String.fromCodePoint(Number.parseInt(decimal, 10)));
}

export function parseDataItems(html) {
  return [...html.matchAll(/\bdata-item(?![\w:-])\s*=\s*(["'])([\s\S]*?)\1/gi)].map((match) => JSON.parse(decodeHtmlAttribute(match[2])));
}

export function normalizeVote(value) {
  return ({ Sim: 'sim', 'Não': 'nao', 'Abstenção': 'abstencao', Ausente: 'ausente', Obstrução: 'obstrucao' })[String(value).trim()] ?? null;
}

export function isoDate(value) {
  const match = String(value).match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?/);
  if (!match) throw new Error(`data ALRS inválida: ${value}`);
  return `${match[3]}-${match[2]}-${match[1]}T${match[4] ?? '00'}:${match[5] ?? '00'}:00Z`;
}

function loadEnv() {
  const env = {};
  for (const file of ENV_FILES) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      const text = line.trim(); if (!text || text.startsWith('#')) continue;
      const index = text.indexOf('='); if (index < 0) continue;
      env[text.slice(0, index).trim()] = text.slice(index + 1).trim().replace(/^["']|["']$/g, '');
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

async function fetchSource(source) {
  const response = await fetch(source.url, { headers: { 'user-agent': 'eleicao2026-source-recovery/1.0', accept: 'text/html' } });
  const body = await response.text();
  const hash = `sha256:${createHash('sha256').update(body, 'utf8').digest('hex')}`;
  if (response.status !== 200 || Buffer.byteLength(body, 'utf8') !== source.bytes || hash !== source.sha256) throw new Error(`evidência mudou para ${source.url}: HTTP ${response.status}, bytes ${body.length}, hash ${hash}`);
  return parseDataItems(body);
}

export function selectExactEvidence(items, eventId, expectedDate, expectedVote) {
  const [type, number, year] = EVENTS[eventId];
  const matches = items.filter((item) => String(item.tipoProjeto).trim() === type && Number(item.numProposicao) === number && Number(item.anoProposicao) === year && isoDate(item.dataVotacao).slice(0, 10) === String(expectedDate).slice(0, 10));
  if (matches.length !== 1) return { ok: false, reason: `expected_one_match_got_${matches.length}` };
  const value = normalizeVote(matches[0].voto);
  if (!value || value !== expectedVote) return { ok: false, reason: `vote_mismatch_${value ?? 'invalid'}_vs_${expectedVote}` };
  return { ok: true, item: matches[0] };
}

async function main() {
  const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
  const env = loadEnv();
  const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
  const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Credenciais Supabase ausentes');
  const sb = createClient(url, key, { auth: { persist: false } });
  const sources = new Map(manifest.sources.map((source) => [source.tse_candidate_id, source]));
  const [candidates, events, votes, existingSources] = await Promise.all([
    allRows(sb, 'candidates', 'id,tse_candidate_id'),
    allRows(sb, 'voting_events', 'id,external_id,occurred_at,house'),
    allRows(sb, 'legislative_votes', 'id,voting_event_id,candidate_id,value,source_reference_id'),
    allRows(sb, 'source_references', 'id,url,content_hash'),
  ]);
  const candidateTse = new Map(candidates.map((row) => [row.id, String(row.tse_candidate_id)]));
  const eventByExternal = new Map(events.filter((row) => row.house === 'alrs').map((row) => [row.external_id, row]));
  const sourceByUrl = new Map(existingSources.filter((row) => row.url).map((row) => [row.url, row]));
  const pageItems = new Map();
  for (const source of manifest.sources) pageItems.set(source.tse_candidate_id, await fetchSource(source));

  const plan = [];
  for (const eventId of manifest.eligible_events) {
    const event = eventByExternal.get(eventId);
    if (!event) throw new Error(`evento remoto ausente: ${eventId}`);
    for (const vote of votes.filter((row) => row.voting_event_id === event.id && row.source_reference_id === null)) {
      const tse = candidateTse.get(vote.candidate_id);
      const source = sources.get(tse);
      if (!source) continue;
      const evidence = selectExactEvidence(pageItems.get(tse), eventId, event.occurred_at, vote.value);
      if (!evidence.ok) throw new Error(`${eventId}/${tse}: ${evidence.reason}`);
      plan.push({ voteId: vote.id, eventId, tseCandidateId: tse, sourceUrl: source.url, sourceHash: source.sha256 });
    }
  }
  const sourceRows = [...new Map(plan.map((row) => [row.sourceUrl, row])).values()].map((row) => ({ source_name: 'Portal da Transparência ALRS — Votos em Plenário', source_category: 'oficial', url: row.sourceUrl, content_hash: row.sourceHash }));
  const existingPlan = plan.filter((row) => sourceByUrl.has(row.sourceUrl));
  const report = { mode: process.argv.includes('--apply') ? 'apply' : 'dry-run', eligible_events: manifest.eligible_events, planned_votes: plan.length, planned_sources: sourceRows.length, existing_sources: existingPlan.length, blocked_events: manifest.blocked_events.length, blocked_identity: manifest.blocked_identity.length };
  if (!process.argv.includes('--apply')) { console.log(JSON.stringify(report, null, 2)); return; }
  for (const row of sourceRows) {
    if (!sourceByUrl.has(row.url)) {
      const { data, error } = await sb.from('source_references').insert(row).select('id,url').single();
      if (error) throw error;
      sourceByUrl.set(data.url, data);
    }
  }
  let updated = 0;
  for (const row of plan) {
    const source = sourceByUrl.get(row.sourceUrl);
    const { error } = await sb.from('legislative_votes').update({ source_reference_id: source.id }).eq('id', row.voteId).is('source_reference_id', null);
    if (error) throw error;
    updated += 1;
  }
  console.log(JSON.stringify({ ...report, updated_votes: updated }, null, 2));
}

if (process.argv[1]?.endsWith('backfill-alrs-missing-sources.mjs')) main().catch((error) => { console.error(`FED-17: ${error.message}`); process.exitCode = 1; });
