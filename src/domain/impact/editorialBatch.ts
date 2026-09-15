export type EditorialBatchItem = {
  proposition_version_id: string;
  review_key: string;
  source_gate?: string;
  official_event_type?: string;
};

export type EditorialBatchContext = {
  batch_id: string;
  batch_sha256: string;
  batch_hash_basis?: 'items' | 'external_source_batch';
  items: EditorialBatchItem[];
};

export type EditorialDecisionEnvelope = {
  batch_id?: string;
  batch_sha256?: string;
  items?: Array<{ proposition_version_id: string; review_key: string; decision: string; disposition?: string; rationale?: string; notes?: string }>;
  decisions?: Array<{ proposition_version_id: string; review_key: string; decision: string; disposition?: string; rationale?: string; notes?: string }>;
};

async function sha256Hex(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function validateEditorialDecisionEnvelope(context: EditorialBatchContext, envelope: EditorialDecisionEnvelope) {
  const errors: string[] = [];
  const expectedHash = await sha256Hex(JSON.stringify({ batch_id: context.batch_id, items: context.items }));
  const rows = envelope.items ?? envelope.decisions ?? [];
  const expected = new Map(context.items.map((item) => [item.proposition_version_id, item]));
  const seen = new Set<string>();
  if ((context.batch_hash_basis ?? 'items') === 'items' && expectedHash !== context.batch_sha256) errors.push('context_batch_sha256_mismatch');
  if (envelope.batch_id !== context.batch_id) errors.push('batch_id_mismatch');
  if (envelope.batch_sha256 !== context.batch_sha256) errors.push('batch_sha256_mismatch');
  if (rows.length !== expected.size) errors.push('cardinality_mismatch');
  for (const row of rows) {
    const source = expected.get(row.proposition_version_id);
    if (!source) { errors.push(`${row.proposition_version_id}:unknown_item`); continue; }
    if (seen.has(row.proposition_version_id)) errors.push(`${row.proposition_version_id}:duplicate_decision`);
    seen.add(row.proposition_version_id);
    if (row.review_key !== source.review_key) errors.push(`${row.proposition_version_id}:review_key_mismatch`);
    if (!['approved', 'needs_changes'].includes(row.decision)) errors.push(`${row.proposition_version_id}:invalid_decision`);
    if (!['assess', 'no_direct_population_group', 'taxonomy_gap', 'excluded'].includes(row.disposition ?? '')) errors.push(`${row.proposition_version_id}:invalid_disposition`);
    const rationale = String(row.decision === 'needs_changes' ? row.notes : row.rationale ?? '').trim();
    if (rationale.length < 20) errors.push(`${row.proposition_version_id}:rationale_too_short`);
    if (row.disposition === 'assess' && source.source_gate && source.source_gate !== 'green') errors.push(`${row.proposition_version_id}:source_gate_not_green`);
    if (source.official_event_type === 'procedural_confirmed') errors.push(`${row.proposition_version_id}:procedural_forbidden`);
  }
  for (const id of expected.keys()) if (!seen.has(id)) errors.push(`${id}:missing_decision`);
  return { valid: errors.length === 0, errors, rows };
}
