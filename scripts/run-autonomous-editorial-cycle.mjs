#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const apply = args.includes('--apply');
const decisions = args.find((arg) => !arg.startsWith('--')) ?? null;
const report = { schema_version: '1.0.0', packet_type: 'autonomous_editorial_cycle', remote_apply: false, steps: [] };
function run(label, script, extra = [], allowFailure = false) {
  try {
    const output = execFileSync(process.execPath, [resolve(root, script), ...extra], { cwd: root, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
    report.steps.push({ label, status: 'ok', output: output.trim().split('\n').at(-1) ?? '' });
    return true;
  } catch (error) {
    report.steps.push({ label, status: allowFailure ? 'blocked_non_terminal' : 'error', output: String(error.stdout ?? error.stderr ?? error.message).trim().split('\n').at(-1) ?? '' });
    if (!allowFailure) throw error;
    return false;
  }
}
const discoveryManifest = resolve(root, 'data/legislative-import/alrs/alrs-nominal-discovery-manifest-v1.json');
const discoveryAgeHours = existsSync(discoveryManifest) ? (Date.now() - statSync(discoveryManifest).mtimeMs) / 3_600_000 : Infinity;
if (discoveryAgeHours >= 6) run('official_discovery', 'scripts/discover-alrs-nominal-votes.mjs', [], true);
else report.steps.push({ label: 'official_discovery', status: 'deferred_manifest_fresh', age_hours: Number(discoveryAgeHours.toFixed(2)) });
run('reconcile', 'scripts/reconcile-impact-resolved-versions.mjs');
if (existsSync(discoveryManifest)) run('nominal_reconcile', 'scripts/reconcile-alrs-nominal-votes.mjs');
run('nominal_import', 'scripts/import-alrs-nominal-votes.mjs', ['--apply', '--output=/tmp/autonomous-alrs-import.json'], true);
run('metadata', 'scripts/reconcile-legislative-version-metadata.mjs');
run('substantive_sources', 'scripts/acquire-alrs-substantive-sources.mjs', [], true);
run('vote_profiles', 'scripts/build-vote-profile-fast.mjs', ['--apply'], true);
run('build_batch', 'scripts/build-alrs-impact-batch-proposals.mjs');
run('source_acquisition', 'scripts/acquire-alrs-source-queue.mjs', [], true);
run('publish_portal', 'scripts/verify-portal-publication.mjs', [], true);
const batchFile = resolve(root, 'data/legislative-import/alrs/impact-editorial-batch-001-v1.json');
const classifierFile = resolve(root, 'data/legislative-import/alrs/impact-editorial-classifier-decisions-v1.json');
const reviewerFile = resolve(root, 'data/legislative-import/alrs/impact-editorial-reviewed-decisions-v1.json');
const batch = JSON.parse(readFileSync(batchFile, 'utf8'));
if (batch.items.length) {
  run('classifier', 'scripts/classify-editorial-batch.mjs', [batchFile]);
  run('reviewer', 'scripts/review-editorial-batch.mjs', [batchFile, classifierFile]);
  if (apply) {
    run('apply', 'scripts/apply-validated-editorial-batch.mjs', [batchFile, reviewerFile, '--apply', '--output=/tmp/autonomous-editorial-apply.json']);
    report.remote_apply = true;
    run('reconcile_after_apply', 'scripts/reconcile-impact-resolved-versions.mjs');
    run('metadata_after_apply', 'scripts/reconcile-legislative-version-metadata.mjs');
    run('next_batch', 'scripts/build-alrs-impact-batch-proposals.mjs');
    run('publish_portal_after_apply', 'scripts/verify-portal-publication.mjs', [], true);
  }
} else report.steps.push({ label: 'classifier_reviewer_apply', status: 'idle_no_green_matter' });
console.log(JSON.stringify(report));
