#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const input = resolve(root, 'data/legislative-import/alrs/impact-matrix-review-pack-p0-p1.json');
const output = resolve(root, 'data/legislative-import/alrs/impact-assessment-draft-pack-v1.json');

export function buildAssessmentDraftPack(pack) {
  const items = (pack.items ?? []).filter((item) => Array.isArray(item.group_candidates) && item.group_candidates.length > 0).map((item) => ({
    proposition_version_id: item.proposition_version_id,
    proposition_external_id: item.proposition_external_id,
    version_key: item.version_key,
    title: item.title,
    priority: item.priority,
    candidate_count: item.candidate_count,
    factual_vote_count: item.factual_vote_count,
    event_external_ids: item.event_external_ids,
    official_sources: item.official_sources,
    group_candidates: item.group_candidates,
    draft_assessments: item.group_candidates.map((group_slug) => ({
      group_slug,
      impact_direction: null,
      defending_vote: null,
      severity: null,
      structural_type: null,
      confidence: null,
      rationale: null,
      status: 'needs_editorial_decision',
    })),
    review_status: 'pending_review',
    remote_apply: false,
  }));
  return { schema_version: '1.0.0', packet_type: 'alrs_impact_assessment_draft_pack', methodology_version: '1.0.0', unit_of_work: 'one_matrix_per_proposition_version', remote_apply: false, public_approval: false, totals: { versions: items.length, factual_votes: items.reduce((sum, item) => sum + item.factual_vote_count, 0), draft_assessments: items.reduce((sum, item) => sum + item.draft_assessments.length, 0) }, items };
}

function main() {
  const pack = JSON.parse(readFileSync(input, 'utf8'));
  const draft = buildAssessmentDraftPack(pack);
  writeFileSync(output, `${JSON.stringify(draft, null, 2)}\n`);
  console.log(JSON.stringify({ output, ...draft.totals }));
}

if (process.argv[1]?.endsWith('build-alrs-assessment-draft-pack.mjs')) main();
