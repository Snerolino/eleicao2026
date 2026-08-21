#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const meritPath = resolve(root, 'data/legislative-import/alrs/impact-merit-review-pack-p0-p1.json');
const manifestPath = resolve(root, 'data/legislative-import/alrs/impact-merit-source-manifest.json');
const outputPath = resolve(root, 'data/legislative-import/alrs/impact-matrix-review-pack-p0-p1.json');

const merit = JSON.parse(readFileSync(meritPath, 'utf8'));
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const sourceByUrl = new Map(manifest.urls.map((row) => [row.url, row]));
const items = merit.items.map((item) => ({
  house: item.house,
  proposition_version_id: item.proposition_version_id,
  review_key: item.review_key,
  proposition_external_id: item.proposition_external_id,
  version_key: item.version_key,
  version_key_collision: item.version_key_collision,
  title: item.title,
  title_quality: item.title_quality,
  priority: item.priority,
  candidate_count: item.candidate_count,
  factual_vote_count: item.factual_vote_count,
  event_external_ids: item.event_external_ids,
  official_sources: item.source_urls.map((url) => sourceByUrl.get(url)).filter(Boolean),
  candidate_source_links: item.candidate_source_links ?? [],
  factual_source_gate: item.source_urls.every((url) => sourceByUrl.get(url)?.ok === true) ? 'green' : 'blocked',
  event_gate: 'official_event_classification_required',
  editorial_status: 'pending_review',
  methodology_version: '1.0.0',
  severity: null,
  structural_type: null,
  assessments: [],
  human_review_required: true,
  remote_apply: false,
}));
const pack = { schema_version: '1.0.0', packet_type: 'alrs_impact_matrix_review_pack', unit_of_work: 'one_matrix_per_proposition_version', review_status: 'pending_review', remote_apply: false, public_approval: false, totals: { versions: items.length, factual_source_gate_green: items.filter((item) => item.factual_source_gate === 'green').length, factual_votes: items.reduce((sum, item) => sum + item.factual_vote_count, 0) }, items };
writeFileSync(outputPath, `${JSON.stringify(pack, null, 2)}\n`);
console.log(JSON.stringify({ output: outputPath, ...pack.totals }));
