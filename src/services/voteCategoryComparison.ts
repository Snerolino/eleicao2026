import { supabase } from '@/lib/supabase';
import { buildVoteCategoryComparisons, type VoteCategoryComparison, type VoteCategoryFact } from '@/domain/impact/vote-category-comparison';

type Row = Record<string, any>;

export async function fetchVoteCategoryComparisons(candidateIds: string[]): Promise<VoteCategoryComparison[]> {
  if (!supabase || candidateIds.length < 2) return [];
  const client = supabase as any;
  const { data: indexRows, error: indexError } = await client
    .from('legislator_vote_index')
    .select('candidate_id,voting_event_id,value')
    .in('candidate_id', candidateIds);
  if (indexError) throw indexError;
  const indexes = (indexRows ?? []) as Row[];
  const eventIds = [...new Set(indexes.map((row) => row.voting_event_id).filter(Boolean))];
  if (eventIds.length === 0) return [];
  const { data: eventRows, error: eventError } = await supabase
    .from('voting_events')
    .select('id,house,proposition_version_id')
    .in('id', eventIds);
  if (eventError) throw eventError;
  const events = (eventRows ?? []) as Row[];
  const versionIds = [...new Set(events.map((row) => row.proposition_version_id).filter(Boolean))];
  if (versionIds.length === 0) return [];
  const { data: matrixRows, error: matrixError } = await supabase
    .from('impact_matrices')
    .select('proposition_version_id,review_status,impact_assessments(group_slug)')
    .eq('review_status', 'approved')
    .in('proposition_version_id', versionIds);
  if (matrixError) throw matrixError;
  const eventById = new Map(events.map((row) => [row.id, row]));
  const facts: VoteCategoryFact[] = [];
  for (const matrix of (matrixRows ?? []) as Row[]) {
    if (matrix.review_status !== 'approved') continue;
    const groups = Array.isArray(matrix.impact_assessments) ? matrix.impact_assessments : [];
    const matrixEvents = events.filter((event) => event.proposition_version_id === matrix.proposition_version_id);
    for (const group of groups) {
      if (!group.group_slug) continue;
      for (const index of indexes) {
        const event = eventById.get(index.voting_event_id);
        if (!event || !matrixEvents.some((candidateEvent) => candidateEvent.id === event.id)) continue;
        facts.push({ candidate_id: index.candidate_id, house: event.house, voting_event_id: event.id, group_slug: group.group_slug, value: index.value, review_status: 'approved' });
      }
    }
  }
  return buildVoteCategoryComparisons(facts, candidateIds);
}
