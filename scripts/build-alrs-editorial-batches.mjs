#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { validateBatch } from './lib/editorial-batch-contract.mjs';

const root = resolve(import.meta.dirname, '..');
const laneFile = resolve(root, 'data/legislative-import/alrs/alrs-exclusive-editorial-lane-v1.json');
const outputDir = resolve(root, 'data/legislative-import/alrs/editorial-batches');
const manifestFile = resolve(outputDir, 'manifest-v1.json');
const lane = JSON.parse(readFileSync(laneFile, 'utf8'));

export function buildEditorialBatches(lane) {
  const batches = (lane.batches ?? []).map((source, index) => {
    const batch = {
      schema_version: '1.0.0',
      packet_type: 'alrs_editorial_disposition_batch',
      mode: 'pending_review',
      batch_id: `alrs-editorial-${String(index + 1).padStart(3, '0')}`,
      source_batch_id: source.batch_id,
      items: (source.items ?? []).map((item) => ({
        ...item,
        recommended_disposition: null,
        recommended_rationale: null,
        decision: null,
        disposition: null,
        rationale: null,
        human_review_required: true,
        remote_apply: false,
        public_approval: false,
      })),
      remote_apply: false,
      public_approval: false,
    };
    const validation = validateBatch(batch);
    if (!validation.valid) throw new Error(`${batch.batch_id}: ${validation.errors.join(',')}`);
    batch.batch_sha256 = validation.expected_hash;
    return batch;
  });
  return {
    schema_version: '1.0.0',
    packet_type: 'alrs_editorial_disposition_batch_manifest',
    source_queue_sha256: createHash('sha256').update(JSON.stringify(lane)).digest('hex'),
    remote_apply: false,
    public_approval: false,
    totals: {
      input_versions: lane.totals?.input_versions ?? 0,
      ready_for_disposition: batches.reduce((sum, batch) => sum + batch.items.length, 0),
      batches: batches.length,
      p0_versions: batches.flatMap((batch) => batch.items).filter((item) => item.priority === 'P0').length,
      p1_versions: batches.flatMap((batch) => batch.items).filter((item) => item.priority === 'P1').length,
      p2_versions: batches.flatMap((batch) => batch.items).filter((item) => item.priority === 'P2').length,
      p3_versions: batches.flatMap((batch) => batch.items).filter((item) => item.priority === 'P3').length,
    },
    batches: batches.map((batch) => ({ batch_id: batch.batch_id, file: `${batch.batch_id}.json`, batch_sha256: batch.batch_sha256, items: batch.items.length, priorities: [...new Set(batch.items.map((item) => item.priority))] })),
  };
}

function main() {
  const manifest = buildEditorialBatches(lane);
  mkdirSync(outputDir, { recursive: true });
  for (const descriptor of manifest.batches) {
    const batch = (lane.batches ?? []).find((source, index) => `alrs-editorial-${String(index + 1).padStart(3, '0')}` === descriptor.batch_id);
    const full = {
      schema_version: '1.0.0', packet_type: 'alrs_editorial_disposition_batch', mode: 'pending_review',
      batch_id: descriptor.batch_id, source_batch_id: batch.batch_id,
      items: batch.items.map((item) => ({ ...item, recommended_disposition: null, recommended_rationale: null, decision: null, disposition: null, rationale: null, human_review_required: true, remote_apply: false, public_approval: false })),
      remote_apply: false, public_approval: false, batch_sha256: descriptor.batch_sha256,
    };
    writeFileSync(resolve(outputDir, descriptor.file), `${JSON.stringify(full, null, 2)}\n`);
  }
  writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(JSON.stringify({ output: manifestFile, totals: manifest.totals, remote_apply: false }));
}

if (process.argv[1]?.endsWith('build-alrs-editorial-batches.mjs')) main();
