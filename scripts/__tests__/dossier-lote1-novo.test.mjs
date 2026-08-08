// @vitest-environment node

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadPublicCandidateSnapshot } from '../public-candidate-snapshot.mjs';

const root = resolve(import.meta.dirname, '..', '..');
const scriptPath = resolve(root, 'scripts/import-dossier-lote1-novo-2026.mjs');
const script = readFileSync(scriptPath, 'utf8');

// Bloco de dados do dossiê: da abertura do array CLAIMS até o fim das definições
// (antes da função genérica). Contém somente dados importáveis — sem comentários de regra.
function dataBlock() {
  const start = script.indexOf('const CLAIMS');
  const end = script.indexOf('async function upsertSource', start);
  return script.slice(start, end);
}

describe('dossiê Lote 1 — NOVO/Deputado Federal (import pending_review)', () => {
  it('importa apenas fatos concretos — nunca fabrica claim para "informação não localizada"', () => {
    const block = dataBlock().toLowerCase();
    // Ausência de registro não é claim; conteúdos fabricados são proibidos.
    expect(block).not.toContain('não localizado');
    expect(block).not.toContain('nao localizado');
    expect(block).not.toContain('sem registros');

    // Os candidatos citados existem no snapshot público (rastreabilidade TSE).
    const candidates = loadPublicCandidateSnapshot({ root });
    const tseIds = new Set(candidates.map((candidate) => candidate.tse_candidate_id));
    expect(tseIds.has('210002532998')).toBe(true); // Ada Cristina Munaretto
    expect(tseIds.has('210002533002')).toBe(true); // Felipe Zortéa Camozzato
    expect(tseIds.has('210002533003')).toBe(true); // Marco Antonio M. dos Santos
  });

  it('cria todas as claims com status pending_review e fonte rastreável', () => {
    expect(script).toContain("status: 'pending_review'");
    expect(script).not.toContain("status: 'published'");
    const claimCount = (dataBlock().match(/category: '/g) ?? []).length;
    const sourceHashUses = (dataBlock().match(/source_hash: '/g) ?? []).length;
    expect(claimCount).toBeGreaterThanOrEqual(4);
    expect(sourceHashUses).toBeGreaterThanOrEqual(4);
  });

  it('usa somente fontes oficiais/pública — nunca raw_content', () => {
    expect(script).toContain("source_category: 'oficial'");
    expect(dataBlock()).not.toContain('raw_content');
    // Não importa candidatos sem fato concreto do Lote 1 (nada de claims vazias).
    expect(dataBlock()).not.toContain('210002532996'); // Hiago Stock Morandi
    expect(dataBlock()).not.toContain('210002532995'); // Sandra Bonetto
  });

  it('exige --apply e service role externa (nunca anon para escrita)', () => {
    expect(script).toMatch(/process\.argv\.includes\('--apply'\)/);
    expect(script).toContain('SUPABASE_SECRET_KEY');
    expect(script).toMatch(/não pode vir de \.env versionado/i);
  });
});