import type { CandidateWithClaims } from '@/types/election';

const MANDATE_KEYWORDS_REGEX = /\b(eleit[oa]|deputad[oa]|senador[a]?|governador[a]?|prefeit[oa]|vereador[a]?|mandato|reeleit[oa]|ex-deputad|ex-prefeit|ex-vereador|titular eleito|suplente em exercício)\b/i;

export type CandidateExperienceFilter = '' | 'mandato_anterior' | 'estreante';

/**
 * Cache to avoid redundant expensive regex evaluations across re-renders.
 */
const mandateCache = new WeakMap<CandidateWithClaims, boolean>();

/**
 * Identifica se o candidato já foi eleito anteriormente ou exerceu cargo eletivo / mandato parlamentar.
 * ⚡ Bolt Optimization: Uses WeakMap caching to avoid repeated O(N) regex evaluations during list filtering.
 */
export function hasPreviousMandate(candidate: CandidateWithClaims): boolean {
  if (mandateCache.has(candidate)) {
    return mandateCache.get(candidate)!;
  }

  // 1. Possui votos nominais em qualquer casa legislativa oficial
  if ((candidate.voting_profiles ?? []).some((profile) => profile.total_votes > 0)) {
    mandateCache.set(candidate, true);
    return true;
  }

  // 2. Possui claims de histórico político confirmando cargo eletivo / eleição prévia
  const claims = candidate.claims ?? [];
  const hasMandate = claims.some(
    (claim) =>
      (claim.category === 'historico_politico' || claim.category === 'historico') &&
      MANDATE_KEYWORDS_REGEX.test(claim.content)
  );

  mandateCache.set(candidate, hasMandate);
  return hasMandate;
}

export function candidateExperienceFilterType(candidate: CandidateWithClaims): 'mandato_anterior' | 'estreante' {
  return hasPreviousMandate(candidate) ? 'mandato_anterior' : 'estreante';
}

export function candidateExperienceBadge(candidate: CandidateWithClaims): {
  label: string;
  type: 'mandato_anterior' | 'estreante';
  tooltip: string;
} {
  if (hasPreviousMandate(candidate)) {
    return {
      label: 'Mandato anterior',
      type: 'mandato_anterior',
      tooltip: 'Candidato(a) com histórico de cargo eletivo anterior ou votações legislativas registradas.',
    };
  }
  return {
    label: '1ª candidatura',
    type: 'estreante',
    tooltip: 'Candidato(a) concorrendo pela primeira vez ou sem mandato eletivo anterior registrado.',
  };
}
