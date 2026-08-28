import type { CandidateNominalVote } from "@/types/election";
import rawVotes from "../../data/candidate-nominal-votes.json";

interface CompactProposition {
  h: string;
  p: string;
  t: string;
  u: string;
  l: string;
  g: string | null;
  d: string | null;
}

interface CompactVotesPayload {
  p: CompactProposition[];
  c: Record<string, Array<[number, string, string]>>;
}

const payload = rawVotes as unknown as CompactVotesPayload;

export function getCandidateNominalVotes(
  candidateTseId?: string | null,
  house?: string
): CandidateNominalVote[] {
  if (!candidateTseId || !payload || !payload.p || !payload.c) return [];

  const rawList = payload.c[candidateTseId] ?? [];
  const props = payload.p;
  const votes: CandidateNominalVote[] = [];

  for (const item of rawList) {
    const pIdx = item[0];
    const voteVal = item[1];
    const date = item[2];
    const prop = props[pIdx];
    if (!prop) continue;

    if (house && prop.h.toLowerCase() !== house.toLowerCase()) continue;

    votes.push({
      house: prop.h,
      proposition_id: prop.p,
      title: prop.t,
      vote_value: voteVal,
      date: date,
      source_url: prop.u,
      source_label: prop.l,
      assessment_group: prop.g,
      impact_direction: prop.d as any,
    });
  }

  return votes;
}

export async function fetchCandidateNominalVotes(
  candidateTseId?: string | null,
  house?: string
): Promise<CandidateNominalVote[]> {
  return getCandidateNominalVotes(candidateTseId, house);
}
