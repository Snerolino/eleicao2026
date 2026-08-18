// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { buildEnvelope, classifyEvent } from '../collect-camara-votes.mjs';

describe('FED-8: votação 2580259-27 simbólica Câmara', () => {
  const detail = {
    id: '2580259-27',
    descricao: 'Aprovada a Redação Final assinada pela relatora, Dep. Maria Rosas (REPUBLIC-SP).',
    dataHoraRegistro: '2026-08-12T19:49:18',
    data: '2026-08-12',
    proposicoesAfetadas: null,
    objetosPossiveis: null,
  };

  const { voting_events, ...rest } = { voting_events: [], ...detail };

  it('classifica como não individualizada (outro) sem votos individuais', () => {
    const eventClass = classifyEvent(detail, []);
    expect(eventClass.is_individualized).toBe(false);
    expect(eventClass.vote_method).toBe('outro');
  });

  it('não converte simbólica em voto nominal quando não há votos', () => {
    const result = buildEnvelope(detail, [], null, '2580259-27', 'RS');
    expect(result.eventClass.is_individualized).toBe(false);
    expect(result.envelope).toBeNull();
  });

  it('preserva ausência de envelope sem registrar voto algum', () => {
    const result = buildEnvelope(detail, [], null, '2580259-27', 'RS');
    expect(result.envelope).toBeNull();
  });
});
