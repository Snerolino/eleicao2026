// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { buildDateWindows, buildVotesUrl, classifyDiscoveryResponse, collectVoteIds } from '../discover-camara-vote-ids.mjs';

describe('discover-camara-vote-ids', () => {
  it('monta consulta oficial paginada e determinística', () => {
    expect(buildVotesUrl({ start: '2026-01-01', end: '2026-12-31', page: 2, items: 50 })).toBe(
      'https://dadosabertos.camara.leg.br/api/v2/votacoes?dataInicio=2026-01-01&dataFim=2026-12-31&itens=50&pagina=2&ordem=ASC&ordenarPor=DataHoraRegistro',
    );
  });

  it('não transforma 405 ou erro de rede em lista vazia válida', () => {
    expect(classifyDiscoveryResponse({ status: 405 })).toEqual({ status: 'blocked', reason: 'method_not_allowed' });
    expect(classifyDiscoveryResponse({ error: 'timeout' })).toEqual({ status: 'blocked', reason: 'network_error', detail: 'timeout' });
    expect(classifyDiscoveryResponse({ status: 200 })).toEqual({ status: 'ok', reason: null });
  });

  it('divide intervalos maiores que três meses no limite aceito pela API', () => {
    expect(buildDateWindows('2026-01-01', '2026-12-31')).toEqual([
      { start: '2026-01-01', end: '2026-03-31' },
      { start: '2026-04-01', end: '2026-06-30' },
      { start: '2026-07-01', end: '2026-09-30' },
      { start: '2026-10-01', end: '2026-12-31' },
    ]);
  });

  it('deduplica ids entre páginas sem perder zero numérico', () => {
    expect(collectVoteIds([{ dados: [{ id: '1' }, { id: 2 }] }, { dados: [{ id: '1' }, { id: 0 }] }])).toEqual(['1', '2', '0']);
  });
});
