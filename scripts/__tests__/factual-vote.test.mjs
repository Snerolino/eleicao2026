import { describe, expect, it } from 'vitest';
import { interpretFactualVote } from '../../src/domain/impact/factual-vote.ts';

describe('factual-vote: separa fato de impacto', () => {
  it('voto SIM sem assessment permanece factual e não avaliado', () => {
    expect(interpretFactualVote({ value: 'sim' })).toEqual({
      factual_value: 'sim',
      impact_status: 'nao_avaliado',
      alignment: null,
    });
  });

  it('voto NÃO só recebe alinhamento quando há defending_vote', () => {
    expect(interpretFactualVote(
      { value: 'nao' },
      { impact_direction: 'positive', defending_vote: 'sim' },
    )).toMatchObject({ factual_value: 'nao', impact_status: 'avaliavel', alignment: 'contra' });
  });

  it('unclear permanece não avaliável mesmo com voto nominal', () => {
    expect(interpretFactualVote(
      { value: 'sim' },
      { impact_direction: 'unclear', defending_vote: null },
    )).toMatchObject({ factual_value: 'sim', impact_status: 'avaliavel', alignment: 'nao_avaliavel' });
  });

  it('ausência sem registro não vira voto contrário nem score zero', () => {
    expect(interpretFactualVote(null)).toEqual({
      factual_value: 'ausente',
      impact_status: 'nao_avaliado',
      alignment: null,
    });
  });
});
