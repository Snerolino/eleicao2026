import type { Alignment } from './alignment';
import {
  deriveAlignmentV2,
  IMPACT_METHODOLOGY_V2,
  type EventAttributionReviewStatus,
  type VoteAttributionStatus,
} from './event-attribution-v2';
import { computeScore, type ScoreResult, type ScoreInput } from './score';
import type { FactualVoteValue } from './vote-category-comparison';

export interface VoteCategoryScoreFact {
  candidate_id: string;
  house: string;
  voting_event_id?: string;
  proposition_version_id?: string;
  assessment_id?: string;
  group_slug: string;
  value: FactualVoteValue;
  absence_type?: 'estrategica' | 'obstrucao_coordenada' | 'justificada' | null;
  impact_direction: 'positive' | 'negative' | 'mixed' | 'unclear';
  /** Legado textual. Nunca determina o sentido do evento na metodologia v2. */
  defending_vote?: 'sim' | 'nao' | null;
  textual_defending_vote?: 'sim' | 'nao' | null;
  event_defending_vote?: 'sim' | 'nao' | null;
  score_eligible?: boolean;
  vote_attribution_status?: VoteAttributionStatus;
  score_withholding_reason?: string | null;
  attribution_review_status?: EventAttributionReviewStatus;
  attribution_methodology_version?: string | null;
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

function toLegacyAlignment(
  value: ReturnType<typeof deriveAlignmentV2>,
): Alignment {
  switch (value) {
    case 'aligned':
      return 'a_favor';
    case 'not_aligned':
      return 'contra';
    case 'no_alignment':
      return 'sem_dado';
    case 'withheld':
    default:
      return 'nao_avaliavel';
  }
}

export function buildVoteCategoryScores(
  facts: readonly VoteCategoryScoreFact[],
  methodologyVersion = IMPACT_METHODOLOGY_V2,
): VoteCategoryScore[] {
  const grouped = new Map<string, VoteCategoryScoreFact[]>();
  const seenFacts = new Set<string>();

  for (const fact of facts) {
    if (fact.review_status !== 'approved' && fact.review_status !== 'contested') continue;

    // Methodology v2 scores the concrete event, not the proposition/version.
    // The assessment id prevents duplicate source joins from double-counting.
    const eventIdentity = fact.voting_event_id ?? 'missing-event';
    const assessmentIdentity = fact.assessment_id ?? fact.group_slug;
    const factKey = [
      fact.candidate_id,
      fact.house,
      fact.group_slug,
      eventIdentity,
      assessmentIdentity,
    ].join('|');
    if (seenFacts.has(factKey)) continue;
    seenFacts.add(factKey);

    const key = `${fact.candidate_id}|${fact.house}|${fact.group_slug}`;
    const bucket = grouped.get(key) ?? [];
    bucket.push(fact);
    grouped.set(key, bucket);
  }

  return [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, bucket]) => {
      const [candidate_id, house, group_slug] = key.split('|');
      const inputs: ScoreInput[] = bucket.map((fact) => {
        const alignmentV2 = deriveAlignmentV2(
          { value: fact.value },
          {
            event_defending_vote: fact.event_defending_vote ?? null,
            score_eligible: fact.score_eligible === true,
            vote_attribution_status:
              fact.vote_attribution_status ?? 'event_binding_missing',
            score_withholding_reason: fact.score_withholding_reason ?? null,
            review_status: fact.attribution_review_status ?? 'pending_review',
            methodology_version: fact.attribution_methodology_version ?? null,
          },
        );

        return {
          alignment: toLegacyAlignment(alignmentV2),
          structural_type: fact.structural_type,
          severity: fact.severity,
          confidence: fact.confidence,
        };
      });

      const result = computeScore(inputs, methodologyVersion);
      return {
        candidate_id,
        house,
        group_slug,
        ...result,
        contested_assessments: bucket.filter(
          (fact) =>
            fact.review_status === 'contested' ||
            fact.attribution_review_status === 'contested',
        ).length,
      };
    });
}

/** Formata somente na borda da UI; o domínio mantém number|null. */
export function formatCategoryScore(score: number | null): string {
  if (score === null) return 'não avaliado';
  const normalized = Math.abs(score) < 0.005 ? 0 : score;
  return `${normalized >= 0 ? '+' : ''}${normalized
    .toFixed(2)
    .replace('.', ',')}`;
}
