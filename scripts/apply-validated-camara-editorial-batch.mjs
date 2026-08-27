#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const positional = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const batchFile = resolve(root, positional[0] ?? 'data/legislative-import/camara/impact-editorial-batch-001-v1.json');
const reviewedFile = resolve(root, positional[1] ?? 'data/legislative-import/camara/impact-editorial-reviewed-decisions-v1.json');
const apply = process.argv.includes('--apply');
const outputFile = resolve(root, process.argv.find((arg) => arg.startsWith('--output='))?.slice(9) ?? '/tmp/camara-editorial-apply.json');

const batch = JSON.parse(readFileSync(batchFile, 'utf8'));
const reviewed = JSON.parse(readFileSync(reviewedFile, 'utf8'));

const reviewMap = new Map(reviewed.reviews.map((r) => [r.proposition_version_id, r]));

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

const files = findJsonFiles(resolve(root, 'data/legislative-import/camara'));
const votesList = [];
for (const f of files) {
  try {
    const data = JSON.parse(readFileSync(f, 'utf8'));
    if (Array.isArray(data.votes)) votesList.push(...data.votes);
  } catch {}
}

const votesByVersion = new Map();
for (const vote of votesList) {
  const list = votesByVersion.get(vote.proposition_version_id) ?? [];
  list.push(vote);
  votesByVersion.set(vote.proposition_version_id, list);
}

const appliedMatrices = [];
let totalFanoutVotes = 0;
const impactedDeputies = new Set();

for (const item of batch.items) {
  const review = reviewMap.get(item.proposition_version_id);
  if (!review || review.decision !== 'approved') continue;

  if (review.disposition === 'assess' && review.matrix) {
    const matchedVotes = votesByVersion.get(item.proposition_version_id) ?? [];
    for (const v of matchedVotes) {
      if (v.deputy_id) impactedDeputies.add(v.deputy_id);
    }
    totalFanoutVotes += matchedVotes.length;

    appliedMatrices.push({
      proposition_version_id: item.proposition_version_id,
      canonical_editorial_key: item.canonical_editorial_key,
      title: item.title,
      matrix: review.matrix,
      assessments: review.assessments,
      fanout_votes: matchedVotes.length,
      fanout_deputies: [...new Set(matchedVotes.map((v) => v.deputy_id))],
      applied_at: new Date().toISOString(),
    });
  }
}

const report = {
  schema_version: '1.0.0',
  batch_id: batch.batch_id,
  house: 'camara',
  applied: apply,
  applied_at: new Date().toISOString(),
  matrices_applied: appliedMatrices.length,
  total_fanout_votes: totalFanoutVotes,
  unique_deputies_impacted: impactedDeputies.size,
  matrices: appliedMatrices,
};

writeFileSync(outputFile, JSON.stringify(report, null, 2));

console.log(`✅ Aplicação editorial federal: ${appliedMatrices.length} matrizes aprovadas com fan-out para ${totalFanoutVotes} votos nominais de ${impactedDeputies.size} parlamentares federais do RS.`);
