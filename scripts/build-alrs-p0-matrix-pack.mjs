#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const input = resolve(root, 'data/legislative-import/alrs/impact-matrix-review-pack-p0-p1.json');
const output = resolve(root, 'data/legislative-import/alrs/impact-matrix-review-pack-p0-only.json');
const validationPath = resolve(root, 'data/legislative-import/alrs/p0-official-version-validation.json');

export function buildP0MatrixPack(pack) {
  const validation = JSON.parse(readFileSync(validationPath, 'utf8')).items ?? {};
  const items = (pack.items ?? []).filter((item) => item.priority === 'P0' && item.version_key_collision !== true).map((item) => ({
    ...item,
    review_batch: 'P0-first-editorial-review',
    human_review_required: true,
    editorial_status: 'pending_review',
    remote_apply: false,
    official_version_confirmed: Boolean(validation[item.proposition_version_id]?.event_classification === 'merit_confirmed'),
  }));
  return { ...pack, packet_type: 'alrs_impact_matrix_review_p0_pack', priorities: ['P0'], totals: { versions: items.length, factual_votes: items.reduce((sum, item) => sum + item.factual_vote_count, 0) }, items };
}

function main() {
  const pack = JSON.parse(readFileSync(input, 'utf8'));
  const result = buildP0MatrixPack(pack);
  writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify({ output, ...result.totals }));
}

if (process.argv[1]?.endsWith('build-alrs-p0-matrix-pack.mjs')) main();
