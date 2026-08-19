import { supabase } from '@/lib/supabase';
import { buildVoteCategoryComparisons, type VoteCategoryComparison, type VoteCategoryFact } from '@/domain/impact/vote-category-comparison';

type Row = Record<string, any>;

export function buildApprovedVoteFacts(
  indexRows: readonly Row[],
  eventRows: readonly Row[],
  matrixRows: readonly Row[],
): VoteCategoryFact[] {
  const eventById = new Map(eventRows.map((row) => [row.id, row]));
  const facts: VoteCategoryFact[] = [];
  for (const matrix of matrixRows) {
    if (matrix.review_status !== 'approved') continue;
    const groups = Array.isArray(matrix.impact_assessments) ? matrix.impact_assessments : [];
    const matrixEvents = eventRows.filter((event) => event.proposition_version_id === matrix.proposition_version_id);
    for (const group of groups) {
      const sources = Array.isArray(group.impact_assessment_sources) ? group.impact_assessment_sources : [];
      if (typeof group.group_slug !== 'string' || sources.length === 0) continue;
      for (const index of indexRows) {
        const event = eventById.get(index.voting_event_id);
        if (!event || !matrixEvents.some((candidateEvent) => candidateEvent.id === event.id)) continue;
        facts.push({ candidate_id: index.candidate_id, house: event.house, voting_event_id: event.id, group_slug: group.group_slug, value: index.value, review_status: 'approved' });
      }
    }
  }
  return facts;
}

export async function fetchVoteCategoryComparisons(candidateIds: string[]): Promise<VoteCategoryComparison[]> {
  if (!supabase || candidateIds.length < 2) return [];
  const client = supabase as any;
  const { data: indexRows, error: indexError } = await client.from('legislator_vote_index').select('candidate_id,voting_event_id,value').in('candidate_id', candidateIds);
  if (indexError) throw indexError;
  const indexes = (indexRows ?? []) as Row[];
  const eventIds = [...new Set(indexes.map((row) => row.voting_event_id).filter(Boolean))];
  if (eventIds.length === 0) return [];
  const { data: eventRows, error: eventError } = await client.from('voting_events').select('id,house,proposition_version_id').in('id', eventIds);
  if (eventError) throw eventError;
  const events = (eventRows ?? []) as Row[];
  const versionIds = [...new Set(events.map((row) => row.proposition_version_id).filter(Boolean))];
  if (versionIds.length === 0) return [];
  const { data: matrixRows, error: matrixError } = await client.from('impact_matrices').select('proposition_version_id,review_status,impact_assessments(group_slug,impact_assessment_sources(source_reference_id))').eq('review_status', 'approved').in('proposition_version_id', versionIds);
  if (matrixError) throw matrixError;
  return buildVoteCategoryComparisons(buildApprovedVoteFacts(indexes, events, (matrixRows ?? []) as Row[]), candidateIds);
}
