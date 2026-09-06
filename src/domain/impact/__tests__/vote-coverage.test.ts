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

describe('vote-coverage', () => {
  it('mantém somente votações ligadas a grupos populacionais canônicos', () => {
    const result = filterPopulationRelevantVotes([
      vote(),
      vote({ assessment_group: 'mulheres' }),
      vote({ assessment_group: 'grupo_inventado' }),
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].assessment_group).toBe('mulheres');
  });

  it('calcula cobertura total, pertinente e pontuada separadamente', () => {
    const result = summarizeVoteCoverage([
      vote(),
      vote({ assessment_group: 'mulheres', score_eligible: true }),
      vote({ assessment_group: 'estudantes', score_eligible: false }),
      vote({ assessment_group: 'grupo_inventado', score_eligible: true }),
    ]);
    expect(result).toMatchObject({
      totalVotes: 4,
      relevantVotes: 2,
      scoredVotes: 1,
      relevantPercentage: 50,
      scoredPercentage: 50,
    });
  });

  it('não transforma ausência de cobertura em zero', () => {
    expect(summarizeVoteCoverage([]).relevantPercentage).toBeNull();
    expect(summarizeVoteCoverage([vote()]).scoredPercentage).toBeNull();
    expect(formatCoveragePercentage(null)).toBe('não avaliado');
    expect(formatCoveragePercentage(50)).toBe('50,0%');
  });
});
