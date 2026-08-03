import { useQuery } from '@tanstack/react-query';
import { Link, Navigate, useParams } from 'react-router';
import { sanitizeUrl } from '@/utils/sanitizeUrl';
import { CandidatePhoto } from '@/components/candidates/CandidatePhoto';
import { DataFreshness } from '@/components/DataFreshness';
import { SourceReferenceBadge } from '@/components/sources/SourceReferenceBadge';
import {
  EmptyState,
  ErrorState,
  LoadingSkeleton
} from '@/components/states';
import { usePageMetadata } from '@/hooks/usePageMetadata';
import { fetchCandidateById } from '@/services/candidates';
import { candidatePublicId, candidatePublicPath } from '@/utils/candidateIdentity';
import {
  DOSSIER_SECTIONS,
  type CandidateWithClaims,
  type Claim
} from '@/types/election';

function claimsForSection(
  claims: Claim[],
  matchersSet: ReadonlySet<string>
): Claim[] {
  return claims.filter((claim) =>
    matchersSet.has(claim.category.toLowerCase())
  );
}

export function CandidateDossierPage() {
  const { slug = '' } = useParams();
  const decodedId = decodeURIComponent(slug);

  const query = useQuery<CandidateWithClaims | null>({
    queryKey: ['candidate', decodedId],
    queryFn: () => fetchCandidateById(decodedId),
    enabled: Boolean(decodedId),
    staleTime: 60_000,
    retry: 2
  });

  const candidate = query.data;

  usePageMetadata(
    candidate
      ? `${candidate.full_name} — Portal Transparência Eleitoral RS`
      : 'Dossiê do candidato — Portal Transparência Eleitoral RS',
    candidate
      ? `Dossiê público de ${candidate.full_name} (${candidate.party}) — histórico, plataforma e reputação com fontes verificadas.`
      : 'Dossiê público com informações publicadas e referências de fonte.',
    {
      image: candidate?.photo_url ?? undefined,
      url: candidate ? `${window.location.origin}${candidatePublicPath(candidate)}` : undefined
    }
  );

  if (candidate && decodedId !== candidatePublicId(candidate)) {
    return <Navigate to={candidatePublicPath(candidate)} replace />;
  }

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8">
      <Link
        to="/"
        className="font-mono text-xs uppercase tracking-wider text-[var(--color-institutional)] underline-offset-4 hover:underline"
      >
        <span aria-hidden="true" className="mr-1">←</span> Voltar à lista
      </Link>

      {query.isLoading && (
        <div className="mt-6">
          <LoadingSkeleton label="Carregando dossiê" />
        </div>
      )}

      {query.isError && (
        <div className="mt-6">
          <ErrorState
            onRetry={() => query.refetch()}
            message="Não foi possível carregar o dossiê."
          />
        </div>
      )}

      {!query.isLoading && !query.isError && candidate === null && (
        <div className="mt-6">
          <EmptyState>Candidato não encontrado.</EmptyState>
        </div>
      )}

      {candidate && (
        <article className="mt-6 space-y-10">
          <DataFreshness updatedAt={query.dataUpdatedAt} />

          <header className="flex flex-col gap-5 border-b border-[var(--color-border-editorial)] pb-7 sm:flex-row sm:items-center">
            <div className="h-32 w-32 shrink-0 overflow-hidden rounded-sm bg-[var(--color-skeleton)]">
              <CandidatePhoto
                name={candidate.full_name}
                photoUrl={candidate.photo_url}
                className="h-full w-full object-cover"
              />
            </div>

            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-muted-ink)]">
                {candidate.position_label}
              </p>
              <h1 className="mt-1 text-4xl leading-tight">
                {candidate.full_name}
              </h1>
              <p className="mt-2 font-mono text-sm text-[var(--color-muted-ink)]">
                {candidate.party}
                {candidate.ballot_number != null
                  ? ` · nº ${candidate.ballot_number}`
                  : ''}
              </p>

              {
                (() => {
                  const safePhotoSourceUrl = sanitizeUrl(candidate.photo_source_url);
                  return safePhotoSourceUrl ? (
                    <a
                      href={safePhotoSourceUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="mt-3 inline-block font-mono text-xs text-[var(--color-institutional)] underline underline-offset-2"
                      aria-label={`Abrir fonte da foto de ${candidate.full_name}`}
                    >
                      fonte da foto <span aria-hidden="true">↗</span>
                    </a>
                  ) : null;
                })()
              }
            </div>
          </header>

          {DOSSIER_SECTIONS.map((section) => {
            const claims = claimsForSection(
              candidate.claims,
              section.categoryMatchersSet
            );

            return (
              <section
                key={section.key}
                aria-labelledby={`section-${section.key}`}
                className="space-y-4"
              >
                <h2
                  id={`section-${section.key}`}
                  className="text-2xl"
                >
                  {section.label}
                </h2>

                {claims.length === 0 ? (
                  <p className="font-mono text-xs uppercase tracking-wide text-[var(--color-muted-ink)]">
                    Ainda não verificado
                  </p>
                ) : (
                  <ul className="space-y-4">
                    {claims.map((claim) => (
                      <li
                        key={claim.id}
                        className="space-y-4 rounded-md border border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-5"
                      >
                        <p className="leading-relaxed">
                          {claim.content}
                        </p>
                        <SourceReferenceBadge
                          document={claim.source_document}
                          confidenceScore={
                            claim.confidence_score
                          }
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </article>
      )}
    </main>
  );
}
