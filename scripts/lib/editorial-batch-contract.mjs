import { createHash } from 'node:crypto';

export const DISPOSITIONS = new Set(['assess', 'no_direct_population_group', 'taxonomy_gap', 'excluded']);
export const DECISIONS = new Set(['approved', 'needs_changes']);
export const DIRECTIONS = new Set(['positive', 'negative', 'mixed', 'unclear']);
export const STRUCTURAL_TYPES = new Set(['structural', 'budgetary', 'symbolic']);
export const CANONICAL_GROUPS = new Set([
  'povos_indigenas',
  'comunidades_quilombolas',
  'populacao_negra_periferica',
  'mulheres',
  'lgbtqia',
  'pessoas_com_deficiencia',
  'populacao_rua',
  'populacao_carceraria',
  'criancas_adolescentes_vulnerabilidade',
  'pessoas_idosas_dependentes',
  'trabalhadores_informais',
  'agricultura_familiar_sem_terra',
  'povos_de_terreiro',
  'imigrantes_refugiados',
]);

const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const text = (value) => String(value ?? '').trim();

export function canonicalBatchPayload(batch) {
  return { batch_id: batch?.batch_id, items: batch?.items ?? [] };
}

export function canonicalBatchHash(batch) {
  return sha256(JSON.stringify(canonicalBatchPayload(batch)));
}

function validateAssessment(id, assessment, errors) {
  if (!CANONICAL_GROUPS.has(assessment?.group_slug)) errors.push(`${id}:invalid_group_slug`);
  if (!DIRECTIONS.has(assessment?.impact_direction)) errors.push(`${id}:invalid_impact_direction`);
  if (['positive', 'negative'].includes(assessment?.impact_direction) && !['sim', 'nao'].includes(assessment?.defending_vote)) {
    errors.push(`${id}:defending_vote_required`);
  }
  if (assessment?.impact_direction === 'unclear' && assessment.defending_vote != null) errors.push(`${id}:unclear_defending_vote_must_be_null`);
  if (!Number.isFinite(assessment?.confidence) || assessment.confidence < 0 || assessment.confidence > 1) errors.push(`${id}:invalid_confidence`);
  if (text(assessment?.rationale).length < 20) errors.push(`${id}:assessment_rationale_too_short`);
}

export function validateBatch(batch) {
  const errors = [];
  const items = Array.isArray(batch?.items) ? batch.items : [];
  if (!text(batch?.batch_id)) errors.push('batch_id_missing');
  const seen = new Set();
  for (const item of items) {
    const id = item?.proposition_version_id;
    if (!id) errors.push('proposition_version_id_missing');
    if (seen.has(id)) errors.push(`${id}:duplicate_item`);
    seen.add(id);
    if (!text(item?.review_key)) errors.push(`${id}:review_key_missing`);
    if (item?.remote_apply === true) errors.push(`${id}:remote_apply_must_be_false`);
    if (item?.public_approval === true) errors.push(`${id}:public_approval_must_be_false`);
  }
  return { valid: errors.length === 0, errors, expected_hash: canonicalBatchHash(batch), item_ids: [...seen] };
}

export function validateDecisionEnvelope(batch, envelope) {
  const errors = [...validateBatch(batch).errors];
  const expectedHash = canonicalBatchHash(batch);
  const expectedById = new Map((batch?.items ?? []).map((item) => [item.proposition_version_id, item]));
  const rows = envelope?.items ?? envelope?.decisions ?? [];
  const seen = new Set();
  if (envelope?.batch_id !== batch?.batch_id) errors.push('batch_id_mismatch');
  if (envelope?.batch_sha256 !== expectedHash) errors.push('batch_sha256_mismatch');
  if (rows.length !== expectedById.size) errors.push('cardinality_mismatch');

  for (const row of rows) {
    const id = row?.proposition_version_id;
    const source = expectedById.get(id);
    if (!source) { errors.push(`${id ?? '<missing>'}:unknown_item`); continue; }
    if (seen.has(id)) errors.push(`${id}:duplicate_decision`);
    seen.add(id);
    if (row.review_key !== source.review_key) errors.push(`${id}:review_key_mismatch`);
    if (!DECISIONS.has(row.decision)) errors.push(`${id}:invalid_decision`);
    if (!DISPOSITIONS.has(row.disposition)) errors.push(`${id}:invalid_disposition`);
    if (source.source_gate && source.source_gate !== 'green' && row.disposition === 'assess') errors.push(`${id}:source_gate_not_green`);
    if ((source.official_event_type ?? source.event_type) === 'procedural_confirmed') errors.push(`${id}:procedural_forbidden`);
    if (text(row.decision === 'needs_changes' ? row.notes : row.rationale).length < 20) errors.push(`${id}:rationale_too_short`);
    if (row.disposition === 'assess') {
      if (!row.matrix || ![1, 2, 3, 4, 5].includes(row.matrix.severity)) errors.push(`${id}:invalid_severity`);
      if (!STRUCTURAL_TYPES.has(row.matrix?.structural_type)) errors.push(`${id}:invalid_structural_type`);
      if (!Array.isArray(row.assessments) || row.assessments.length === 0) errors.push(`${id}:assessments_required`);
      for (const assessment of row.assessments ?? []) validateAssessment(id, assessment, errors);
    }
  }
  for (const id of expectedById.keys()) if (!seen.has(id)) errors.push(`${id}:missing_decision`);
  return { valid: errors.length === 0, errors, expected_hash: expectedHash, rows, approved: rows.filter((row) => row.decision === 'approved').length, needs_changes: rows.filter((row) => row.decision === 'needs_changes').length };
}

export function requiresExternalReview(decision) {
  return Number(decision?.matrix?.severity) >= 4 || (Number.isFinite(decision?.confidence) && decision.confidence < 0.6) || (decision?.assessments ?? []).some((assessment) => Number(assessment.confidence) < 0.6);
}
