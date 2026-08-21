#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const input = resolve(root, 'data/legislative-import/alrs/version-key-collision-audit-v1.json');
const output = resolve(root, 'data/legislative-import/alrs/version-key-collision-resolution-pack-v1.json');

export function buildCollisionResolutionPack(audit) {
  const groups = (audit.collisions ?? []).map((collision) => {
    const dates = [...new Set(collision.entries.map((entry) => entry.occurred_at).filter(Boolean))];
    const propositionIds = [...new Set(collision.entries.map((entry) => entry.proposition_external_id))];
    const titles = [...new Set(collision.entries.map((entry) => entry.title))];
    const sameTextDifferentEvents = titles.length === 1 && dates.length > 1;
    return {
      version_key: collision.version_key,
      proposition_version_ids: collision.proposition_version_ids,
      proposition_external_ids: propositionIds,
      official_titles: titles,
      event_dates: dates,
      event_ids: [...new Set(collision.entries.map((entry) => entry.event_external_id))],
      source_urls: [...new Set(collision.entries.map((entry) => entry.source_url).filter(Boolean))],
      technical_hypothesis: sameTextDifferentEvents ? 'same_text_multiple_events_possible' : 'version_identity_mismatch_possible',
      resolution_status: 'needs_official_text_hash_review',
      remote_apply: false,
      human_review_required: true,
    };
  });
  return { schema_version: '1.0.0', packet_type: 'alrs_version_key_collision_resolution_pack', remote_apply: false, public_approval: false, totals: { collision_keys: groups.length, same_text_multiple_events_possible: groups.filter((group) => group.technical_hypothesis === 'same_text_multiple_events_possible').length, version_identity_mismatch_possible: groups.filter((group) => group.technical_hypothesis === 'version_identity_mismatch_possible').length }, items: groups };
}

function main() {
  const audit = JSON.parse(readFileSync(input, 'utf8'));
  const pack = buildCollisionResolutionPack(audit);
  writeFileSync(output, `${JSON.stringify(pack, null, 2)}\n`);
  console.log(JSON.stringify({ output, ...pack.totals }));
}

if (process.argv[1]?.endsWith('build-alrs-version-collision-resolution-pack.mjs')) main();
