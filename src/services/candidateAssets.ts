import type { CandidateDeclaredAssets } from '@/types/election';
import rawAssets from '../../data/candidate-declared-assets.json';

const candidateAssetsMap = rawAssets as Record<string, CandidateDeclaredAssets>;

export function getCandidateDeclaredAssets(
  tseCandidateId?: string | null
): CandidateDeclaredAssets | null {
  if (!tseCandidateId) return null;
  return candidateAssetsMap[tseCandidateId] ?? null;
}

export async function fetchCandidateDeclaredAssets(
  tseCandidateId?: string | null
): Promise<CandidateDeclaredAssets | null> {
  return getCandidateDeclaredAssets(tseCandidateId);
}
