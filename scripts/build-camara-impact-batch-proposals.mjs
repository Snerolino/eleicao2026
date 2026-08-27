#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadAlrsKnowledgeBase, matchCrossHouseSimilarity } from './cross-house-similarity-matcher.mjs';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'data/legislative-import/camara/impact-editorial-batch-001-v1.json');
const batchSize = 30;

function findJsonFiles(dir) {
  let results = [];
  if (!existsSync(dir)) return results;
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    const full = resolve(dir, item.name);
    if (item.isDirectory()) results.push(...findJsonFiles(full));
    else if (
      item.name.endsWith('.json') &&
      !item.name.includes('candidate-catalog') &&
      !item.name.includes('manifest') &&
      !item.name.includes('scout') &&
      !item.name.includes('impact-editorial')
    ) {
      results.push(full);
    }
  }
  return results;
}

function loadFederalPropositionsAndVotes() {
  const files = findJsonFiles(resolve(root, 'data/legislative-import/camara'));
  const propsMap = new Map();
  const votesList = [];

  for (const f of files) {
    try {
      const data = JSON.parse(readFileSync(f, 'utf8'));
      if (Array.isArray(data.propositions)) {
        for (const p of data.propositions) {
          const existing = propsMap.get(p.external_id) ?? { ...p, versions: [] };
          const existingKeys = new Set(existing.versions.map((v) => v.version_key));
          for (const v of p.versions ?? []) {
            if (!existingKeys.has(v.version_key)) {
              existing.versions.push(v);
              existingKeys.add(v.version_key);
            }
          }
          propsMap.set(p.external_id, existing);
        }
      }
      if (Array.isArray(data.votes)) {
        votesList.push(...data.votes);
      }
    } catch {}
  }

  return { propositions: [...propsMap.values()], votes: votesList };
}

function computeCanonicalKey(prop, version) {
  const type = String(prop.proposition_type ?? 'outro').toUpperCase();
  const num = String(prop.number ?? '0');
  const yr = String(prop.year ?? '2026');
  const hash = version.text_hash ? (version.text_hash.startsWith('sha256:') ? version.text_hash.slice(7, 19) : version.text_hash.slice(0, 12)) : 'nohash';
  return `camara:${type}:${num}:${yr}:${version.version_key}:${hash}`;
}

const precedents = loadAlrsKnowledgeBase();
const { propositions, votes } = loadFederalPropositionsAndVotes();

// Mapeia votos por proposition_version_id
const votesByVersion = new Map();
for (const vote of votes) {
  const list = votesByVersion.get(vote.proposition_version_id) ?? [];
  list.push(vote);
  votesByVersion.set(vote.proposition_version_id, list);
}

const batchItems = [];

for (const prop of propositions) {
  for (const version of prop.versions ?? []) {
    const versionId = `proposition_versions:camara:${prop.external_id}:${version.version_key}`;
    const matchedVotes = votesByVersion.get(versionId) ?? [];
    const deputyIds = [...new Set(matchedVotes.map((v) => v.deputy_id).filter(Boolean))];

    const similarity = matchCrossHouseSimilarity({
      title: prop.title,
      summary: prop.summary,
      version_label: version.version_label,
    }, precedents);

    const canonicalKey = computeCanonicalKey(prop, version);
    const sourceUrls = [
      prop.official_url,
      version.source,
      ...(version.voting_events ?? []).map((e) => e.source),
    ].filter((u) => typeof u === 'string' && u.startsWith('http'));

    batchItems.push({
      proposition_version_id: versionId,
      canonical_editorial_key: canonicalKey,
      external_id: prop.external_id,
      version_key: version.version_key,
      title: prop.title ?? `${prop.proposition_type} ${prop.number}/${prop.year}`,
      summary: prop.summary ?? version.version_label ?? '',
      version_label: version.version_label ?? '',
      house: 'camara',
      official_event_type: similarity.disposition === 'excluded' ? 'procedural_confirmed' : 'merit_confirmed',
      candidate_count: deputyIds.length,
      factual_vote_count: matchedVotes.length,
      coverage_priority: Math.max(1, deputyIds.length * matchedVotes.length),
      source_urls: [...new Set(sourceUrls)],
      source_gate: sourceUrls.length > 0 ? 'green' : 'needs_substantive_source_check',
      candidate_ids: deputyIds,
      unique_candidates: deputyIds.length,
      recommended_disposition: similarity.disposition,
      recommended_rationale: similarity.rationale,
      recommendation_confidence: similarity.similarity_score,
      matched_groups: similarity.matched_groups,
      suggested_defending_vote: similarity.suggested_defending_vote,
      suggested_structural_type: similarity.suggested_structural_type,
      suggested_severity: similarity.suggested_severity,
      precedent_match: similarity.precedent_match,
      review_status: 'pending_review',
      remote_apply: false,
    });
  }
}

// Ordena por prioridade de cobertura
batchItems.sort((a, b) => b.coverage_priority - a.coverage_priority || a.canonical_editorial_key.localeCompare(b.canonical_editorial_key));

const selectedItems = batchItems.slice(0, batchSize);

const batchPayload = {
  schema_version: '1.0.0',
  batch_id: `camara-editorial-batch-001-${createHash('sha256').update(JSON.stringify(selectedItems)).digest('hex').slice(0, 12)}`,
  house: 'camara',
  created_at: new Date().toISOString(),
  total_candidates: selectedItems.length,
  items: selectedItems,
};

writeFileSync(output, JSON.stringify(batchPayload, null, 2));
console.log(`✅ Lote federal construído: ${selectedItems.length} proposições em ${output}`);
