import { BENEFICIARY_GROUPS_CANONICAL_ORDER } from '@/domain/impact/beneficiary-groups';
import type { CandidateNominalVote } from '@/types/election';

const CANONICAL_GROUPS = new Set<string>(BENEFICIARY_GROUPS_CANONICAL_ORDER);

export function isPopulationRelevantVote(vote: CandidateNominalVote): boolean {
  return typeof vote.assessment_group === 'string' && CANONICAL_GROUPS.has(vote.assessment_group);
}

export function isScoredPopulationVote(vote: CandidateNominalVote): boolean {
  return isPopulationRelevantVote(vote) && vote.score_eligible === true;
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
