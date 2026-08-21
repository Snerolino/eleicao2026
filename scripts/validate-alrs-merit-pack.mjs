#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const input = process.argv.slice(2).find((arg) => !arg.startsWith('--')) ?? 'data/legislative-import/alrs/impact-matrix-review-pack-p0-p1.json';

export function validateAlrsMeritPack(pack) {
  const errors = [];
  for (const [index, item] of (pack.items ?? []).entries()) {
    const prefix = `items[${index}]`;
    if (!item.proposition_version_id || !item.review_key) errors.push(`${prefix}: identity_missing`);
    if (item.version_key_collision) errors.push(`${prefix}: version_key_collision`);
    if (item.title_quality !== 'complete_or_unverified') errors.push(`${prefix}: title_quality_${item.title_quality}`);
    if (item.factual_source_gate !== 'green') errors.push(`${prefix}: factual_source_gate_${item.factual_source_gate}`);
    if (item.human_review_required !== true) errors.push(`${prefix}: human_review_required_missing`);
    if (item.remote_apply !== false) errors.push(`${prefix}: remote_apply_not_false`);
    if (item.editorial_status !== 'pending_review') errors.push(`${prefix}: editorial_status_invalid`);
    if (!Array.isArray(item.candidate_source_links)) errors.push(`${prefix}: candidate_source_links_missing`);
  }
  return { ok: errors.length === 0, errors, checked: pack.items?.length ?? 0 };
}

function main() {
  const pack = JSON.parse(readFileSync(resolve(root, input), 'utf8'));
  const result = validateAlrsMeritPack(pack);
  console.log(JSON.stringify(result));
  if (!result.ok) process.exit(2);
}

if (process.argv[1]?.endsWith('validate-alrs-merit-pack.mjs')) main();
