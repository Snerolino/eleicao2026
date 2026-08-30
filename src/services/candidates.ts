import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type {
  Candidate,
  CandidateWithClaims,
  Claim,
  ClaimStatus,
  SourceReference,
  VotingProfile,
} from "@/types/election";
import { onlyPublished } from "@/utils/claims";
import { candidateSlugFromTse } from "@/utils/candidateIdentity";
import { normalizePosition } from "@/utils/position";
import {
  applyPublicCandidateOverrides,
  applyPublicCandidateWithClaimsOverrides,
  isPublicCandidateVisible,
} from "@/utils/publicCandidateOverrides";
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
  gender?: string | null;
  race?: string | null;
  indigenous_ethnicity?: string | null;
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
  source_text?: string | null;
  source_url?: string | null;
  published_at?: string | null;
}

type VotingProfileRow = Omit<VotingProfile, 'nominal_balance'> & { profile_score: number };
type VotingProfileBatchRow = VotingProfileRow & { candidate_id: string };

let lastClaimsFetchDegraded = false;
let lastCandidatesFetchFromSnapshot = false;
let lastCandidatesFetchDiagnostic: string | null = null;

export function wasLastClaimsFetchDegraded(): boolean {
  return lastClaimsFetchDegraded;
}

export function wasLastCandidatesFetchFromSnapshot(): boolean {
  return lastCandidatesFetchFromSnapshot;
}

export function getLastCandidatesFetchDiagnostic(): string | null {
  return lastCandidatesFetchDiagnostic;
}

function technicalErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return "erro desconhecido";
}

function clampConfidence(score: number | null): 1 | 2 | 3 | 4 | 5 {
  return Math.min(5, Math.max(1, Math.round(score ?? 1))) as 1 | 2 | 3 | 4 | 5;
}

export function mapCandidate(row: CandidateRow): Candidate {
  const normalized = normalizePosition(row.position);
  const publicCandidate = row.tse_candidate_id
    ? PUBLIC_CANDIDATES.find((candidate) => candidate.tse_candidate_id === row.tse_candidate_id)
    : undefined;

  return applyPublicCandidateOverrides({
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
    gender: row.gender ?? publicCandidate?.gender ?? null,
    race: row.race ?? publicCandidate?.race ?? null,
    indigenous_ethnicity: row.indigenous_ethnicity ?? publicCandidate?.indigenous_ethnicity ?? null,
  });
}

const CANDIDATE_SELECT =
  "id, slug, full_name, party, ballot_number, position, photo_url, photo_source_url, tse_candidate_id, ballot_name, state, election_year, registration_status";
const OFFICIAL_STALE_DB_MIN_COUNT = 69;
const PUBLIC_CANDIDATES_WITH_PHOTOS = PUBLIC_CANDIDATES.filter(
  (candidate) => candidate.photo_url,
).length;

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

  const syntheticDocument: SourceReference | null =
    document ??
    (row.source_text || row.source_url
      ? {
          id: null,
          source_name: row.source_text?.trim() || 'Fonte oficial',
          source_category: 'oficial',
          url: row.source_url ?? null,
          fetched_at: row.published_at ?? null,
        }
      : null);

  return {
    id: row.id,
    candidate_id: row.candidate_id,
    category: row.category,
    content: row.content,
    confidence_score: clampConfidence(row.confidence_score),
    status: row.status as ClaimStatus,
    source_document_id: row.source_document_id,
    source_document: syntheticDocument,
    source_text: row.source_text ?? null,
    source_url: row.source_url ?? null,
    published_at: row.published_at ?? null,
  };
}

const CLAIM_ID_CHUNK_SIZE = 100;

function chunkBy<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export async function fetchPublishedClaims(candidateIds: string[]): Promise<Claim[]> {
  if (!supabase || candidateIds.length === 0) return [];

  // Separa em lotes para nao estourar o limite de tamanho de URL do gateway
  // REST do Supabase quando ha muitos candidatos (`.in()` com centenas de UUIDs).
  const chunks = chunkBy(candidateIds, CLAIM_ID_CHUNK_SIZE);
  const allClaims: Claim[] = [];

  for (const chunk of chunks) {
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
      source_text,
      source_url,
      published_at,
      source_references (
        id,
        source_name,
        source_category,
        url,
        fetched_at
      )
    `,
      )
      .in("candidate_id", chunk)
      .in("status", ["published", "corrected"]);

    if (error) throw error;

    allClaims.push(
      ...((data ?? []) as unknown as ClaimRow[]).map(mapClaim),
    );
  }

  return onlyPublished(allClaims);
}

export async function fetchVotingProfiles(candidateId: string): Promise<VotingProfile[]> {
  if (!supabase) return [];
  const profileClient = supabase as unknown as {
    from: (table: string) => {
      select: (columns: string) => {
        eq: (column: string, value: string) => Promise<{ data: VotingProfileRow[] | null; error: unknown }>;
      };
    };
  };
  const { data, error } = await profileClient
    .from('legislator_vote_profile')
    .select('house,total_votes,votos_sim,votos_nao,votos_abstencao,votos_ausente,votos_obstrucao,profile_score')
    .eq('candidate_id', candidateId);
  return error ? [] : (data ?? []).map((profile) => ({
    ...profile,
    nominal_balance: profile.profile_score,
  }));
}

async function fetchVotingProfilesForCandidates(
  candidateIds: string[],
): Promise<Map<string, VotingProfile[]>> {
  const profilesByCandidate = new Map<string, VotingProfile[]>();
  if (!supabase || candidateIds.length === 0) return profilesByCandidate;

  const profileClient = supabase as unknown as {
    from: (table: string) => {
      select: (columns: string) => {
        in: (column: string, values: string[]) => Promise<{
          data: VotingProfileBatchRow[] | null;
          error: unknown;
        }>;
      };
    };
  };

  const chunks = chunkBy(candidateIds, CLAIM_ID_CHUNK_SIZE);
  const responses = await Promise.all(chunks.map((chunk) => profileClient
    .from('legislator_vote_profile')
    .select('candidate_id,house,total_votes,votos_sim,votos_nao,votos_abstencao,votos_ausente,votos_obstrucao,profile_score')
    .in('candidate_id', chunk)));

  for (const { data, error } of responses) {
    if (error) throw error;
    for (const profile of data ?? []) {
      const profiles = profilesByCandidate.get(profile.candidate_id) ?? [];
      const { candidate_id: _candidateId, profile_score, ...rest } = profile;
      profiles.push({ ...rest, nominal_balance: profile_score });
      profilesByCandidate.set(profile.candidate_id, profiles);
    }
  }
  return profilesByCandidate;
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

  const candidates = ((data ?? []) as CandidateRow[])
    .map(mapCandidate)
    .filter(isPublicCandidateVisible);
  let claims: Claim[] = [];
  lastClaimsFetchDegraded = false;

  try {
    claims = await fetchPublishedClaims(
      candidates.map((candidate) => candidate.id),
    );
  } catch (claimError) {
    lastClaimsFetchDegraded = true;
    if (import.meta.env.DEV) {
      console.warn(
        "Informações editoriais temporariamente indisponíveis.",
        claimError,
      );
    } else {
      console.warn("Informações editoriais temporariamente indisponíveis.");
    }
  }

  const claimsByCandidate = new Map<string, Claim[]>();

  for (const claim of claims) {
    const current = claimsByCandidate.get(claim.candidate_id) ?? [];
    current.push(claim);
    claimsByCandidate.set(claim.candidate_id, current);
  }

  const profilesByCandidate = await fetchVotingProfilesForCandidates(
    candidates.map((candidate) => candidate.id),
  );

  return candidates.map((candidate) => applyPublicCandidateWithClaimsOverrides({
    ...candidate,
    claims: claimsByCandidate.get(candidate.id) ?? [],
    voting_profiles: profilesByCandidate.get(candidate.id) ?? [],
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
  if (!isPublicCandidateVisible(candidate)) return null;
  const claims = await fetchPublishedClaims([candidate.id]);
  const voting_profiles = await fetchVotingProfiles(candidate.id);

  return applyPublicCandidateWithClaimsOverrides({
    ...candidate,
    claims,
    voting_profiles,
  });
}

export async function fetchAllCandidates(): Promise<CandidateWithClaims[]> {
  if (!isSupabaseConfigured) {
    lastCandidatesFetchFromSnapshot = true;
    return fetchAllFromMock();
  }

  try {
    const supabaseData = await fetchAllCandidatesFromSupabase();
    if (supabaseData.length > 0) {
      if (isSupabaseSnapshotStale(supabaseData.length)) {
        lastCandidatesFetchFromSnapshot = true;
        lastCandidatesFetchDiagnostic = `Snapshot oficial mais completo que Supabase (${PUBLIC_CANDIDATES.length}/${supabaseData.length}).`;
        console.warn(lastCandidatesFetchDiagnostic);
        return mergeSupabaseEditorialData(supabaseData);
      }
      if (!lastClaimsFetchDegraded && isSupabaseSnapshotRicherForPhotos(supabaseData)) {
        lastCandidatesFetchFromSnapshot = true;
        lastCandidatesFetchDiagnostic = `Snapshot oficial tem fotos TSE mais completo que Supabase (${PUBLIC_CANDIDATES_WITH_PHOTOS}/${supabaseData.filter((candidate) => candidate.photo_url).length}).`;
        console.warn(lastCandidatesFetchDiagnostic);
        return mergeSupabaseEditorialData(supabaseData);
      }
      lastCandidatesFetchFromSnapshot = false;
      lastCandidatesFetchDiagnostic = null;
      return supabaseData;
    }
  } catch (candidateError) {
    lastCandidatesFetchDiagnostic = technicalErrorMessage(candidateError);
    // Supabase unavailable — fall through to mock
  }

  lastCandidatesFetchFromSnapshot = true;
  return fetchAllFromMock();
}

function fetchAllFromMock(): CandidateWithClaims[] {
  return PUBLIC_CANDIDATES.map((candidate) => applyPublicCandidateWithClaimsOverrides({
    ...candidate,
    claims: onlyPublished(candidate.claims),
  }));
}

function selectRicherVotingProfiles(
  snapshotProfiles?: VotingProfile[],
  remoteProfiles?: VotingProfile[],
): VotingProfile[] {
  const snapshotTotal = (snapshotProfiles ?? []).reduce((acc, p) => acc + p.total_votes, 0);
  const remoteTotal = (remoteProfiles ?? []).reduce((acc, p) => acc + p.total_votes, 0);
  if (snapshotTotal >= remoteTotal && snapshotTotal > 0) {
    return snapshotProfiles ?? [];
  }
  return remoteProfiles && remoteProfiles.length > 0 ? remoteProfiles : (snapshotProfiles ?? []);
}

function mergeSupabaseEditorialData(supabaseData: CandidateWithClaims[]): CandidateWithClaims[] {
  const byTse = new Map(
    supabaseData
      .filter((candidate) => candidate.tse_candidate_id)
      .map((candidate) => [candidate.tse_candidate_id as string, candidate]),
  );
  return PUBLIC_CANDIDATES.map((snapshotCandidate) => {
    const remoteCandidate = snapshotCandidate.tse_candidate_id
      ? byTse.get(snapshotCandidate.tse_candidate_id)
      : undefined;
    return applyPublicCandidateWithClaimsOverrides({
      ...snapshotCandidate,
      claims: remoteCandidate?.claims ?? onlyPublished(snapshotCandidate.claims),
      voting_profiles: selectRicherVotingProfiles(snapshotCandidate.voting_profiles, remoteCandidate?.voting_profiles),
    });
  });
}

function isSupabaseSnapshotStale(supabaseCount: number): boolean {
  return (
    supabaseCount >= OFFICIAL_STALE_DB_MIN_COUNT &&
    PUBLIC_CANDIDATES.length > supabaseCount
  );
}

function isSupabaseSnapshotRicherForPhotos(
  supabaseData: CandidateWithClaims[],
): boolean {
  if (supabaseData.length < OFFICIAL_STALE_DB_MIN_COUNT) return false;
  const supabasePhotos = supabaseData.filter((candidate) => candidate.photo_url).length;
  return PUBLIC_CANDIDATES_WITH_PHOTOS > supabasePhotos;
}

export async function fetchCandidateById(
  id: string,
): Promise<CandidateWithClaims | null> {
  if (!isSupabaseConfigured) {
    return findInMock(id);
  }

  try {
    const candidate = await fetchCandidateFromSupabase(id);
    if (candidate) {
      const snapshotCandidate = findInMock(id);
      return applyPublicCandidateWithClaimsOverrides({
        ...candidate,
        photo_url: candidate.photo_url || snapshotCandidate?.photo_url || null,
        photo_source_url: candidate.photo_source_url || snapshotCandidate?.photo_source_url || null,
        voting_profiles: selectRicherVotingProfiles(snapshotCandidate?.voting_profiles, candidate.voting_profiles),
        category_scores: snapshotCandidate?.category_scores ?? candidate.category_scores ?? [],
      });
    }
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
