// @vitest-environment node

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadPublicCandidateSnapshot } from '../public-candidate-snapshot.mjs';

const root = resolve(import.meta.dirname, '..', '..');
const scriptPath = resolve(root, 'scripts/import-dossier-lote3-novo-2026.mjs');
const script = readFileSync(scriptPath, 'utf8');

function dataBlock() {
  const start = script.indexOf('const CLAIMS');
  const end = script.indexOf('async function upsertSource', start);
  return script.slice(start, end);
}

describe('dossiê Lote 3 / consolidado (import pending_review)', () => {
  it('importa apenas fatos concretos — nunca fabrica claim para "informação não localizada"', () => {
    const block = dataBlock().toLowerCase();
    expect(block).not.toContain('não localizado');
    expect(block).not.toContain('nao localizado');
    expect(block).not.toContain('sem registros');
    // Candidatos do Lote 3 com fato concreto existem no snapshot público.
    const candidates = loadPublicCandidateSnapshot({ root });
    const tseIds = new Set(candidates.map((candidate) => candidate.tse_candidate_id));
    expect(tseIds.has('210002533072')).toBe(true); // Martin Cesar Kalkmann
    expect(tseIds.has('210002533066')).toBe(true); // Giuseppe Ricardo M. Riesgo
    expect(tseIds.has('210002532989')).toBe(true); // Tiago José Albrecht
  });

  it('cria todas as claims com status pending_review e fonte rastreável', () => {
    expect(script).toContain("status: 'pending_review'");
    expect(script).not.toContain("status: 'published'");
    const claimCount = (dataBlock().match(/category: '/g) ?? []).length;
    const sourceHashUses = (dataBlock().match(/source_hash: '/g) ?? []).length;
    expect(claimCount).toBeGreaterThanOrEqual(4);
    expect(sourceHashUses).toBeGreaterThanOrEqual(4);
  });

  it('não importa candidatos UP/sem fato concreto do consolidado', () => {
    const block = dataBlock();
    // UP (Luciano Schafer, Tania Peres, Gustavo Estery, etc.) sem fato concreto — fora.
    expect(block).not.toContain('210002533435'); // Luciano Schafer
    expect(block).not.toContain('210002533434'); // Tania Mara Santoro Peres
  });

  it('exige --apply e service role externa (nunca anon para escrita)', () => {
    expect(script).toMatch(/process\.argv\.includes\('--apply'\)/);
    expect(script).toContain('SUPABASE_SECRET_KEY');
    expect(script).toMatch(/não pode vir de \.env versionado/i);
  });
});