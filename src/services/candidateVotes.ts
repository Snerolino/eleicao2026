import type { CandidateNominalVote } from "@/types/election";
import rawVotes from "../../data/candidate-nominal-votes.json";

const candidateVotesMap = rawVotes as Record<string, CandidateNominalVote[]>;

export function getCandidateNominalVotes(
  candidateTseId?: string | null,
  house?: string
): CandidateNominalVote[] {
  if (!candidateTseId) return [];
  const votes = candidateVotesMap[candidateTseId] ?? [];
  if (!house) return votes;
  return votes.filter((v) => v.house.toLowerCase() === house.toLowerCase());
}

export async function fetchCandidateNominalVotes(
  candidateTseId?: string | null,
  house?: string
): Promise<CandidateNominalVote[]> {
  return getCandidateNominalVotes(candidateTseId, house);
}
