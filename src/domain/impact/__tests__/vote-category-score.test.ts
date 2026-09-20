import { describe, expect, it } from 'vitest';
import {
  buildVoteCategoryScores,
  formatCategoryScore,
  type VoteCategoryScoreFact,
} from '../vote-category-score';

const fact = (
  overrides: Partial<VoteCategoryScoreFact> = {},
): VoteCategoryScoreFact => ({
  candidate_id: 'a',
  house: 'alrs',
  voting_event_id: 'event-1',
  proposition_version_id: 'version-1',
  assessment_id: 'assessment-1',
  group_slug: 'mulheres',
  value: 'sim',
  impact_direction: 'positive',
  defending_vote: 'sim',
  textual_defending_vote: 'sim',
  event_defending_vote: 'sim',
  score_eligible: true,
  vote_attribution_status: 'isolated',
  score_withholding_reason: null,
  attribution_review_status: 'approved',
  attribution_methodology_version: '2.0.0',
  severity: 3,
  structural_type: 'structural',
  confidence: 0.9,
  review_status: 'approved',
  ...overrides,
});

describe('vote-category-score v2', () => {
  it('deriva saldo apenas de eventos com atribuição v2 aprovada', () => {
    const [result] = buildVoteCategoryScores([
      fact({ severity: 4, structural_type: 'structural' }),
      fact({
        voting_event_id: 'event-2',
        assessment_id: 'assessment-2',
        value: 'nao',
        severity: 2,
        structural_type: 'budgetary',
      }),
    ]);
    expect(result).toMatchObject({
      candidate_id: 'a',
      group_slug: 'mulheres',
      score: 0.5,
      eligible_weight: 8,
      evaluated_events: 2,
      excluded_no_data: 0,
    });
    expect(formatCategoryScore(result.score)).toBe('+0,50');
  });

  it('retém evento sem atribuição mesmo que o defending_vote textual exista', () => {
    const [result] = buildVoteCategoryScores([
      fact({
        event_defending_vote: null,
        score_eligible: false,
        vote_attribution_status: 'event_binding_missing',
        score_withholding_reason: 'Objeto do evento não vinculado.',
        attribution_review_status: 'pending_review',
      }),
    ]);
    expect(result.score).toBeNull();
    expect(result.evaluated_events).toBe(0);
    expect(result.withheld_events).toBe(1);
    expect(formatCategoryScore(result.score)).toBe('não avaliado');
  });

  it('não usa campos legados do assessment para fabricar score', () => {
    const [result] = buildVoteCategoryScores([
      fact({
        event_defending_vote: undefined,
        score_eligible: undefined,
        vote_attribution_status: undefined,
        attribution_review_status: undefined,
        attribution_methodology_version: undefined,
      }),
    ]);
    expect(result.score).toBeNull();
    expect(result.withheld_events).toBe(1);
  });

  it('não conta duas vezes o mesmo evento/assessment quando fontes convergem', () => {
    const result = buildVoteCategoryScores([fact(), fact()]);
    expect(result[0].evaluated_events).toBe(1);
  });

  it('conta separadamente eventos distintos da mesma proposition_version', () => {
    const result = buildVoteCategoryScores([
      fact({ voting_event_id: 'event-1' }),
      fact({ voting_event_id: 'event-2' }),
    ]);
    expect(result[0].evaluated_events).toBe(2);
    expect(result[0].evaluated_propositions).toBe(2);
  });

  it.each(['abstencao', 'ausente', 'obstrucao'] as const)(
    'exclui %s do score sem tratá-lo como contra',
    (value) => {
      const [result] = buildVoteCategoryScores([fact({ value })]);
      expect(result.score).toBeNull();
      expect(result.no_alignment_events).toBe(1);
      expect(result.withheld_events).toBe(0);
    },
  );
});
