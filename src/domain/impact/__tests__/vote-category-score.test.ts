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

  it('retorna não avaliado quando o evento não é elegível a score', () => {
    const [result] = buildVoteCategoryScores([{ candidate_id: 'a', house: 'alrs', group_slug: 'trabalhadores_formais', value: 'sim', impact_direction: 'negative', defending_vote: 'nao', event_defending_vote: null, score_eligible: false, vote_attribution_status: 'event_binding_missing', severity: 3, structural_type: 'structural', confidence: 0.9, review_status: 'approved' }]);
    expect(result.score).toBeNull();
    expect(formatCategoryScore(result.score)).toBe('não avaliado');
    expect(result.evaluated_propositions).toBe(0);
    expect(result.excluded_no_data).toBe(1);
  });

  it('não conta duas vezes o mesmo evento quando fontes convergem', () => {
    const result = buildVoteCategoryScores([
      { candidate_id: 'a', house: 'alrs', voting_event_id: 'event-1', group_slug: 'mulheres', value: 'sim', impact_direction: 'positive', defending_vote: 'sim', score_eligible: true, severity: 3, structural_type: 'structural', confidence: 0.9, review_status: 'approved' },
      { candidate_id: 'a', house: 'alrs', voting_event_id: 'event-1', group_slug: 'mulheres', value: 'sim', impact_direction: 'positive', defending_vote: 'sim', score_eligible: true, severity: 3, structural_type: 'structural', confidence: 0.9, review_status: 'approved' },
    ]);
    expect(result[0].evaluated_propositions).toBe(1);
  });

  it('conta uma vez a mesma proposition_version em eventos repetidos', () => {
    const result = buildVoteCategoryScores([
      { candidate_id: 'a', house: 'alrs', voting_event_id: 'event-1', proposition_version_id: 'version-1', group_slug: 'mulheres', value: 'sim', impact_direction: 'positive', defending_vote: 'sim', score_eligible: true, severity: 3, structural_type: 'structural', confidence: 0.9, review_status: 'approved' },
      { candidate_id: 'a', house: 'alrs', voting_event_id: 'event-2', proposition_version_id: 'version-1', group_slug: 'mulheres', value: 'sim', impact_direction: 'positive', defending_vote: 'sim', score_eligible: true, severity: 3, structural_type: 'structural', confidence: 0.9, review_status: 'approved' },
    ]);
    expect(result[0].evaluated_propositions).toBe(1);
  });
});
