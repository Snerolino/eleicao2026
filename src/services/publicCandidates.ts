import publicCandidates from '../../data/public-candidates.json';
import sourceManifest from '../../data/tse-source-manifest.json';
import type { CandidateWithClaims } from '@/types/election';
import { onlyPublished } from '@/utils/claims';
import {
  applyPublicCandidateWithClaimsOverrides,
  isPublicCandidateVisible,
} from '@/utils/publicCandidateOverrides';

export interface PublicCandidatesSnapshotMetadata {
  createdAt: string | null;
  scope: string | null;
}

export const PUBLIC_CANDIDATES: CandidateWithClaims[] = (
  publicCandidates as CandidateWithClaims[]
)
  .filter(isPublicCandidateVisible)
  .map((candidate) => applyPublicCandidateWithClaimsOverrides({
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
