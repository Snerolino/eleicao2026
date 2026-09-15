#!/usr/bin/env node
/**
 * Legacy guard: this writer is intentionally disabled.
 * Matrix creation must use the authenticated RPC path after the migration
 * 20260913193000_harden_alrs_editorial_batch_apply.sql is applied and verified.
 */

const apply = process.argv.includes('--apply');
const report = {
  status: 'blocked',
  remote_apply: false,
  reason: 'writer legado desativado; use Auth/RPC e mantenha a matriz pending_review',
};
console.log(JSON.stringify(report));
if (apply || process.argv.length > 2) process.exitCode = 2;
