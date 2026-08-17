// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { parseArgs, renderAlrsPlan } from '../import-alrs-votes.mjs';

const BASE_ARGS = [
  '--solicitante',
  '999999',
  '--ano',
  '2026',
  '--catalog',
  'fixtures/legislative-import/alrs-id-catalog.json',
  '--html',
  'fixtures/legislative-import/alrs-data-items.html',
];

describe('CLI ALRS dry-run', () => {
  it('interpreta a execução offline com catálogo explícito', () => {
    const options = parseArgs(BASE_ARGS);

    expect(options).toMatchObject({
      solicitanteId: '999999',
      ano: '2026',
      catalogFile: 'fixtures/legislative-import/alrs-id-catalog.json',
      htmlFile: 'fixtures/legislative-import/alrs-data-items.html',
      candidatesFile: 'data/public-candidates.json',
      json: false,
    });
  });

  it('renderiza contagens e afirma ausência de escrita', () => {
    const output = renderAlrsPlan({
      source: { url: 'https://transparencia.al.rs.gov.br/fonte', content_hash: 'sha256:abc' },
      counts: { data_items: 5, duplicate_items: 0, votes: 5, pending_matches: 0 },
    });

    expect(output).toMatch(/Modo: DRY-RUN ALRS/);
    expect(output).toMatch(/votos planejados: 5/);
    expect(output).toMatch(/pendências de match: 0/);
    expect(output).toMatch(/Nenhuma escrita realizada/);
  });

  it('rejeita --apply antes de qualquer acesso externo', () => {
    expect(() => parseArgs([...BASE_ARGS, '--apply'])).toThrow(/somente dry-run.*--apply/i);
  });

  it('exige catálogo explícito', () => {
    expect(() => parseArgs([
      '--solicitante',
      '999999',
      '--ano',
      '2026',
      '--html',
      'fixtures/legislative-import/alrs-data-items.html',
    ])).toThrow(/--catalog é obrigatório/);
  });
});
