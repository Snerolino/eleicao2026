import type { ClaimStatus } from '@/types/election';

export function onlyPublished<T extends { status: ClaimStatus }>(
  claims: T[]
): T[] {
  return claims.filter((claim) =>
    claim.status === 'published' || claim.status === 'corrected'
  );
}
