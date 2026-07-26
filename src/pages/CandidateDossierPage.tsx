import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
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
import {
  DOSSIER_SECTIONS,
  type CandidateWithClaims,
  type Claim
} from '@/types/election';

function claimsForSection(
  claims: Claim[],
  matchers: readonly string[]
): Claim[] {
  const accepted = new Set(
    matchers.map((matcher) => matcher.toLowerCase())
  );

  return claims.filter((claim) =>
    accepted.has(claim.category.toLowerCase())
  );
}

export function CandidateDossierPage() {
  const { id = '' } = useParams();
  const decodedId = decodeURIComponent(id);

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
      url: candidate ? `${window.location.origin}/candidatos/${encodeURIComponent(candidate.id)}` : undefined
    }
  );

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Link
        to="/"
        className="font-mono text-xs uppercase tracking-wider text-[var(--color-institutional)] underline-offset-4 hover:underline"
      >
        ← Voltar à lista
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

              {candidate.photo_source_url && (
                <a
                  href={candidate.photo_source_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-3 inline-block font-mono text-xs text-[var(--color-institutional)] underline underline-offset-2"
                >
                  fonte da foto ↗
                </a>
              )}
            </div>
          </header>

          {DOSSIER_SECTIONS.map((section) => {
            const claims = claimsForSection(
              candidate.claims,
              section.categoryMatchers
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
                        className="space-y-4 rounded-md border border-[var(--color-border-editorial)] bg-white p-5"
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
