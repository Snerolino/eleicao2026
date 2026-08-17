// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { buildEnvelope, classifyEvent, normalizeVote } from '../collect-camara-votes.mjs';

describe('coletor Câmara: normalização factual', () => {
  it('normaliza somente valores oficiais conhecidos', () => {
    expect(normalizeVote('Sim')).toBe('sim');
    expect(normalizeVote('Não')).toBe('nao');
    expect(normalizeVote('Presente sem voto individual')).toBeNull();
  });

  it('classifica evento sem votos individuais como simbólico/outro e não inventa votos', () => {
    const result = classifyEvent({ descricao: 'Aprovado simbolicamente' }, []);
    expect(result).toMatchObject({ vote_method: 'simbolica', is_individualized: false });
    expect(buildEnvelope({ descricao: 'Aprovado simbolicamente' }, [], { id: 1 }, 'event-1').envelope).toBeNull();
  });

  it('emite envelope nominal somente com votos normalizáveis', () => {
    const result = buildEnvelope(
      { idEvento: 82876, dataHoraRegistro: '2026-08-12T19:48:20', descricao: 'Aprovado', proposicoesAfetadas: [{ id: 2580259, siglaTipo: 'PLP', numero: 230, ano: 2025, ementa: 'Ementa oficial', uri: 'https://dadosabertos.camara.leg.br/api/v2/proposicoes/2580259' }] },
      [
        { tipoVoto: 'Não', dataRegistroVoto: '2026-08-12T19:47:22', deputado_: { id: 156190, siglaUf: 'RS' } },
        { tipoVoto: 'Sim', dataRegistroVoto: '2026-08-12T19:47:22', deputado_: { id: 156191, siglaUf: 'SP' } },
      ],
      null,
      '2580259-24',
    );
    expect(result.eventClass).toMatchObject({ vote_method: 'nominal', is_individualized: true });
    expect(result.envelope.votes).toHaveLength(1);
    expect(result.envelope.votes[0]).toMatchObject({ deputy_id: 'camara-deputado-156190', value: 'nao' });
    expect(result.envelope.votes[0]).not.toHaveProperty('impact');
  });
});
