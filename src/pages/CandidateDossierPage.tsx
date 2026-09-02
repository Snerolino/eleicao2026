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
import { fetchVoteCategoryScores } from '@/services/voteCategoryComparison';
import { formatCategoryScore, type VoteCategoryScore } from '@/domain/impact/vote-category-score';
import {
  DOSSIER_SECTIONS,
  votingHouseMetadata,
  type CandidateWithClaims,
  type Claim
} from '@/types/election';
import { CandidateNominalVotesList } from '@/components/candidates/CandidateNominalVotesList';
import { getCandidateNominalVotes } from '@/services/candidateVotes';
import { CandidateDeclaredAssetsCard } from '@/components/candidates/CandidateDeclaredAssetsCard';
import { getCandidateDeclaredAssets } from '@/services/candidateAssets';
import { CandidateAuthoredProjectsList } from '@/components/candidates/CandidateAuthoredProjectsList';

import { DivergentScoreBar } from '@/components/impact/DivergentScoreBar';
import { getBeneficiaryGroupLabel } from '@/domain/impact/beneficiary-groups';
import { SavedCandidateButton } from '@/components/candidates/SavedCandidateButton';
import { useSavedCandidates } from '@/hooks/useSavedCandidates';

function claimsForSection(
  claims: Claim[],
  matchersSet: ReadonlySet<string>
): Claim[] {
  return claims.filter((claim) =>
    matchersSet.has(claim.category.toLowerCase())
  );
}

function CategoryScoreList({
  scores,
  house,
  candidateName,
}: {
  scores: VoteCategoryScore[];
  house: string;
  candidateName: string;
}) {
  if (scores.length === 0) {
    return (
      <p className="font-mono text-xs uppercase tracking-wide text-[var(--color-muted-ink)]">
        Há votos factuais na casa {house}, mas ainda não há avaliações populacionais aprovadas para gerar score por categoria.
      </p>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {scores.map((score) => {
        const label = getBeneficiaryGroupLabel(score.group_slug);
        return (
          <div
            key={`${score.house}-${score.group_slug}`}
            className="rounded-sm border border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium leading-tight">{label}</span>
              <strong className="font-mono text-sm text-[var(--color-institutional)]">
                {formatCategoryScore(score.score)}
              </strong>
            </div>
            <div className="mt-2">
              <DivergentScoreBar
                score={score.score}
                evaluatedPropositions={score.evaluated_propositions}
                contestedAssessments={score.contested_assessments}
                candidateName={candidateName}
                groupLabel={label}
              />
            </div>
          </div>
        );
      })}
    </div>
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
  const { savedSet, toggleSaved } = useSavedCandidates();
  const candidateUniqueId = candidate ? (candidate.tse_candidate_id ?? candidate.id) : '';
  const isSaved = candidateUniqueId ? savedSet.has(candidateUniqueId) : false;

  const categoryScoresQuery = useQuery({
    queryKey: ['candidate-category-scores', candidate?.id],
    queryFn: () => fetchVoteCategoryScores(candidate?.id ? [candidate.id] : []),
    enabled: Boolean(candidate?.id),
    staleTime: 60_000,
  });

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

          <header className="flex flex-col gap-5 border-b border-[var(--color-border-editorial)] pb-7 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
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
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <SavedCandidateButton
                candidateName={candidate.full_name}
                saved={isSaved}
                onToggle={() => toggleSaved(candidateUniqueId)}
              />
              <span className="font-mono text-xs text-[var(--color-muted-ink)]">
                {isSaved ? 'Salvo nos favoritos' : 'Favoritar candidato'}
              </span>
            </div>
          </header>

          <CandidateAuthoredProjectsList projects={candidate.authored_projects ?? []} />

          {(candidate.voting_profiles ?? []).filter((profile) => profile.total_votes > 0).map((profile) => {
            const house = votingHouseMetadata(profile.house);
            const headingId = `voting-profile-heading-${profile.house}`;
            const safeSourceUrl = sanitizeUrl(house.sourceUrl);
            return (
            <section
              key={profile.house}
              aria-labelledby={headingId}
              className="border-y-[3px] border-double border-[var(--color-ink)] py-6"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-[var(--color-muted-ink)]">
                    Registro legislativo · {house.label}
                  </p>
                  <h2 id={headingId} className="mt-1 text-3xl">
                    Perfil de votações nominais
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-muted-ink)]">
                    {profile.total_votes} votos individuais localizados na {house.label}.
                    Os números abaixo são fatos de votação; a avaliação pública aparece por categoria somente quando existe assessment aprovado e fonte verificável.
                  </p>
                </div>
                <div className="shrink-0 text-left sm:text-right">
                  <span className="font-mono text-[0.68rem] uppercase tracking-widest text-[var(--color-muted-ink)]">avaliação por categoria</span>
                  <strong className="mt-1 block font-mono text-sm text-[var(--color-institutional)]">metodologia v1</strong>
                </div>
              </div>
              <div className="mt-5 border border-[var(--color-border-editorial)] p-4">
                <h3 className="font-mono text-xs uppercase tracking-widest text-[var(--color-muted-ink)]">Impacto populacional por categoria</h3>
                <p className="mt-2 text-sm text-[var(--color-muted-ink)]">O valor considera somente proposições com assessment aprovado, grupo identificado e voto elegível.</p>
                {categoryScoresQuery.isLoading ? (
                  <LoadingSkeleton label="Calculando avaliação por categoria" />
                ) : (
                  <div className="mt-3">
                    <CategoryScoreList
                      scores={(() => {
                        const allScores = categoryScoresQuery.data ?? [];
                        const houseScores = allScores.filter(
                          (score) => score.house === profile.house
                        );

                        const snapshotScores =
                          Array.isArray(candidate.category_scores) && candidate.category_scores.length > 0
                            ? candidate.category_scores.map((cs) => ({
                                candidate_id: candidate.id,
                                house: profile.house,
                                group_slug: cs.group,
                                score: cs.score,
                                methodology_version: '1.0.0',
                                evaluated_propositions: cs.evaluated_propositions_count,
                                eligible_weight: cs.evaluated_propositions_count * 3,
                                excluded_no_data: 0,
                                contested_assessments: 0,
                                average_confidence: 0.95,
                              }))
                            : [];

                        const houseEvaluated = houseScores.reduce((acc, s) => acc + (s.evaluated_propositions || 0), 0);
                        const snapshotEvaluated = snapshotScores.reduce((acc, s) => acc + (s.evaluated_propositions || 0), 0);

                        if (houseScores.length > 0 && houseEvaluated >= snapshotEvaluated) {
                          return houseScores;
                        }
                        if (snapshotScores.length > 0) {
                          return snapshotScores;
                        }
                        return houseScores.length > 0 ? houseScores : allScores;
                      })()}
                      house={house.label}
                      candidateName={candidate.full_name}
                    />
                  </div>
                )}
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-px border border-[var(--color-border-editorial)] bg-[var(--color-border-editorial)] sm:grid-cols-5">
                {[
                  ['Sim', profile.votos_sim, 'text-[var(--color-institutional)]'],
                  ['Não', profile.votos_nao, 'text-[var(--color-factcheck)]'],
                  ['Abstenção', profile.votos_abstencao, 'text-[var(--color-ink)]'],
                  ['Ausente', profile.votos_ausente, 'text-[var(--color-muted-ink)]'],
                  ['Obstrução', profile.votos_obstrucao, 'text-[var(--color-press)]'],
                ].map(([label, value, color]) => (
                  <div key={label} className="bg-[var(--color-paper)] px-3 py-3">
                    <dt className="font-mono text-[0.62rem] uppercase tracking-wider text-[var(--color-muted-ink)]">{label}</dt>
                    <dd className={`mt-1 font-mono text-xl font-semibold ${color}`}>{value}</dd>
                  </div>
                ))}
              </dl>
              {safeSourceUrl ? (
                <a
                  href={safeSourceUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-4 inline-block font-mono text-xs text-[var(--color-institutional)] underline underline-offset-4"
                >
                  Fonte: {house.sourceLabel} <span aria-hidden="true">↗</span>
                </a>
              ) : (
                <p className="mt-4 font-mono text-xs text-[var(--color-muted-ink)]">
                  Fonte: {house.sourceLabel}
                </p>
              )}

              {/* Lista Detalhada de Votações Nominais por Matéria */}
              {(() => {
                const nominalVotes = getCandidateNominalVotes(candidate.tse_candidate_id, profile.house);
                if (nominalVotes.length === 0) return null;
                return <CandidateNominalVotesList votes={nominalVotes} houseLabel={house.label} />;
              })()}
            </section>
            );
          })}

          {candidate.position === 'deputado_estadual' && !(candidate.voting_profiles ?? []).some((profile) => profile.total_votes > 0) ? (
            <section className="border-y border-[var(--color-border-editorial)] py-5" aria-label="Cobertura de votações nominais">
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-[var(--color-muted-ink)]">Registro legislativo · ALRS</p>
              <h2 className="mt-1 text-2xl">Votações nominais</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-muted-ink)]">
                Nenhum registro nominal oficial está disponível no corpus publicado para este candidato. Isso não representa voto zero nem ausência de participação.
              </p>
              <a href="https://transparencia.al.rs.gov.br/parlamentares/votos-plenario" target="_blank" rel="noreferrer noopener" className="mt-3 inline-block font-mono text-xs text-[var(--color-institutional)] underline underline-offset-4" aria-label={`Consultar fonte oficial ALRS sobre ${candidate.full_name}`}>
                Consultar fonte oficial ALRS <span aria-hidden="true">↗</span>
              </a>
            </section>
          ) : null}

          {/* Patrimônio e Bens Declarados ao TSE */}
          <CandidateDeclaredAssetsCard
            assets={getCandidateDeclaredAssets(candidate.tse_candidate_id)}
            candidateName={candidate.ballot_name || candidate.full_name}
          />

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
                    {claims.map((claim) => {
                      const source = claim.source_document;
                      if (!source) {
                        return (
                          <li
                            key={claim.id}
                            className="space-y-2 rounded-md border border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-5"
                          >
                            <p className="font-mono text-xs uppercase tracking-wide text-[var(--color-muted-ink)]">
                              Sem fonte verificada — conteúdo não exibido.
                            </p>
                          </li>
                        );
                      }
                      return (
                        <li
                          key={claim.id}
                          className="space-y-4 rounded-md border border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-5"
                        >
                          <p className="leading-relaxed">
                            {claim.content}
                          </p>
                          <SourceReferenceBadge
                            document={source}
                            confidenceScore={
                              claim.confidence_score
                            }
                          />
                        </li>
                      );
                    })}
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
