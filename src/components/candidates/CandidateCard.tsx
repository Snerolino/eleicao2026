import { Link } from 'react-router-dom';
import type { CandidateWithClaims } from '@/types/election';
import { SourceReferenceBadge } from '@/components/sources/SourceReferenceBadge';
import { CandidatePhoto } from './CandidatePhoto';

interface CandidateCardProps {
  candidate: CandidateWithClaims;
}

export function CandidateCard({
  candidate
}: CandidateCardProps) {
  const summary = candidate.claims.find(
    (claim) =>
      claim.category.toLowerCase() === 'summary' &&
      claim.status === 'published'
  );

  return (
    <article className="flex min-h-full flex-col overflow-hidden rounded-md border border-[var(--color-border-editorial)] bg-white">
      <div className="flex gap-4 p-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-sm bg-[var(--color-skeleton)]">
          <CandidatePhoto
            name={candidate.full_name}
            photoUrl={candidate.photo_url}
            className="h-full w-full object-cover"
          />

          {candidate.photo_source_url && (
            <a
              href={candidate.photo_source_url}
              target="_blank"
              rel="noreferrer noopener"
              className="absolute bottom-1 right-1 rounded-sm bg-[var(--color-ink)]/85 px-1.5 py-1 font-mono text-[0.6rem] text-white"
              aria-label={`Abrir fonte da foto de ${candidate.full_name}`}
            >
              fonte ↗
            </a>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-mono text-[0.68rem] uppercase tracking-wider text-[var(--color-muted-ink)]">
            {candidate.position_label}
          </p>
          <h3 className="mt-1 text-xl leading-tight">
            {candidate.full_name}
          </h3>
          <p className="mt-2 font-mono text-xs text-[var(--color-muted-ink)]">
            {candidate.party}
            {candidate.ballot_number != null
              ? ` · nº ${candidate.ballot_number}`
              : ''}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 border-t border-[var(--color-border-editorial)] px-4 py-4">
        {summary ? (
          <>
            <p className="text-sm leading-relaxed">
              {summary.content}
            </p>
            <SourceReferenceBadge
              document={summary.source_document}
              confidenceScore={summary.confidence_score}
            />
          </>
        ) : (
          <div className="flex min-h-20 items-center">
            <p className="font-mono text-xs uppercase tracking-wide text-[var(--color-muted-ink)]">
              Resumo ainda não verificado
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-[var(--color-border-editorial)] px-4 py-3">
        <Link
          to={`/candidatos/${encodeURIComponent(candidate.id)}`}
          className="inline-flex text-sm font-semibold text-[var(--color-institutional)] underline-offset-4 hover:underline"
          aria-label={`Ver dossiê completo de ${candidate.full_name}`}
        >
          Ver dossiê completo <span aria-hidden="true" className="ml-1">→</span>
        </Link>
      </div>
    </article>
  );
}
