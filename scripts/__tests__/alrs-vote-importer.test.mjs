// @vitest-environment node

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  buildAlrsSourceUrl,
  parseAlrsDataItems,
  planAlrsVoteImport,
} from '../../src/domain/impact/alrs-vote-importer.ts';

const HTML = readFileSync('fixtures/legislative-import/alrs-data-items.html', 'utf8');
const CATALOG = JSON.parse(readFileSync('fixtures/legislative-import/alrs-id-catalog.json', 'utf8'));
const CANDIDATES = JSON.parse(readFileSync('data/public-candidates.json', 'utf8'));
const SOURCE_URL = buildAlrsSourceUrl('999999', 2026);

function plan(overrides = {}) {
  return planAlrsVoteImport({
    rawHtml: HTML,
    sourceUrl: SOURCE_URL,
    solicitanteId: '999999',
    catalog: CATALOG,
    candidates: CANDIDATES,
    ...overrides,
  });
}

function itemHtml(overrides = {}) {
  const item = {
    nomeDeputado: 'Deputada Fixture',
    dataVotacao: '10/06/2026',
    tipoProjeto: 'PL',
    numProposicao: '77',
    anoProposicao: '2025',
    materia: 'Matéria fixture',
    voto: 'Sim',
    resultadoVotacao: 'Aprovado',
    ...overrides,
  };
  return `<div data-item='${JSON.stringify(item)}'></div>`;
}

describe('parser/importer local de votos da ALRS', () => {
  it('extrai somente o JSON de data-item e somente os oito campos permitidos', () => {
    const items = parseAlrsDataItems(HTML);

    expect(items).toHaveLength(5);
    expect(items[0]).toEqual({
      nomeDeputado: 'Deputada Fixture',
      dataVotacao: '10/06/2026',
      tipoProjeto: 'PL',
      numProposicao: '77',
      anoProposicao: '2025',
      materia: 'Projeto de lei usado no teste de contrato',
      voto: 'Sim',
      resultadoVotacao: 'Aprovado',
    });
    expect(items[1].materia).toBe('Matéria com acento & transparência');
    expect(JSON.stringify(items)).not.toContain('campoIgnorado');
    expect(JSON.stringify(items)).not.toContain('não extrair texto fora');
  });

  it('preserva o HTML bruto e seu SHA-256 na fonte', () => {
    const result = plan();
    const expected = `sha256:${createHash('sha256').update(HTML, 'utf8').digest('hex')}`;

    expect(result.source).toEqual({ url: SOURCE_URL, content_hash: expected, raw_html: HTML });
    expect(result.votes.every((vote) => vote.source.content_hash === expected)).toBe(true);
  });

  it('normaliza exclusivamente os cinco valores factuais aceitos', () => {
    expect(plan().votes.map((vote) => vote.value)).toEqual([
      'sim',
      'nao',
      'abstencao',
      'ausente',
      'obstrucao',
    ]);
  });

  it.each(['Bancada', 'Subscrição', 'Preferência', 'Favorável'])(
    'falha fechado para %s e não o converte em voto de mérito',
    (voto) => {
      expect(() => plan({ rawHtml: itemHtml({ voto }) })).toThrow(/voto inválido/);
    },
  );

  it('falha fechado quando qualquer campo obrigatório está ausente', () => {
    const html = itemHtml();
    const withoutMateria = html.replace(/,"materia":"Matéria fixture"/, '');
    expect(() => plan({ rawHtml: withoutMateria })).toThrow(/materia é obrigatório/);
  });

  it('mapeia ALRS → TSE → candidate.id existente sem usar nome como heurística', () => {
    const result = plan();
    const snapshotCandidate = CANDIDATES.find((candidate) => candidate.tse_candidate_id === '210002533936');

    expect(result.candidate_match).toEqual({
      alrs_solicitante_id: '999999',
      tse_candidate_id: '210002533936',
      candidate_id: snapshotCandidate.id,
    });
    expect(result.votes.every((vote) => vote.candidate_id === snapshotCandidate.id)).toBe(true);
  });

  it('registra pendência e não gera voto quando o tse_candidate_id não existe no snapshot', () => {
    const result = plan({ candidates: [] });

    expect(result.counts).toMatchObject({ data_items: 5, votes: 0, pending_matches: 5 });
    expect(result.pending_matches.every((pending) => pending.reason === 'tse_candidate_not_found')).toBe(true);
  });

  it('registra pendência e não gera voto quando o ID ALRS não está no catálogo explícito', () => {
    const result = plan({ catalog: { schema_version: '1.0.0', entries: [] } });

    expect(result.votes).toHaveLength(0);
    expect(result.pending_matches).toHaveLength(5);
    expect(result.pending_matches[0]).toMatchObject({
      reason: 'alrs_id_not_cataloged',
      tse_candidate_id: null,
    });
  });

  it('é idempotente por chave natural e elimina repetição idêntica', () => {
    const firstItem = HTML.match(/<div data-item=.*<\/div>/)?.[0];
    expect(firstItem).toBeTruthy();
    const duplicated = HTML.replace('</body>', `${firstItem}</body>`);
    const first = plan({ rawHtml: duplicated });
    const second = plan({ rawHtml: duplicated });

    expect(first).toEqual(second);
    expect(first.counts).toMatchObject({ data_items: 6, duplicate_items: 1, votes: 5 });
  });

  it('falha fechado para JSON inválido e para página sem data-item', () => {
    expect(() => parseAlrsDataItems('<div data-item="{invalido}"></div>')).toThrow(/JSON válido/);
    expect(() => parseAlrsDataItems('<html><body>sem resultados estruturados</body></html>')).toThrow(/Nenhum atributo/);
  });
});
