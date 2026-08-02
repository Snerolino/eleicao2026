import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();

describe('Fase 7 checklist final de liberação MVP', () => {
  const checklistPath = 'docs/release/fase-7-checklist-mvp.md';

  it('documenta todos os domínios do checklist final do Guia Mestre', () => {
    const checklist = readFileSync(join(root, checklistPath), 'utf8');

    for (const item of [
      'Security',
      'Data',
      'Frontend',
      'Degradação',
      'PWA',
      'Acessibilidade',
      'SEO',
      'CI/CD',
      'Editorial',
      'Operação',
      'Documentação',
    ]) {
      expect(checklist).toMatch(new RegExp(item, 'i'));
    }

    expect(checklist).toContain('212');
    expect(checklist).toContain('213');
    expect(checklist).toMatch(/FRANCISCO MARQUES NETO/);
    expect(checklist).toMatch(/interven[cç][aã]o humana/i);
    expect(checklist).toMatch(/CSP enforce/i);
    expect(checklist).toMatch(/publica[cç][aã]o editorial/i);
    expect(checklist).toMatch(/dom[ií]nio pr[oó]prio/i);
  });

  it('remove estado antigo de 69 candidaturas do README e referencia o checklist no índice', () => {
    const readme = readFileSync(join(root, 'README.md'), 'utf8');
    const index = readFileSync(join(root, 'docs/index.md'), 'utf8');

    expect(readme).toContain('212 candidaturas públicas');
    expect(readme).toMatch(/213`? linhas oficiais TSE/);
    expect(readme).not.toMatch(/69 candidaturas oficiais/i);
    expect(readme).not.toMatch(/modo de demonstra[cç][aã]o/i);
    expect(index).toContain('release/fase-7-checklist-mvp.md');
  });

  it('mantém evidências de validação e gates decididos no status assinável', () => {
    const checklist = readFileSync(join(root, checklistPath), 'utf8');

    expect(checklist).toMatch(/smoke produ[cç][aã]o/i);
    expect(checklist).toMatch(/health produ[cç][aã]o/i);
    expect(checklist).toMatch(/status=ok/);
    expect(checklist).toMatch(/blocks_release=false/);
    expect(checklist).toMatch(/MVP operacional/i);
    expect(checklist).toMatch(/Gates humanos decididos/i);
    expect(checklist).toMatch(/tecnicamente assin[aá]vel/i);
    expect(checklist).toMatch(/rs\.votopraquem\.org/i);
  });
});
