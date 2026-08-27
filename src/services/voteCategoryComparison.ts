import { supabase } from '@/lib/supabase';
import { buildVoteCategoryComparisons, type VoteCategoryComparison, type VoteCategoryFact } from '@/domain/impact/vote-category-comparison';
import { buildVoteCategoryScores, type VoteCategoryScore, type VoteCategoryScoreFact } from '@/domain/impact/vote-category-score';
import { PUBLIC_CANDIDATES } from './publicCandidates';

type Row = Record<string, any>;

function chunk<T>(items: T[], size = 100): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) result.push(items.slice(index, index + size));
  return result;
}

async function resolveDbCandidateMapping(client: any, candidateIds: string[]): Promise<{
  queryIds: string[];
  dbToPublicId: Map<string, string>;
}> {
  const dbToPublicId = new Map<string, string>();
  for (const id of candidateIds) {
    dbToPublicId.set(id, id);
  }

  const tseIds = candidateIds
    .map((id) => PUBLIC_CANDIDATES.find((c) => c.id === id)?.tse_candidate_id)
    .filter((tse): tse is string => typeof tse === 'string' && tse.length > 0);

  if (tseIds.length > 0) {
    try {
      const { data: dbCands } = await client
        .from('candidates')
        .select('id, tse_candidate_id')
        .in('tse_candidate_id', tseIds);

      if (Array.isArray(dbCands)) {
        for (const db of dbCands) {
          const publicCand = PUBLIC_CANDIDATES.find(
            (c) => String(c.tse_candidate_id) === String(db.tse_candidate_id)
          );
          if (publicCand) {
            dbToPublicId.set(db.id, publicCand.id);
          }
        }
      }
    } catch {
      // Degradação graciosa
    }
  }

  const queryIds = [...new Set([...candidateIds, ...Array.from(dbToPublicId.keys())])];
  return { queryIds, dbToPublicId };
}

export function buildApprovedVoteFacts(
  indexRows: readonly Row[],
  eventRows: readonly Row[],
  matrixRows: readonly Row[],
  dbToPublicId?: Map<string, string>,
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
        const publicCandId = dbToPublicId?.get(index.candidate_id) ?? index.candidate_id;
        facts.push({ candidate_id: publicCandId, house: event.house, voting_event_id: event.id, group_slug: group.group_slug, value: index.value, review_status: 'approved' });
      }
    }
  }
  return facts;
}

export async function fetchVoteCategoryComparisons(candidateIds: string[]): Promise<VoteCategoryComparison[]> {
  if (!supabase || candidateIds.length < 2) return [];
  const client = supabase as any;
  const { queryIds, dbToPublicId } = await resolveDbCandidateMapping(client, candidateIds);

  const indexBatches = await Promise.all(
    queryIds.map((cid) =>
      client.from('legislator_vote_index').select('candidate_id,voting_event_id,value').eq('candidate_id', cid)
    )
  );
  const indexError = indexBatches.find((result) => result.error)?.error;
  if (indexError) throw indexError;
  const indexes = indexBatches.flatMap((result) => result.data ?? []) as Row[];

  const eventIds = [...new Set(indexes.map((row) => row.voting_event_id).filter(Boolean))];
  if (eventIds.length === 0) return [];
  const { data: eventRows, error: eventError } = await client.from('voting_events').select('id,house,proposition_version_id').in('id', eventIds);
  if (eventError) throw eventError;
  const events = (eventRows ?? []) as Row[];
  const versionIds = [...new Set(events.map((row) => row.proposition_version_id).filter(Boolean))];
  if (versionIds.length === 0) return [];
  const { data: matrixRows, error: matrixError } = await client.from('impact_matrices').select('proposition_version_id,review_status,impact_assessments(group_slug,impact_assessment_sources(source_reference_id))').eq('review_status', 'approved').in('proposition_version_id', versionIds);
  if (matrixError) throw matrixError;
  return buildVoteCategoryComparisons(buildApprovedVoteFacts(indexes, events, (matrixRows ?? []) as Row[], dbToPublicId), candidateIds);
}

export async function fetchVoteCategoryScores(candidateIds: string[]): Promise<VoteCategoryScore[]> {
  if (!supabase || candidateIds.length < 1) return [];
  const client = supabase as any;
  const { queryIds, dbToPublicId } = await resolveDbCandidateMapping(client, candidateIds);

  const indexBatches = await Promise.all(
    queryIds.map((cid) =>
      client.from('legislator_vote_index').select('candidate_id,voting_event_id,value').eq('candidate_id', cid)
    )
  );
  const indexError = indexBatches.find((result) => result.error)?.error;
  if (indexError) throw indexError;
  const indexes = indexBatches.flatMap((result) => result.data ?? []) as Row[];

  const eventIds = [...new Set(indexes.map((row) => row.voting_event_id).filter(Boolean))];
  if (eventIds.length === 0) return [];
  const eventBatches = await Promise.all(chunk(eventIds).map((batch) => client.from('voting_events').select('id,house,proposition_version_id').in('id', batch)));
  const eventError = eventBatches.find((result) => result.error)?.error;
  if (eventError) throw eventError;
  const events = eventBatches.flatMap((result) => result.data ?? []) as Row[];
  const versionIds = [...new Set(events.map((row) => row.proposition_version_id).filter(Boolean))];
  if (versionIds.length === 0) return [];
  const matrixBatches = await Promise.all(chunk(versionIds).map((batch) => client.from('impact_matrices').select('proposition_version_id,review_status,severity,structural_type,impact_assessments(group_slug,impact_direction,defending_vote,confidence,impact_assessment_sources(source_reference_id))').in('proposition_version_id', batch).in('review_status', ['approved', 'contested'])));
  const matrixError = matrixBatches.find((result) => result.error)?.error;
  if (matrixError) throw matrixError;
  const eventById = new Map(events.map((row) => [row.id, row]));
  const facts: VoteCategoryScoreFact[] = [];
  for (const matrix of matrixBatches.flatMap((result) => result.data ?? []) as Row[]) {
    const groups = Array.isArray(matrix.impact_assessments) ? matrix.impact_assessments : [];
    for (const group of groups) {
      if (typeof group.group_slug !== 'string' || !Array.isArray(group.impact_assessment_sources) || group.impact_assessment_sources.length === 0) continue;
      for (const index of indexes) {
        const event = eventById.get(index.voting_event_id);
        if (!event || event.proposition_version_id !== matrix.proposition_version_id) continue;
        const publicCandId = dbToPublicId.get(index.candidate_id) ?? index.candidate_id;
        facts.push({ candidate_id: publicCandId, house: event.house, group_slug: group.group_slug, value: index.value, impact_direction: group.impact_direction, defending_vote: group.defending_vote ?? null, severity: matrix.severity, structural_type: matrix.structural_type, confidence: group.confidence, review_status: matrix.review_status });
      }
    }
  }
  return buildVoteCategoryScores(facts);
}
