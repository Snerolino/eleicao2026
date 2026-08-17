// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { buildVoteProfileRows } from '../lib/vote-profile.mjs';

describe('buildVoteProfileRows', () => {
  it('preserva perfis separados quando o candidato tem duas casas', () => {
    const result = buildVoteProfileRows([
      { candidate_id: 'candidate-1', voting_event_id: 'alrs-1', value: 'sim', voting_events: { house: 'alrs' } },
      { candidate_id: 'candidate-1', voting_event_id: 'alrs-2', value: 'nao', voting_events: { house: 'alrs' } },
      { candidate_id: 'candidate-1', voting_event_id: 'camara-1', value: 'nao', voting_events: { house: 'camara' } },
      { candidate_id: 'candidate-1', voting_event_id: 'camara-2', value: 'abstencao', voting_events: { house: 'camara' } },
    ]);

    expect(result.profileRows).toEqual([
      expect.objectContaining({
        candidate_id: 'candidate-1',
        house: 'alrs',
        total_votes: 2,
        votos_sim: 1,
        votos_nao: 1,
        profile_score: 0,
      }),
      expect.objectContaining({
        candidate_id: 'candidate-1',
        house: 'camara',
        total_votes: 2,
        votos_sim: 0,
        votos_nao: 1,
        votos_abstencao: 1,
        profile_score: -0.5,
      }),
    ]);
  });

  it('mantém o índice factual por evento e não inventa direção', () => {
    const result = buildVoteProfileRows([
      { candidate_id: 'candidate-1', voting_event_id: 'event-1', value: 'obstrucao', voting_events: { house: 'camara' } },
      { candidate_id: 'candidate-1', voting_event_id: 'event-2', value: 'valor-desconhecido', voting_events: { house: 'camara' } },
    ]);

    expect(result.indexRows).toEqual([
      expect.objectContaining({ voting_event_id: 'event-1', direction: 0, value: 'obstrucao' }),
      expect.objectContaining({ voting_event_id: 'event-2', direction: 0, value: 'valor-desconhecido' }),
    ]);
  });
});
