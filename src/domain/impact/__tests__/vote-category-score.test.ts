import { describe, expect, it } from 'vitest';
import { buildVoteCategoryScores, formatCategoryScore } from '../vote-category-score';

describe('vote-category-score', () => {
  it('deriva saldo por candidato/casa/grupo com pesos v1', () => {
    const result = buildVoteCategoryScores([
      { candidate_id: 'a', house: 'camara', group_slug: 'mulheres', value: 'sim', impact_direction: 'positive', defending_vote: 'sim', severity: 4, structural_type: 'structural', confidence: 0.9, review_status: 'approved' },
      { candidate_id: 'a', house: 'camara', group_slug: 'mulheres', value: 'nao', impact_direction: 'positive', defending_vote: 'sim', severity: 2, structural_type: 'budgetary', confidence: 0.8, review_status: 'approved' },
    ]);
    expect(result[0]).toMatchObject({ candidate_id: 'a', group_slug: 'mulheres', score: 0.5, eligible_weight: 8, excluded_no_data: 0 });
    expect(formatCategoryScore(result[0].score)).toBe('+0,50');
  });

  it('retorna não avaliado quando defending_vote é nulo', () => {
    const [result] = buildVoteCategoryScores([{ candidate_id: 'a', house: 'camara', group_slug: 'mulheres', value: 'sim', impact_direction: 'unclear', defending_vote: null, severity: 5, structural_type: 'structural', confidence: 0.5, review_status: 'approved' }]);
    expect(result.score).toBeNull();
    expect(formatCategoryScore(result.score)).toBe('não avaliado');
  });
});
