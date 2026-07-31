import publicCandidates from '../../data/public-candidates.json';
import sourceManifest from '../../data/tse-source-manifest.json';
import type { CandidateWithClaims } from '@/types/election';
import { onlyPublished } from '@/utils/claims';

export interface PublicCandidatesSnapshotMetadata {
  createdAt: string | null;
  scope: string | null;
}

export const PUBLIC_CANDIDATES: CandidateWithClaims[] = (
  publicCandidates as CandidateWithClaims[]
).map((candidate) => ({
  ...candidate,
  claims: onlyPublished(candidate.claims ?? []),
}));

const [manifestEntry] = sourceManifest as Array<{
  created_at?: string;
  scope?: string;
}>;

export const PUBLIC_CANDIDATES_SNAPSHOT: PublicCandidatesSnapshotMetadata = {
  createdAt: manifestEntry?.created_at ?? null,
  scope: manifestEntry?.scope ?? null,
};
