import { BENEFICIARY_GROUPS_CANONICAL_ORDER } from '@/domain/impact/beneficiary-groups';
import type { CandidateNominalVote } from '@/types/election';

const CANONICAL_GROUPS = new Set<string>(BENEFICIARY_GROUPS_CANONICAL_ORDER);

export function isPopulationRelevantVote(vote: CandidateNominalVote): boolean {
  return typeof vote.assessment_group === 'string' && CANONICAL_GROUPS.has(vote.assessment_group);
}

export function isScoredPopulationVote(vote: CandidateNominalVote): boolean {
  return (
    isPopulationRelevantVote(vote) &&
    vote.attribution_methodology_version === '2.0.0' &&
    typeof vote.voting_event_id === 'string' &&
    vote.voting_event_id.length > 0 &&
    vote.score_eligible === true &&
    (vote.attribution_review_status === 'approved' ||
      vote.attribution_review_status === 'contested') &&
    (vote.vote_attribution_status === 'isolated' ||
      vote.vote_attribution_status === 'compound_separable') &&
    (vote.event_defending_vote === 'sim' || vote.event_defending_vote === 'nao')
  );
}

export interface VoteCoverageSummary {
  totalVotes: number;
  relevantVotes: number;
  scoredVotes: number;
  relevantPercentage: number | null;
  scoredPercentage: number | null;
}

export function summarizeVoteCoverage(votes: readonly CandidateNominalVote[]): VoteCoverageSummary {
  const relevantVotes = votes.filter(isPopulationRelevantVote).length;
  const scoredVotes = votes.filter(isScoredPopulationVote).length;
  return {
    totalVotes: votes.length,
    relevantVotes,
    scoredVotes,
    relevantPercentage: votes.length > 0 ? (relevantVotes / votes.length) * 100 : null,
    scoredPercentage: relevantVotes > 0 ? (scoredVotes / relevantVotes) * 100 : null,
  };
}

export function formatCoveragePercentage(value: number | null): string {
  if (value === null) return 'não avaliado';
  return `${value.toFixed(1).replace('.', ',')}%`;
}

export function filterPopulationRelevantVotes(votes: readonly CandidateNominalVote[]): CandidateNominalVote[] {
  return votes.filter(isPopulationRelevantVote);
}
