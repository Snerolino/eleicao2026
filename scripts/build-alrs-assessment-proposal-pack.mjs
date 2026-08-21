#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const input = resolve(root, 'data/legislative-import/alrs/impact-assessment-draft-pack-v1.json');
const output = resolve(root, 'data/legislative-import/alrs/impact-assessment-proposal-pack-v1.json');

function proposalFor(_title, group) {
  return {
    group_slug: group,
    impact_direction: null,
    defending_vote: null,
    severity: null,
    structural_type: null,
    confidence: null,
    rationale: `Pista preliminar baseada apenas no título oficial: a matéria aparenta relacionar-se a ${group.replaceAll('_', ' ')}. Confirmar o texto integral, o tipo do evento, a direção e o voto antes da aprovação.`,
    proposal_status: 'needs_human_review',
  };
}

export function buildAssessmentProposalPack(pack) {
  const items = (pack.items ?? []).map((item) => ({
    ...item,
    proposed_assessments: (item.draft_assessments ?? []).map((assessment) => proposalFor(item.title, assessment.group_slug)),
    review_status: 'pending_review',
    remote_apply: false,
  }));
  return { schema_version: '1.0.0', packet_type: 'alrs_impact_assessment_proposal_pack', methodology_version: '1.0.0', source: 'official_title_preliminary_proposal', remote_apply: false, public_approval: false, totals: { versions: items.length, proposed_assessments: items.reduce((sum, item) => sum + item.proposed_assessments.length, 0) }, items };
}

function main() {
  const pack = JSON.parse(readFileSync(input, 'utf8'));
  const result = buildAssessmentProposalPack(pack);
  writeFileSync(output, `${JSON.stringify(result, null, 2)}\\n`);
  console.log(JSON.stringify({ output, ...result.totals }));
}

if (process.argv[1]?.endsWith('build-alrs-assessment-proposal-pack.mjs')) main();
