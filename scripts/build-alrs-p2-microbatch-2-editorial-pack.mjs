#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const input = resolve(root, 'data/legislative-import/alrs/p2-microbatch-2-2026-08-23.json');
const manifestPath = resolve(root, 'data/legislative-import/alrs/p2-microbatch-2-source-manifest.json');
const output = resolve(root, 'data/legislative-import/alrs/p2-microbatch-2-editorial-review-pack.json');
const q = JSON.parse(readFileSync(input, 'utf8'));
const manifest = existsSync(manifestPath)
  ? JSON.parse(readFileSync(manifestPath, 'utf8'))
  : null;

const items = q.items.map((item) => {
  const evidence = manifest?.items?.[item.proposition_version_id];
  const sourceGreen = Boolean(evidence?.official_match_key && evidence?.proposition_page);
  return {
    ...item,
    ...(evidence ?? {}),
    source_status: sourceGreen ? 'green' : 'needs_substantive_review',
    substantive_source_gate: sourceGreen ? 'green' : 'blocked_missing_manifest',
    source_durability_gate: sourceGreen ? 'green' : 'blocked_missing_manifest',
    editorial_disposition: 'pending_review',
    assessments: [],
    human_review_required: true,
    remote_apply: false,
  };
});

const sourceGreen = items.filter((item) => item.source_status === 'green').length;
const result = {
  schema_version: '1.0.0',
  packet_type: 'alrs_p2_microbatch_2_editorial_review_pack',
  review_status: 'pending_review',
  source_manifest_present: Boolean(manifest),
  remote_apply: false,
  public_approval: false,
  totals: {
    versions: items.length,
    source_green: sourceGreen,
    dispositions_pending: items.length,
  },
  items,
};
writeFileSync(output, JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({
  versions: items.length,
  source_manifest_present: Boolean(manifest),
  source_green: sourceGreen,
  dispositions_pending: items.length,
}));
