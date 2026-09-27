#!/usr/bin/env node
/** Seleciona microbatch de recuperação factual sem aplicar dados remotos. */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const inventoryPath = resolve(root, 'artifacts/reprocess-impact-v2/release-inventory.json');
const metadataPath = resolve(root, 'data/legislative-import/alrs/proposition-version-metadata-v1.json');
const collisionPath = resolve(root, 'data/legislative-import/alrs/version-key-collision-audit-v1.json');
const sourcePaths = [
  resolve(root, 'data/legislative-import/alrs/p0-substantive-source-manifest.json'),
  resolve(root, 'data/legislative-import/alrs/p1-substantive-source-manifest.json'),
];
const outputPath = resolve(root, 'data/legislative-import/alrs/alrs-attribution-source-recovery-microbatch-v1.json');

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function sourceEntries(paths) {
  const entries = new Map();
  for (const path of paths) {
    const items = readJson(path).items ?? {};
    const rows = Array.isArray(items) ? items : Object.entries(items).map(([proposition_version_id, value]) => ({ proposition_version_id, ...value }));
    for (const row of rows) {
      const normalized = {
        ...row,
        document_sha256: row.document_sha256 ?? row.sha256 ?? null,
        document_bytes: row.document_bytes ?? row.bytes ?? null,
        content_addressed_path: row.content_addressed_path ?? row.document_path ?? null,
      };
      if (normalized.durability_gate === 'green' && normalized.source_bytes_preserved === true && normalized.proposition_page && normalized.document_sha256 && normalized.content_addressed_path) {
        entries.set(String(normalized.proposition_version_id), normalized);
      }
    }
  }
  return entries;
}

function collisionKeys(path) {
  const audit = readJson(path);
  return new Set((audit.collisions ?? []).map((item) => item.version_key).filter(Boolean));
}

export function selectMicrobatch(inventory, substantiveSources, collisions, { limit = 5, minimum = 5 } = {}) {
  const candidates = inventory.inventory ?? [];
  const grouped = new Map();
  for (const item of candidates) {
    const source = substantiveSources.get(String(item.proposition_version_id));
    if (item.house !== 'alrs' || item.state !== 'withheld_source') continue;
    if (!item.event_source_reference_id || item.version_source_reference_id) continue;
    if (!item.factual_vote_present || collisions.has(item.version_key) || !source) continue;
    const existing = grouped.get(item.voting_event_id) ?? { ...item, pairs: [] };
    existing.pairs.push({
      inventory_key: item.inventory_key,
      assessment_id: item.assessment_id,
      group_slug: item.group_slug,
    });
    existing.source_evidence = {
      proposition_page: source.proposition_page,
      proposition_page_sha256: source.page_sha256 ?? null,
      proposition_page_bytes: source.page_bytes ?? null,
      document_sha256: source.document_sha256,
      document_bytes: source.document_bytes,
      content_addressed_path: source.content_addressed_path,
      durability_gate: source.durability_gate,
    };
    grouped.set(item.voting_event_id, existing);
  }
  const selected = [...grouped.values()]
    .sort((a, b) => String(a.occurred_at).localeCompare(String(b.occurred_at)) || String(a.voting_event_id).localeCompare(String(b.voting_event_id)))
    .slice(0, limit)
    .map((item) => ({
      voting_event_id: item.voting_event_id,
      event_external_id: item.event_external_id,
      occurred_at: item.occurred_at,
      proposition_version_id: item.proposition_version_id,
      version_key: item.version_key,
      title: item.title ?? null,
      assessment_ids: [...new Set(item.pairs.map((pair) => pair.assessment_id))],
      inventory_keys: item.pairs.map((pair) => pair.inventory_key),
      candidate_count: item.candidate_ids?.length ?? 0,
      candidate_ids: item.candidate_ids ?? [],
      event_source_reference_id: item.event_source_reference_id,
      event_status: item.event_status ?? 'unknown_requires_event_classification',
      version_source_reference_id: null,
      source_evidence: item.source_evidence,
      status: 'pending_version_source_recovery',
      next_gate: 'resolve_version_source_reference_bind_object_voted_and_classify_event',
      remote_apply: false,
      public_approval: false,
    }));
  return {
    schema_version: '1.0.0',
    packet_type: 'alrs_attribution_source_recovery_microbatch',
    status: selected.length >= minimum ? 'pending_source_recovery' : (selected.length > 0 ? 'blocked_below_minimum' : 'blocked_no_source_candidates'),
    remote_apply: false,
    public_approval: false,
    selection_policy: 'green_substantive_source_event_source_no_collision_candidate',
    inventory_count: candidates.length,
    eligible_event_count: grouped.size,
    selected_count: selected.length,
    required_minimum: 5,
    items: selected,
  };
}

if (process.argv[1]?.endsWith('select-alrs-source-recovery-microbatch.mjs')) {
  try {
    const inventory = readJson(inventoryPath);
    const metadata = readJson(metadataPath).items ?? {};
    const sources = sourceEntries(sourcePaths);
    const collisions = collisionKeys(collisionPath);
    const result = selectMicrobatch(inventory, sources, collisions, {
      limit: Number(process.argv.find((arg) => arg.startsWith('--limit='))?.slice(8) ?? 5),
    });
    for (const item of result.items) item.title = metadata[item.proposition_version_id]?.title ?? item.title;
    mkdirSync(resolve(root, 'data/legislative-import/alrs'), { recursive: true });
    writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
    console.log(JSON.stringify({ output: 'data/legislative-import/alrs/alrs-attribution-source-recovery-microbatch-v1.json', status: result.status, eligible_event_count: result.eligible_event_count, selected_count: result.selected_count, remote_apply: false }));
  } catch (error) {
    console.error(`SOURCE_RECOVERY_BLOCKED: ${error.message}`);
    process.exit(2);
  }
}
