#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const input = resolve(root, 'data/legislative-import/alrs/impact-review-queue-v1.json');
const output = resolve(root, 'data/legislative-import/alrs/impact-editorial-batch-001-v1.json');
const batchSize = 25;
const resolvedCatalogFile = resolve(root, 'data/legislative-import/alrs/impact-resolved-version-catalog-v1.json');

function loadResolvedCatalog() {
  if (!existsSync(resolvedCatalogFile)) return { resolved_version_ids: [], existing_matrix_version_ids: [], profile_candidate_ids: [] };
  return JSON.parse(readFileSync(resolvedCatalogFile, 'utf8'));
}

function canonicalSourceGreenIds() {
  const ids = new Set();
  for (const name of ['p0-substantive-source-manifest.json', 'p1-substantive-source-manifest.json', 'p2-microbatch-2-source-manifest.json', 'p2-microbatch-4-source-manifest.json', 'p2-microbatch-5-source-manifest.json']) {
    const file = resolve(root, 'data/legislative-import/alrs', name);
    if (!existsSync(file)) continue;
    const data = JSON.parse(readFileSync(file, 'utf8'));
    for (const [id, source] of Object.entries(data.items ?? {})) if (source?.durability_gate === 'green' || source?.source_durability_gate === 'green') ids.add(id);
  }
  return ids;
}

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
const resolvedCatalog = loadResolvedCatalog();
const resolvedIds = new Set(resolvedCatalog.resolved_version_ids ?? []);
const existingMatrixIds = new Set(resolvedCatalog.existing_matrix_version_ids ?? []);
const sourceGreenIds = canonicalSourceGreenIds();
const candidates = (queue.items ?? [])
  .filter((item) => item.house === 'alrs' && !item.version_key_collision && item.editorial_disposition === 'pending_review' && !resolvedIds.has(item.proposition_version_id) && !existingMatrixIds.has(item.proposition_version_id))
  .map((item) => ({
    ...item,
    coverage_priority: Number(item.candidate_count ?? 0) * Number(item.factual_vote_count ?? 0),
  }))
  .sort((a, b) => b.coverage_priority - a.coverage_priority || a.review_key.localeCompare(b.review_key))
  .slice(0, batchSize)
  .map((item) => {
    const recommended = recommendation(item);
    const candidateIds = [...new Set((item.candidate_source_links ?? []).map((link) => link.candidate_id).filter(Boolean))].sort();
    const newProfileIds = candidateIds.filter((id) => !(resolvedCatalog.profile_candidate_ids ?? []).includes(id));
    return {
      proposition_version_id: item.proposition_version_id,
      review_key: item.review_key,
      title: item.title,
      official_event_type: item.official_event_type,
      candidate_count: item.candidate_count,
      factual_vote_count: item.factual_vote_count,
      coverage_priority: item.coverage_priority,
      source_urls: item.source_urls ?? [],
      source_gate: sourceGreenIds.has(item.proposition_version_id) ? 'green' : 'needs_substantive_source_check',
      candidate_ids: candidateIds,
      unique_candidates: candidateIds.length,
      new_profiles_impacted: newProfileIds.length,
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
  batch_id: 'alrs-impact-editorial-batch-001-v2',
  batch_size: batchSize,
  review_status: 'pending_review',
  remote_apply: false,
  public_approval: false,
  totals: {
    proposals: candidates.length,
    candidate_occurrences: candidates.reduce((sum, item) => sum + Number(item.candidate_count ?? 0), 0),
    unique_candidates: new Set(candidates.flatMap((item) => item.candidate_ids ?? [])).size,
    new_profiles_impacted: candidates.reduce((sum, item) => sum + Number(item.new_profiles_impacted ?? 0), 0),
    factual_votes: candidates.reduce((sum, item) => sum + Number(item.factual_vote_count ?? 0), 0),
  },
  items: candidates,
};

result.batch_sha256 = createHash('sha256').update(JSON.stringify({ batch_id: result.batch_id, items: result.items })).digest('hex');

writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ output, ...result.totals, batch_id: result.batch_id, batch_sha256: result.batch_sha256 }));
