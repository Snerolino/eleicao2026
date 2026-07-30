import publicCandidates from '../../data/public-candidates.json';
import type { CandidateWithClaims } from '@/types/election';
import { onlyPublished } from '@/utils/claims';

export const PUBLIC_CANDIDATES: CandidateWithClaims[] = (
  publicCandidates as CandidateWithClaims[]
).map((candidate) => ({
  ...candidate,
  claims: onlyPublished(candidate.claims ?? []),
}));
