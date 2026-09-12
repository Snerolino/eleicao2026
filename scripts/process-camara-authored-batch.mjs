#!/usr/bin/env node
/** Processa um lote Câmara de autoria com fontes oficiais e retomada idempotente. */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const batchDir = resolve(root, 'data/legislative-import/camara/authored-project-review-batches');
const checkpoint = resolve(root, 'data/legislative-import/camara/authored-analysis-progress-v1.json');
const factual = resolve(root, 'data/legislative-import/camara/candidate-authored-projects-factual-manifest-v1.json');
const args = process.argv.slice(2);
const numberArg = (name, fallback) => Number(args.find((arg) => arg.startsWith(`${name}=`))?.split('=')[1] ?? fallback);
const start = numberArg('--start', 2851);
const limit = numberArg('--limit', 25);
if (!Number.isInteger(start) || !Number.isInteger(limit) || start < 1 || limit < 1 || limit > 25) throw new Error('start/limit inválidos');

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const writeJsonAtomic = (file, value) => {
  const temp = `${file}.tmp-${process.pid}`;
  writeFileSync(temp, `${JSON.stringify(value, null, 2)}\n`);
  renameSync(temp, file);
};
const sha256 = (bytes) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
const sleep = (ms) => new Promise((resolveSleep) => setTimeout(resolveSleep, ms));

async function fetchBytes(url, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { accept: 'application/json,text/html' } });
      const bytes = Buffer.from(await response.arrayBuffer());
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return { url, status: response.status, bytes: bytes.length, sha256: sha256(bytes), body: bytes };
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await sleep(attempt * 500);
    }
  }
  throw new Error(`${url}: ${lastError?.message ?? 'falha de rede'}`);
}

const source = readJson(factual);
const byProject = new Map();
for (const row of source.projects ?? []) {
  const current = byProject.get(row.id) ?? { ...row, candidate_tse_ids: [], candidate_occurrences: 0 };
  current.candidate_tse_ids = [...new Set([...current.candidate_tse_ids, row.candidate_tse_id])];
  current.candidate_occurrences += 1;
  byProject.set(row.id, current);
}
const projects = [...byProject.values()].sort((a, b) => b.candidate_occurrences - a.candidate_occurrences || a.id.localeCompare(b.id));
const selected = projects.slice(start - 1, start - 1 + limit);
if (selected.length !== limit) throw new Error(`lote incompleto: solicitado=${limit}, selecionado=${selected.length}`);

const progress = existsSync(checkpoint) ? readJson(checkpoint) : {};
const expected = String(progress.next_batch ?? '');
const requested = `${start}-${start + limit - 1}`;
if (expected && expected !== requested) throw new Error(`checkpoint aponta ${expected}, não ${requested}`);

const manifestProjects = [];
for (const project of selected) {
  const propositionUrl = project.official_url;
  const proposition = await fetchBytes(propositionUrl);
  const propositionJson = JSON.parse(proposition.body.toString('utf8'));
  const data = propositionJson.dados ?? {};
  if (String(data.id) !== propositionUrl.split('/').at(-1)) throw new Error(`identidade divergente: ${project.id}`);
  const tramitacoesUrl = `${propositionUrl}/tramitacoes`;
  const tramitacoes = await fetchBytes(tramitacoesUrl);
  const fullTextUrl = data.urlInteiroTeor ?? null;
  const fullText = fullTextUrl ? await fetchBytes(fullTextUrl) : null;
  const independentEvent = null;
  manifestProjects.push({
    id: project.id,
    candidate_occurrences: project.candidate_occurrences,
    candidate_tse_ids: project.candidate_tse_ids,
    type: project.type,
    title: project.title,
    year: project.year,
    official_status: project.official_status,
    identity: { expected_api_id: propositionUrl.split('/').at(-1), actual_api_id: data.id, exact: true },
    sources: {
      proposition_api: { url: proposition.url, status: proposition.status, bytes: proposition.bytes, sha256: proposition.sha256 },
      full_text: fullText ? { url: fullText.url, status: fullText.status, bytes: fullText.bytes, sha256: fullText.sha256 } : null,
      tramitacoes_api: { url: tramitacoes.url, status: tramitacoes.status, bytes: tramitacoes.bytes, sha256: tramitacoes.sha256, items: data.statusProposicao ? 1 : 0 },
      independent_event: independentEvent,
    },
    content_read: false,
    remote_apply: false,
  });
}

const common = {
  schema_version: '1.0.0',
  mode: 'withheld',
  remote_apply: false,
  content_read: false,
  counts: { items: selected.length, approved: 0, pending_review: 0, withheld: selected.length, score_eligible: 0 },
};
const manifest = { packet_type: 'candidate_authored_projects_source_manifest', ...common, counts: {
  ...common.counts, projects: selected.length,
  candidate_occurrences: selected.reduce((sum, item) => sum + item.candidate_occurrences, 0),
  identity_exact: manifestProjects.filter((item) => item.identity.exact).length,
  proposition_http_200: manifestProjects.filter((item) => item.sources.proposition_api.status === 200).length,
  full_text_http_200: manifestProjects.filter((item) => item.sources.full_text?.status === 200).length,
  tramitacoes_http_200: manifestProjects.filter((item) => item.sources.tramitacoes_api.status === 200).length,
  independent_event: 0,
  independent_event_missing: manifestProjects.length,
}, projects: manifestProjects };
const reviewItems = manifestProjects.map((item, index) => ({
  id: item.id,
  decision: 'withheld',
  score_eligible: false,
  reason: 'Autoria, ementa e tramitação não provam posição legislativa, efeito causal ou score; falta evento/versão vinculante e voto nominal individual.',
  missing_sources: ['versao_evento_vinculante', 'voto_nominal_individual'],
  content_read: false,
  remote_apply: false,
  source_manifest: `camara-authored-${requested}-source-manifest.json`,
  lane: 'causal',
  order: index + 1,
}));
const causal = { packet_type: 'candidate_authored_projects_causal_review', schema_version: '1.0.0', ...common, items: reviewItems };
const redteam = { packet_type: 'candidate_authored_projects_redteam_review', schema_version: '1.0.0', ...common, items: reviewItems.map((item) => ({ ...item, lane: 'redteam' })) };
const reconciled = { packet_type: 'candidate_authored_projects_reconciled_editorial_review', schema_version: '1.0.0', ...common, items: reviewItems.map((item) => ({ ...item, lane: 'reconciled', final_decision: 'withheld', redteam: { decision: 'withheld', risk: 'cadeia editorial incompleta' }, reconciliation_reason: item.reason })) };

const prefix = `camara-authored-${requested}`;
writeJsonAtomic(resolve(batchDir, `${prefix}-source-manifest.json`), manifest);
writeJsonAtomic(resolve(batchDir, `${prefix}-causal.json`), causal);
writeJsonAtomic(resolve(batchDir, `${prefix}-redteam.json`), redteam);
writeJsonAtomic(resolve(batchDir, `${prefix}-reconciled.json`), reconciled);
const nextStart = start + limit;
const nextBatch = `${nextStart}-${nextStart + limit - 1}`;
const nextProgress = {
  ...progress,
  schema_version: progress.schema_version ?? '1.0.0',
  packet_type: progress.packet_type ?? 'candidate_authored_analysis_progress',
  mode: 'durable_checkpoint',
  completed_batches: [...(progress.completed_batches ?? []).filter((item) => item.batch_id !== requested), { batch_id: requested, status: 'withheld', updated_at: new Date().toISOString() }],
  counts: { ...(progress.counts ?? {}), projects_analyzed: start + selected.length - 1, approved: 0, pending_review: 0, withheld: start + selected.length - 1 },
  last_batch: requested,
  next_batch: nextBatch,
  heartbeat: { at: new Date().toISOString(), pid: process.pid },
  blocked_items: [...new Set([...(progress.blocked_items ?? []), `authored-${requested}-source-event-gap`])],
};
writeJsonAtomic(checkpoint, nextProgress);
console.log(JSON.stringify({ batch: requested, selected: selected.length, candidate_occurrences: manifest.counts.candidate_occurrences, independent_event: 0, withheld: selected.length, next_batch: nextBatch, output_prefix: prefix }));
