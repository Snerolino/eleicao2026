// @vitest-environment node

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadPublicCandidateSnapshot } from '../public-candidate-snapshot.mjs';

const root = resolve(import.meta.dirname, '..', '..');
const scriptPath = resolve(root, 'scripts/import-dossier-lote2-novo-2026.mjs');
const script = readFileSync(scriptPath, 'utf8');

function dataBlock() {
  const start = script.indexOf('const CLAIMS');
  const end = script.indexOf('async function upsertSource', start);
  return script.slice(start, end);
}

describe('dossiê Lote 2 — NOVO/DF e NOVO/DE (import pending_review)', () => {
  it('importa apenas fatos concretos — nunca fabrica claim para "informação não localizada"', () => {
    const block = dataBlock().toLowerCase();
    expect(block).not.toContain('não localizado');
    expect(block).not.toContain('nao localizado');
    expect(block).not.toContain('sem registros');

    const candidates = loadPublicCandidateSnapshot({ root });
    const tseIds = new Set(candidates.map((candidate) => candidate.tse_candidate_id));
    expect(tseIds.has('210002533056')).toBe(true); // Ramiro Stallbaum Rosário
    expect(tseIds.has('210002533053')).toBe(true); // Everton de Souza Dias
  });

  it('cria todas as claims com status pending_review e fonte rastreável', () => {
    expect(script).toContain("status: 'pending_review'");
    expect(script).not.toContain("status: 'published'");
    const claimCount = (dataBlock().match(/category: '/g) ?? []).length;
    const sourceHashUses = (dataBlock().match(/source_hash: '/g) ?? []).length;
    expect(claimCount).toBeGreaterThanOrEqual(3);
    expect(sourceHashUses).toBeGreaterThanOrEqual(3);
  });

  it('usa somente fontes oficiais/pública — nunca raw_content; respeita override público', () => {
    expect(script).toContain("source_category: 'oficial'");
    expect(dataBlock()).not.toContain('raw_content');
    // Francisco Marques Neto está fora do snapshot público (override) — sem claim.
    expect(dataBlock()).not.toContain('210002533050');
    // Candidatos sem fato concreto do Lote 2 não entram (ex.: Eduardo Wartchow, Eber Langoni).
    expect(dataBlock()).not.toContain('210002533009'); // Eduardo Wartchow
    expect(dataBlock()).not.toContain('210002533067'); // Eber Langoni
  });

  it('exige --apply e service role externa (nunca anon para escrita)', () => {
    expect(script).toMatch(/process\.argv\.includes\('--apply'\)/);
    expect(script).toContain('SUPABASE_SECRET_KEY');
    expect(script).toMatch(/não pode vir de \.env versionado/i);
  });
});