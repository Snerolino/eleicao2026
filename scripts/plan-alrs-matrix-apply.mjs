#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const input = process.argv.slice(2).find((arg) => !arg.startsWith('--')) ?? 'data/legislative-import/alrs/confirmed-merit-review-pack-v1.json';
const output = process.argv.find((arg) => arg.startsWith('--output='))?.split('=')[1] ?? 'data/legislative-import/alrs/impact-matrix-apply-plan.json';
const DISPOSITIONS = new Set(['assess', 'no_direct_population_group', 'taxonomy_gap', 'excluded']);

export function planAlrsMatrixApply(pack) {
  const errors = [];
  if (pack.review_status !== 'approved') errors.push('pack_review_status_not_approved');
  if (pack.public_approval !== true) errors.push('public_approval_missing');
  const plan = [];
  for (const [index, item] of (pack.items ?? []).entries()) {
    const prefix = `items[${index}]`;
    const disposition = item.editorial_disposition;
    if (!DISPOSITIONS.has(disposition)) {
      errors.push(`${prefix}:editorial_disposition_missing`);
      continue;
    }
    if (item.version_key_collision) errors.push(`${prefix}:version_key_collision`);
    if (item.factual_source_gate !== 'green') errors.push(`${prefix}:factual_source_gate_not_green`);
    if (item.human_review_required !== true) errors.push(`${prefix}:human_review_required_missing`);
    if (item.editorial_status !== 'approved') errors.push(`${prefix}:editorial_status_not_approved`);
    if (disposition !== 'assess') continue;
    if (item.substantive_source_gate !== 'green') errors.push(`${prefix}:substantive_source_gate_not_green`);
    if (!Array.isArray(item.assessments) || item.assessments.length === 0) {
      errors.push(`${prefix}:assessments_empty`);
      continue;
    }
    plan.push({ proposition_version_id: item.proposition_version_id, review_key: item.review_key, assessments: item.assessments });
  }
  return { ok: errors.length === 0, errors, remote_apply: false, reviewed_versions: pack.items?.length ?? 0, planned_versions: plan.length, plan: errors.length === 0 ? plan : [] };
}

function main() {
  const inputPath = resolve(root, input);
  const pack = JSON.parse(readFileSync(inputPath, 'utf8'));
  const result = { input_file: input, input_sha256: createHash('sha256').update(readFileSync(inputPath)).digest('hex'), ...planAlrsMatrixApply(pack) };
  writeFileSync(resolve(root, output), `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify({ output, ok: result.ok, errors: result.errors.length, planned_versions: result.planned_versions }));
  if (!result.ok) process.exit(2);
}

if (process.argv[1]?.endsWith('plan-alrs-matrix-apply.mjs')) main();
