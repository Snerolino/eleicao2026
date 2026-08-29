import { memo } from 'react';
import { Link } from 'react-router';
import type { CandidateWithClaims } from '@/types/election';
import { SourceReferenceBadge } from '@/components/sources/SourceReferenceBadge';
import { CandidatePhoto } from './CandidatePhoto';
import { sanitizeUrl } from '@/utils/sanitizeUrl';
import { candidatePublicPath } from '@/utils/candidateIdentity';
import { candidateExperienceBadge } from '@/utils/candidateExperience';
import { SOURCE_CATEGORY_COLOR } from '@/utils/sourceCategory';

interface CandidateCardProps {
  candidate: CandidateWithClaims;
}

export const CandidateCard = memo(function CandidateCard({
  candidate
}: CandidateCardProps) {
  const published = candidate.claims.filter((claim) => claim.status === 'published');
  const SUMMARY_PRIORITY = [
    'summary',
    'plataforma',
    'historico_politico',
    'reputacao',
    'votacao_scrutiny',
  ];
  // ⚡ Bolt Optimization: Replaced declarative chained find/sort (O(N log N)) with an iterative O(N) loop to resolve the summary claim with highest priority.
  const summary = (() => {
    let bestScore = Infinity;
    let bestClaim = null;
    let fallbackClaim = null;
    for (const claim of published) {
      if (!fallbackClaim) fallbackClaim = claim;
      const cat = claim.category.toLowerCase();
      if (cat === 'summary') return claim;
      const score = SUMMARY_PRIORITY.indexOf(cat);
      if (score !== -1 && score < bestScore) {
        bestScore = score;
        bestClaim = claim;
      }
    }
    return bestClaim ?? fallbackClaim ?? null;
  })();

  const sourceDoc = summary?.source_document ?? null;
  const hasSource = Boolean(sourceDoc);
  const spineColor = SOURCE_CATEGORY_COLOR[sourceDoc?.source_category ?? 'outro'];
  const experience = candidateExperienceBadge(candidate);

  return (
    <article
      className="relative flex min-h-full flex-col overflow-hidden rounded-sm border border-l-4 border-[var(--color-border-editorial)] bg-card transition-colors hover:border-[var(--color-institutional)] focus-within:border-[var(--color-institutional)] focus-within:ring-2 focus-within:ring-[var(--color-institutional)] focus-within:ring-offset-2 focus-within:ring-offset-[var(--color-paper)]"
      style={{ borderLeftColor: spineColor }}
      data-source-category={sourceDoc?.source_category ?? 'outro'}
      data-experience-type={experience.type}
    >
      <div className="flex gap-4 p-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-sm bg-[var(--color-skeleton)]">
          <CandidatePhoto
            name={candidate.full_name}
            photoUrl={candidate.photo_url}
            className="h-full w-full object-cover"
          />

          {(() => {
            const safePhotoSourceUrl = sanitizeUrl(candidate.photo_source_url);
            return safePhotoSourceUrl ? (
              <a
                href={safePhotoSourceUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="absolute bottom-1 right-1 z-10 rounded-sm bg-[var(--color-ink)]/85 px-1.5 py-1 font-mono text-[0.6rem] text-white"
                aria-label={`Abrir fonte da foto de ${candidate.full_name}`}
              >
                fonte <span aria-hidden="true">↗</span>
              </a>
            ) : null;
          })()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="font-mono text-[0.68rem] uppercase tracking-wider text-[var(--color-muted-ink)]">
              {candidate.party} &middot; {candidate.position_label}
            </p>
            {experience.type === 'mandato_anterior' ? (
              <span
                className="inline-flex items-center gap-1 rounded-full border border-[color-mix(in_srgb,var(--color-institutional)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-institutional)_10%,var(--color-paper))] px-2 py-0.5 font-mono text-[0.6rem] font-semibold uppercase tracking-wider text-[var(--color-institutional)]"
                title={experience.tooltip}
              >
                <svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" className="h-2.5 w-2.5 shrink-0">
                  <path d="M8 1a1 1 0 0 1 .7.3l2.8 2.8H14a1 1 0 0 1 1 1v2.5l2.8 2.8a1 1 0 0 1 0 1.4L15 11.8V14a1 1 0 0 1-1 1h-2.5l-2.8 2.8a1 1 0 0 1-1.4 0L4.5 15H2a1 1 0 0 1-1-1v-2.2L.2 10.5a1 1 0 0 1 0-1.4L2 6.3V4a1 1 0 0 1 1-1h2.5L8.3 1.3A1 1 0 0 1 8 1zm0 4.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z" />
                </svg>
                {experience.label}
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border-editorial)] bg-[var(--color-paper)] px-2 py-0.5 font-mono text-[0.6rem] font-medium uppercase tracking-wider text-[var(--color-muted-ink)]"
                title={experience.tooltip}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-muted-ink)]/60" aria-hidden="true" />
                {experience.label}
              </span>
            )}
          </div>

          <Link
            to={candidatePublicPath(candidate)}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            <h3 className="mt-1 font-[family-name:var(--font-display)] text-xl font-bold leading-tight text-[var(--color-ink)]">
              {candidate.full_name}
            </h3>
          </Link>

          {candidate.ballot_number && (
            <p className="mt-1 font-mono text-sm text-[var(--color-muted-ink)]">
              {candidate.ballot_number}
            </p>
          )}

          {summary && hasSource && (
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--color-ink)]">
              {summary.content}
            </p>
          )}
        </div>
      </div>

      {summary && hasSource && (
        <div className="mt-auto border-t border-[var(--color-border-editorial)] px-4 py-3">
          <SourceReferenceBadge
            document={sourceDoc}
            confidenceScore={summary.confidence_score}
          />
        </div>
      )}
    </article>
  );
});
