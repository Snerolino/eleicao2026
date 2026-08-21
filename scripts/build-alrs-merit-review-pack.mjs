#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const input = resolve(root, 'data/legislative-import/alrs/impact-review-priority-p0-p1.json');
const output = resolve(root, 'data/legislative-import/alrs/impact-merit-review-pack-p0-p1.json');

export function buildMeritReviewPack(queue) {
  const excluded_collision_count = (queue.items ?? []).filter((item) => item.event_type === 'merit_candidate' && item.version_key_collision).length;
  const items = (queue.items ?? []).filter((item) => item.event_type === 'merit_candidate' && !item.version_key_collision).map((item) => ({
    ...item,
    review_gate: 'official_event_confirmation_required',
    editorial_disposition: 'pending_review',
    suggested_groups: [],
    suggested_direction: null,
    defending_vote: null,
    human_review_required: true,
    remote_apply: false,
  }));
  return {
    schema_version: '1.0.0',
    packet_type: 'alrs_impact_merit_review_pack',
    methodology_version: queue.methodology_version,
    unit_of_work: queue.unit_of_work,
    review_status: 'pending_review',
    remote_apply: false,
    public_approval: false,
    totals: {
      versions: items.length,
      factual_votes: items.reduce((sum, item) => sum + item.factual_vote_count, 0),
      p0_versions: items.filter((item) => item.priority === 'P0').length,
      p1_versions: items.filter((item) => item.priority === 'P1').length,
      excluded_version_collisions: excluded_collision_count,
    },
    items,
  };
}

function main() {
  const queue = JSON.parse(readFileSync(input, 'utf8'));
  const pack = buildMeritReviewPack(queue);
  writeFileSync(output, `${JSON.stringify(pack, null, 2)}\n`);
  console.log(JSON.stringify({ output, ...pack.totals }));
}

if (process.argv[1]?.endsWith('build-alrs-merit-review-pack.mjs')) main();
