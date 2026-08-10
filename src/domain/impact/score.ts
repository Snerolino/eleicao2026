/**
 * Score como função determinística (GUIA §16–18).
 * Fórmula v1: Σ(peso × sinal) / Σ(peso incluído) → [-1, 1].
 * confidence NÃO pondera o score na v1 (§17); serve para robustez, revisão e público.
 */

import type { Alignment } from './alignment';

export const STRUCTURAL_WEIGHTS = {
  structural: 1.5,
  budgetary: 1.0,
  symbolic: 0.5,
} as const;

export const ALIGNMENT_SIGNALS: Record<Alignment, number | null> = {
  a_favor: 1,
  contra: -1,
  neutro_declarado: 0,
  omissao_estrategica: -0.5,
  omissao_coordenada: 0,
  sem_dado: null, // excluído
  nao_avaliavel: null, // excluído
};

export interface ScoreInput {
  alignment: Alignment;
  structural_type: keyof typeof STRUCTURAL_WEIGHTS;
  severity: number;
  confidence?: number;
}

export interface ScoreResult {
  score: number | null;
  methodology_version: string;
  evaluated_propositions: number;
  eligible_weight: number;
  excluded_no_data: number;
  contested_assessments: number;
  average_confidence: number | null;
}

/**
 * Calcula o score agregado. Exclui sem_dado/nao_avaliavel do numerador e
 * do denominador. Retorna null quando não há proposição elegível.
 */
export function computeScore(inputs: ScoreInput[], methodologyVersion: string): ScoreResult {
  let numerator = 0;
  let denominator = 0;
  let excluded = 0;
  let contested = 0;
  let confidenceSum = 0;
  let confidenceCount = 0;

  for (const item of inputs) {
    const signal = ALIGNMENT_SIGNALS[item.alignment];
    const weight = STRUCTURAL_WEIGHTS[item.structural_type] * item.severity;

    if (typeof item.confidence === 'number') {
      confidenceSum += item.confidence;
      confidenceCount += 1;
    }

    if (signal === null) {
      excluded += 1;
      continue;
    }

    numerator += weight * signal;
    denominator += weight;
  }

  const score = denominator > 0 ? numerator / denominator : null;

  return {
    score,
    methodology_version: methodologyVersion,
    evaluated_propositions: inputs.length,
    eligible_weight: denominator,
    excluded_no_data: excluded,
    contested_assessments: contested,
    average_confidence: confidenceCount > 0 ? confidenceSum / confidenceCount : null,
  };
}
