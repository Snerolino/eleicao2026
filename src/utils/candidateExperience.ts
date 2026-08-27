import type { CandidateWithClaims } from '@/types/election';

const MANDATE_KEYWORDS_REGEX = /\b(eleit[oa]|deputad[oa]|senador[a]?|governador[a]?|prefeit[oa]|vereador[a]?|mandato|reeleit[oa]|ex-deputad|ex-prefeit|ex-vereador|titular eleito|suplente em exercício)\b/i;

export type CandidateExperienceFilter = '' | 'mandato_anterior' | 'estreante';

/**
 * Identifica se o candidato já foi eleito anteriormente ou exerceu cargo eletivo / mandato parlamentar.
 */
export function hasPreviousMandate(candidate: CandidateWithClaims): boolean {
  // 1. Possui votos nominais em qualquer casa legislativa oficial
  if ((candidate.voting_profiles ?? []).some((profile) => profile.total_votes > 0)) {
    return true;
  }

  // 2. Possui claims de histórico político confirmando cargo eletivo / eleição prévia
  const claims = candidate.claims ?? [];
  return claims.some(
    (claim) =>
      (claim.category === 'historico_politico' || claim.category === 'historico') &&
      MANDATE_KEYWORDS_REGEX.test(claim.content)
  );
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
