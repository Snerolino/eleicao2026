import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type {
  Candidate,
  CandidateWithClaims,
  Claim,
  ClaimStatus,
  SourceReference,
} from "@/types/election";
import { onlyPublished } from "@/utils/claims";
import { candidateSlugFromTse } from "@/utils/candidateIdentity";
import { normalizePosition } from "@/utils/position";
import { normalizeSourceCategory } from "@/utils/sourceCategory";
import { PUBLIC_CANDIDATES } from "./publicCandidates";

interface CandidateRow {
  id: string;
  slug?: string | null;
  full_name: string;
  party: string;
  ballot_number: string | number | null;
  position: string;
  photo_url: string | null;
  photo_source_url: string | null;
  tse_candidate_id?: string | null;
  ballot_name?: string | null;
  state?: string | null;
  election_year?: number | null;
  registration_status?: string | null;
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

export function mapCandidate(row: CandidateRow): Candidate {
  const normalized = normalizePosition(row.position);

  return {
    id: row.id,
    slug: candidateSlugFromTse(row.full_name, row.tse_candidate_id) ?? row.slug ?? null,
    full_name: row.full_name,
    party: row.party,
    ballot_number: row.ballot_number,
    position: normalized.position,
    position_label: normalized.label,
    photo_url: row.photo_url,
    photo_source_url: row.photo_source_url,
    tse_candidate_id: row.tse_candidate_id ?? null,
    ballot_name: row.ballot_name ?? null,
    state: row.state ?? null,
    election_year: row.election_year ?? undefined,
    registration_status: row.registration_status ?? null,
  };
}

const CANDIDATE_SELECT =
  "id, slug, full_name, party, ballot_number, position, photo_url, photo_source_url, tse_candidate_id, ballot_name, state, election_year, registration_status";

function toSafePublicId(value: string): string | null {
  const trimmed = value.trim();
  return /^[a-zA-Z0-9_-]+$/.test(trimmed) ? trimmed : null;
}

function candidateLookupFilter(publicId: string): string {
  const filters = [`slug.eq.${publicId}`];
  if (/^\d+$/.test(publicId)) filters.push(`tse_candidate_id.eq.${publicId}`);
  if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(publicId)) {
    filters.push(`id.eq.${publicId}`);
  }
  return filters.join(',');
}

function firstDocument(
  value: DocumentRow | DocumentRow[] | null | undefined,
): DocumentRow | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export function mapClaim(row: ClaimRow): Claim {
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

export async function fetchPublishedClaims(candidateIds: string[]): Promise<Claim[]> {
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
    .select(CANDIDATE_SELECT)
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
  publicId: string,
): Promise<CandidateWithClaims | null> {
  if (!supabase) throw new Error("Supabase não configurado.");

  const safePublicId = toSafePublicId(publicId);
  if (!safePublicId) return null;
  const { data, error } = await supabase
    .from("candidates")
    .select(CANDIDATE_SELECT)
    .or(candidateLookupFilter(safePublicId))
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
  PUBLIC_CANDIDATES.flatMap((candidate) =>
    [candidate.slug, candidate.id, candidate.tse_candidate_id]
      .filter((value): value is string => Boolean(value))
      .map((value) => [value, candidate] as const),
  ),
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
