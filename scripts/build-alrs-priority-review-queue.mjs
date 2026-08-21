#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const input = resolve(root, 'data/legislative-import/alrs/impact-review-queue-v1.json');
const output = resolve(root, 'data/legislative-import/alrs/impact-review-priority-p0-p1.json');

export function buildPriorityQueue(queue, priorities = ['P0', 'P1']) {
  const allowed = new Set(priorities);
  const items = (queue.items ?? []).filter((item) => allowed.has(item.priority)).map((item) => ({
    house: item.house,
    proposition_version_id: item.proposition_version_id,
    proposition_external_id: item.proposition_external_id,
    version_key: item.version_key,
    title: item.title,
    priority: item.priority,
    candidate_count: item.candidate_count,
    factual_vote_count: item.factual_vote_count,
    event_count: item.event_count,
    event_external_ids: item.event_external_ids,
    source_urls: [...new Set(item.source_urls ?? [])],
    event_type: item.event_type,
    editorial_disposition: 'pending_review',
    suggested_groups: [],
    suggested_direction: null,
    defending_vote: null,
    remote_apply: false,
  }));
  return {
    schema_version: '1.0.0',
    packet_type: 'alrs_impact_review_priority_queue',
    methodology_version: queue.methodology_version,
    unit_of_work: queue.unit_of_work,
    priorities,
    review_status: 'pending_review',
    remote_apply: false,
    public_approval: false,
    totals: {
      versions: items.length,
      factual_votes: items.reduce((sum, item) => sum + item.factual_vote_count, 0),
      p0_versions: items.filter((item) => item.priority === 'P0').length,
      p1_versions: items.filter((item) => item.priority === 'P1').length,
    },
    items,
  };
}

function main() {
  const queue = JSON.parse(readFileSync(input, 'utf8'));
  const priority = buildPriorityQueue(queue);
  writeFileSync(output, `${JSON.stringify(priority, null, 2)}\n`);
  console.log(JSON.stringify({ output, ...priority.totals }));
}

if (process.argv[1]?.endsWith('build-alrs-priority-review-queue.mjs')) main();
