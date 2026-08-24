#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const batchFile = args[0] ?? 'data/legislative-import/alrs/impact-editorial-batch-001-v1.json';
const decisionsFile = args[1];
const outputFile = args[2] ?? '/tmp/editorial-batch-validation.json';

if (!decisionsFile) {
  console.error('Uso: node scripts/validate-editorial-batch-decisions.mjs <batch.json> <decisions.json> [report.json]');
  process.exit(2);
}

const batch = JSON.parse(readFileSync(resolve(root, batchFile), 'utf8'));
const decisions = JSON.parse(readFileSync(resolve(root, decisionsFile), 'utf8'));
const allowed = new Set(['approved', 'needs_changes']);
const batchIds = new Set((batch.items ?? []).map((item) => item.proposition_version_id));
const rows = decisions.items ?? decisions.decisions ?? [];
const errors = [];
const seen = new Set();

for (const row of rows) {
  const id = row.proposition_version_id;
  if (!batchIds.has(id)) errors.push(`${id ?? '<missing>'}:unknown_proposition_version`);
  if (seen.has(id)) errors.push(`${id}:duplicate_decision`);
  seen.add(id);
  if (!allowed.has(row.decision)) errors.push(`${id}:invalid_decision`);
  if (row.decision === 'needs_changes' && String(row.notes ?? '').trim().length < 20) errors.push(`${id}:needs_changes_requires_notes`);
}
for (const id of batchIds) if (!seen.has(id)) errors.push(`${id}:missing_decision`);

const result = {
  schema_version: '1.0.0',
  packet_type: 'alrs_editorial_batch_decision_validation',
  batch_packet_type: batch.packet_type,
  remote_apply: false,
  valid: errors.length === 0,
  totals: { expected: batchIds.size, received: rows.length, approved: rows.filter((row) => row.decision === 'approved').length, needs_changes: rows.filter((row) => row.decision === 'needs_changes').length, errors: errors.length },
  errors,
};
writeFileSync(resolve(root, outputFile), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result));
if (errors.length) process.exitCode = 1;
