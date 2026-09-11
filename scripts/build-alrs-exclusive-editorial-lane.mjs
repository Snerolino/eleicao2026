#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const readJson = async (relative) => JSON.parse(await readFile(resolve(root, relative), 'utf8'));
const queue = await readJson('data/legislative-import/alrs/impact-review-queue-v1.json');
const collisionAudit = await readJson('data/legislative-import/alrs/version-key-collision-audit-v1.json');
const collisionKeys = new Set((collisionAudit.collisions ?? []).map((item) => item.version_key));
const pending = (queue.items ?? [])
  .filter((item) => item.editorial_disposition === 'pending_review')
  .filter((item) => !collisionKeys.has(item.version_key))
  .map((item) => ({
    proposition_version_id: item.proposition_version_id,
    review_key: item.review_key,
    version_key: item.version_key,
    priority: item.priority ?? 'P3',
    event_type: item.event_type ?? null,
    official_event_type: item.official_event_type ?? null,
    title: item.title ?? null,
    source_urls: item.source_urls ?? [],
    candidate_count: Number(item.candidate_count ?? 0),
    factual_vote_count: Number(item.factual_vote_count ?? 0),
    editorial_disposition: 'pending_review',
    remote_apply: false,
    public_approval: false,
  }))
  .sort((a, b) => {
    const priority = { P0: 0, P1: 1, P2: 2, P3: 3 };
    return (priority[a.priority] - priority[b.priority])
      || ((b.candidate_count * b.factual_vote_count) - (a.candidate_count * a.factual_vote_count))
      || a.review_key.localeCompare(b.review_key);
  });

const batchSize = 25;
const batches = [];
for (let index = 0; index < pending.length; index += batchSize) {
  const items = pending.slice(index, index + batchSize);
  batches.push({
    batch_id: `alrs-exclusive-${String(index / batchSize + 1).padStart(3, '0')}`,
    offset: index,
    limit: items.length,
    items,
    remote_apply: false,
    public_approval: false,
  });
}

const output = {
  schema_version: '1.0.0',
  packet_type: 'alrs_exclusive_editorial_lane',
  mode: 'read-only',
  unit_of_work: 'one proposition_version per review_key',
  remote_apply: false,
  public_approval: false,
  collision_exclusion: {
    collision_keys: collisionKeys.size,
    excluded_items: (queue.items ?? []).filter((item) => collisionKeys.has(item.version_key)).length,
    resolution_pack: 'data/legislative-import/alrs/version-key-collision-resolution-pack-v1.json',
  },
  totals: {
    input_versions: (queue.items ?? []).length,
    pending_versions: pending.length,
    p0_versions: pending.filter((item) => item.priority === 'P0').length,
    p1_versions: pending.filter((item) => item.priority === 'P1').length,
    p2_versions: pending.filter((item) => item.priority === 'P2').length,
    p3_versions: pending.filter((item) => item.priority === 'P3').length,
    batches: batches.length,
  },
  batches,
};

const outputPath = resolve(root, 'data/legislative-import/alrs/alrs-exclusive-editorial-lane-v1.json');
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify({ output: outputPath, totals: output.totals, remote_apply: false }));
