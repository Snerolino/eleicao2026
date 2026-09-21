import { describe, expect, it } from 'vitest';
import {
  filterPopulationRelevantVotes,
  formatCoveragePercentage,
  summarizeVoteCoverage,
} from '../vote-coverage';
import type { CandidateNominalVote } from '@/types/election';

const vote = (overrides: Partial<CandidateNominalVote> = {}): CandidateNominalVote => ({
  house: 'camara',
  proposition_id: 'PL 1/2026',
  title: 'Projeto de lei',
  vote_value: 'sim',
  date: '2026-01-01',
  source_url: 'https://camara.leg.br/fonte',
  source_label: 'Câmara',
  assessment_group: null,
  score_eligible: false,
  ...overrides,
});

const scoreableV2 = (overrides: Partial<CandidateNominalVote> = {}): CandidateNominalVote =>
  vote({
    assessment_group: 'mulheres',
    voting_event_id: 'event-1',
    score_eligible: true,
    event_defending_vote: 'sim',
    vote_attribution_status: 'isolated',
    attribution_methodology_version: '2.0.0',
    attribution_review_status: 'approved',
    ...overrides,
  });

describe('vote-coverage v2', () => {
  it('mantém somente votações ligadas a grupos populacionais canônicos', () => {
    const result = filterPopulationRelevantVotes([
      vote(),
      vote({ assessment_group: 'mulheres' }),
      vote({ assessment_group: 'grupo_inventado' }),
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].assessment_group).toBe('mulheres');
  });

  it('só conta como pontuado evento com atribuição v2 completa', () => {
    const result = summarizeVoteCoverage([
      vote(),
      scoreableV2(),
      vote({ assessment_group: 'estudantes', score_eligible: true }),
      scoreableV2({
        assessment_group: 'estudantes',
        voting_event_id: 'event-2',
        attribution_review_status: 'pending_review',
      }),
      vote({ assessment_group: 'grupo_inventado', score_eligible: true }),
    ]);
    expect(result).toMatchObject({
      totalVotes: 5,
      relevantVotes: 3,
      scoredVotes: 1,
      relevantPercentage: 60,
    });
    expect(result.scoredPercentage).toBeCloseTo(100 / 3, 6);
  });

  it('não transforma ausência de cobertura em zero', () => {
    expect(summarizeVoteCoverage([]).relevantPercentage).toBeNull();
    expect(summarizeVoteCoverage([vote()]).scoredPercentage).toBeNull();
    expect(formatCoveragePercentage(null)).toBe('não avaliado');
    expect(formatCoveragePercentage(50)).toBe('50,0%');
  });
});
