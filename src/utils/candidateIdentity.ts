import type { Candidate } from '@/types/election';

function ascii(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'C');
}

export function candidateSlugFromTse(fullName: string, tseCandidateId: string | null | undefined): string | null {
  const suffix = String(tseCandidateId ?? '').replace(/\D/g, '');
  if (!suffix) return null;

  const base = ascii(fullName)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_{2,}/g, '_') || 'candidato';

  return `${base}_${suffix}`;
}

export function candidatePublicId(candidate: Pick<Candidate, 'slug' | 'id' | 'tse_candidate_id'>): string {
  return candidate.slug || candidate.tse_candidate_id || candidate.id;
}

export function candidatePublicPath(candidate: Pick<Candidate, 'slug' | 'id' | 'tse_candidate_id'>): string {
  return `/candidatos/${encodeURIComponent(candidatePublicId(candidate))}`;
}
