#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const batchFile = resolve(root, process.argv[2] ?? 'data/legislative-import/alrs/impact-editorial-batch-001-v1.json');
const output = resolve(root, process.argv.find((arg) => arg.startsWith('--output='))?.slice(9) ?? 'data/legislative-import/alrs/impact-editorial-classifier-decisions-v1.json');
const batch = JSON.parse(readFileSync(batchFile, 'utf8'));
const decisions = (batch.items ?? []).map((item) => ({
  proposition_version_id: item.proposition_version_id,
  review_key: item.review_key,
  decision: item.requires_external_review ? 'needs_changes' : 'approved',
  disposition: item.recommended_disposition,
  rationale: item.recommended_rationale,
  notes: item.requires_external_review ? 'Painel externo exigido pela metodologia; manter em fila externa sem bloquear outras matérias.' : 'Classificação automática baseada em fonte verde, evento não procedural e disposição recomendada.',
  reviewer_type: 'automatic_classifier',
  classifier_confidence: item.recommendation_confidence,
  source_gate: item.source_gate,
}));
const result = { schema_version: '1.0.0', packet_type: 'alrs_editorial_batch_automatic_classifier', batch_id: batch.batch_id, batch_sha256: createHash('sha256').update(JSON.stringify({ batch_id: batch.batch_id, items: batch.items })).digest('hex'), classifier: 'hermes-deterministic-v1', remote_apply: false, items: decisions };
writeFileSync(resolve(root, output), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ output, batch_id: result.batch_id, decisions: decisions.length }));
