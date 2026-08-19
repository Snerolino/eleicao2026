import { describe, expect, it } from 'vitest';
import { buildVoteCategoryComparisons, type VoteCategoryFact } from '../vote-category-comparison';

const facts: VoteCategoryFact[] = [
  { candidate_id: 'a', house: 'camara', voting_event_id: 'e1', group_slug: 'mulheres', value: 'sim', review_status: 'approved' },
  { candidate_id: 'b', house: 'camara', voting_event_id: 'e1', group_slug: 'mulheres', value: 'nao', review_status: 'approved' },
  { candidate_id: 'a', house: 'camara', voting_event_id: 'e2', group_slug: 'mulheres', value: 'abstencao', review_status: 'approved' },
  { candidate_id: 'b', house: 'camara', voting_event_id: 'e2', group_slug: 'mulheres', value: 'sim', review_status: 'approved' },
  { candidate_id: 'a', house: 'camara', voting_event_id: 'private', group_slug: 'mulheres', value: 'sim', review_status: 'approved' },
  { candidate_id: 'b', house: 'camara', voting_event_id: 'private', group_slug: 'mulheres', value: 'sim', review_status: 'pending_review' },
];

describe('vote-category-comparison', () => {
  it('compara apenas eventos comuns e matrizes aprovadas', () => {
    const [comparison] = buildVoteCategoryComparisons(facts, ['a', 'b']);
    expect(comparison).toMatchObject({ house: 'camara', group_slug: 'mulheres', events_compared: 2 });
    expect(comparison.candidates).toEqual([
      { candidate_id: 'a', total_votes: 2, sim: 1, nao: 0, abstencao: 1, ausente: 0, obstrucao: 0 },
      { candidate_id: 'b', total_votes: 2, sim: 1, nao: 1, abstencao: 0, ausente: 0, obstrucao: 0 },
    ]);
  });

  it('não calcula comparação com menos de dois candidatos', () => {
    expect(buildVoteCategoryComparisons(facts, ['a'])).toEqual([]);
  });
});
