#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const input = resolve(root, 'data/legislative-import/alrs/impact-review-queue-v1.json');
const output = resolve(root, 'data/legislative-import/alrs/substantive-review-queue-v1.json');

export function buildSubstantiveQueue(queue) {
  const items = (queue.items ?? []).filter((item) => ['merit_confirmed', 'merit_candidate'].includes(item.event_type) && !item.version_key_collision && item.title_quality === 'complete_or_unverified').map((item) => ({ ...item, review_gate: item.event_type === 'merit_confirmed' ? 'official_event_confirmed' : 'official_event_confirmation_required', human_review_required: true, editorial_disposition: 'pending_review', remote_apply: false }));
  return { schema_version: '1.0.0', packet_type: 'alrs_substantive_impact_review_queue', methodology_version: queue.methodology_version, unit_of_work: queue.unit_of_work, review_status: 'pending_review', remote_apply: false, public_approval: false, totals: { versions: items.length, factual_votes: items.reduce((sum, item) => sum + item.factual_vote_count, 0), official_merit_confirmed: items.filter((item) => item.event_type === 'merit_confirmed').length, merit_candidate: items.filter((item) => item.event_type === 'merit_candidate').length }, items };
}

function main() {
  const queue = JSON.parse(readFileSync(input, 'utf8'));
  const result = buildSubstantiveQueue(queue);
  writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify({ output, ...result.totals }));
}

if (process.argv[1]?.endsWith('build-alrs-substantive-review-queue.mjs')) main();
