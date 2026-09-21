export const IMPACT_METHODOLOGY_V2 = '2.0.0' as const;

export type VoteAttributionStatus =
  | 'isolated'
  | 'compound_separable'
  | 'compound_non_separable'
  | 'procedural'
  | 'event_binding_missing';

export type EventAttributionReviewStatus =
  | 'pending_review'
  | 'approved'
  | 'contested'
  | 'rejected';

export type EventDefendingVote = 'sim' | 'nao' | null;

export interface EventAttributionV2 {
  event_defending_vote: EventDefendingVote;
  score_eligible: boolean;
  vote_attribution_status: VoteAttributionStatus;
  score_withholding_reason?: string | null;
  review_status: EventAttributionReviewStatus;
  methodology_version?: string | null;
}

export interface FactualVoteV2 {
  value: 'sim' | 'nao' | 'abstencao' | 'ausente' | 'obstrucao';
}

export type DerivedAlignmentV2 =
  | 'aligned'
  | 'not_aligned'
  | 'no_alignment'
  | 'withheld';

export function isScoreableAttributionV2(
  attribution: EventAttributionV2 | null | undefined,
): attribution is EventAttributionV2 & {
  event_defending_vote: 'sim' | 'nao';
  score_eligible: true;
  vote_attribution_status: 'isolated' | 'compound_separable';
  review_status: 'approved' | 'contested';
} {
  if (!attribution) return false;
  if (attribution.methodology_version && attribution.methodology_version !== IMPACT_METHODOLOGY_V2) {
    return false;
  }
  return (
    attribution.score_eligible === true &&
    (attribution.review_status === 'approved' || attribution.review_status === 'contested') &&
    (attribution.vote_attribution_status === 'isolated' ||
      attribution.vote_attribution_status === 'compound_separable') &&
    (attribution.event_defending_vote === 'sim' ||
      attribution.event_defending_vote === 'nao')
  );
}

export function deriveAlignmentV2(
  vote: FactualVoteV2 | null | undefined,
  attribution: EventAttributionV2 | null | undefined,
): DerivedAlignmentV2 {
  if (!isScoreableAttributionV2(attribution)) return 'withheld';
  if (!vote) return 'no_alignment';

  if (vote.value === 'abstencao' || vote.value === 'ausente' || vote.value === 'obstrucao') {
    return 'no_alignment';
  }

  if (vote.value === attribution.event_defending_vote) return 'aligned';
  if (
    (vote.value === 'sim' && attribution.event_defending_vote === 'nao') ||
    (vote.value === 'nao' && attribution.event_defending_vote === 'sim')
  ) {
    return 'not_aligned';
  }

  return 'no_alignment';
}
