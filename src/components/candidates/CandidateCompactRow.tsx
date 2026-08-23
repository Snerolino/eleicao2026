import { Link } from 'react-router';
import type { CandidateWithClaims } from '@/types/election';
import { candidatePublicPath } from '@/utils/candidateIdentity';
import { CandidatePhoto } from './CandidatePhoto';
import { SavedCandidateButton } from './SavedCandidateButton';

interface CandidateCompactRowProps {
  candidate: CandidateWithClaims;
  saved: boolean;
  onToggleSaved: () => void;
}

export function CandidateCompactRow({ candidate, saved, onToggleSaved }: CandidateCompactRowProps) {
  return (
    <article className="relative grid grid-cols-[auto_48px_minmax(0,1fr)_auto] items-center gap-3 border-b border-[var(--color-border-editorial)] px-2 py-2.5 transition-colors hover:bg-[color-mix(in_srgb,var(--color-institutional)_5%,var(--color-paper))] sm:grid-cols-[auto_48px_minmax(0,1fr)_10rem_7rem_5rem_auto]">
      <SavedCandidateButton candidateName={candidate.full_name} saved={saved} onToggle={onToggleSaved} />
      <CandidatePhoto name={candidate.full_name} photoUrl={candidate.photo_url} className="h-12 w-12 rounded-sm object-cover" />
      <Link to={candidatePublicPath(candidate)} className="min-w-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-institutional)]">
        <strong className="block truncate font-[family-name:var(--font-display)] text-base text-[var(--color-ink)]">{candidate.full_name}</strong>
        <span className="block truncate font-mono text-xs uppercase tracking-wider text-[var(--color-muted-ink)]">{candidate.party} · {candidate.ballot_number ?? 'número não informado'}</span>
      </Link>
      <span className="hidden truncate font-mono text-xs uppercase tracking-wider text-[var(--color-muted-ink)] sm:block">{candidate.position_label}</span>
      <span className="hidden truncate font-mono text-xs text-[var(--color-muted-ink)] sm:block">{candidate.ballot_number ?? '—'}</span>
      <span className="hidden truncate font-mono text-xs text-[var(--color-muted-ink)] sm:block">{candidate.party}</span>
      <Link to={candidatePublicPath(candidate)} className="relative z-10 hidden font-mono text-xs uppercase tracking-wider text-[var(--color-institutional)] underline-offset-4 hover:underline sm:block">Ver perfil →</Link>
    </article>
  );
}
