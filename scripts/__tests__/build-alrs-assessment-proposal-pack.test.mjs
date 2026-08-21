// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync, unlinkSync } from 'node:fs';
import { buildAssessmentProposalPack } from '../build-alrs-assessment-proposal-pack.mjs';

describe('alrs-assessment-proposal-pack', () => {
  it('gera proposta explícita e mantém revisão humana', () => {
    const result = buildAssessmentProposalPack({ items: [{ title: 'Proteção de mulheres vítimas de violência', draft_assessments: [{ group_slug: 'mulheres' }] }] });
    expect(result.items[0].proposed_assessments[0]).toMatchObject({ group_slug: 'mulheres', impact_direction: null, defending_vote: null, severity: null, structural_type: null, confidence: null, proposal_status: 'needs_human_review' });
    expect(result.public_approval).toBe(false);
  });
});
