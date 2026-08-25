#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const input = resolve(root, process.argv[2] ?? 'data/legislative-import/alrs/impact-editorial-classifier-decisions-v1.json');
const output = resolve(root, process.argv.find((arg) => arg.startsWith('--output='))?.slice(9) ?? 'data/legislative-import/alrs/impact-editorial-reviewed-decisions-v1.json');
const packet = JSON.parse(readFileSync(input, 'utf8'));
const errors = [];
for (const item of packet.items ?? []) {
  if (!item.proposition_version_id || !item.review_key) errors.push('missing_identity');
  if (!['approved', 'needs_changes'].includes(item.decision)) errors.push(`${item.proposition_version_id}:invalid_decision`);
  if (!item.disposition) errors.push(`${item.proposition_version_id}:missing_disposition`);
  if (item.source_gate !== 'green') errors.push(`${item.proposition_version_id}:source_not_green`);
  if (item.decision === 'needs_changes' && !item.notes) errors.push(`${item.proposition_version_id}:missing_notes`);
  if (item.decision === 'approved' && item.requires_external_review) errors.push(`${item.proposition_version_id}:external_review_bypass`);
}
const result = { ...packet, packet_type: 'alrs_editorial_batch_automatic_review', reviewer: 'hermes-deterministic-reviewer-v1', reviewer_type: 'automatic_reviewer', remote_apply: false, valid: errors.length === 0, errors, items: (packet.items ?? []).map((item) => ({ ...item, reviewer_type: 'automatic_reviewer', review_status: errors.length ? 'rejected' : 'reviewed' })) };
writeFileSync(resolve(root, output), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ output, valid: result.valid, decisions: result.items.length, errors: errors.length }));
if (errors.length) process.exit(1);
