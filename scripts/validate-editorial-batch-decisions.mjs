#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { validateDecisionEnvelope } from './lib/editorial-batch-contract.mjs';

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
const validation = validateDecisionEnvelope(batch, decisions);
const rows = validation.rows;

const result = {
  schema_version: '1.0.0',
  packet_type: 'alrs_editorial_batch_decision_validation',
  batch_packet_type: batch.packet_type,
  batch_id: batch.batch_id,
  batch_sha256: validation.expected_hash,
  remote_apply: false,
  valid: validation.valid,
  totals: { expected: (batch.items ?? []).length, received: rows.length, approved: validation.approved, needs_changes: validation.needs_changes, errors: validation.errors.length },
  errors: validation.errors,
};
writeFileSync(resolve(root, outputFile), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result));
if (validation.errors.length) process.exitCode = 1;
