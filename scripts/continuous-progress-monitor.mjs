#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const files = [
  'data/legislative-import/alrs/impact-review-queue-v1.json',
  'data/legislative-import/alrs/p2-microbatch-5-editorial-review-pack.json',
  'data/legislative-import/alrs/p2-microbatch-4-editorial-review-pack.json',
  'data/legislative-import/alrs/p2-microbatch-2-editorial-review-pack.json',
  'data/legislative-import/camara/candidate-authored-projects-factual-manifest-v1.json',
  'data/legislative-import/camara/authored-analysis-progress-v1.json',
  'data/legislative-import/camara/authored-project-review-batches/manifest.json',
  'data/legislative-import/camara/authored-project-review-batches/procedural-triage.json',
];
const digest = createHash('sha256');
for (const file of files) {
  try { digest.update(file); digest.update(readFileSync(resolve(root, file))); } catch { digest.update(`${file}:missing`); }
}
function json(file, fallback = {}) { try { return JSON.parse(readFileSync(resolve(root, file), 'utf8')); } catch { return fallback; } }
const alrs = json(files[0]);
const factual = json(files[4]);
const progress = json(files[5]);
const batches = json(files[6]);
const triage = json(files[7]);
console.log(JSON.stringify({
  fingerprint: digest.digest('hex'),
  pending_editorial_items: (alrs.items ?? []).filter((item) => item.editorial_disposition === 'pending_review').length,
  factual_votes: (alrs.items ?? []).reduce((sum, item) => sum + Number(item.factual_vote_count ?? 0), 0),
  authored_projects: Number(factual.totals?.unique_projects ?? 0),
  authored_project_roles: Number(factual.totals?.project_role_rows ?? 0),
  authored_reviewed_batches: Array.isArray(batches.batches) ? batches.batches.length : 0,
  authored_analyzed_projects: Number(progress.counts?.projects_analyzed ?? 0),
  authored_next_batch: progress.next_batch ?? null,
  procedural_candidates: Number(triage.counts?.procedural_candidate ?? 0),
  substantive_candidates: Number(triage.counts?.substantive_candidate ?? 0),
}));
