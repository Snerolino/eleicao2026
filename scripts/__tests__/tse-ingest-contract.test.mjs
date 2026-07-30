import { describe, expect, it } from 'vitest';
import {
  assertPublicSnapshotHasNoSensitiveFields,
  buildDatasetSourceManifest,
  isDatabaseWriteAllowed,
} from '../tse-ingest-contract.mjs';

describe('H3.1 contrato do pipeline TSE', () => {
  it('registra origem, hash, data e escopo do dataset oficial', () => {
    const manifest = buildDatasetSourceManifest({
      datasetKey: 'consulta_cand',
      uf: 'RS',
      sourceKind: 'local-dir',
      sourcePath: '../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv',
      officialUrl: 'https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand/consulta_cand_2026.zip',
      sha256: 'a'.repeat(64),
      rowCount: 69,
      createdAt: '2026-07-30T12:00:00.000Z',
    });

    expect(manifest).toMatchObject({
      dataset_key: 'consulta_cand',
      uf: 'RS',
      scope: 'consulta_cand/2026/RS',
      official_url: 'https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand/consulta_cand_2026.zip',
      sha256: 'a'.repeat(64),
      row_count: 69,
      created_at: '2026-07-30T12:00:00.000Z',
    });
  });

  it('dry-run nunca autoriza escrita no banco', () => {
    expect(isDatabaseWriteAllowed({ dryRun: true, shouldImport: false, hasServiceRole: false })).toBe(false);
    expect(isDatabaseWriteAllowed({ dryRun: true, shouldImport: true, hasServiceRole: true })).toBe(false);
    expect(isDatabaseWriteAllowed({ dryRun: false, shouldImport: true, hasServiceRole: true })).toBe(true);
    expect(isDatabaseWriteAllowed({ dryRun: false, shouldImport: true, hasServiceRole: false })).toBe(false);
  });

  it('nega campos e valores sensíveis no snapshot público', () => {
    expect(() =>
      assertPublicSnapshotHasNoSensitiveFields([
        {
          id: '1',
          full_name: 'Pessoa Teste',
          cpf: '12345678901',
        },
      ]),
    ).toThrow(/campo sensível/i);

    expect(() =>
      assertPublicSnapshotHasNoSensitiveFields([
        {
          id: '1',
          full_name: 'Pessoa Teste',
          source: 'contato pessoa@example.com',
        },
      ]),
    ).toThrow(/valor sensível/i);
  });
});
