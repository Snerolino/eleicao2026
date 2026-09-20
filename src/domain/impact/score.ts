/**
 * Score como função determinística.
 * Fórmula: Σ(peso × sinal) / Σ(peso incluído) → [-1, 1].
 *
 * Na metodologia v2 o domínio de atribuição converte somente eventos
 * comprovadamente elegíveis em a_favor/contra. no_alignment e withheld
 * chegam aqui como sem_dado/nao_avaliavel e nunca entram no denominador.
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
  sem_dado: null,
  nao_avaliavel: null,
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
  /** @deprecated Compatibilidade de UI. Na v2 representa eventos avaliados. */
  evaluated_propositions: number;
  evaluated_events: number;
  eligible_weight: number;
  excluded_no_data: number;
  withheld_events: number;
  no_alignment_events: number;
  contested_assessments: number;
  average_confidence: number | null;
}

export function computeScore(inputs: ScoreInput[], methodologyVersion: string): ScoreResult {
  let numerator = 0;
  let denominator = 0;
  let excluded = 0;
  let evaluated = 0;
  let withheld = 0;
  let noAlignment = 0;
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
      if (item.alignment === 'nao_avaliavel') withheld += 1;
      else noAlignment += 1;
      continue;
    }

    evaluated += 1;
    numerator += weight * signal;
    denominator += weight;
  }

  const score = denominator > 0 ? numerator / denominator : null;

  return {
    score,
    methodology_version: methodologyVersion,
    evaluated_propositions: evaluated,
    evaluated_events: evaluated,
    eligible_weight: denominator,
    excluded_no_data: excluded,
    withheld_events: withheld,
    no_alignment_events: noAlignment,
    contested_assessments: contested,
    average_confidence: confidenceCount > 0 ? confidenceSum / confidenceCount : null,
  };
}
