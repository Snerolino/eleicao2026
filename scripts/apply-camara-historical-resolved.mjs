#!/usr/bin/env node
/**
 * FED-27: writer factual histórico da Câmara.
 *
 * O contrato local é validado antes de qualquer consulta ou escrita remota.
 * O modo padrão é dry-run; somente --apply permite reconciliar as quatro
 * tabelas factuais legislativas. Fontes, matrizes, RPCs e dados editoriais
 * ficam fora do escopo deste writer.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { loadEnv, resolveExistingSources, validateSourceInput } from './apply-camara-q1-sources.mjs';

const ROOT = resolve(import.meta.dirname, '..');
const DEFAULTS = {
  envelope: resolve(ROOT, 'data/legislative-import/camara/historical-resolved-envelope.json'),
  catalog: resolve(ROOT, 'data/legislative-import/camara/historical-resolved-catalog.json'),
  sources: resolve(ROOT, 'data/legislative-import/camara/historical-source-catalog-input.json'),
  manifest: resolve(ROOT, 'data/legislative-import/camara/historical-resolved-source-manifest.json'),
};

const EXPECTED = { sources: 7, candidates: 18, blocked: 8, propositions: 2, versions: 6, events: 6, votes: 84 };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function fail(message) {
  throw new Error(`FED-27: ${message}`);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function loadHistoricalInputs(paths = DEFAULTS) {
  for (const [name, path] of Object.entries(paths)) if (!existsSync(path)) fail(`arquivo ${name} não encontrado: ${path}`);
  return {
    envelope: readJson(paths.envelope),
    catalog: readJson(paths.catalog),
    sources: readJson(paths.sources),
    manifest: readJson(paths.manifest),
  };
}

function parseTitle(title) {
  const match = /^(PEC|PL)\s+(\d+)\/(\d{4})$/i.exec(title?.trim() ?? '');
  if (!match) fail(`proposição sem número/ano oficial: ${title}`);
  return { proposition_type: match[1].toLowerCase(), number: Number(match[2]), year: Number(match[3]) };
}

function countEnvelope(envelope) {
  const propositions = envelope.propositions ?? [];
  const versions = propositions.flatMap((proposition) => proposition.versions ?? []);
  const events = versions.flatMap((version) => version.voting_events ?? []);
  return { propositions: propositions.length, versions: versions.length, events: events.length, votes: (envelope.votes ?? []).length };
}

function assertExactCounts(counts) {
  for (const key of ['propositions', 'versions', 'events', 'votes']) {
    if (counts[key] !== EXPECTED[key]) fail(`contagem ${key} inesperada: esperado ${EXPECTED[key]}, recebido ${counts[key]}`);
  }
}

function sourceUrlsFromEnvelope(envelope) {
  const urls = new Set();
  for (const proposition of envelope.propositions ?? []) {
    if (proposition.official_url) urls.add(proposition.official_url);
    for (const version of proposition.versions ?? []) {
      if (version.source) urls.add(version.source);
      for (const event of version.voting_events ?? []) if (event.source) urls.add(event.source);
    }
  }
  for (const vote of envelope.votes ?? []) if (vote.source) urls.add(vote.source);
  return urls;
}

/** Valida fontes, identidades e o envelope histórico sem Supabase. */
export function validateHistoricalContract({ envelope, catalog, sources, manifest }) {
  if (envelope?.schema_version !== '1.0.0' || envelope?.country !== 'BR' || envelope?.state !== 'RS') {
    fail('envelope histórico inválido');
  }

  const expectedSources = validateSourceInput(sources, manifest);
  if (expectedSources.length !== EXPECTED.sources || manifest.urls.length !== EXPECTED.sources) {
    fail(`mapeamento de source_reference incompleto: esperado exatamente ${EXPECTED.sources} fontes`);
  }
  const sourceByUrl = new Map(expectedSources.map((source) => [source.url, source]));
  const envelopeSourceUrls = sourceUrlsFromEnvelope(envelope);
  if (envelopeSourceUrls.size !== EXPECTED.sources || [...sourceByUrl.keys()].some((url) => !envelopeSourceUrls.has(url))) {
    fail(`fontes do envelope não cobrem exatamente as ${EXPECTED.sources} fontes oficiais`);
  }

  const candidateByTse = catalog?.candidateByTse;
  if (!candidateByTse || typeof candidateByTse !== 'object' || Array.isArray(candidateByTse)) fail('catálogo de candidatos inválido');
  const candidateEntries = Object.entries(candidateByTse);
  if (candidateEntries.length !== EXPECTED.candidates || catalog.eligible_identities !== EXPECTED.candidates) {
    fail(`mapeamento de candidatos elegíveis deve conter exatamente ${EXPECTED.candidates} entradas`);
  }
  if (catalog.blocked_exact_records !== EXPECTED.blocked) {
    fail(`identidades bloqueadas divergente: esperado exatamente ${EXPECTED.blocked}`);
  }
  for (const [tse, candidateId] of candidateEntries) {
    if (!/^\d+$/.test(tse) || !UUID.test(candidateId)) fail(`mapping TSE/UUID inválido: ${tse}`);
  }

  const counts = countEnvelope(envelope);
  assertExactCounts(counts);
  const seenCandidates = new Set();
  for (const proposition of envelope.propositions) {
    if (proposition.house !== 'camara') fail(`house inválida na proposição: ${proposition.external_id}`);
    parseTitle(proposition.title);
    if (!proposition.external_id || !Array.isArray(proposition.versions)) fail(`proposição histórica inválida: ${proposition.external_id}`);
    for (const version of proposition.versions) {
      if (!sourceByUrl.has(version.source)) fail(`fonte de versão ausente: ${version.source}`);
      for (const event of version.voting_events ?? []) if (!sourceByUrl.has(event.source)) fail(`fonte de evento ausente: ${event.source}`);
    }
  }
  for (const vote of envelope.votes) {
    const tse = String(vote.tse_candidate_id ?? '');
    const expectedCandidate = candidateByTse[tse];
    if (!expectedCandidate) fail(`identidade ausente ou bloqueada no catálogo: ${tse}`);
    if (vote.candidate_id !== expectedCandidate) fail(`candidate_id diverge do mapping TSE: ${tse}`);
    if (vote.deputy_id !== `camara-deputado-${expectedCandidate}`) fail(`deputy_id diverge do candidato resolvido: ${tse}`);
    if (!sourceByUrl.has(vote.source)) fail(`fonte de voto ausente: ${vote.source}`);
    seenCandidates.add(tse);
  }
  if (seenCandidates.size !== EXPECTED.candidates || candidateEntries.some(([tse]) => !seenCandidates.has(tse))) {
    fail(`votos não cobrem exatamente os ${EXPECTED.candidates} candidatos elegíveis`);
  }

  return { expectedSources, sourceByUrl, candidateByTse, counts };
}

function factualRows(envelope, sourceByUrl, candidateByTse) {
  const propositions = [];
  const versions = [];
  const events = [];
  const votes = [];
  for (const proposition of envelope.propositions) {
    const parsed = parseTitle(proposition.title);
    const propositionRow = {
      house: proposition.house,
      external_id: proposition.external_id,
      proposition_type: parsed.proposition_type,
      number: parsed.number,
      year: parsed.year,
      title: proposition.title,
      official_url: proposition.official_url ?? null,
    };
    propositions.push({ key: { house: proposition.house, external_id: proposition.external_id }, row: propositionRow, versions: proposition.versions });
  }
  return { propositions, versions, events, votes, candidateByTse, sourceByUrl };
}

function inc() {
  return { legislative_propositions: 0, proposition_versions: 0, voting_events: 0, legislative_votes: 0 };
}

function valuesEqual(key, actual, expected) {
  if (actual === expected) return true;
  if (actual == null || expected == null) return false;
  if (['effective_from', 'occurred_at', 'recorded_at'].includes(key)) {
    const actualTime = Date.parse(actual);
    const expectedTime = Date.parse(expected);
    return Number.isFinite(actualTime) && actualTime === expectedTime;
  }
  return String(actual) === String(expected);
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

async function ensureRow(sb, table, where, row, report) {
  const { data: existing, error } = await sb.from(table).select('*').match(where).maybeSingle();
  if (error) throw error;
  if (existing) {
    report.existing[table] += 1;
    const patch = {};
    for (const [key, expected] of Object.entries(row)) {
      if (key === 'source_reference_id') {
        if (existing[key] == null) patch[key] = expected;
        else if (existing[key] !== expected) fail(`source_reference_id divergente em ${table}/${existing.id}`);
      } else if (!valuesEqual(key, existing[key], expected)) {
        fail(`conflito factual em ${table}/${existing.id}: ${key}`);
      }
    }
    if (Object.keys(patch).length) {
      const { error: updateError } = await sb.from(table).update(patch).eq('id', existing.id);
      if (updateError) throw updateError;
      report.updated[table] += 1;
    }
    return existing;
  }
  report.planned[table] += 1;
  const { data, error: insertError } = await sb.from(table).insert(row).select('*').single();
  if (insertError) throw insertError;
  report.inserted[table] += 1;
  return data;
}

/** Executa o writer com contrato já carregado; apply=false nunca instancia Supabase. */
export async function runHistoricalWriter({ inputs = loadHistoricalInputs(), apply = false, sb = null, sourceRows = null } = {}) {
  const contract = validateHistoricalContract(inputs);
  const report = {
    mode: apply ? 'apply' : 'dry-run',
    remote_apply: apply,
    local_contract_verified: { ...contract.counts, sources: contract.expectedSources.length, eligible_candidates: EXPECTED.candidates, blocked_identities: EXPECTED.blocked },
    planned: { ...contract.counts, legislative_propositions: contract.counts.propositions, proposition_versions: contract.counts.versions, voting_events: contract.counts.events, legislative_votes: contract.counts.votes },
    inserted: inc(),
    updated: inc(),
    existing: inc(),
    votes_touched: 0,
    impact_touched: false,
    editorial_touched: false,
    rpc_called: false,
    source_reference_mappings: [],
  };
  delete report.planned.propositions;
  delete report.planned.versions;
  delete report.planned.events;
  delete report.planned.votes;
  if (!apply) return report;
  if (!sb) fail('cliente Supabase ausente para --apply');

  const rows = sourceRows ?? await allRows(sb, 'source_references', 'id,url,content_hash');
  const resolvedSources = resolveExistingSources(contract.expectedSources, rows);
  if (resolvedSources.size !== EXPECTED.sources) fail(`source_reference mappings resolvidos: esperado ${EXPECTED.sources}, recebido ${resolvedSources.size}`);
  report.source_reference_mappings = contract.expectedSources.map((source) => ({ url: source.url, content_hash: source.content_hash, id: resolvedSources.get(source.url) }));

  const eventByExternal = new Map();
  const versionByKey = new Map();
  for (const proposition of inputs.envelope.propositions) {
    const parsed = parseTitle(proposition.title);
    const prop = await ensureRow(sb, 'legislative_propositions', { house: proposition.house, external_id: proposition.external_id }, {
      house: proposition.house, external_id: proposition.external_id, proposition_type: parsed.proposition_type,
      number: parsed.number, year: parsed.year, title: proposition.title, official_url: proposition.official_url ?? null,
    }, report);
    for (const version of proposition.versions) {
      const source = contract.sourceByUrl.get(version.source);
      const row = await ensureRow(sb, 'proposition_versions', { proposition_id: prop.id, version_key: version.version_key }, {
        proposition_id: prop.id, version_key: version.version_key, version_label: version.version_label,
        text_hash: source.content_hash, source_reference_id: resolvedSources.get(source.url), effective_from: version.effective_from,
      }, report);
      versionByKey.set(`${proposition.external_id}:${version.version_key}`, row);
      for (const event of version.voting_events) {
        const eventSource = contract.sourceByUrl.get(event.source);
        const eventRow = await ensureRow(sb, 'voting_events', { house: event.house, external_id: event.external_id }, {
          proposition_version_id: row.id, house: event.house, external_id: event.external_id, session_id: event.session_id ?? null,
          vote_round: event.vote_round ?? null, occurred_at: event.occurred_at, source_reference_id: resolvedSources.get(eventSource.url),
        }, report);
        eventByExternal.set(event.external_id, eventRow);
      }
    }
  }
  for (const vote of inputs.envelope.votes) {
    const eventExternal = vote.voting_event_id.split(':').pop();
    const event = eventByExternal.get(eventExternal);
    if (!event) fail(`evento ausente para voto: ${eventExternal}`);
    const voteSource = contract.sourceByUrl.get(vote.source);
    const valueRow = {
      voting_event_id: event.id, legislator_id: null, candidate_id: contract.candidateByTse[vote.tse_candidate_id], value: vote.value,
      absence_type: vote.value === 'obstrucao' ? 'obstrucao_coordenada' : null, recorded_at: vote.recorded_at,
      source_reference_id: resolvedSources.get(voteSource.url),
    };
    const before = report.inserted.legislative_votes + report.updated.legislative_votes;
    await ensureRow(sb, 'legislative_votes', { voting_event_id: event.id, candidate_id: valueRow.candidate_id }, valueRow, report);
    if (report.inserted.legislative_votes + report.updated.legislative_votes > before) report.votes_touched += 1;
  }
  return report;
}

function parseArgs(args) {
  const result = { apply: false, paths: { ...DEFAULTS } };
  for (const arg of args) {
    if (arg === '--apply') result.apply = true;
    else if (arg.startsWith('--envelope=')) result.paths.envelope = resolve(ROOT, arg.slice(11));
    else if (arg.startsWith('--catalog=')) result.paths.catalog = resolve(ROOT, arg.slice(9));
    else if (arg.startsWith('--sources=')) result.paths.sources = resolve(ROOT, arg.slice(10));
    else if (arg.startsWith('--manifest=')) result.paths.manifest = resolve(ROOT, arg.slice(10));
    else fail(`flag não suportada: ${arg}`);
  }
  return result;
}

async function main() {
  const { apply, paths } = parseArgs(process.argv.slice(2));
  const inputs = loadHistoricalInputs(paths);
  if (!apply) {
    console.log(JSON.stringify(await runHistoricalWriter({ inputs }), null, 2));
    return;
  }
  const env = loadEnv();
  const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
  const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) fail('credenciais Supabase ausentes para --apply');
  const sb = createClient(url, key, { auth: { persist: false } });
  console.log(JSON.stringify(await runHistoricalWriter({ inputs, apply: true, sb }), null, 2));
}

if (process.argv[1]?.endsWith('apply-camara-historical-resolved.mjs')) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
