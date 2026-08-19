import { VOTE_VALUES } from './contract';

export type FactualVoteValue = (typeof VOTE_VALUES)[number];

export interface VoteCategoryFact {
  candidate_id: string;
  house: string;
  voting_event_id: string;
  group_slug: string;
  value: FactualVoteValue;
  review_status: 'approved' | 'pending_review' | 'contested' | 'rascunho';
}

export interface VoteCategoryCandidateSummary {
  candidate_id: string;
  total_votes: number;
  sim: number;
  nao: number;
  abstencao: number;
  ausente: number;
  obstrucao: number;
}

export interface VoteCategoryComparison {
  house: string;
  group_slug: string;
  events_compared: number;
  candidates: VoteCategoryCandidateSummary[];
}

const VOTE_KEYS: FactualVoteValue[] = ['sim', 'nao', 'abstencao', 'ausente', 'obstrucao'];

function emptySummary(candidate_id: string): VoteCategoryCandidateSummary {
  return { candidate_id, total_votes: 0, sim: 0, nao: 0, abstencao: 0, ausente: 0, obstrucao: 0 };
}

/**
 * Compara somente fatos em eventos comuns e matrizes aprovadas.
 * Não calcula score, alinhamento ou recomendação.
 */
export function buildVoteCategoryComparisons(
  facts: readonly VoteCategoryFact[],
  candidateIds: readonly string[],
): VoteCategoryComparison[] {
  const selected = new Set(candidateIds);
  if (selected.size < 2) return [];
  const valid = facts.filter((fact) => selected.has(fact.candidate_id) && fact.review_status === 'approved');
  const eventCandidates = new Map<string, Set<string>>();
  for (const fact of valid) {
    const key = `${fact.house}|${fact.group_slug}|${fact.voting_event_id}`;
    const members = eventCandidates.get(key) ?? new Set<string>();
    members.add(fact.candidate_id);
    eventCandidates.set(key, members);
  }
  const commonKeys = new Set([...eventCandidates].filter(([, members]) => members.size === selected.size).map(([key]) => key));
  const grouped = new Map<string, VoteCategoryComparison>();
  for (const fact of valid) {
    const eventKey = `${fact.house}|${fact.group_slug}|${fact.voting_event_id}`;
    if (!commonKeys.has(eventKey)) continue;
    const groupKey = `${fact.house}|${fact.group_slug}`;
    const comparison = grouped.get(groupKey) ?? { house: fact.house, group_slug: fact.group_slug, events_compared: 0, candidates: candidateIds.map(emptySummary) };
    const summary = comparison.candidates.find((candidate) => candidate.candidate_id === fact.candidate_id);
    if (!summary) continue;
    summary.total_votes += 1;
    if (VOTE_KEYS.includes(fact.value)) summary[fact.value] += 1;
    comparison.events_compared = new Set(valid.filter((row) => commonKeys.has(`${row.house}|${row.group_slug}|${row.voting_event_id}`) && `${row.house}|${row.group_slug}` === groupKey).map((row) => row.voting_event_id)).size;
    grouped.set(groupKey, comparison);
  }
  return [...grouped.values()].sort((a, b) => `${a.house}|${a.group_slug}`.localeCompare(`${b.house}|${b.group_slug}`));
}
