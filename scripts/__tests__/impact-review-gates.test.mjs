import { describe, expect, it } from 'vitest';
import { canApproveImpactMatrix } from '../../src/domain/impact/review-gates.ts';

/**
 * Testes RED da Fase 1 (GUIA §9 — Governance).
 * Gates de revisão humana obrigatória.
 */

const base = {
  severity: 3,
  confidenceValues: [0.8],
  hasInternalApproval: true,
  hasExternalApproval: false,
  hasBlockingContestation: false,
  methodologyExists: true,
  hasAssessmentOrExplicitlyNone: true,
  allSourcesSufficient: true,
  defendingVotesValid: true,
};

describe('impact-review-gates', () => {
  it('severity 4 + só revisão interna → não aprova', () => {
    expect(
      canApproveImpactMatrix({
        ...base,
        severity: 4,
        hasInternalApproval: true,
        hasExternalApproval: false,
      }).ok,
    ).toBe(false);
  });

  it('severity 5 + painel externo → pode aprovar', () => {
    expect(
      canApproveImpactMatrix({
        ...base,
        severity: 5,
        hasInternalApproval: true,
        hasExternalApproval: true,
      }).ok,
    ).toBe(true);
  });

  it('confidence 0.59 + só interna → não aprova', () => {
    expect(
      canApproveImpactMatrix({
        ...base,
        confidenceValues: [0.59],
        hasInternalApproval: true,
        hasExternalApproval: false,
      }).ok,
    ).toBe(false);
  });

  it('confidence 0.60 + interna → gate externo não obrigatório', () => {
    expect(
      canApproveImpactMatrix({
        ...base,
        confidenceValues: [0.6],
        hasInternalApproval: true,
        hasExternalApproval: false,
      }).ok,
    ).toBe(true);
  });

  it('contestação aberta → estado contested', () => {
    const r = canApproveImpactMatrix({ ...base, hasBlockingContestation: true });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/contest/i);
  });

  it('sem revisão interna aprovada → não aprova', () => {
    expect(
      canApproveImpactMatrix({
        ...base,
        hasInternalApproval: false,
        hasExternalApproval: true,
      }).ok,
    ).toBe(false);
  });

  it('metodologia inexistente → não aprova', () => {
    expect(
      canApproveImpactMatrix({
        ...base,
        methodologyExists: false,
        hasInternalApproval: true,
        hasExternalApproval: false,
      }).ok,
    ).toBe(false);
  });

  it('matriz sem assessments e sem marcação explícita → não aprova', () => {
    expect(
      canApproveImpactMatrix({
        ...base,
        hasAssessmentOrExplicitlyNone: false,
      }).ok,
    ).toBe(false);
  });
});
