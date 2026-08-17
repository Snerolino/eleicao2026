#!/usr/bin/env node
/** Importa votos individuais ALRS; dry-run por padrão, --apply em lotes idempotentes. */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const ROOT = resolve(import.meta.dirname, '..');
const CACHE = resolve(ROOT, '.orchestrator/runtime/alrs-cache');
const CATALOG = resolve(ROOT, 'fixtures/legislative-import/alrs-id-catalog.json');
const CANDIDATES = resolve(ROOT, 'data/public-candidates.json');
const PLAN_CLI = resolve(ROOT, 'scripts/import-alrs-votes.mjs');
const ENV_FILES = [resolve(ROOT, '.env.local'), '/home/lourenco/Projetos/raspador-candidados-2026/.env'];
const PAGE = 1000;

function loadEnv() {
  const out = {};
  for (const file of ENV_FILES) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      const text = line.trim(); if (!text || text.startsWith('#')) continue;
      const i = text.indexOf('='); if (i < 0) continue;
      out[text.slice(0, i).trim()] = text.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    }
  }
  return out;
}
function digest(text) { return createHash('sha256').update(text).digest('hex'); }
function hash(text) { return `sha256:${digest(text)}`; }
function slugId(text, prefix) { return `${prefix}_${digest(text).slice(0, 24)}`; }
function propositionType(value) {
  const normalized = String(value).trim().toLowerCase();
  if (normalized === 'pec') return 'pec';
  if (normalized === 'plp') return 'plp';
  if (normalized === 'pdl') return 'pld';
  if (normalized === 'pl' || normalized === 'plc') return 'pl';
  if (normalized === 'lei') return 'lei';
  return 'outro';
}
function isoDate(value) {
  const m = String(value).match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?/);
  if (!m) throw new Error(`Data ALRS inválida: ${value}`);
  return `${m[3]}-${m[2]}-${m[1]}T${m[4] ?? '00'}:${m[5] ?? '00'}:00Z`;
}
function collectPlans() {
  const files = readdirSync(CACHE).filter((name) => /\d+-\d{4}\.html$/.test(name)).map((name) => resolve(CACHE, name)).filter((file) => readFileSync(file, 'utf8').includes('data-item'));
  const votes = [];
  for (const file of files) {
    const [, solicitante, ano] = file.match(/(\d+)-(\d{4})\.html$/);
    const raw = execFileSync(process.execPath, [PLAN_CLI, '--solicitante', solicitante, '--ano', ano, '--catalog', CATALOG, '--candidates', CANDIDATES, '--html', file, '--json'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    votes.push(...JSON.parse(raw).votes);
  }
  return [...new Map(votes.map((vote) => [vote.idempotency_key, vote])).values()];
}
async function allRows(sb, table, select) {
  const rows = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await sb.from(table).select(select).range(from, from + PAGE - 1);
    if (error) throw error;
    rows.push(...(data ?? []));
    if ((data ?? []).length < PAGE) return rows;
  }
}
async function insertBatches(sb, table, records, select) {
  const inserted = [];
  for (let i = 0; i < records.length; i += 100) {
    const { data, error } = await sb.from(table).insert(records.slice(i, i + 100)).select(select);
    if (error) throw error;
    inserted.push(...(data ?? []));
  }
  return inserted;
}
async function main() {
  const apply = process.argv.includes('--apply');
  const e = loadEnv(); const url = e.VITE_SUPABASE_URL || e.SUPABASE_URL; const key = e.SUPABASE_SECRET_KEY || e.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Credenciais Supabase ausentes');
  const sb = createClient(url, key, { auth: { persist: false } });
  const votes = collectPlans();
  const [remoteCandidates, remoteSources, remoteProps, remoteVersions, remoteEvents, remoteVotes] = await Promise.all([
    allRows(sb, 'candidates', 'id,tse_candidate_id'),
    allRows(sb, 'source_references', 'id,url,content_hash'),
    allRows(sb, 'legislative_propositions', 'id,external_id,house'),
    allRows(sb, 'proposition_versions', 'id,proposition_id,version_key'),
    allRows(sb, 'voting_events', 'id,external_id,house'),
    allRows(sb, 'legislative_votes', 'id,voting_event_id,candidate_id'),
  ]);
  const candidates = new Map(remoteCandidates.filter((x) => x.tse_candidate_id).map((x) => [String(x.tse_candidate_id), x.id]));
  const sources = new Map(remoteSources.filter((x) => x.url).map((x) => [x.url, x.id]));
  const props = new Map(remoteProps.filter((x) => x.house === 'alrs').map((x) => [x.external_id, x.id]));
  const versions = new Map(remoteVersions.map((x) => [`${x.proposition_id}|${x.version_key}`, x.id]));
  const events = new Map(remoteEvents.filter((x) => x.house === 'alrs').map((x) => [x.external_id, x.id]));
  const existingVotes = new Set(remoteVotes.map((x) => `${x.voting_event_id}|${x.candidate_id}`));
  const sourceRows = new Map(); const propRows = new Map(); const versionRows = new Map(); const eventRows = new Map(); const voteRows = new Map();
  let unresolved = 0;
  for (const vote of votes) {
    const candidateId = candidates.get(String(vote.tse_candidate_id)); if (!candidateId) { unresolved += 1; continue; }
    const n = vote.natural_key;
    const sourceKey = n.source_url;
    if (!sources.has(sourceKey)) sourceRows.set(sourceKey, { source_name: 'Portal da Transparência ALRS — Votos em Plenário', source_category: 'oficial', url: sourceKey, content_hash: vote.source.content_hash });
    const propKey = slugId(`${n.tipo_projeto}|${n.num_proposicao}|${n.ano_proposicao}|${n.materia_hash}`, 'alrs_prop');
    if (!props.has(propKey)) propRows.set(propKey, { external_id: propKey, house: 'alrs', proposition_type: propositionType(n.tipo_projeto), number: Number.parseInt(n.num_proposicao, 10) || null, year: Number.parseInt(n.ano_proposicao, 10) || null, title: vote.materia, official_url: n.source_url });
    const propId = props.get(propKey) || propKey;
    const versionKey = `${propId}|${n.materia_hash}`;
    if (!versions.has(versionKey)) versionRows.set(versionKey, { proposition_key: propKey, proposition_id: propId, version_key: n.materia_hash, version_label: 'Registro ALRS', text_hash: n.materia_hash, effective_from: isoDate(n.data_votacao), source_url: n.source_url });
    const versionId = versions.get(versionKey) || versionKey;
    const eventKey = slugId(`${propKey}|${n.data_votacao}|${vote.resultado_votacao}`, 'alrs_event');
    if (!events.has(eventKey)) eventRows.set(eventKey, { external_id: eventKey, proposition_key: propKey, version_id: versionId, house: 'alrs', occurred_at: isoDate(n.data_votacao), vote_round: 'nominal', source_url: n.source_url });
    const eventId = events.get(eventKey) || eventKey;
    voteRows.set(`${eventId}|${candidateId}`, { eventKey, candidateId, value: vote.value, recorded_at: isoDate(n.data_votacao), sourceKey });
  }
  if (!apply) {
    const plannedExisting = [...voteRows.values()].filter((row) => existingVotes.has(`${events.get(row.eventKey) || row.eventKey}|${row.candidateId}`)).length;
    console.log(JSON.stringify({ mode: 'dry-run', collected_votes: votes.length, unresolved, source_rows: sourceRows.size, proposition_rows: propRows.size, version_rows: versionRows.size, event_rows: eventRows.size, unique_vote_rows: voteRows.size, already_existing_votes: plannedExisting, new_vote_rows: voteRows.size - plannedExisting }, null, 2));
    return;
  }
  const insertedSources = await insertBatches(sb, 'source_references', [...sourceRows.values()], 'id,url');
  for (const row of insertedSources) sources.set(row.url, row.id);
  const propsToInsert = [...propRows.values()].map(({ proposition_key, ...row }) => row);
  const insertedProps = await insertBatches(sb, 'legislative_propositions', propsToInsert, 'id,external_id');
  for (const row of insertedProps) props.set(row.external_id, row.id);
  const versionsToInsert = [...versionRows.values()].map(({ proposition_key, proposition_id, source_url, ...row }) => ({ ...row, proposition_id: props.get(proposition_key) }));
  const insertedVersions = await insertBatches(sb, 'proposition_versions', versionsToInsert, 'id,proposition_id,version_key');
  for (const row of insertedVersions) versions.set(`${row.proposition_id}|${row.version_key}`, row.id);
  const eventsToInsert = [...eventRows.values()].map(({ proposition_key, version_id, source_url, ...row }) => ({ ...row, proposition_version_id: versions.get(`${props.get(proposition_key)}|${version_id.split('|').pop()}`) || version_id }));
  const insertedEvents = await insertBatches(sb, 'voting_events', eventsToInsert, 'id,external_id');
  for (const row of insertedEvents) events.set(row.external_id, row.id);
  const votesToInsert = [];
  for (const row of voteRows.values()) {
    const eventId = events.get(row.eventKey); const key = `${eventId}|${row.candidateId}`;
    if (existingVotes.has(key)) continue;
    votesToInsert.push({ voting_event_id: eventId, candidate_id: row.candidateId, legislator_id: null, value: row.value, recorded_at: row.recorded_at, source_reference_id: sources.get(row.sourceKey) || null });
  }
  const insertedVotes = await insertBatches(sb, 'legislative_votes', votesToInsert, 'id');
  console.log(JSON.stringify({ mode: 'apply', collected_votes: votes.length, inserted_sources: insertedSources.length, inserted_propositions: insertedProps.length, inserted_versions: insertedVersions.length, inserted_events: insertedEvents.length, inserted_votes: insertedVotes.length, unresolved }, null, 2));
}
main().catch((error) => { console.error(`ERRO: ${error.message}`); process.exit(1); });
