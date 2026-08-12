// @vitest-environment node

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderPlan, renderSql } from '../import-legislative-dry-run.mjs';
import { planLegislativeImport } from '../../src/domain/impact/legislative-importer.ts';

const CLI = resolve('scripts/import-legislative-dry-run.mjs');
const FIXTURE = resolve('fixtures/legislative-import/boa-minima.json');
const CATALOG = resolve('fixtures/legislative-import/catalogo-exemplo.json');

function runCli(args) {
  return spawnSync(process.execPath, [CLI, ...args], { encoding: 'utf8' });
}

describe('legislative importer CLI dry-run', () => {
  it('imprime modo DRY-RUN e contagens para fixture boa, exit 0', () => {
    const result = runCli([FIXTURE]);
    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/Modo: DRY-RUN/);
    expect(result.stdout).toMatch(/legislative_propositions: 1/);
    expect(result.stdout).toMatch(/proposition_versions: 1/);
    expect(result.stdout).toMatch(/voting_events: 1/);
    expect(result.stdout).toMatch(/legislative_votes: 1/);
    expect(result.stdout).toMatch(/Nenhuma escrita realizada/);
  });

  it('rejeita --apply com exit 1 e sem escrita', () => {
    const result = runCli([FIXTURE, '--apply']);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/--apply/);
  });

  it('rejeita flag desconhecida com exit 1', () => {
    const result = runCli([FIXTURE, '--push']);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/não suportada/);
  });

  it('rejeita arquivo inexistente com exit 1', () => {
    const result = runCli(['fixtures/legislative-import/nao-existe.json']);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/não encontrado/);
  });

  it('é determinístico e repetível', () => {
    const first = runCli([FIXTURE]);
    const second = runCli([FIXTURE]);
    expect(first.status).toBe(0);
    expect(second.status).toBe(0);
    expect(first.stdout).toBe(second.stdout);
  });

  it('não imprime UUIDs gerados localmente', () => {
    const result = runCli([FIXTURE]);
    expect(result.stdout).not.toMatch(
      /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i,
    );
  });

  it('renderSql gera SQL a partir do plano', () => {
    const fixture = JSON.parse(readFileSync(FIXTURE, 'utf8'));
    const result = planLegislativeImport(fixture);
    expect(result.ok).toBe(true);
    const sql = renderSql(result.plan);
    expect(sql).toContain('insert into legislative_propositions');
    expect(sql).toContain('insert into legislative_votes');
  });

  it('--emit-sql imprime SQL puro (não o plano legível)', () => {
    const result = runCli(['--emit-sql', FIXTURE]);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('insert into legislative_propositions');
    expect(result.stdout).not.toContain('Modo: DRY-RUN');
  });

  it('--emit-sql --apply é rejeitado (flag inválida)', () => {
    const result = runCli(['--emit-sql', '--apply', FIXTURE]);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/não suportada/);
  });

  it('--catalog ausente gera null comentado para FK de apoio', () => {
    const result = runCli(['--emit-sql', FIXTURE]);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("null /* 'legislators:deputy-rs-001' */");
  });

  it('--catalog presente resolve UUID real no SQL', () => {
    const result = runCli(['--emit-sql', '--catalog', CATALOG, FIXTURE]);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("'11111111-1111-1111-1111-111111111111'");
    expect(result.stdout).not.toContain("null /* 'legislators:deputy-rs-001' */");
  });

  it('--catalog com arquivo inexistente erra com exit 1', () => {
    const result = runCli(['--emit-sql', '--catalog', 'nao-existe.json', FIXTURE]);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/Catálogo não encontrado/);
  });
});