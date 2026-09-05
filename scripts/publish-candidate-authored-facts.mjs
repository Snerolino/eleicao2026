#!/usr/bin/env node
/** Publica fatos oficiais de autoria já revisados, separados da análise causal. */
import fs from 'node:fs';
import path from 'node:path';
import { assertAuthoredWriterScope } from './lib/assert-authored-writer-scope.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data/public-candidates.json');
const MANIFEST = path.join(ROOT, 'data/legislative-import/camara/candidate-authored-projects-factual-manifest-v1.json');
const SOURCE_QUEUE = path.join(ROOT, 'data/legislative-import/camara/candidate-authored-source-recovery-queue-v1.json');
const RECONCILED = [
  path.join(ROOT, 'data/legislative-import/camara/authored-project-review-batches/camara-authored-revisit-ready-batch-reconciled-v1.json'),
  path.join(ROOT, 'data/legislative-import/camara/authored-project-review-batches/camara-authored-revisit-26-50-reconciled-v1.json'),
  path.join(ROOT, 'data/legislative-import/camara/authored-project-review-batches/camara-authored-revisit-51-75-reconciled-v1.json'),
];
const apply = process.argv.includes('--apply');

function read(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function clean(value) { return String(value ?? '').replace(/\s+/g, ' ').trim(); }
function toFact(row) {
  return {
    id: row.id,
    candidate_tse_id: row.candidate_tse_id,
    house: 'camara',
    type: clean(row.type).toUpperCase(),
    number: clean(row.number),
    year: Number(row.year),
    title: clean(row.title),
    role: clean(row.role).toLowerCase(),
    official_status: clean(row.official_status).toLowerCase(),
    official_url: clean(row.official_url),
    authorship_source_url: clean(row.authorship_source_url),
    authorship_official_id: row.authorship_official_id ? clean(row.authorship_official_id) : null,
    official_ementa: clean(row.official_ementa),
    editorial_status: 'approved',
  };
}

const manifest = read(MANIFEST);
const sourceQueue = read(SOURCE_QUEUE);
const queueById = new Map((sourceQueue.items ?? []).map((item) => [item.id, item]));
const selectedIds = new Set(RECONCILED.flatMap((file) => (read(file).items ?? [])
  .filter((item) => item.final_decision === 'pending_review')
  .map((item) => item.id)));
const rows = manifest.projects.filter((row) => selectedIds.has(row.id));
const uniqueKeys = new Set();
const facts = [];
for (const row of rows) {
  const queueItem = queueById.get(row.id);
  if (!queueItem?.official_sources?.full_text_url || !queueItem?.official_sources?.latest_status_event_url) continue;
  const key = `${row.candidate_tse_id}|${row.id}`;
  if (uniqueKeys.has(key)) continue;
  uniqueKeys.add(key);
  facts.push(toFact(row));
}
facts.sort((a, b) => a.candidate_tse_id.localeCompare(b.candidate_tse_id) || a.id.localeCompare(b.id));

const candidates = read(SNAPSHOT);
const byCandidate = new Map();
for (const fact of facts) {
  const list = byCandidate.get(fact.candidate_tse_id) ?? [];
  list.push(fact);
  byCandidate.set(fact.candidate_tse_id, list);
}
const candidateIds = new Set(candidates.map((candidate) => String(candidate.tse_candidate_id ?? '')));
for (const fact of facts) {
  if (!candidateIds.has(fact.candidate_tse_id)) throw new Error(`candidate_tse_id ausente no snapshot: ${fact.candidate_tse_id}`);
}

const report = {
  schema_version: '1.0.0',
  packet_type: 'candidate_authored_facts_publication',
  mode: apply ? 'apply' : 'dry-run',
  remote_apply: false,
  editorial_projects: selectedIds.size,
  factual_project_candidate_rows: facts.length,
  candidates_touched: byCandidate.size,
  causal_analysis_published: 0,
  scores_published: 0,
  votes_published: 0,
};

if (apply) {
  assertAuthoredWriterScope(ROOT, ['data/public-candidates.json', 'scripts/publish-candidate-authored-facts.mjs']);
  const merged = candidates.map((candidate) => {
    const candidateId = String(candidate.tse_candidate_id ?? '');
    if (!byCandidate.has(candidateId)) return candidate;
    const current = new Map((candidate.authored_project_facts ?? []).map((fact) => [`${fact.candidate_tse_id}|${fact.id}`, fact]));
    for (const fact of byCandidate.get(candidateId)) current.set(`${fact.candidate_tse_id}|${fact.id}`, fact);
    return { ...candidate, authored_project_facts: [...current.values()] };
  });
  const temp = `${SNAPSHOT}.tmp`;
  fs.writeFileSync(temp, `${JSON.stringify(merged, null, 2)}\n`);
  fs.renameSync(temp, SNAPSHOT);
  report.snapshot_updated = true;
}
console.log(JSON.stringify(report));
