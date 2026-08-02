import publicCandidateOverrides from '../../data/public-candidate-overrides.json';
import type { Candidate, CandidateWithClaims, Claim } from '@/types/election';

interface PositionOverride {
  position?: Candidate['position'];
  position_label?: string;
}

interface PublicCandidateOverrides {
  excluded_tse_candidate_ids?: string[];
  position_overrides?: Record<string, PositionOverride>;
}

const overrides = publicCandidateOverrides as PublicCandidateOverrides;
const excludedTseCandidateIds = new Set(overrides.excluded_tse_candidate_ids ?? []);
const positionOverrides = overrides.position_overrides ?? {};

export function isPublicCandidateVisible(candidate: Candidate): boolean {
  const tseCandidateId = candidate.tse_candidate_id;
  return !tseCandidateId || !excludedTseCandidateIds.has(tseCandidateId);
}

export function applyPublicCandidateOverrides<T extends Candidate>(candidate: T): T {
  const tseCandidateId = candidate.tse_candidate_id;
  if (!tseCandidateId) return candidate;

  const override = positionOverrides[tseCandidateId];
  if (!override) return candidate;

  return {
    ...candidate,
    position: override.position ?? candidate.position,
    position_label: override.position_label ?? candidate.position_label,
  };
}

function officialSummaryForViceGovernor(candidate: Candidate): string {
  const number = candidate.ballot_number != null ? `, número ${candidate.ballot_number}` : '';
  return `Candidato(a) a Vice-governador pelo ${candidate.party}${number}. Registro de candidatura protocolado na Justiça Eleitoral (fonte: TSE).`;
}

function applyClaimPresentationOverrides(candidate: Candidate, claim: Claim): Claim {
  if (
    candidate.position === 'vice_governador'
    && claim.category.toLowerCase() === 'summary'
    && /\bgovernador\b/i.test(claim.content)
    && !/vice-governador/i.test(claim.content)
  ) {
    return {
      ...claim,
      content: officialSummaryForViceGovernor(candidate),
    };
  }
  return claim;
}

export function applyPublicCandidateWithClaimsOverrides<T extends CandidateWithClaims>(candidate: T): T {
  const overridden = applyPublicCandidateOverrides(candidate);
  return {
    ...overridden,
    claims: overridden.claims.map((claim) => applyClaimPresentationOverrides(overridden, claim)),
  };
}
