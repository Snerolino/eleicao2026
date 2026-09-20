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

function factKey(
  fact: Pick<VoteCategoryFact, "candidate_id" | "house" | "group_slug" | "voting_event_id">
): string {
  return `${fact.candidate_id}|${fact.house}|${fact.group_slug}|${fact.voting_event_id}`;
}

function chunk<T>(items: T[], size = 100): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
}

async function fetchApprovedEventAttributions(
  client: any,
  eventIds: string[],
  assessmentIds: string[]
): Promise<Row[]> {
  if (eventIds.length === 0 || assessmentIds.length === 0) return [];
  const eventChunks = chunk(eventIds);
  const assessmentChunks = chunk(assessmentIds);
  const rows: Row[] = [];

  for (const eventBatch of eventChunks) {
    for (const assessmentBatch of assessmentChunks) {
      const { data, error } = await client
        .from("impact_event_attributions")
        .select(
          "id,voting_event_id,assessment_id,event_defending_vote,score_eligible,vote_attribution_status,score_withholding_reason,confidence,review_status,methodology_version,impact_event_attribution_sources(source_reference_id,source_kind)"
        )
        .in("voting_event_id", eventBatch)
        .in("assessment_id", assessmentBatch)
        .eq("methodology_version", "2.0.0")
        .in("review_status", ["approved", "contested"]);
      if (error) throw error;
      rows.push(...(data ?? []));
    }
  }

  return rows;
}

function attributionKey(votingEventId: string, assessmentId: string): string {
  return `${votingEventId}|${assessmentId}`;
}

function isApprovedScoreableAttribution(row: Row | undefined): boolean {
  return Boolean(
    row &&
      row.score_eligible === true &&
      (row.review_status === "approved" || row.review_status === "contested") &&
      (row.vote_attribution_status === "isolated" ||
        row.vote_attribution_status === "compound_separable") &&
      (row.event_defending_vote === "sim" || row.event_defending_vote === "nao") &&
      Array.isArray(row.impact_event_attribution_sources) &&
      row.impact_event_attribution_sources.length > 0
  );
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

  const queryIds = Array.from(new Set([...candidateIds, ...dbToPublicId.keys()]));
  return { queryIds, dbToPublicId };
}

export function buildApprovedVoteFacts(
  indexRows: readonly Row[],
  eventRows: readonly Row[],
  matrixRows: readonly Row[],
  attributionRows: readonly Row[] = [],
  dbToPublicId?: Map<string, string>
): VoteCategoryFact[] {
  const eventById = new Map(eventRows.map((row) => [row.id, row]));
  const attributionByEventAssessment = new Map(
    attributionRows.map((row) => [
      attributionKey(row.voting_event_id, row.assessment_id),
      row,
    ])
  );
  const factsByKey = new Map<string, VoteCategoryFact>();
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
      if (
        typeof group.id !== "string" ||
        typeof group.group_slug !== "string" ||
        sources.length === 0
      ) continue;
      for (const index of indexRows) {
        const event = eventById.get(index.voting_event_id);
        if (!event || !matrixEvents.some((candidateEvent) => candidateEvent.id === event.id))
          continue;
        const attribution = attributionByEventAssessment.get(
          attributionKey(event.id, group.id)
        );
        if (!isApprovedScoreableAttribution(attribution)) continue;
        const publicCandId = dbToPublicId?.get(index.candidate_id) ?? index.candidate_id;
        const fact: VoteCategoryFact = {
          candidate_id: publicCandId,
          house: event.house,
          voting_event_id: event.id,
          group_slug: group.group_slug,
          value: index.value,
          review_status: "approved",
        };
        factsByKey.set(factKey(fact), fact);
      }
    }
  }
  return [...factsByKey.values()];
}

export function getLocalVoteCategoryScoreFacts(candidateIds: string[]): VoteCategoryScoreFact[] {
  const facts: VoteCategoryScoreFact[] = [];
  for (const cid of candidateIds) {
    const cand = PUBLIC_CANDIDATES.find(
      (c) => c.id === cid || c.slug === cid || c.tse_candidate_id === cid
    );
    const tseId = cand?.tse_candidate_id;
    if (!tseId) continue;
    const votes = getCandidateNominalVotes(tseId);
    for (const v of votes) {
      if (
        !v.assessment_group ||
        !v.impact_direction ||
        v.attribution_methodology_version !== "2.0.0" ||
        !v.voting_event_id
      ) continue;
      const defVote =
        v.defending_vote !== undefined
          ? v.defending_vote
          : v.impact_direction === "negative"
          ? "nao"
          : v.impact_direction === "positive"
          ? "sim"
          : null;
      facts.push({
        candidate_id: cand.id,
        house: v.house,
        voting_event_id: v.voting_event_id,
        proposition_version_id: v.proposition_id,
        group_slug: v.assessment_group,
        value: v.vote_value as VoteCategoryScoreFact["value"],
        impact_direction: v.impact_direction,
        defending_vote: defVote,
        textual_defending_vote: v.textual_defending_vote,
        event_defending_vote: v.event_defending_vote,
        score_eligible: v.score_eligible,
        vote_attribution_status: v.vote_attribution_status as any,
        score_withholding_reason: v.score_withholding_reason,
        attribution_review_status: v.attribution_review_status as any,
        attribution_methodology_version: v.attribution_methodology_version,
        severity: v.severity || 3,
        structural_type: (v.structural_type as any) || "structural",
        confidence: v.confidence || 0.95,
        review_status: "approved",
      });
    }
  }
  return facts;
}

export function getLocalVoteCategoryFacts(candidateIds: string[]): VoteCategoryFact[] {
  const facts: VoteCategoryFact[] = [];
  for (const cid of candidateIds) {
    const cand = PUBLIC_CANDIDATES.find(
      (c) => c.id === cid || c.slug === cid || c.tse_candidate_id === cid
    );
    const tseId = cand?.tse_candidate_id;
    if (!tseId) continue;
    const votes = getCandidateNominalVotes(tseId);
    for (const v of votes) {
      if (
        !v.assessment_group ||
        v.attribution_methodology_version !== "2.0.0" ||
        !v.voting_event_id ||
        v.score_eligible !== true ||
        !["isolated", "compound_separable"].includes(v.vote_attribution_status ?? "") ||
        !["sim", "nao"].includes(v.event_defending_vote ?? "")
      ) continue;
      facts.push({
        candidate_id: cand.id,
        house: v.house,
        voting_event_id: v.voting_event_id,
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
        "proposition_version_id,review_status,impact_assessments(id,group_slug,impact_assessment_sources(source_reference_id))"
      )
      .eq("review_status", "approved")
      .in("proposition_version_id", versionIds);
    if (matrixError) throw matrixError;
    const matrices = (matrixRows ?? []) as Row[];
    const assessmentIds = [
      ...new Set(
        matrices.flatMap((matrix) =>
          Array.isArray(matrix.impact_assessments)
            ? matrix.impact_assessments.map((group: Row) => group.id).filter(Boolean)
            : []
        )
      ),
    ] as string[];
    const attributions = await fetchApprovedEventAttributions(
      client,
      eventIds,
      assessmentIds
    );
    const dbFacts = buildApprovedVoteFacts(
      indexes,
      events,
      matrices,
      attributions,
      dbToPublicId
    );
    const dbComparisonKeys = new Set(dbFacts.map((f) => factKey(f)));
    const missingLocalComparisons = localFacts.filter(
      (f) => !dbComparisonKeys.has(factKey(f))
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

export function getLocalVoteCategoryScores(_candidateIds: string[]): VoteCategoryScore[] {
  // Legacy category_scores were produced before event-scoped attribution v2.
  // Keep the exported symbol temporarily for API compatibility, but fail closed.
  // They must never be used as a substitute for a missing/withheld v2 result.
  return [];
}

export async function fetchVoteCategoryScores(
  candidateIds: string[]
): Promise<VoteCategoryScore[]> {
  candidateIds = [...new Set(candidateIds.map((id) =>
    PUBLIC_CANDIDATES.find((candidate) => candidate.id === id || candidate.tse_candidate_id === id || candidate.slug === id)?.id ?? id
  ))];
  // A seleção dos demais candidatos não pode mudar o fallback deste candidato.
  if (candidateIds.length > 1) {
    return (await Promise.all(candidateIds.map((id) => fetchVoteCategoryScores([id])))).flat();
  }
  const localFacts = getLocalVoteCategoryScoreFacts(candidateIds);

  if (!supabase || candidateIds.length < 1) {
    // Methodology v2 is fail-closed: never resurrect legacy category_scores.
    return buildVoteCategoryScores(localFacts);
  }
  try {
    const client = supabase as any;
    const { queryIds, dbToPublicId } = await resolveDbCandidateMapping(client, candidateIds);

    const indexes = (
      await Promise.all(queryIds.map((cid) => fetchCandidateIndex(client, cid)))
    ).flat() as Row[];

    const eventIds = [...new Set(indexes.map((row) => row.voting_event_id).filter(Boolean))];
    if (eventIds.length === 0) {
      return buildVoteCategoryScores(localFacts);
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
      return buildVoteCategoryScores(localFacts);
    }
    const matrixBatches = await Promise.all(
      chunk(versionIds).map((batch) =>
        client
          .from("impact_matrices")
          .select(
            "proposition_version_id,review_status,severity,structural_type,impact_assessments(id,group_slug,impact_direction,defending_vote,textual_defending_vote,confidence,impact_assessment_sources(source_reference_id))"
          )
          .in("proposition_version_id", batch)
          .in("review_status", ["approved", "contested"])
      )
    );
    const matrixError = matrixBatches.find((result) => result.error)?.error;
    if (matrixError) throw matrixError;
    const matrices = matrixBatches.flatMap((result) => result.data ?? []) as Row[];
    const assessmentIds = [
      ...new Set(
        matrices.flatMap((matrix) =>
          Array.isArray(matrix.impact_assessments)
            ? matrix.impact_assessments.map((group: Row) => group.id).filter(Boolean)
            : []
        )
      ),
    ] as string[];
    const attributions = await fetchApprovedEventAttributions(
      client,
      eventIds,
      assessmentIds
    );
    const attributionByEventAssessment = new Map(
      attributions.map((row) => [
        attributionKey(row.voting_event_id, row.assessment_id),
        row,
      ])
    );
    const eventById = new Map(events.map((row) => [row.id, row]));
    const dbFacts: VoteCategoryScoreFact[] = [];
    for (const matrix of matrices) {
      const groups = Array.isArray(matrix.impact_assessments) ? matrix.impact_assessments : [];
      for (const group of groups) {
        if (
          typeof group.id !== "string" ||
          typeof group.group_slug !== "string" ||
          !Array.isArray(group.impact_assessment_sources) ||
          group.impact_assessment_sources.length === 0
        )
          continue;
        for (const index of indexes) {
          const event = eventById.get(index.voting_event_id);
          if (!event || event.proposition_version_id !== matrix.proposition_version_id) continue;
          const publicCandId = dbToPublicId.get(index.candidate_id) ?? index.candidate_id;
          const attribution = attributionByEventAssessment.get(
            attributionKey(event.id, group.id)
          );
          const hasAttributionSources =
            Array.isArray(attribution?.impact_event_attribution_sources) &&
            attribution.impact_event_attribution_sources.length > 0;
          dbFacts.push({
            candidate_id: publicCandId,
            house: event.house,
            voting_event_id: event.id,
            proposition_version_id: event.proposition_version_id,
            assessment_id: group.id,
            group_slug: group.group_slug,
            value: index.value,
            impact_direction: group.impact_direction,
            defending_vote: group.defending_vote ?? null,
            textual_defending_vote:
              group.textual_defending_vote ?? group.defending_vote ?? null,
            event_defending_vote:
              hasAttributionSources ? attribution?.event_defending_vote ?? null : null,
            score_eligible:
              hasAttributionSources && attribution?.score_eligible === true,
            vote_attribution_status:
              hasAttributionSources
                ? attribution?.vote_attribution_status
                : "event_binding_missing",
            score_withholding_reason:
              hasAttributionSources
                ? attribution?.score_withholding_reason ?? null
                : "Atribuição v2 aprovada e fontes do evento não localizadas.",
            attribution_review_status:
              hasAttributionSources
                ? attribution?.review_status
                : "pending_review",
            attribution_methodology_version:
              hasAttributionSources
                ? attribution?.methodology_version
                : "2.0.0",
            severity: matrix.severity,
            structural_type: matrix.structural_type,
            confidence: group.confidence,
            review_status: matrix.review_status,
          });
        }
      }
    }

    const dbCategoryKeys = new Set(
      dbFacts.map(
        (fact) => `${fact.candidate_id}|${fact.house}|${fact.group_slug}`
      )
    );
    const localComplement = localFacts.filter(
      (fact) =>
        !dbCategoryKeys.has(
          `${fact.candidate_id}|${fact.house}|${fact.group_slug}`
        )
    );

    // Keep null/withheld results. A null remote v2 result is authoritative and
    // must never be replaced by a legacy snapshot with a numeric score.
    return buildVoteCategoryScores([...dbFacts, ...localComplement]);
  } catch (error) {
    console.warn(
      "[voteCategoryComparison] Erro ao consultar Supabase; metodologia v2 falha fechada:",
      error
    );
    return buildVoteCategoryScores(localFacts);
  }
}
