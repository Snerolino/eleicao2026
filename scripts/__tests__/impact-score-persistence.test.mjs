// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { deriveAlignment } from '../../src/domain/impact/alignment.ts';
import { computeScore } from '../../src/domain/impact/score.ts';

/**
 * Testes de contrato do desenho de persistência de score/alinhamento
 * (Fase 2, Task 5 — docs/persistencia-score-impacto-v1.md).
 *
 * Nenhum SQL é executado aqui: apenas o shape do snapshot derivado é fixado
 * a partir das funções puras existentes (deriveAlignment + computeScore).
 */

const SEMVER = /^[0-9]+\.[0-9]+\.[0-9]+$/;

/** Shape conceitual do snapshot persistível (espelha ScoreResult). */
function buildSnapshot({ legislatorKey, groupSlug, inputs, methodologyVersion }) {
  if (!SEMVER.test(methodologyVersion)) {
    throw new Error(`methodology_version inválida: ${methodologyVersion}`);
  }
  const result = computeScore(inputs, methodologyVersion);
  return {
    legislator_key: legislatorKey,
    group_slug: groupSlug,
    methodology_version: methodologyVersion,
    score: result.score,
    evaluated_propositions: result.evaluated_propositions,
    eligible_weight: result.eligible_weight,
    excluded_no_data: result.excluded_no_data,
    contested_assessments: result.contested_assessments,
    average_confidence: result.average_confidence,
  };
}

describe('impact-score-persistence: snapshot derivado (contrato v1)', () => {
  it('sem peso elegível → score null, nunca 0 por ausência de dado', () => {
    const snapshot = buildSnapshot({
      legislatorKey: 'deputy-rs-001',
      groupSlug: 'mulheres',
      inputs: [{ alignment: 'sem_dado', structural_type: 'structural', severity: 3 }],
      methodologyVersion: '1.0.0',
    });
    expect(snapshot.score).toBeNull();
    expect(snapshot.excluded_no_data).toBe(1);
  });

  it('score dentro de [-1, 1] para caso normal', () => {
    const snapshot = buildSnapshot({
      legislatorKey: 'deputy-rs-001',
      groupSlug: 'mulheres',
      inputs: [{ alignment: 'a_favor', structural_type: 'structural', severity: 3 }],
      methodologyVersion: '1.0.0',
    });
    expect(snapshot.score).toBe(1);
    expect(snapshot.score).toBeGreaterThanOrEqual(-1);
    expect(snapshot.score).toBeLessThanOrEqual(1);
  });

  it('contested_assessments soma, não exclui (metodologia v1)', () => {
    const result = computeScore(
      [
        { alignment: 'a_favor', structural_type: 'structural', severity: 3 },
        { alignment: 'contra', structural_type: 'budgetary', severity: 2 },
      ],
      '1.0.0',
    );
    expect(result.contested_assessments).toBe(0);
  });

  it('confidence não pondera; average_confidence reportado à parte', () => {
    const result = computeScore(
      [
        { alignment: 'a_favor', structural_type: 'structural', severity: 3, confidence: 0.4 },
        { alignment: 'contra', structural_type: 'structural', severity: 3, confidence: 0.9 },
      ],
      '1.0.0',
    );
    expect(result.score).toBe(0); // sem ponderação por confidence
    expect(result.average_confidence).toBeCloseTo(0.65, 6);
  });

  it('mesma entrada → mesmo snapshot (determinismo)', () => {
    const inputs = [
      { alignment: 'a_favor', structural_type: 'structural', severity: 3 },
      { alignment: 'omissao_estrategica', structural_type: 'budgetary', severity: 4 },
    ];
    const a = buildSnapshot({
      legislatorKey: 'deputy-rs-001',
      groupSlug: 'mulheres',
      inputs,
      methodologyVersion: '1.0.0',
    });
    const b = buildSnapshot({
      legislatorKey: 'deputy-rs-001',
      groupSlug: 'mulheres',
      inputs: structuredClone(inputs),
      methodologyVersion: '1.0.0',
    });
    expect(a).toEqual(b);
  });

  it('deriveAlignment produz alinhamentos válidos para a enum v1', () => {
    const assessment = { impact_direction: 'positive', defending_vote: 'sim' };
    const alignment = deriveAlignment({ value: 'ausente', absence_type: 'estrategica' }, assessment);
    expect(alignment).toBe('omissao_estrategica');
  });

  it('rejeita methodology_version fora do semver', () => {
    expect(() =>
      buildSnapshot({
        legislatorKey: 'deputy-rs-001',
        groupSlug: 'mulheres',
        inputs: [{ alignment: 'a_favor', structural_type: 'structural', severity: 3 }],
        methodologyVersion: '1.0',
      }),
    ).toThrow(/methodology_version/);
  });
});
