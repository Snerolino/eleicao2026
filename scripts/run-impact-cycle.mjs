#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const decisions = args.find((arg) => !arg.startsWith('--')) ?? null;
const apply = args.includes('--apply');
const commands = [
  ['reconcile', 'scripts/reconcile-impact-resolved-versions.mjs'],
  ['build_batch', 'scripts/build-alrs-impact-batch-proposals.mjs'],
];
const report = { schema_version: '1.0.0', packet_type: 'impact_cycle', remote_apply: false, steps: [] };

function run(label, script, extra = []) {
  const output = execFileSync(process.execPath, [resolve(root, script), ...extra], { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  report.steps.push({ label, status: 'ok', output: output.trim().split('\n').at(-1) ?? '' });
}

for (const [label, script] of commands) run(label, script);
const batchFile = resolve(root, 'data/legislative-import/alrs/impact-editorial-batch-001-v1.json');
const batch = JSON.parse(readFileSync(batchFile, 'utf8'));
report.batch = { batch_id: batch.batch_id, batch_sha256: batch.batch_sha256, totals: batch.totals };
if (decisions) {
  const extra = [batchFile, resolve(decisions), '--output=/tmp/impact-cycle-apply.json'];
  if (apply) extra.push('--apply');
  run(apply ? 'apply_batch' : 'validate_batch', 'scripts/apply-validated-editorial-batch.mjs', extra);
  run('reconcile_after_apply', 'scripts/reconcile-impact-resolved-versions.mjs');
  run('regenerate_next_batch', 'scripts/build-alrs-impact-batch-proposals.mjs');
} else {
  report.steps.push({ label: 'apply_batch', status: 'waiting_for_validated_decisions_json', remote_apply: false });
}
console.log(JSON.stringify(report));
