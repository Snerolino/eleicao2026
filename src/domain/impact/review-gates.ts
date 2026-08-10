/**
 * Gates de revisão humana (GUIA §9 Governance e §14 RPC approve_impact_matrix).
 * Espelha a checagem atômica do approve_impact_matrix(p_matrix_id).
 */

export interface ReviewGateInput {
  severity: number;
  confidenceValues: number[];
  hasInternalApproval: boolean;
  hasExternalApproval: boolean;
  hasBlockingContestation: boolean;
  methodologyExists: boolean;
  hasAssessmentOrExplicitlyNone: boolean;
  allSourcesSufficient: boolean;
  defendingVotesValid: boolean;
}

export interface ReviewGateResult {
  ok: boolean;
  reason?: string;
}

/**
 * Regras v1 (GUIA §14):
 *  - revisão interna aprovada obrigatória;
 *  - severity >= 4 → exige revisão externa (painel) aprovada;
 *  - qualquer confidence < 0.6 → exige revisão externa aprovada;
 *  - contestação bloqueante → não aprova (estado contested);
 *  - metodologia deve existir;
 *  - matriz precisa de pelo menos um assessment válido OU nenhum grupo explicitamente.
 */
export function canApproveImpactMatrix(input: ReviewGateInput): ReviewGateResult {
  if (!input.methodologyExists) {
    return { ok: false, reason: 'versão da metodologia não existe' };
  }
  if (!input.hasAssessmentOrExplicitlyNone) {
    return { ok: false, reason: 'sem assessments e sem marcação explícita de nenhum grupo' };
  }
  if (!input.allSourcesSufficient) {
    return { ok: false, reason: 'assessments sem fontes suficientes' };
  }
  if (!input.defendingVotesValid) {
    return { ok: false, reason: 'defending_vote não obedece a metodologia' };
  }
  if (!input.hasInternalApproval) {
    return { ok: false, reason: 'revisão interna aprovada obrigatória' };
  }
  if (input.hasBlockingContestation) {
    return { ok: false, reason: 'contestação bloqueante aberta (estado contested)' };
  }

  const needsExternal =
    input.severity >= 4 || input.confidenceValues.some((c) => c < 0.6);
  if (needsExternal && !input.hasExternalApproval) {
    return {
      ok: false,
      reason: `severity ${input.severity} ou confidence < 0.6 exige revisão externa aprovada`,
    };
  }

  return { ok: true };
}
