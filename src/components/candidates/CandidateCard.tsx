import { Link } from "react-router-dom";
import type { CandidateWithClaims } from "@/types/election";
import { SourceReferenceBadge } from "@/components/sources/SourceReferenceBadge";
import { CandidatePhoto } from "./CandidatePhoto";
import { sanitizeUrl } from "@/utils/sanitizeUrl";
import { candidatePublicPath } from "@/utils/candidateIdentity";

interface CandidateCardProps {
  candidate: CandidateWithClaims;
}

export function CandidateCard({ candidate }: CandidateCardProps) {
  const summary = candidate.claims.find(
    (claim) =>
      claim.category.toLowerCase() === "summary" &&
      claim.status === "published",
  );

  return (
    <article className="relative flex min-h-full flex-col overflow-hidden rounded-md border border-[var(--color-border-editorial)] bg-card transition-colors hover:border-[var(--color-institutional)] focus-within:border-[var(--color-institutional)] focus-within:ring-2 focus-within:ring-[var(--color-institutional)]">
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
                className="absolute bottom-1 right-1 rounded-sm bg-[var(--color-ink)]/85 px-1.5 py-1 font-mono text-[0.6rem] text-white"
                aria-label={`Abrir fonte da foto de ${candidate.full_name}`}
              >
                fonte ↗
              </a>
            ) : null;
          })()}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-mono text-[0.68rem] uppercase tracking-wider text-[var(--color-muted-ink)]">
            {candidate.party} &middot; {candidate.position_label}
          </p>

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

          {summary && (
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--color-ink)]">
              {summary.content}
            </p>
          )}
        </div>
      </div>

      <div className="mt-auto border-t border-[var(--color-border-editorial)] px-4 py-3">
        <SourceReferenceBadge
          document={summary?.source_document ?? null}
          confidenceScore={summary?.confidence_score ?? 0}
        />
      </div>
    </article>
  );
}
