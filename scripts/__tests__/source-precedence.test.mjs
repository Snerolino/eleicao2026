// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { classifySource, resolveOfficialPrecedence } from '../lib/source-precedence.mjs';

describe('source-precedence', () => {
  it('classifica portal oficial e dataset', () => {
    const dataset = classifySource({ source_path: "../dataset2026/candidatos/x.csv" });
    const official = classifySource({ source_url: 'https://dadosabertos.camara.leg.br/api/v2/votacoes/1' });
    expect(dataset).toEqual({ tier: 1, label: 'dataset2026' });
    expect(official).toEqual({ tier: 3, label: 'official' });
  });

  it('descarta dataset quando há conflito com fonte oficial', () => {
    const result = resolveOfficialPrecedence([
      { id: '1', name: 'dataset', source_path: "../dataset2026/votos.csv", value: 'sim' },
      { id: '1', name: 'official', source_url: 'https://dadosabertos.camara.leg.br/api/v2/votacoes/1/votos', value: 'nao' },
    ], { keyOf: (row) => row.id, fields: ['value'] });
    expect(result.resolved[0].name).toBe('official');
    expect(result.discarded[0]).toMatchObject({
      reason: 'official_source_wins',
      discarded_source: 'dataset2026',
      conflicting_fields: ['value'],
    });
  });

  it('trata mirror TSE com URL oficial como fonte oficial', () => {
    const source = classifySource({
      source_kind: 'local-dir',
      source_path: "../dataset2026/candidatos/x.csv",
      official_url: 'https://cdn.tse.jus.br/estatistica/x.zip',
    });
    expect(source).toEqual({ tier: 3, label: 'official' });
  });
});
