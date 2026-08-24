#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const input = resolve(root, 'data/legislative-import/alrs/impact-review-queue-v1.json');
const output = resolve(root, 'data/legislative-import/alrs/impact-editorial-batch-001-v1.json');
const batchSize = 25;

function recommendation(item) {
  const title = String(item.title ?? '').toLowerCase();
  if (item.event_type === 'procedural_confirmed') {
    return { disposition: 'excluded', rationale: 'Evento classificado como procedural; não deve gerar matriz de mérito.', confidence: 0.9 };
  }
  if (/mulher|violên|violenc|matern|lgbt|trans|travesti|gênero|genero/.test(title)) {
    return { disposition: 'assess', rationale: 'Título indica possível efeito direto sobre grupo populacional; exige confirmação editorial e assessment completo.', confidence: 0.62 };
  }
  if (/estud|educa|agric|rural|abigeato|turismo|cultura|desporto/.test(title)) {
    return { disposition: 'taxonomy_gap', rationale: 'Título sugere público específico que pode não estar representado com segurança na taxonomia v1; confirmar antes de forçar grupo.', confidence: 0.58 };
  }
  return { disposition: 'no_direct_population_group', rationale: 'Não há grupo populacional direto identificável com segurança apenas na unidade normativa atual; confirmar editorialmente.', confidence: 0.55 };
}

const queue = JSON.parse(readFileSync(input, 'utf8'));
const candidates = (queue.items ?? [])
  .filter((item) => item.house === 'alrs' && !item.version_key_collision && item.editorial_disposition === 'pending_review')
  .map((item) => ({
    ...item,
    coverage_priority: Number(item.candidate_count ?? 0) * Number(item.factual_vote_count ?? 0),
  }))
  .sort((a, b) => b.coverage_priority - a.coverage_priority || a.review_key.localeCompare(b.review_key))
  .slice(0, batchSize)
  .map((item) => {
    const recommended = recommendation(item);
    return {
      proposition_version_id: item.proposition_version_id,
      review_key: item.review_key,
      title: item.title,
      official_event_type: item.official_event_type,
      candidate_count: item.candidate_count,
      factual_vote_count: item.factual_vote_count,
      coverage_priority: item.coverage_priority,
      source_urls: item.source_urls ?? [],
      source_gate: 'needs_substantive_source_check',
      recommended_disposition: recommended.disposition,
      recommended_rationale: recommended.rationale,
      recommendation_confidence: recommended.confidence,
      review_status: 'pending_review',
      remote_apply: false,
      public_approval: false,
    };
  });

const result = {
  schema_version: '1.0.0',
  packet_type: 'alrs_impact_editorial_batch_proposals',
  unit_of_work: 'one_proposition_version_fanout_to_all_voters',
  batch_size: batchSize,
  review_status: 'pending_review',
  remote_apply: false,
  public_approval: false,
  totals: {
    proposals: candidates.length,
    candidate_coverage: candidates.reduce((sum, item) => sum + Number(item.candidate_count ?? 0), 0),
    factual_votes: candidates.reduce((sum, item) => sum + Number(item.factual_vote_count ?? 0), 0),
  },
  items: candidates,
};

writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ output, ...result.totals }));
