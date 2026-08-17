// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const catalog = JSON.parse(readFileSync(resolve(process.cwd(), 'data/legislative-import/camara/candidate-catalog.json'), 'utf8'));

describe('catálogo Câmara ↔ candidato TSE', () => {
  it('cobre exatamente o universo federal público e mantém identidades pendentes', () => {
    expect(catalog.schema_version).toBe('1.0.0');
    expect(catalog.totals).toMatchObject({
      public_candidates: 434,
      official_deputies_downloaded: 513,
      matched: 22,
      identity_pending: 412,
    });
    expect(catalog.entries).toHaveLength(434);
  });

  it('não duplica candidato TSE nem deputado_id e não fabrica IDs para pendências', () => {
    const entries = catalog.entries;
    expect(new Set(entries.map((entry) => entry.tse_candidate_id)).size).toBe(entries.length);
    const matched = entries.filter((entry) => entry.identity_status === 'matched');
    expect(new Set(matched.map((entry) => entry.camara_deputado_id)).size).toBe(matched.length);
    expect(entries.filter((entry) => entry.identity_status === 'identity_pending')
      .every((entry) => entry.camara_deputado_id === null && entry.match_method === 'none'))
      .toBe(true);
  });

  it('aceita somente correspondência oficial exata no lote publicado', () => {
    const matched = catalog.entries.filter((entry) => entry.identity_status === 'matched');
    expect(matched.every((entry) => entry.match_method === 'official_name_exact'))
      .toBe(true);
    expect(matched.every((entry) => entry.confidence === 1 && entry.camara_uf === 'RS'))
      .toBe(true);
  });
});
