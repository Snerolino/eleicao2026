import { memo, useCallback } from 'react';
import { Link } from 'react-router';
import type { CandidateWithClaims } from '@/types/election';
import { candidatePublicPath } from '@/utils/candidateIdentity';
import { candidateExperienceBadge } from '@/utils/candidateExperience';
import { CandidatePhoto } from './CandidatePhoto';
import { SavedCandidateButton } from './SavedCandidateButton';

interface CandidateCompactRowProps {
  candidate: CandidateWithClaims;
  saved: boolean;
  onToggleSaved: (id: string) => void;
}

export const CandidateCompactRow = memo(function CandidateCompactRow({ candidate, saved, onToggleSaved }: CandidateCompactRowProps) {
  const handleToggle = useCallback(() => onToggleSaved(candidate.tse_candidate_id ?? candidate.id), [candidate.id, candidate.tse_candidate_id, onToggleSaved]);
  const experience = candidateExperienceBadge(candidate);

  return (
    <article
      className="relative grid grid-cols-[auto_48px_minmax(0,1fr)_auto] items-center gap-3 border-b border-[var(--color-border-editorial)] px-2 py-2.5 transition-colors hover:bg-[color-mix(in_srgb,var(--color-institutional)_5%,var(--color-paper))] sm:grid-cols-[auto_48px_minmax(0,1fr)_8.5rem_7.5rem_4.5rem_auto]"
      data-experience-type={experience.type}
    >
      <SavedCandidateButton candidateName={candidate.full_name} saved={saved} onToggle={handleToggle} />
      <CandidatePhoto name={candidate.full_name} photoUrl={candidate.photo_url} className="h-12 w-12 rounded-sm object-cover" />
      <Link to={candidatePublicPath(candidate)} className="min-w-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-institutional)]">
        <div className="flex items-center gap-1.5">
          <strong className="block truncate font-[family-name:var(--font-display)] text-base text-[var(--color-ink)]">{candidate.full_name}</strong>
          {experience.type === 'mandato_anterior' ? (
            <span
              className="shrink-0 rounded-full border border-[color-mix(in_srgb,var(--color-institutional)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-institutional)_12%,var(--color-paper))] px-1.5 py-0.2 font-mono text-[0.58rem] font-semibold uppercase tracking-wider text-[var(--color-institutional)] sm:hidden"
              title={experience.tooltip}
            >
              Mandato
            </span>
          ) : null}
        </div>
        <span className="block truncate font-mono text-xs uppercase tracking-wider text-[var(--color-muted-ink)]">{candidate.party} · {candidate.ballot_number ?? 'número não informado'}</span>
      </Link>
      <span className="hidden truncate font-mono text-xs uppercase tracking-wider text-[var(--color-muted-ink)] sm:block">{candidate.position_label}</span>
      <span className="hidden truncate sm:block">
        {experience.type === 'mandato_anterior' ? (
          <span
            className="inline-flex items-center gap-1 rounded-full border border-[color-mix(in_srgb,var(--color-institutional)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-institutional)_10%,var(--color-paper))] px-2 py-0.5 font-mono text-[0.62rem] font-semibold uppercase tracking-wider text-[var(--color-institutional)]"
            title={experience.tooltip}
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" className="h-2.5 w-2.5 shrink-0">
              <path d="M8 1a1 1 0 0 1 .7.3l2.8 2.8H14a1 1 0 0 1 1 1v2.5l2.8 2.8a1 1 0 0 1 0 1.4L15 11.8V14a1 1 0 0 1-1 1h-2.5l-2.8 2.8a1 1 0 0 1-1.4 0L4.5 15H2a1 1 0 0 1-1-1v-2.2L.2 10.5a1 1 0 0 1 0-1.4L2 6.3V4a1 1 0 0 1 1-1h2.5L8.3 1.3A1 1 0 0 1 8 1zm0 4.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z" />
            </svg>
            Mandato anterior
          </span>
        ) : (
          <span
            className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border-editorial)] bg-[var(--color-paper)] px-2 py-0.5 font-mono text-[0.62rem] font-medium uppercase tracking-wider text-[var(--color-muted-ink)]"
            title={experience.tooltip}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-muted-ink)]/60" aria-hidden="true" />
            1ª candidatura
          </span>
        )}
      </span>
      <span className="hidden truncate font-mono text-xs text-[var(--color-muted-ink)] sm:block">{candidate.party}</span>
      <Link to={candidatePublicPath(candidate)} className="relative z-10 hidden font-mono text-xs uppercase tracking-wider text-[var(--color-institutional)] underline-offset-4 hover:underline sm:block" aria-label={`Ver perfil de ${candidate.full_name}`}>Ver perfil <span aria-hidden="true">→</span></Link>
    </article>
  );
});
