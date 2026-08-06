// @vitest-environment node

import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
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

  mkdirSync(resolve(dir, 'consulta_cand_2026'), { recursive: true });
  const consultaHeader = 'SQ_CANDIDATO;DS_GENERO;DS_COR_RACA';
  const consultaRows = Array.from({ length: 213 }, (_, index) => {
    const sq = 210002530000 + index;
    return `${sq};${index % 2 === 0 ? 'FEMININO' : 'MASCULINO'};${index % 3 === 0 ? 'PRETA' : 'BRANCA'}`;
  });
  writeFileSync(
    resolve(dir, 'consulta_cand_2026/consulta_cand_2026_RS.csv'),
    `${consultaHeader}\n${consultaRows.join('\n')}\n`,
    'latin1',
  );
  return dir;
}

describe('snapshot público de candidatos', () => {
  it('carrega o snapshot versionado com o mínimo esperado de candidaturas', () => {
    const candidates = loadPublicCandidateSnapshot({ root });

    expect(candidates.length).toBeGreaterThanOrEqual(212);
    expect(candidates[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        slug: expect.any(String),
        tse_candidate_id: expect.any(String),
        full_name: expect.any(String),
        party: expect.any(String),
        gender: expect.stringMatching(/^(FEMININO|MASCULINO|NÃO DIVULGÁVEL|NÃO INFORMADO)$/),
        race: expect.any(String),
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

    expect(slugs.size).toBe(candidates.length);
    expect(tseIds.size).toBe(candidates.length);
    expect(tseIds.has('210002533050')).toBe(false);
    expect(candidates.some((candidate) => candidate.position === 'vice_governador')).toBe(true);
  });

  it('mantém fotos oficiais rastreáveis e com asset público existente', () => {
    const candidates = loadPublicCandidateSnapshot({ root });
    const withPhotos = candidates.filter((candidate) => candidate.photo_url);

    expect(withPhotos.length).toBeGreaterThanOrEqual(212);
    expect(withPhotos).toHaveLength(candidates.length);

    for (const candidate of withPhotos) {
      expect(candidate.photo_url).toMatch(/^\/photos\/tse-2026-rs\/[a-z0-9_]+_\d+\.jpe?g$/);
      expect(candidate.photo_source_url).toBe(
        'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2026/fotos/foto_cand2026_RS_div.zip',
      );
      expect(existsSync(resolve(root, 'public', candidate.photo_url.slice(1)))).toBe(true);
    }
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
    expect(candidates.find((candidate) => candidate.tse_candidate_id === '210002530000')).toEqual(
      expect.objectContaining({ gender: 'FEMININO', race: 'PRETA' }),
    );
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
