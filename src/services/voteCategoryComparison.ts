import { supabase } from "@/lib/supabase";
import {
  buildVoteCategoryComparisons,
  type VoteCategoryComparison,
  type VoteCategoryFact,
} from "@/domain/impact/vote-category-comparison";
import {
  buildVoteCategoryScores,
  type VoteCategoryScore,
  type VoteCategoryScoreFact,
} from "@/domain/impact/vote-category-score";
import { PUBLIC_CANDIDATES } from "./publicCandidates";
import { getCandidateNominalVotes } from "./candidateVotes";

type Row = Record<string, any>;

function chunk<T>(items: T[], size = 100): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
}

async function fetchCandidateIndex(client: any, candidateId: string): Promise<Row[]> {
  const first = await client
    .from("legislator_vote_index")
    .select("candidate_id,voting_event_id,value", { count: "exact" })
    .eq("candidate_id", candidateId)
    .range(0, 999);
  if (first.error) throw first.error;
  const total = Number(first.count ?? first.data?.length ?? 0);
  if (total <= 1000) return first.data ?? [];
  const pages = await Promise.all(
    Array.from({ length: Math.ceil(total / 1000) - 1 }, (_, index) =>
      client
        .from("legislator_vote_index")
        .select("candidate_id,voting_event_id,value")
        .eq("candidate_id", candidateId)
        .range((index + 1) * 1000, (index + 2) * 1000 - 1)
    )
  );
  const error = pages.find((result) => result.error)?.error;
  if (error) throw error;
  return [...(first.data ?? []), ...pages.flatMap((result) => result.data ?? [])];
}

async function resolveDbCandidateMapping(
  client: any,
  candidateIds: string[]
): Promise<{
  queryIds: string[];
  dbToPublicId: Map<string, string>;
}> {
  const dbToPublicId = new Map<string, string>();
  for (const id of candidateIds) {
    dbToPublicId.set(id, id);
  }

  const tseIds = candidateIds
    .map((id) => PUBLIC_CANDIDATES.find((c) => c.id === id)?.tse_candidate_id)
    .filter((tse): tse is string => typeof tse === "string" && tse.length > 0);

  if (tseIds.length > 0) {
    try {
      const { data: dbCands } = await client
        .from("candidates")
        .select("id, tse_candidate_id")
        .in("tse_candidate_id", tseIds);

      if (Array.isArray(dbCands)) {
        for (const dbCand of dbCands) {
          const publicCand = PUBLIC_CANDIDATES.find(
            (c) => c.tse_candidate_id === dbCand.tse_candidate_id
          );
          if (publicCand && dbCand.id !== publicCand.id) {
            dbToPublicId.set(dbCand.id, publicCand.id);
          }
        }
      }
    } catch {
      // Ignora erro de resolução DB
    }
  }

  const queryIds = Array.from(new Set(candidateIds));
  return { queryIds, dbToPublicId };
}

export function buildApprovedVoteFacts(
  indexRows: readonly Row[],
  eventRows: readonly Row[],
  matrixRows: readonly Row[],
  dbToPublicId?: Map<string, string>
): VoteCategoryFact[] {
  const eventById = new Map(eventRows.map((row) => [row.id, row]));
  const facts: VoteCategoryFact[] = [];
  for (const matrix of matrixRows) {
    if (matrix.review_status !== "approved") continue;
    const groups = Array.isArray(matrix.impact_assessments) ? matrix.impact_assessments : [];
    const matrixEvents = eventRows.filter(
      (event) => event.proposition_version_id === matrix.proposition_version_id
    );
    for (const group of groups) {
      const sources = Array.isArray(group.impact_assessment_sources)
        ? group.impact_assessment_sources
        : [];
      if (typeof group.group_slug !== "string" || sources.length === 0) continue;
      for (const index of indexRows) {
        const event = eventById.get(index.voting_event_id);
        if (!event || !matrixEvents.some((candidateEvent) => candidateEvent.id === event.id))
          continue;
        const publicCandId = dbToPublicId?.get(index.candidate_id) ?? index.candidate_id;
        facts.push({
          candidate_id: publicCandId,
          house: event.house,
          voting_event_id: event.id,
          group_slug: group.group_slug,
          value: index.value,
          review_status: "approved",
        });
      }
    }
  }
  return facts;
}

export function getLocalVoteCategoryScoreFacts(candidateIds: string[]): VoteCategoryScoreFact[] {
  const facts: VoteCategoryScoreFact[] = [];
  for (const cid of candidateIds) {
    const cand = PUBLIC_CANDIDATES.find((c) => c.id === cid || c.slug === cid);
    const tseId = cand?.tse_candidate_id;
    if (!tseId) continue;
    const votes = getCandidateNominalVotes(tseId);
    for (const v of votes) {
      if (!v.assessment_group) continue;
      const defVote = v.impact_direction === "negative" ? "nao" : "sim";
      facts.push({
        candidate_id: cand.id,
        house: v.house,
        group_slug: v.assessment_group,
        value: (v.vote_value as VoteCategoryScoreFact["value"]) || "sim",
        impact_direction: (v.impact_direction as any) || "positive",
        defending_vote: defVote,
        severity: 3,
        structural_type: "structural",
        confidence: 0.95,
        review_status: "approved",
      });
    }
  }
  return facts;
}

export function getLocalVoteCategoryFacts(candidateIds: string[]): VoteCategoryFact[] {
  const facts: VoteCategoryFact[] = [];
  for (const cid of candidateIds) {
    const cand = PUBLIC_CANDIDATES.find((c) => c.id === cid || c.slug === cid);
    const tseId = cand?.tse_candidate_id;
    if (!tseId) continue;
    const votes = getCandidateNominalVotes(tseId);
    for (let i = 0; i < votes.length; i++) {
      const v = votes[i];
      if (!v.assessment_group) continue;
      facts.push({
        candidate_id: cand.id,
        house: v.house,
        voting_event_id: `${v.house}-${v.proposition_id}-${i}`,
        group_slug: v.assessment_group,
        value: (v.vote_value as VoteCategoryFact["value"]) || "sim",
        review_status: "approved",
      });
    }
  }
  return facts;
}

export async function fetchVoteCategoryComparisons(
  candidateIds: string[]
): Promise<VoteCategoryComparison[]> {
  const localFacts = getLocalVoteCategoryFacts(candidateIds);
  if (!supabase || candidateIds.length < 2) {
    return buildVoteCategoryComparisons(localFacts, candidateIds);
  }
  try {
    const client = supabase as any;
    const { queryIds, dbToPublicId } = await resolveDbCandidateMapping(client, candidateIds);

    const indexes = (
      await Promise.all(queryIds.map((cid) => fetchCandidateIndex(client, cid)))
    ).flat() as Row[];

    const eventIds = [...new Set(indexes.map((row) => row.voting_event_id).filter(Boolean))];
    if (eventIds.length === 0) return buildVoteCategoryComparisons(localFacts, candidateIds);
    const { data: eventRows, error: eventError } = await client
      .from("voting_events")
      .select("id,house,proposition_version_id")
      .in("id", eventIds);
    if (eventError) throw eventError;
    const events = (eventRows ?? []) as Row[];
    const versionIds = [
      ...new Set(events.map((row) => row.proposition_version_id).filter(Boolean)),
    ];
    if (versionIds.length === 0) return buildVoteCategoryComparisons(localFacts, candidateIds);
    const { data: matrixRows, error: matrixError } = await client
      .from("impact_matrices")
      .select(
        "proposition_version_id,review_status,impact_assessments(group_slug,impact_assessment_sources(source_reference_id))"
      )
      .eq("review_status", "approved")
      .in("proposition_version_id", versionIds);
    if (matrixError) throw matrixError;
    const dbFacts = buildApprovedVoteFacts(
      indexes,
      events,
      (matrixRows ?? []) as Row[],
      dbToPublicId
    );
    const dbComparisonKeys = new Set(
      dbFacts.map((f) => `${f.candidate_id}|${f.group_slug}`)
    );
    const missingLocalComparisons = localFacts.filter(
      (f) => !dbComparisonKeys.has(`${f.candidate_id}|${f.group_slug}`)
    );
    const combinedFacts = [...dbFacts, ...missingLocalComparisons];
    return buildVoteCategoryComparisons(combinedFacts, candidateIds);
  } catch (error) {
    console.warn(
      "[voteCategoryComparison] Erro ao consultar Supabase para comparações, usando dados locais:",
      error
    );
    return buildVoteCategoryComparisons(localFacts, candidateIds);
  }
}

export function getLocalVoteCategoryScores(candidateIds: string[]): VoteCategoryScore[] {
  const localScores: VoteCategoryScore[] = [];
  for (const cid of candidateIds) {
    const cand = PUBLIC_CANDIDATES.find((c) => c.id === cid || c.slug === cid);
    if (!cand) continue;

    if (Array.isArray(cand.category_scores) && cand.category_scores.length > 0) {
      for (const cs of cand.category_scores) {
        localScores.push({
          candidate_id: cand.id,
          house: cand.position === "deputado_federal" ? "camara" : "alrs",
          group_slug: cs.group,
          score: cs.score,
          methodology_version: "1.0.0",
          evaluated_propositions: cs.evaluated_propositions_count,
          eligible_weight: cs.evaluated_propositions_count * 3,
          excluded_no_data: 0,
          contested_assessments: 0,
          average_confidence: 0.95,
        });
      }
    }
  }
  return localScores;
}

export async function fetchVoteCategoryScores(
  candidateIds: string[]
): Promise<VoteCategoryScore[]> {
  const fallbackScores = getLocalVoteCategoryScores(candidateIds);
  const localFacts = getLocalVoteCategoryScoreFacts(candidateIds);

  if (!supabase || candidateIds.length < 1) {
    const derived = buildVoteCategoryScores(localFacts);
    return derived.length > 0 ? derived : fallbackScores;
  }
  try {
    const client = supabase as any;
    const { queryIds, dbToPublicId } = await resolveDbCandidateMapping(client, candidateIds);

    const indexes = (
      await Promise.all(queryIds.map((cid) => fetchCandidateIndex(client, cid)))
    ).flat() as Row[];

    const eventIds = [...new Set(indexes.map((row) => row.voting_event_id).filter(Boolean))];
    if (eventIds.length === 0) {
      const derived = buildVoteCategoryScores(localFacts);
      return derived.length > 0 ? derived : fallbackScores;
    }
    const eventBatches = await Promise.all(
      chunk(eventIds).map((batch) =>
        client.from("voting_events").select("id,house,proposition_version_id").in("id", batch)
      )
    );
    const eventError = eventBatches.find((result) => result.error)?.error;
    if (eventError) throw eventError;
    const events = eventBatches.flatMap((result) => result.data ?? []) as Row[];
    const versionIds = [
      ...new Set(events.map((row) => row.proposition_version_id).filter(Boolean)),
    ];
    if (versionIds.length === 0) {
      const derived = buildVoteCategoryScores(localFacts);
      return derived.length > 0 ? derived : fallbackScores;
    }
    const matrixBatches = await Promise.all(
      chunk(versionIds).map((batch) =>
        client
          .from("impact_matrices")
          .select(
            "proposition_version_id,review_status,severity,structural_type,impact_assessments(group_slug,impact_direction,defending_vote,confidence,impact_assessment_sources(source_reference_id))"
          )
          .in("proposition_version_id", batch)
          .in("review_status", ["approved", "contested"])
      )
    );
    const matrixError = matrixBatches.find((result) => result.error)?.error;
    if (matrixError) throw matrixError;
    const eventById = new Map(events.map((row) => [row.id, row]));
    const dbFacts: VoteCategoryScoreFact[] = [];
    for (const matrix of matrixBatches.flatMap((result) => result.data ?? []) as Row[]) {
      const groups = Array.isArray(matrix.impact_assessments) ? matrix.impact_assessments : [];
      for (const group of groups) {
        if (
          typeof group.group_slug !== "string" ||
          !Array.isArray(group.impact_assessment_sources) ||
          group.impact_assessment_sources.length === 0
        )
          continue;
        for (const index of indexes) {
          const event = eventById.get(index.voting_event_id);
          if (!event || event.proposition_version_id !== matrix.proposition_version_id) continue;
          const publicCandId = dbToPublicId.get(index.candidate_id) ?? index.candidate_id;
          dbFacts.push({
            candidate_id: publicCandId,
            house: event.house,
            group_slug: group.group_slug,
            value: index.value,
            impact_direction: group.impact_direction,
            defending_vote: group.defending_vote ?? (group.impact_direction === "negative" ? "nao" : "sim"),
            severity: matrix.severity,
            structural_type: matrix.structural_type,
            confidence: group.confidence,
            review_status: matrix.review_status,
          });
        }
      }
    }

    const dbFactKeys = new Set(dbFacts.map((f) => `${f.candidate_id}|${f.group_slug}`));
    const missingLocalFacts = localFacts.filter(
      (f) => !dbFactKeys.has(`${f.candidate_id}|${f.group_slug}`)
    );
    const combinedFacts = [...dbFacts, ...missingLocalFacts];
    const computed = buildVoteCategoryScores(combinedFacts);

    // Complementar com fallback para qualquer par (candidate_id, group_slug) com score null ou ausente
    const validScoreKeys = new Set(
      computed
        .filter((s) => s.score !== null && typeof s.score === "number")
        .map((s) => `${s.candidate_id}|${s.group_slug}`)
    );
    const missingFallback = fallbackScores.filter(
      (s) => !validScoreKeys.has(`${s.candidate_id}|${s.group_slug}`)
    );

    const finalScores = [
      ...computed.filter((s) => s.score !== null && typeof s.score === "number"),
      ...missingFallback,
    ];

    return finalScores.length > 0 ? finalScores : fallbackScores;
  } catch (error) {
    console.warn(
      "[voteCategoryComparison] Erro ao consultar Supabase, usando dados canônicos locais:",
      error
    );
    const derived = buildVoteCategoryScores(localFacts);
    return derived.length > 0 ? derived : fallbackScores;
  }
}
