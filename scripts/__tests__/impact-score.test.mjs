import { describe, expect, it } from 'vitest';
import { computeScore } from '../../src/domain/impact/score.ts';

/**
 * Testes RED da Fase 1 (GUIA §16 — Score como função determinística).
 * Fórmula: Σ(peso × sinal) / Σ(peso incluído) → [-1, 1].
 * confidence NÃO pondera o score na v1 (§17).
 */

describe('impact-score: computeScore', () => {
  it('a_favor em proposição estrutural severity 3 → score 1 (100%)', () => {
    const r = computeScore(
      [{ alignment: 'a_favor', structural_type: 'structural', severity: 3 }],
      '1.0.0',
    );
    expect(r.score).toBe(1);
    expect(r.methodology_version).toBe('1.0.0');
  });

  it('contra em proposição estrutural severity 3 → score -1', () => {
    const r = computeScore(
      [{ alignment: 'contra', structural_type: 'structural', severity: 3 }],
      '1.0.0',
    );
    expect(r.score).toBe(-1);
  });

  it('neutro_declarado → sinal 0, entra no denominador', () => {
    const r = computeScore(
      [{ alignment: 'neutro_declarado', structural_type: 'structural', severity: 3 }],
      '1.0.0',
    );
    expect(r.score).toBe(0);
  });

  it('omissao_estrategica → sinal -0.5', () => {
    const r = computeScore(
      [{ alignment: 'omissao_estrategica', structural_type: 'structural', severity: 3 }],
      '1.0.0',
    );
    expect(r.score).toBe(-0.5);
  });

  it('omissao_coordenada → sinal 0', () => {
    const r = computeScore(
      [{ alignment: 'omissao_coordenada', structural_type: 'structural', severity: 3 }],
      '1.0.0',
    );
    expect(r.score).toBe(0);
  });

  it('sem_dado e nao_avaliavel → excluídos do numerador e denominador', () => {
    const r = computeScore(
      [
        { alignment: 'a_favor', structural_type: 'structural', severity: 3 },
        { alignment: 'sem_dado', structural_type: 'structural', severity: 3 },
        { alignment: 'nao_avaliavel', structural_type: 'structural', severity: 3 },
      ],
      '1.0.0',
    );
    expect(r.score).toBe(1);
    expect(r.excluded_no_data).toBe(2);
  });

  it('pesos por tipo: structural 1.5, budgetary 1.0, symbolic 0.5', () => {
    // a_favor structural severity 2 (peso 3) + contra budgetary severity 4 (peso 4)
    // = (3×1 + 4×-1) / (3+4) = -1/7 ≈ -0.142857
    const r = computeScore(
      [
        { alignment: 'a_favor', structural_type: 'structural', severity: 2 },
        { alignment: 'contra', structural_type: 'budgetary', severity: 4 },
      ],
      '1.0.0',
    );
    expect(r.score).toBeCloseTo(-1 / 7, 6);
    expect(r.eligible_weight).toBeCloseTo(7, 6);
  });

  it('confidence não pondera o score (v1)', () => {
    const r = computeScore(
      [
        { alignment: 'a_favor', structural_type: 'structural', severity: 3, confidence: 0.4 },
        { alignment: 'contra', structural_type: 'structural', severity: 3, confidence: 0.9 },
      ],
      '1.0.0',
    );
    // sem ponderação por confidence: (4.5×1 + 4.5×-1)/(4.5+4.5) = 0
    expect(r.score).toBe(0);
  });

  it('retorna cobertura: evaluated_propositions, eligible_weight, average_confidence', () => {
    const r = computeScore(
      [
        { alignment: 'a_favor', structural_type: 'structural', severity: 3, confidence: 0.8 },
        { alignment: 'contra', structural_type: 'budgetary', severity: 2, confidence: 0.6 },
        { alignment: 'sem_dado', structural_type: 'symbolic', severity: 5, confidence: 0.7 },
      ],
      '1.0.0',
    );
    expect(r.evaluated_propositions).toBe(3);
    expect(r.eligible_weight).toBeCloseTo(4.5 + 2, 6);
    expect(r.excluded_no_data).toBe(1);
    expect(r.average_confidence).toBeCloseTo((0.8 + 0.6 + 0.7) / 3, 6);
  });

  it('sem nenhuma proposição elegível → score null e cobertura zero', () => {
    const r = computeScore([], '1.0.0');
    expect(r.score).toBeNull();
    expect(r.evaluated_propositions).toBe(0);
    expect(r.eligible_weight).toBe(0);
  });
});
