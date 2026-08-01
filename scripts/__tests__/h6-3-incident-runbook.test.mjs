import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();

describe('H6.3 runbook de incidente e recuperação', () => {
  it('documenta diagnóstico e ação para incidentes operacionais comuns sem pedir segredo em texto claro', () => {
    const runbook = readFileSync(join(root, 'docs/runbooks/h6-3-incidentes-recuperacao.md'), 'utf8');

    for (const termo of [
      'produção vazia',
      '4xx',
      '5xx',
      'RLS',
      'cache antigo',
      'ingestão parcial',
      'deploy falho',
      'rollback',
    ]) {
      expect(runbook).toMatch(new RegExp(termo, 'i'));
    }

    expect(runbook).toMatch(/release\.json/);
    expect(runbook).toMatch(/npm run smoke:preview/);
    expect(runbook).toMatch(/npm run health:preview/);
    expect(runbook).not.toMatch(/cole.*(token|service_role|senha|connection string)/i);
    expect(runbook).not.toMatch(/eyJhbGci|SUPABASE_SERVICE_ROLE_KEY=\w|CLOUDFLARE_API_TOKEN=\w/);
  });

  it('explicita decisões humanas para SQL remoto, merge, deploy, rollback e publicação editorial', () => {
    const runbook = readFileSync(join(root, 'docs/runbooks/h6-3-incidentes-recuperacao.md'), 'utf8');

    expect(runbook).toMatch(/SQL remoto/i);
    expect(runbook).toMatch(/merge/i);
    expect(runbook).toMatch(/deploy/i);
    expect(runbook).toMatch(/rollback/i);
    expect(runbook).toMatch(/publica[cç][aã]o editorial/i);
    expect(runbook).toMatch(/interven[cç][aã]o humana/i);
  });

  it('é referenciado no índice de documentação e inclui exercício de mesa sem alterar produção', () => {
    const index = readFileSync(join(root, 'docs/index.md'), 'utf8');
    const runbook = readFileSync(join(root, 'docs/runbooks/h6-3-incidentes-recuperacao.md'), 'utf8');

    expect(index).toContain('h6-3-incidentes-recuperacao.md');
    expect(runbook).toMatch(/exerc[ií]cio de mesa/i);
    expect(runbook).toMatch(/sem alterar produ[cç][aã]o/i);
  });
});
