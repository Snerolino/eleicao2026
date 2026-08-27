#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { CANONICAL_GROUPS } from './cross-house-similarity-matcher.mjs';

const root = resolve(import.meta.dirname, '..');
const batchFile = resolve(root, process.argv[2] ?? 'data/legislative-import/camara/impact-editorial-batch-001-v1.json');
const classifierFile = resolve(root, process.argv[3] ?? 'data/legislative-import/camara/impact-editorial-classifier-decisions-v1.json');
const output = resolve(root, process.argv.find((arg) => arg.startsWith('--output='))?.slice(9) ?? 'data/legislative-import/camara/impact-editorial-reviewed-decisions-v1.json');

const batch = JSON.parse(readFileSync(batchFile, 'utf8'));
const classifierData = JSON.parse(readFileSync(classifierFile, 'utf8'));

const canonicalGroupSet = new Set(CANONICAL_GROUPS);

const reviews = [];

for (const dec of classifierData.decisions ?? []) {
  const issues = [];

  if (dec.disposition === 'assess') {
    if (!dec.matrix) {
      issues.push('Matéria com disposition=assess deve conter objeto matrix');
    } else {
      if (dec.matrix.severity < 1 || dec.matrix.severity > 5) issues.push('Severidade inválida (deve ser entre 1 e 5)');
      if (!['structural', 'budgetary', 'symbolic'].includes(dec.matrix.structural_type)) issues.push('Tipo estrutural inválido');
    }

    if (!Array.isArray(dec.assessments) || dec.assessments.length === 0) {
      issues.push('Matéria com disposition=assess deve conter pelo menos 1 assessment');
    } else {
      for (const ass of dec.assessments) {
        if (!canonicalGroupSet.has(ass.group_slug)) issues.push(`Grupo ${ass.group_slug} não pertence aos 14 canônicos`);
        if (!['positive', 'negative', 'mixed', 'unclear'].includes(ass.impact_direction)) issues.push('Direção de impacto inválida');
        if (ass.defending_vote !== null && !['sim', 'nao'].includes(ass.defending_vote)) issues.push('Voto defensor inválido (deve ser sim, nao ou null)');
      }
    }
  } else {
    if (dec.matrix !== null) issues.push(`Matéria com disposition=${dec.disposition} deve ter matrix=null`);
    if (Array.isArray(dec.assessments) && dec.assessments.length > 0) issues.push(`Matéria com disposition=${dec.disposition} deve ter assessments=[]`);
  }

  const isApproved = issues.length === 0;

  reviews.push({
    proposition_version_id: dec.proposition_version_id,
    canonical_editorial_key: dec.canonical_editorial_key,
    title: dec.title,
    disposition: dec.disposition,
    decision: isApproved ? 'approved' : 'rejected',
    auto_approved: isApproved,
    requires_external_review: dec.requires_external_review ?? false,
    reviewer_type: 'hermes-federal-autonomous-reviewer-v1',
    reviewed_at: new Date().toISOString(),
    rationale: dec.rationale,
    matrix: dec.matrix,
    assessments: dec.assessments,
    issues,
  });
}

const payload = {
  schema_version: '1.0.0',
  batch_id: batch.batch_id,
  house: 'camara',
  reviewed_at: new Date().toISOString(),
  total_reviewed: reviews.length,
  summary: {
    approved: reviews.filter((r) => r.decision === 'approved').length,
    rejected: reviews.filter((r) => r.decision === 'rejected').length,
    requires_external_review: reviews.filter((r) => r.requires_external_review).length,
  },
  reviews,
};

writeFileSync(output, JSON.stringify(payload, null, 2));
console.log(`✅ Revisão federal concluída: ${payload.summary.approved}/${payload.total_reviewed} aprovadas em ${output}`);
