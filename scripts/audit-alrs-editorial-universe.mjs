#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const load = (relative, fallback = {}) => {
  const file = resolve(root, relative);
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : fallback;
};
const sha = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');

export function auditEditorialUniverse({ queue, collisions = {}, resolved = {} }) {
  const pending = (queue.items ?? []).filter((item) => item.editorial_disposition === 'pending_review');
  const collisionIds = new Set((collisions.collisions ?? []).flatMap((entry) => entry.proposition_version_ids ?? []));
  const resolvedIds = new Set([
    ...(resolved.resolved_version_ids ?? []),
    ...(resolved.existing_matrix_version_ids ?? []),
  ]);
  const byId = new Map();
  const duplicateIds = [];
  for (const item of pending) {
    if (byId.has(item.proposition_version_id)) duplicateIds.push(item.proposition_version_id);
    byId.set(item.proposition_version_id, item);
  }
  const ready = [];
  const blockedCollision = [];
  const alreadyResolved = [];
  const otherBlocked = [];
  for (const item of pending) {
    const id = item.proposition_version_id;
    if (collisionIds.has(id)) blockedCollision.push({ proposition_version_id: id, reason: 'version_key_collision' });
    else if (resolvedIds.has(id)) alreadyResolved.push({ proposition_version_id: id, reason: 'resolved_catalog_or_existing_matrix' });
    else if (!item.review_key || !id) otherBlocked.push({ proposition_version_id: id ?? null, reason: 'identity_missing' });
    else ready.push(item);
  }
  const classified = new Set([...ready, ...blockedCollision, ...alreadyResolved, ...otherBlocked].map((item) => item.proposition_version_id));
  const unclassified = pending.filter((item) => !classified.has(item.proposition_version_id)).map((item) => item.proposition_version_id);
  return {
    schema_version: '1.0.0',
    packet_type: 'alrs_editorial_universe_audit',
    remote_apply: false,
    inputs_sha256: { queue: sha(queue), collisions: sha(collisions), resolved: sha(resolved) },
    input_pending: pending.length,
    ready_for_disposition: ready.length,
    blocked_collision: blockedCollision.length,
    already_resolved: alreadyResolved.length,
    other_blocked: otherBlocked.length,
    duplicate_version_ids: [...new Set(duplicateIds)],
    unclassified_version_ids: [...new Set(unclassified)],
    ids: {
      ready_for_disposition: ready.map((item) => item.proposition_version_id),
      blocked_collision: blockedCollision.map((item) => item.proposition_version_id),
      already_resolved: alreadyResolved.map((item) => item.proposition_version_id),
      other_blocked: otherBlocked.map((item) => item.proposition_version_id),
    },
    blockers: [...blockedCollision, ...alreadyResolved, ...otherBlocked],
  };
}

function main() {
  const args = process.argv.slice(2);
  const output = args.find((arg) => arg.startsWith('--output='))?.slice(9) ?? 'data/legislative-import/alrs/alrs-editorial-universe-audit-v1.json';
  const result = auditEditorialUniverse({
    queue: load('data/legislative-import/alrs/impact-review-queue-v1.json'),
    collisions: load('data/legislative-import/alrs/version-key-collision-audit-v1.json'),
    resolved: load('data/legislative-import/alrs/impact-resolved-version-catalog-v1.json'),
  });
  writeFileSync(resolve(root, output), `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify({ output, ...Object.fromEntries(Object.entries(result).filter(([key]) => typeof result[key] === 'number')), unclassified: result.unclassified_version_ids.length }));
  if (result.duplicate_version_ids.length || result.unclassified_version_ids.length) process.exitCode = 1;
}

if (process.argv[1]?.endsWith('audit-alrs-editorial-universe.mjs')) main();
