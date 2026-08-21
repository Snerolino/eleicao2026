#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const input = resolve(root, 'data/legislative-import/alrs/impact-review-queue-v1.json');
const output = resolve(root, 'data/legislative-import/alrs/title-recovery-pack-v1.json');

export function buildTitleRecoveryPack(queue) {
  const items = (queue.items ?? []).filter((item) => ['generic', 'possibly_truncated', 'missing'].includes(item.title_quality)).map((item) => ({
    proposition_version_id: item.proposition_version_id,
    review_key: item.review_key,
    version_key: item.version_key,
    version_key_collision: item.version_key_collision,
    proposition_external_id: item.proposition_external_id,
    current_title: item.title,
    title_quality: item.title_quality,
    event_external_ids: item.event_external_ids,
    source_urls: item.source_urls,
    candidate_source_links: item.candidate_source_links ?? [],
    resolution_status: 'needs_official_full_title_and_version_text',
    human_review_required: true,
    remote_apply: false,
  }));
  return { schema_version: '1.0.0', packet_type: 'alrs_title_recovery_pack', remote_apply: false, public_approval: false, totals: { items: items.length, generic: items.filter((item) => item.title_quality === 'generic').length, possibly_truncated: items.filter((item) => item.title_quality === 'possibly_truncated').length, missing: items.filter((item) => item.title_quality === 'missing').length }, items };
}

function main() {
  const queue = JSON.parse(readFileSync(input, 'utf8'));
  const pack = buildTitleRecoveryPack(queue);
  writeFileSync(output, `${JSON.stringify(pack, null, 2)}\n`);
  console.log(JSON.stringify({ output, ...pack.totals }));
}

if (process.argv[1]?.endsWith('build-alrs-title-recovery-pack.mjs')) main();
