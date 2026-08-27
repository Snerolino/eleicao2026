#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { CANONICAL_GROUPS } from './cross-house-similarity-matcher.mjs';

const root = resolve(import.meta.dirname, '..');
const batchFile = resolve(root, process.argv[2] ?? 'data/legislative-import/camara/impact-editorial-batch-001-v1.json');
const reviewedFile = resolve(root, process.argv[3] ?? 'data/legislative-import/camara/impact-editorial-reviewed-decisions-v1.json');
const outputFile = resolve(root, process.argv[4] ?? '/tmp/camara-editorial-validation.json');

const batch = JSON.parse(readFileSync(batchFile, 'utf8'));
const reviewed = JSON.parse(readFileSync(reviewedFile, 'utf8'));

const errors = [];
const canonicalGroupSet = new Set(CANONICAL_GROUPS);

if (batch.batch_id !== reviewed.batch_id) {
  errors.push(`Mismatch de batch_id: ${batch.batch_id} vs ${reviewed.batch_id}`);
}

const batchItemIds = new Set(batch.items.map((i) => i.proposition_version_id));
const reviewMap = new Map(reviewed.reviews.map((r) => [r.proposition_version_id, r]));

for (const id of batchItemIds) {
  const review = reviewMap.get(id);
  if (!review) {
    errors.push(`Proposição ${id} presente no lote mas ausente na revisão`);
    continue;
  }

  if (review.disposition === 'assess') {
    if (!review.matrix) errors.push(`[${id}] disposition=assess requer matrix`);
    if (!Array.isArray(review.assessments) || review.assessments.length === 0) {
      errors.push(`[${id}] disposition=assess requer pelo menos 1 assessment`);
    } else {
      for (const ass of review.assessments) {
        if (!canonicalGroupSet.has(ass.group_slug)) {
          errors.push(`[${id}] grupo ${ass.group_slug} inválido`);
        }
      }
    }
  }
}

const validationReport = {
  schema_version: '1.0.0',
  validated_at: new Date().toISOString(),
  valid: errors.length === 0,
  batch_id: batch.batch_id,
  total_items: batch.items.length,
  total_reviewed: reviewed.reviews.length,
  approved_count: reviewed.reviews.filter((r) => r.decision === 'approved').length,
  errors,
};

writeFileSync(outputFile, JSON.stringify(validationReport, null, 2));

if (errors.length > 0) {
  console.error(`❌ Validação falhou com ${errors.length} erro(s):`, errors);
  process.exit(1);
} else {
  console.log(`✅ Validação independente aprovada: ${validationReport.approved_count} decisões válidas`);
  process.exit(0);
}
