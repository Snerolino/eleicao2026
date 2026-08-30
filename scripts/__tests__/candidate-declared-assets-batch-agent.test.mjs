import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('candidate-declared-assets-batch-agent', () => {
  it('garante que todos os 1003 candidatos possuem declared_assets estruturados', () => {
    const publicCandPath = path.resolve(process.cwd(), 'data/public-candidates.json');
    const cands = JSON.parse(fs.readFileSync(publicCandPath, 'utf8'));

    expect(cands.length).toBe(1003);

    const withAssets = cands.filter((c) => c.declared_assets !== undefined);
    expect(withAssets.length).toBe(1003);
  });

  it('valida estrutura de categorias e anos de declaração', () => {
    const assetsPath = path.resolve(process.cwd(), 'data/candidate-declared-assets.json');
    if (!fs.existsSync(assetsPath)) return;

    const assets = JSON.parse(fs.readFileSync(assetsPath, 'utf8'));
    const validCategories = new Set([
      'Imóveis e Terrenos',
      'Veículos e Automotores',
      'Aplicações e Depósitos Bancários',
      'Participações Societárias e Empresas',
      'Dinheiro em Espécie',
      'Créditos e Direitos',
      'Outros Bens e Direitos',
    ]);

    for (const [tseId, data] of Object.entries(assets)) {
      expect(data.tse_candidate_id).toBe(tseId);
      expect(typeof data.total_declarado).toBe('number');
      expect(Array.isArray(data.declaracoes_por_ano)).toBe(true);

      for (const decl of data.declaracoes_por_ano) {
        expect(typeof decl.ano).toBe('number');
        expect(typeof decl.total).toBe('number');
        for (const item of decl.itens) {
          expect(validCategories.has(item.categoria)).toBe(true);
        }
      }
    }
  });

  it('verifica que a auditoria de evolução patrimonial respeita o IPCA e anos múltiplos', () => {
    const assetsPath = path.resolve(process.cwd(), 'data/candidate-declared-assets.json');
    if (!fs.existsSync(assetsPath)) return;

    const assets = JSON.parse(fs.readFileSync(assetsPath, 'utf8'));
    const multiYear = Object.values(assets).filter((a) => a.declaracoes_por_ano.length >= 2);

    for (const data of multiYear) {
      expect(data.auditoria_evolucao).toBeDefined();
      expect(data.auditoria_evolucao?.ano_base).toBeGreaterThan(data.auditoria_evolucao?.ano_anterior);
      expect(typeof data.auditoria_evolucao?.ipca_acumulado_periodo).toBe('number');
      expect(typeof data.auditoria_evolucao?.resumo).toBe('string');
    }
  });
});
