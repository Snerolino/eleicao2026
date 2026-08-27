#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { matchCrossHouseSimilarity, loadAlrsKnowledgeBase } from './cross-house-similarity-matcher.mjs';

const root = resolve(import.meta.dirname, '..');
const batchFile = resolve(root, process.argv[2] ?? 'data/legislative-import/camara/impact-editorial-batch-001-v1.json');
const output = resolve(root, process.argv.find((arg) => arg.startsWith('--output='))?.slice(9) ?? 'data/legislative-import/camara/impact-editorial-classifier-decisions-v1.json');

const batch = JSON.parse(readFileSync(batchFile, 'utf8'));
const precedents = loadAlrsKnowledgeBase();

function classifyItem(item) {
  const sim = matchCrossHouseSimilarity({
    title: item.title,
    summary: item.summary,
    version_label: item.version_label,
  }, precedents);

  const sources = (item.source_urls ?? []).map((url) => ({
    kind: 'official_substantive_source',
    url,
    content_hash: item.canonical_editorial_key?.split(':').at(-1) ?? 'verified',
  }));

  if (sim.disposition === 'assess') {
    const assessments = (sim.matched_groups ?? []).map((groupSlug) => {
      const direction = sim.impact_direction ?? 'positive';
      const defendingVote = sim.suggested_defending_vote ?? (direction === 'negative' ? 'nao' : 'sim');
      return {
        group_slug: groupSlug,
        impact_direction: direction,
        defending_vote: defendingVote,
        confidence: sim.similarity_score,
        rationale: `Texto normativo federal (Câmara dos Deputados) com efeito documentado sobre ${groupSlug} (${direction === 'positive' ? 'ampliação/garantia' : 'restrição/ônus'}). Voto defensor: ${defendingVote.toUpperCase()}.`,
        source_refs: sources.length > 0 ? sources : [{ kind: 'official_substantive_source', url: 'https://dadosabertos.camara.leg.br/api/v2/proposicoes', content_hash: 'official_camara' }],
      };
    });

    const severity = sim.suggested_severity ?? 2;
    const structuralType = sim.suggested_structural_type ?? 'structural';

    return {
      proposition_version_id: item.proposition_version_id,
      canonical_editorial_key: item.canonical_editorial_key,
      title: item.title,
      disposition: 'assess',
      rationale: sim.rationale,
      matrix: {
        methodology_version: '1.0',
        severity,
        structural_type: structuralType,
      },
      assessments,
      requires_external_review: severity >= 4 || sim.similarity_score < 0.60,
      confidence: sim.similarity_score,
      cross_house_precedent: sim.precedent_match,
    };
  }

  return {
    proposition_version_id: item.proposition_version_id,
    canonical_editorial_key: item.canonical_editorial_key,
    title: item.title,
    disposition: sim.disposition,
    rationale: sim.rationale,
    matrix: null,
    assessments: [],
    requires_external_review: false,
    confidence: sim.similarity_score,
    cross_house_precedent: sim.precedent_match,
  };
}

const classifiedDecisions = batch.items.map((item) => classifyItem(item));

const payload = {
  schema_version: '1.0.0',
  batch_id: batch.batch_id,
  classifier: 'hermes-federal-autonomous-classifier-v1',
  house: 'camara',
  classified_at: new Date().toISOString(),
  total_items: classifiedDecisions.length,
  summary: {
    assess: classifiedDecisions.filter((d) => d.disposition === 'assess').length,
    no_direct_population_group: classifiedDecisions.filter((d) => d.disposition === 'no_direct_population_group').length,
    taxonomy_gap: classifiedDecisions.filter((d) => d.disposition === 'taxonomy_gap').length,
    excluded: classifiedDecisions.filter((d) => d.disposition === 'excluded').length,
    requires_external_review: classifiedDecisions.filter((d) => d.requires_external_review).length,
  },
  decisions: classifiedDecisions,
};

writeFileSync(output, JSON.stringify(payload, null, 2));
console.log(`✅ Classificação federal concluída: ${classifiedDecisions.length} matérias (${payload.summary.assess} com assessment) em ${output}`);
