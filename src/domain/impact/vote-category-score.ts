import { deriveAlignment, type Alignment } from './alignment';
import { computeScore, type ScoreResult, type ScoreInput } from './score';
import type { FactualVoteValue } from './vote-category-comparison';

export interface VoteCategoryScoreFact {
  candidate_id: string;
  house: string;
  group_slug: string;
  value: FactualVoteValue;
  absence_type?: 'estrategica' | 'obstrucao_coordenada' | 'justificada' | null;
  impact_direction: 'positive' | 'negative' | 'mixed' | 'unclear';
  defending_vote: 'sim' | 'nao' | null;
  textual_defending_vote?: 'sim' | 'nao' | null;
  event_defending_vote?: 'sim' | 'nao' | null;
  score_eligible?: boolean;
  vote_attribution_status?:
    | 'isolated'
    | 'compound_separable'
    | 'compound_non_separable'
    | 'procedural'
    | 'event_binding_missing';
  score_withholding_reason?: string | null;
  severity: number;
  structural_type: 'structural' | 'budgetary' | 'symbolic';
  confidence: number;
  review_status: 'approved' | 'contested';
}

export interface VoteCategoryScore extends ScoreResult {
  candidate_id: string;
  house: string;
  group_slug: string;
  contested_assessments: number;
}

export function buildVoteCategoryScores(
  facts: readonly VoteCategoryScoreFact[],
  methodologyVersion = '1.0.0',
): VoteCategoryScore[] {
  const grouped = new Map<string, VoteCategoryScoreFact[]>();
  for (const fact of facts) {
    if (fact.review_status !== 'approved' && fact.review_status !== 'contested') continue;
    const key = `${fact.candidate_id}|${fact.house}|${fact.group_slug}`;
    const bucket = grouped.get(key) ?? [];
    bucket.push(fact);
    grouped.set(key, bucket);
  }
  return [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, bucket]) => {
    const [candidate_id, house, group_slug] = key.split('|');
    const inputs: ScoreInput[] = bucket.map((fact) => ({
      alignment: deriveAlignment(
        { value: fact.value, absence_type: fact.absence_type },
        {
          impact_direction: fact.impact_direction,
          defending_vote: fact.defending_vote,
          textual_defending_vote: fact.textual_defending_vote,
          event_defending_vote: fact.event_defending_vote,
          score_eligible: fact.score_eligible,
          vote_attribution_status: fact.vote_attribution_status,
        },
      ) as Alignment,
      structural_type: fact.structural_type,
      severity: fact.severity,
      confidence: fact.confidence,
    }));
    const result = computeScore(inputs, methodologyVersion);
    return { candidate_id, house, group_slug, ...result, contested_assessments: bucket.filter((fact) => fact.review_status === 'contested').length };
  });
}

/** Formata somente na borda da UI; o domínio mantém number|null. */
export function formatCategoryScore(score: number | null): string {
  if (score === null) return 'não avaliado';
  const normalized = Math.abs(score) < 0.005 ? 0 : score;
  return `${normalized >= 0 ? '+' : ''}${normalized.toFixed(2).replace('.', ',')}`;
}
