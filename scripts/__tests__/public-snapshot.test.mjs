// @vitest-environment node

import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import {
  generatePublicCandidateSnapshot,
  generateTseSourceManifest,
} from '../refresh-public-snapshot.mjs';
import {
  loadPublicCandidateSnapshot,
  validatePublicCandidateSnapshot,
} from '../public-candidate-snapshot.mjs';

const root = resolve(import.meta.dirname, '../..');

function writeOfficialSourceFixtures() {
  const dir = mkdtempSync(resolve(tmpdir(), 'tse-fontes-oficiais-'));
  const sigHeader = 'sg_uf;sg_partido;sq_candidato;nr_candidato;nm_candidato;nm_urna_candidato;ds_cargo';
  const cargos = ['Senador', 'Governador', '1º Suplente', '2º Suplente'];
  const sigRows = Array.from({ length: 213 }, (_, index) => {
    const cargo = cargos[index] ?? (index % 2 === 0 ? 'Deputado Federal' : 'Deputado Estadual');
    const sq = 210002530000 + index;
    return `RS;TSE;${sq};${3000 + index};CANDIDATO OFICIAL ${index};CANDIDATO ${index};${cargo}`;
  });
  writeFileSync(
    resolve(dir, 'FONTE OFICIAL = sig.tse.jus.br -lista_candidatos_2026.csv'),
    `${sigHeader}\n${sigRows.join('\n')}\n`,
    'latin1',
  );

  const dadosAbertosHeader = 'Ano de eleição;Cargo;UF;Quantidade de candidatos;Data de carga';
  const dadosAbertosRows = Array.from({ length: 211 }, (_, index) => `2026;Deputado Federal;RS;1;2026-07-31 08:30:${String(index % 60).padStart(2, '0')}`);
  writeFileSync(
    resolve(dir, 'FONTE OFICIAL  = dadosabertos.tse.jus.b = candidatos.csv'),
    `${dadosAbertosHeader}\n${dadosAbertosRows.join('\n')}\n`,
    'latin1',
  );
  return dir;
}

describe('snapshot público de candidatos', () => {
  it('carrega o snapshot versionado com o mínimo esperado de candidaturas', () => {
    const candidates = loadPublicCandidateSnapshot({ root });

    expect(candidates).toHaveLength(212);
    expect(candidates[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        slug: expect.any(String),
        tse_candidate_id: expect.any(String),
        full_name: expect.any(String),
        party: expect.any(String),
        position: expect.stringMatching(/^(governador|vice_governador|senador|deputado_federal|deputado_estadual|outro)$/),
        claims: [],
      }),
    );
  });

  it('garante identidade pública por slug e chave natural TSE', () => {
    const candidates = loadPublicCandidateSnapshot({ root });
    const slugs = new Set();
    const tseIds = new Set();

    for (const candidate of candidates) {
      expect(candidate.slug).toMatch(/^[a-z0-9_]+_[0-9]{4,}$/);
      expect(candidate.tse_candidate_id).toMatch(/^\d+$/);
      expect(slugs.has(candidate.slug)).toBe(false);
      expect(tseIds.has(candidate.tse_candidate_id)).toBe(false);
      slugs.add(candidate.slug);
      tseIds.add(candidate.tse_candidate_id);
    }

    expect(slugs.size).toBe(212);
    expect(tseIds.size).toBe(212);
    expect(tseIds.has('210002533050')).toBe(false);
    expect(candidates.some((candidate) => candidate.position === 'vice_governador')).toBe(true);
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

  it('gera snapshot a partir da lista oficial atualizada do SIG/TSE e registra dados abertos no manifesto', () => {
    const datasetDir = writeOfficialSourceFixtures();
    const candidates = generatePublicCandidateSnapshot({ datasetDir });
    const manifest = generateTseSourceManifest({ datasetDir, createdAt: '2026-07-31T12:00:00.000Z' });

    expect(candidates).toHaveLength(213);
    expect(candidates.some((candidate) => candidate.tse_candidate_id === '210002530000')).toBe(true);
    expect(candidates.some((candidate) => candidate.position === 'senador')).toBe(true);
    expect(candidates.some((candidate) => candidate.position === 'governador')).toBe(true);
    expect(candidates.some((candidate) => candidate.position === 'outro')).toBe(true);
    expect(manifest).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          dataset_key: 'sig_lista_candidatos',
          row_count: 213,
          source_path: expect.stringContaining('FONTE OFICIAL = sig.tse.jus.br -lista_candidatos_2026.csv'),
        }),
        expect.objectContaining({
          dataset_key: 'dadosabertos_candidatos',
          row_count: 211,
          source_path: expect.stringContaining('FONTE OFICIAL  = dadosabertos.tse.jus.b = candidatos.csv'),
        }),
      ]),
    );
    rmSync(datasetDir, { recursive: true, force: true });
  });
});
