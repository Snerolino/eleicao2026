import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type {
  Candidate,
  CandidateWithClaims,
  Claim,
  ClaimStatus,
  SourceReference,
} from "@/types/election";
import { onlyPublished } from "@/utils/claims";
import { normalizePosition } from "@/utils/position";
import { normalizeSourceCategory } from "@/utils/sourceCategory";
import { PUBLIC_CANDIDATES } from "./publicCandidates";

interface CandidateRow {
  id: string;
  full_name: string;
  party: string;
  ballot_number: string | number | null;
  position: string;
  photo_url: string | null;
  photo_source_url: string | null;
}

interface DocumentRow {
  id?: string | null;
  source_name?: string | null;
  source_category?: string | null;
  url?: string | null;
  fetched_at?: string | null;
}

interface ClaimRow {
  id: string;
  candidate_id: string;
  category: string;
  content: string;
  confidence_score: number | null;
  status: string;
  source_document_id: string | null;
  source_references?: DocumentRow | DocumentRow[] | null;
}

let lastClaimsFetchDegraded = false;

export function wasLastClaimsFetchDegraded(): boolean {
  return lastClaimsFetchDegraded;
}

function clampConfidence(score: number | null): 1 | 2 | 3 | 4 | 5 {
  return Math.min(5, Math.max(1, Math.round(score ?? 1))) as 1 | 2 | 3 | 4 | 5;
}

function mapCandidate(row: CandidateRow): Candidate {
  const normalized = normalizePosition(row.position);

  return {
    id: row.id,
    full_name: row.full_name,
    party: row.party,
    ballot_number: row.ballot_number,
    position: normalized.position,
    position_label: normalized.label,
    photo_url: row.photo_url,
    photo_source_url: row.photo_source_url,
  };
}

function firstDocument(
  value: DocumentRow | DocumentRow[] | null | undefined,
): DocumentRow | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function mapClaim(row: ClaimRow): Claim {
  const source = firstDocument(row.source_references);
  const document: SourceReference | null = source
    ? {
        id: source.id ?? row.source_document_id,
        source_name: source.source_name ?? "Fonte não identificada",
        source_category: normalizeSourceCategory(source.source_category),
        url: source.url ?? null,
        fetched_at: source.fetched_at ?? null,
      }
    : null;

  return {
    id: row.id,
    candidate_id: row.candidate_id,
    category: row.category,
    content: row.content,
    confidence_score: clampConfidence(row.confidence_score),
    status: row.status as ClaimStatus,
    source_document_id: row.source_document_id,
    source_document: document,
  };
}

async function fetchPublishedClaims(candidateIds: string[]): Promise<Claim[]> {
  if (!supabase || candidateIds.length === 0) return [];

  const { data, error } = await supabase
    .from("claims")
    .select(
      `
      id,
      candidate_id,
      category,
      content,
      confidence_score,
      status,
      source_document_id,
      source_references (
        id,
        source_name,
        source_category,
        url,
        fetched_at
      )
    `,
    )
    .in("candidate_id", candidateIds)
    .eq("status", "published");

  if (error) throw error;

  return onlyPublished(((data ?? []) as unknown as ClaimRow[]).map(mapClaim));
}

async function fetchAllCandidatesFromSupabase(): Promise<
  CandidateWithClaims[]
> {
  if (!supabase) throw new Error("Supabase não configurado.");

  const { data, error } = await supabase
    .from("candidates")
    .select(
      "id, full_name, party, ballot_number, position, photo_url, photo_source_url",
    )
    .order("full_name", { ascending: true });

  if (error) throw error;

  const candidates = ((data ?? []) as CandidateRow[]).map(mapCandidate);
  let claims: Claim[] = [];
  lastClaimsFetchDegraded = false;

  try {
    claims = await fetchPublishedClaims(
      candidates.map((candidate) => candidate.id),
    );
  } catch (claimError) {
    lastClaimsFetchDegraded = true;
    console.warn(
      "Informações editoriais temporariamente indisponíveis.",
      claimError,
    );
  }

  const claimsByCandidate = new Map<string, Claim[]>();

  for (const claim of claims) {
    const current = claimsByCandidate.get(claim.candidate_id) ?? [];
    current.push(claim);
    claimsByCandidate.set(claim.candidate_id, current);
  }

  return candidates.map((candidate) => ({
    ...candidate,
    claims: claimsByCandidate.get(candidate.id) ?? [],
  }));
}

async function fetchCandidateFromSupabase(
  id: string,
): Promise<CandidateWithClaims | null> {
  if (!supabase) throw new Error("Supabase não configurado.");

  const { data, error } = await supabase
    .from("candidates")
    .select(
      "id, full_name, party, ballot_number, position, photo_url, photo_source_url",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const candidate = mapCandidate(data as CandidateRow);
  const claims = await fetchPublishedClaims([candidate.id]);

  return {
    ...candidate,
    claims,
  };
}

export async function fetchAllCandidates(): Promise<CandidateWithClaims[]> {
  if (!isSupabaseConfigured) {
    return fetchAllFromMock();
  }

  try {
    const supabaseData = await fetchAllCandidatesFromSupabase();
    if (supabaseData.length > 0) {
      return supabaseData;
    }
  } catch {
    // Supabase unavailable — fall through to mock
  }

  return fetchAllFromMock();
}

function fetchAllFromMock(): CandidateWithClaims[] {
  return PUBLIC_CANDIDATES.map((candidate) => ({
    ...candidate,
    claims: onlyPublished(candidate.claims),
  }));
}

export async function fetchCandidateById(
  id: string,
): Promise<CandidateWithClaims | null> {
  if (!isSupabaseConfigured) {
    return findInMock(id);
  }

  try {
    const candidate = await fetchCandidateFromSupabase(id);
    if (candidate) return candidate;
  } catch {
    // Supabase unavailable — fall through to mock
  }

  return findInMock(id);
}

const mockCandidatesMap = new Map<string, (typeof PUBLIC_CANDIDATES)[number]>(
  PUBLIC_CANDIDATES.map((c) => [c.id, c]),
);

function findInMock(id: string): CandidateWithClaims | null {
  const candidate = mockCandidatesMap.get(id);
  return candidate
    ? {
        ...candidate,
        claims: onlyPublished(candidate.claims),
      }
    : null;
}
