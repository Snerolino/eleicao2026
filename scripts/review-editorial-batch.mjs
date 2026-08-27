#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const batchFile = args.find((arg) => !arg.startsWith('--')) ?? 'data/legislative-import/alrs/impact-editorial-batch-001-v1.json';
const classifierFile = args.find((arg, index) => !arg.startsWith('--') && index > 0) ?? 'data/legislative-import/alrs/impact-editorial-classifier-decisions-v1.json';
const output = resolve(root, args.find((arg) => arg.startsWith('--output='))?.slice(9) ?? 'data/legislative-import/alrs/impact-editorial-reviewed-decisions-v1.json');
const batch = JSON.parse(readFileSync(resolve(root, batchFile), 'utf8'));
const classifier = JSON.parse(readFileSync(resolve(root, classifierFile), 'utf8'));
const sourceItems = batch.items ?? [];
const decisions = classifier.items ?? classifier.decisions ?? [];
const expectedHash = createHash('sha256').update(JSON.stringify({ batch_id: batch.batch_id, items: sourceItems })).digest('hex');

const allowedDecisions = new Set(['approved', 'needs_changes']);
const allowedDispositions = new Set(['no_direct_population_group', 'taxonomy_gap', 'excluded', 'assess']);
const allowedDirections = new Set(['positive', 'negative', 'mixed', 'unclear']);
const allowedStructuralTypes = new Set(['structural', 'budgetary', 'symbolic']);
const allowedCanonicalGroups = new Set([
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

const errors = [];
if (classifier.batch_id !== batch.batch_id) errors.push('batch_id_mismatch');
if (classifier.batch_sha256 !== expectedHash) errors.push('batch_sha256_mismatch');
if (decisions.length !== sourceItems.length) errors.push('cardinality_mismatch');

const sourceById = new Map(sourceItems.map((item) => [item.proposition_version_id, item]));
const seen = new Set();

const summary = {
  items: sourceItems.length,
  approved: 0,
  needs_changes: 0,
  assess: 0,
  no_direct_population_group: 0,
  taxonomy_gap: 0,
  excluded: 0,
  external_review_required: 0,
};

for (const decision of decisions) {
  const id = decision.proposition_version_id;
  const source = sourceById.get(id);
  if (!source) { errors.push(`${id ?? '<missing>'}:unknown_version`); continue; }
  if (seen.has(id)) errors.push(`${id}:duplicate`);
  seen.add(id);

  if (decision.review_key !== source.review_key) errors.push(`${id}:review_key_mismatch`);
  if (!allowedDecisions.has(decision.decision)) errors.push(`${id}:invalid_decision`);
  if (!allowedDispositions.has(decision.disposition)) errors.push(`${id}:invalid_disposition`);
  if (source.source_gate !== 'green') errors.push(`${id}:source_not_green`);
  if ((source.official_event_type ?? source.event_type) === 'procedural_confirmed' && decision.disposition === 'assess') {
    errors.push(`${id}:procedural_forbidden_from_assess`);
  }

  if (decision.decision === 'needs_changes' && (!decision.disposition || String(decision.notes ?? '').trim().length < 20)) {
    errors.push(`${id}:needs_changes_requires_disposition_and_notes`);
  }
  if (decision.decision === 'approved' && String(decision.rationale ?? '').trim().length < 20) {
    errors.push(`${id}:approved_requires_rationale`);
  }
  if (decision.reviewer_type !== 'automatic_classifier') errors.push(`${id}:classifier_reviewer_type_missing`);

  // Validação estrita do assessment quando disposition = assess
  if (decision.disposition === 'assess') {
    if (!decision.matrix || typeof decision.matrix !== 'object') {
      errors.push(`${id}:assess_requires_matrix`);
    } else {
      const { severity, structural_type } = decision.matrix;
      if (![1, 2, 3, 4, 5].includes(severity)) errors.push(`${id}:invalid_severity`);
      if (!allowedStructuralTypes.has(structural_type)) errors.push(`${id}:invalid_structural_type`);
    }

    if (!Array.isArray(decision.assessments) || decision.assessments.length === 0) {
      errors.push(`${id}:assess_requires_assessments_array`);
    } else {
      for (const assessment of decision.assessments) {
        if (!allowedCanonicalGroups.has(assessment.group_slug)) errors.push(`${id}:invalid_group_slug_${assessment.group_slug}`);
        if (!allowedDirections.has(assessment.impact_direction)) errors.push(`${id}:invalid_impact_direction_${assessment.impact_direction}`);

        // Regras de defending_vote
        if (['positive', 'negative'].includes(assessment.impact_direction) && !['sim', 'nao'].includes(assessment.defending_vote)) {
          errors.push(`${id}:positive_or_negative_requires_defending_vote_sim_or_nao`);
        }
        if (assessment.impact_direction === 'unclear' && assessment.defending_vote !== null && assessment.defending_vote !== undefined) {
          errors.push(`${id}:unclear_requires_defending_vote_null`);
        }

        if (typeof assessment.confidence !== 'number' || assessment.confidence < 0 || assessment.confidence > 1) {
          errors.push(`${id}:invalid_confidence`);
        }
        if (String(assessment.rationale ?? '').trim().length < 20) {
          errors.push(`${id}:assessment_rationale_too_short`);
        }
      }
    }
  }

  // Contabilidade de sumário
  if (decision.decision === 'approved') summary.approved += 1;
  else summary.needs_changes += 1;

  if (decision.disposition === 'assess') summary.assess += 1;
  else if (decision.disposition === 'no_direct_population_group') summary.no_direct_population_group += 1;
  else if (decision.disposition === 'taxonomy_gap') summary.taxonomy_gap += 1;
  else if (decision.disposition === 'excluded') summary.excluded += 1;

  if (decision.requires_external_review) summary.external_review_required += 1;
}

for (const source of sourceItems) if (!seen.has(source.proposition_version_id)) errors.push(`${source.proposition_version_id}:missing_decision`);

const result = {
  schema_version: '1.0.0',
  packet_type: 'alrs_editorial_batch_automatic_review',
  batch_id: batch.batch_id,
  batch_sha256: expectedHash,
  reviewer: 'hermes-independent-reviewer-v2',
  reviewer_type: 'automatic_reviewer',
  external_review_gate: 'not_applicable_at_disposition_stage',
  remote_apply: false,
  valid: errors.length === 0,
  summary,
  errors,
  items: decisions.map((item) => ({ ...item, reviewer_type: 'automatic_reviewer', review_status: errors.length ? 'rejected' : 'reviewed' })),
};

writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ output, batch_id: result.batch_id, batch_sha256: result.batch_sha256, valid: result.valid, decisions: decisions.length, errors: errors.length, summary }));
if (errors.length) process.exit(1);
