// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { buildAssessmentDraftPack } from '../build-alrs-assessment-draft-pack.mjs';

describe('alrs-assessment-draft-pack', () => {
  it('gera drafts por grupo sem preencher decisão editorial', () => {
    const result = buildAssessmentDraftPack({ items: [{ proposition_version_id: 'v1', group_candidates: ['mulheres', 'criancas_adolescentes_vulnerabilidade'], factual_vote_count: 7 }] });
    expect(result.totals).toMatchObject({ versions: 1, factual_votes: 7, draft_assessments: 2 });
    expect(result.items[0].draft_assessments[0]).toMatchObject({ group_slug: 'mulheres', impact_direction: null, defending_vote: null, status: 'needs_editorial_decision' });
  });
});
