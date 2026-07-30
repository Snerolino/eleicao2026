// @vitest-environment node

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  loadPublicCandidateSnapshot,
  validatePublicCandidateSnapshot,
} from '../public-candidate-snapshot.mjs';

const root = resolve(import.meta.dirname, '../..');

describe('snapshot público de candidatos', () => {
  it('carrega o snapshot versionado com o mínimo esperado de candidaturas', () => {
    const candidates = loadPublicCandidateSnapshot({ root });

    expect(candidates).toHaveLength(69);
    expect(candidates[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        full_name: expect.any(String),
        party: expect.any(String),
        position: expect.stringMatching(/^deputado_(federal|estadual)$/),
        claims: [],
      }),
    );
  });

  it('rejeita snapshot vazio ou com campos privados', () => {
    expect(() => validatePublicCandidateSnapshot([], { minCount: 1 })).toThrow(
      /vazio|mínimo/i,
    );

    expect(() =>
      validatePublicCandidateSnapshot(
        [
          {
            id: 'x',
            full_name: 'Nome Público',
            party: 'NOVO',
            ballot_number: 3000,
            position: 'deputado_federal',
            position_label: 'Deputado Federal',
            photo_url: null,
            photo_source_url: null,
            claims: [],
            cpf: '00000000000',
          },
        ],
        { minCount: 1 },
      ),
    ).toThrow(/campo proibido/i);
  });

  it('mantém o build sem ingestão nem escrita em src/services/mockData.ts', () => {
    const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));

    expect(packageJson.scripts.build).toContain('data:check');
    expect(packageJson.scripts.build).not.toContain('generate-mockdata');
    expect(packageJson.scripts['data:refresh']).toContain('refresh-public-snapshot');
  });
});
