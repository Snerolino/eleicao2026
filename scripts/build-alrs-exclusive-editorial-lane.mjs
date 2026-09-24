#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const readJson = async (relative) => JSON.parse(await readFile(resolve(root, relative), 'utf8'));
const queue = await readJson('data/legislative-import/alrs/impact-review-queue-v1.json');
const collisionAudit = await readJson('data/legislative-import/alrs/version-key-collision-audit-v1.json');
const resolvedCatalog = await readJson('data/legislative-import/alrs/impact-resolved-version-catalog-v1.json');
const collisionKeys = new Set((collisionAudit.collisions ?? []).map((item) => item.version_key));
const resolvedIds = new Set([...(resolvedCatalog.resolved_version_ids ?? []), ...(resolvedCatalog.existing_matrix_version_ids ?? [])]);
const outputPath = resolve(root, 'data/legislative-import/alrs/alrs-exclusive-editorial-lane-v1.json');
let remoteDispositionRead = { ok: false, rows: 0, approved: 0, needs_changes: 0 };
let remoteReadFailed = false;
try {
  const raw = execFileSync('supabase', [
    'db', 'query', '--linked', '--output-format', 'json',
    "select proposition_version_id, status from public.impact_editorial_dispositions where status in ('approved','needs_changes')",
  ], { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  const payload = JSON.parse(raw.slice(raw.indexOf('{')));
  const rows = payload.rows ?? [];
  for (const row of rows) if (row.proposition_version_id) resolvedIds.add(row.proposition_version_id);
  remoteDispositionRead = {
    ok: true,
    rows: rows.length,
    approved: rows.filter((row) => row.status === 'approved').length,
    needs_changes: rows.filter((row) => row.status === 'needs_changes').length,
  };
} catch {
  remoteReadFailed = true;
  // Never convert an unavailable remote read into a new active queue. Preserve
  // the last confirmed snapshot so a transient CLI/network failure cannot
  // reopen terminal items or dispatch duplicate editorial work.
}
if (remoteReadFailed) {
  try {
    const previous = JSON.parse(await readFile(outputPath, 'utf8'));
    if (previous.remote_disposition_read?.ok === true) {
      console.log(JSON.stringify({
        output: outputPath,
        totals: previous.totals,
        remote_apply: false,
        preserved_last_confirmed_snapshot: true,
      }));
      process.exit(0);
    }
  } catch {
    // No confirmed snapshot exists; the blocked artifact below is safe.
  }
  const blockedOutput = {
    schema_version: '1.0.0',
    packet_type: 'alrs_exclusive_editorial_lane',
    mode: 'blocked-remote-state-unknown',
    remote_apply: false,
    public_approval: false,
    remote_disposition_read: remoteDispositionRead,
    totals: { input_versions: (queue.items ?? []).length, pending_versions: 0, p0_versions: 0, p1_versions: 0, p2_versions: 0, p3_versions: 0, batches: 0 },
    batches: [],
  };
  await writeFile(outputPath, `${JSON.stringify(blockedOutput, null, 2)}\n`);
  console.error('REMOTE_DISPOSITION_READ_FAILED: active queue blocked; no items reopened');
  process.exit(2);
}
const pending = (queue.items ?? [])
  .filter((item) => item.editorial_disposition === 'pending_review')
  .filter((item) => !collisionKeys.has(item.version_key))
  .filter((item) => !resolvedIds.has(item.proposition_version_id))
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
  resolved_exclusion: {
    resolved_ids: resolvedIds.size,
    excluded_items: (queue.items ?? []).filter((item) => resolvedIds.has(item.proposition_version_id)).length,
    catalog: 'data/legislative-import/alrs/impact-resolved-version-catalog-v1.json',
  },
  remote_disposition_read: remoteDispositionRead,
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

await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify({ output: outputPath, totals: output.totals, remote_apply: false }));
