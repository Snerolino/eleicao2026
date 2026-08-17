/**
 * Ponte explícita entre o registro factual de uma votação e a Matriz de Impacto.
 * Um voto nominal nunca é impacto por si só: precisa de assessment metodológico.
 */

import { deriveAlignment, type Alignment, type AlignmentAssessment, type AlignmentVote } from './alignment';

export type FactualVoteValue = AlignmentVote['value'];
export type ImpactEvaluationStatus = 'nao_avaliado' | 'avaliavel';

export interface FactualVote {
  value: FactualVoteValue;
  absence_type?: AlignmentVote['absence_type'];
}

export interface FactualVoteInterpretation {
  factual_value: FactualVoteValue;
  impact_status: ImpactEvaluationStatus;
  alignment: Alignment | null;
}

/**
 * Mantém o fato separado da interpretação. Sem assessment, alignment é null.
 */
export function interpretFactualVote(
  vote: FactualVote | null | undefined,
  assessment?: AlignmentAssessment | null,
): FactualVoteInterpretation {
  if (!vote) {
    return { factual_value: 'ausente', impact_status: 'nao_avaliado', alignment: null };
  }

  if (!assessment) {
    return { factual_value: vote.value, impact_status: 'nao_avaliado', alignment: null };
  }

  return {
    factual_value: vote.value,
    impact_status: 'avaliavel',
    alignment: deriveAlignment(vote, assessment),
  };
}
