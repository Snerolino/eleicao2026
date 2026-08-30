import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { fetchAllCandidates } from '@/services/candidates';
import { CandidatePhoto } from '@/components/candidates/CandidatePhoto';
import {
  DOSSIER_SECTIONS,
  type CandidateWithClaims,
  type Claim,
} from '@/types/election';
import { usePageMetadata } from '@/hooks/usePageMetadata';
import { ConfidenceBadge } from '@/components/sources/ConfidenceBadge';
import { LoadingSkeleton } from '@/components/states';
import { candidatePublicPath } from '@/utils/candidateIdentity';
import { fetchVoteCategoryComparisons, fetchVoteCategoryScores } from '@/services/voteCategoryComparison';
import type { VoteCategoryComparison } from '@/domain/impact/vote-category-comparison';
import { formatCategoryScore, type VoteCategoryScore } from '@/domain/impact/vote-category-score';
import {
  BENEFICIARY_GROUPS_CANONICAL_ORDER,
  getBeneficiaryGroupLabel,
} from '@/domain/impact/beneficiary-groups';
import {
  getCandidateCategoryScore,
  VoteCategoryScoreTableBar,
} from '@/components/impact/VoteCategoryScoreTableBar';
import {
  type CandidateExperienceFilter,
  candidateExperienceBadge,
  hasPreviousMandate,
} from '@/utils/candidateExperience';
import { SavedCandidateButton } from '@/components/candidates/SavedCandidateButton';
import { useSavedCandidates } from '@/hooks/useSavedCandidates';

function normalize(text: string) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function claimsForSection(
  claims: Claim[],
  matchersSet: ReadonlySet<string>
): Claim[] {
  return claims.filter((c) => matchersSet.has(c.category.toLowerCase()));
}

function SectionCell({
  candidate,
  matchersSet,
}: {
  candidate: CandidateWithClaims;
  matchersSet: ReadonlySet<string>;
}) {
  const claims = claimsForSection(candidate.claims, matchersSet);
  if (claims.length === 0) {
    return (
      <td className="border-r border-[var(--color-border-editorial)] px-4 py-4 align-top last:border-r-0">
        <p className="font-mono text-xs uppercase tracking-wide text-[var(--color-muted-ink)]">
          Ainda não verificado
        </p>
      </td>
    );
  }
  return (
    <td className="border-r border-[var(--color-border-editorial)] px-4 py-4 align-top last:border-r-0">
      <ul className="space-y-3">
        {claims
          .filter((claim) => claim.source_document)
          .map((claim) => (
          <li key={claim.id} className="space-y-2">
            <p className="text-sm leading-relaxed">{claim.content}</p>
            <ConfidenceBadge
              score={claim.confidence_score}
              sourceName={
                claim.source_document?.source_name ?? 'Fonte não identificada'
              }
            />
          </li>
        ))}
        {claims.filter((claim) => !claim.source_document).length > 0 && (
          <li className="space-y-2">
            <p className="font-mono text-xs uppercase tracking-wide text-[var(--color-muted-ink)]">
              {claims.filter((claim) => !claim.source_document).length} item(s) sem
              fonte verificada — não exibido(s).
            </p>
          </li>
        )}
      </ul>
    </td>
  );
}

function VoteCategoryTable({
  comparisons,
  candidates,
}: {
  comparisons: VoteCategoryComparison[];
  candidates: CandidateWithClaims[];
}) {
  const safeComparisons = comparisons.filter((comparison) => typeof comparison?.group_slug === 'string' && Array.isArray(comparison?.candidates));
  if (safeComparisons.length === 0) {
    return <p className="font-mono text-xs uppercase tracking-wide text-[var(--color-muted-ink)]">Ainda não há cobertura aprovada de impacto em eventos comuns para comparar por categoria.</p>;
  }
  return (
    <div className="overflow-auto rounded-sm border border-[var(--color-border-editorial)]">
      <table className="w-full border-collapse text-sm">
        <thead><tr className="bg-[var(--color-paper)]">
          <th className="p-3 text-left font-mono text-xs uppercase tracking-wider text-[var(--color-muted-ink)]">Categoria / casa</th>
          {candidates.map((candidate) => <th key={candidate.id} className="border-l border-[var(--color-border-editorial)] p-3 text-left">{candidate.full_name}</th>)}
        </tr></thead>
        <tbody>{safeComparisons.map((comparison) => <tr key={`${comparison.house}:${comparison.group_slug}`} className="border-t border-[var(--color-border-editorial)]">
          <th className="p-3 text-left align-top font-mono text-xs uppercase tracking-wider text-[var(--color-muted-ink)]">{comparison.group_slug.replaceAll('_', ' ')} · {comparison.house} · {comparison.events_compared} evento(s) comum(ns)</th>
          {comparison.candidates.map((summary) => <td key={summary.candidate_id} className="border-l border-[var(--color-border-editorial)] p-3 align-top"><span className="font-mono text-xs">Sim {summary.sim} · Não {summary.nao}</span><br /><span className="font-mono text-[0.65rem] text-[var(--color-muted-ink)]">Abst. {summary.abstencao} · Aus. {summary.ausente} · Obst. {summary.obstrucao}</span></td>)}
        </tr>)}</tbody>
      </table>
    </div>
  );
}

function VoteCategoryScoreTableLegacy({ scores, candidates }: { scores: VoteCategoryScore[]; candidates: CandidateWithClaims[] }) {
  const safeScores = scores.filter((score) => typeof score?.group_slug === 'string' && typeof score?.candidate_id === 'string' && ('score' in score));
  if (candidates.length === 0) return <p className="font-mono text-xs uppercase tracking-wide text-[var(--color-muted-ink)]">Selecione candidatos para visualizar a comparação.</p>;
  
  const keys = BENEFICIARY_GROUPS_CANONICAL_ORDER;

  return (
    <div className="overflow-auto rounded-sm border border-[var(--color-border-editorial)] bg-[var(--color-paper)]">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-[var(--color-paper)]">
            <th className="p-3 text-left font-mono text-xs uppercase tracking-wider text-[var(--color-muted-ink)]">
              Saldo / categoria
            </th>
            {candidates.map((candidate) => (
              <th key={candidate.id} className="border-l border-[var(--color-border-editorial)] p-3 text-left">
                {candidate.full_name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {keys.map((groupSlug) => {
            const label = getBeneficiaryGroupLabel(groupSlug);
            return (
              <tr key={groupSlug} className="border-t border-[var(--color-border-editorial)]">
                <th className="p-3 text-left font-mono text-xs uppercase tracking-wider text-[var(--color-muted-ink)]">
                  {label}
                </th>
                {candidates.map((candidate) => {
                  const scoreObj = getCandidateCategoryScore(safeScores, candidate.id, groupSlug);
                  return (
                    <td key={candidate.id} className="border-l border-[var(--color-border-editorial)] p-3">
                      <strong className="font-mono text-base">{formatCategoryScore(scoreObj.score)}</strong>
                      {scoreObj.evaluatedPropositions > 0 && (
                        <span className="ml-2 font-mono text-[0.65rem] text-[var(--color-muted-ink)]">
                          {scoreObj.evaluatedPropositions} item(s)
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function parseSharedCandidateIds(
  rawIds: string | null,
  validIds: ReadonlySet<string>
): string[] {
  const result: string[] = [];
  for (const rawId of (rawIds ?? '').split(',')) {
    const id = rawId.trim();
    if (!id || !validIds.has(id) || result.includes(id)) continue;
    result.push(id);
    if (result.length === 4) break;
  }
  return result;
}

function serializeSelectedIds(ids: Iterable<string>): string {
  return [...ids].join(',');
}

const OFFICIAL_RACE_FILTERS = ['AMARELA', 'BRANCA', 'INDÍGENA', 'PARDA', 'PRETA', 'NÃO INFORMADO'] as const;

function candidateRaceFilterValue(candidate: CandidateWithClaims): string {
  return candidate.race ?? 'NÃO INFORMADO';
}

function raceFilterLabel(value: string): string {
  if (value === 'NÃO INFORMADO') return 'Não informado';
  return value.charAt(0) + value.slice(1).toLowerCase();
}

const OFFICIAL_POSITIONS = [
  'deputado_federal',
  'deputado_estadual',
  'governador',
  'vice_governador',
  'senador',
] as const;

function positionLabel(position: string): string {
  const labels: Record<string, string> = {
    deputado_federal: 'Deputado Federal',
    deputado_estadual: 'Deputado Estadual',
    governador: 'Governador',
    vice_governador: 'Vice-Governador',
    senador: 'Senador',
  };
  return labels[position] ?? position;
}

export function ComparePage() {
  usePageMetadata(
    'Comparar candidatos — Portal Transparência Eleitoral RS',
    'Selecione e compare candidatos lado a lado nas eleições 2026 no RS.'
  );

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [partyFilter, setPartyFilter] = useState('');
  const [womenOnly, setWomenOnly] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [raceFilter, setRaceFilter] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState<CandidateExperienceFilter>('');
  const [scoreViewMode, setScoreViewMode] = useState<'bars' | 'legacy'>('bars');
  const showDocsHint = true;

  const query = useQuery<CandidateWithClaims[]>({
    queryKey: ['candidates'],
    queryFn: fetchAllCandidates,
    staleTime: 60_000,
    retry: 2,
  });

  const candidates = query.data ?? [];
  const validCandidateIds = useMemo(() => new Set(candidates.map((c) => c.id)), [candidates]);
  const { savedSet, toggleSaved } = useSavedCandidates(validCandidateIds, query.isSuccess);

  const { parties, races, experienceCounts } = useMemo(() => {
    const partySet = new Set<string>();
    const raceSet = new Set<string>(OFFICIAL_RACE_FILTERS);
    let withMandate = 0;
    let firstTime = 0;
    for (const candidate of candidates) {
      partySet.add(candidate.party);
      raceSet.add(candidateRaceFilterValue(candidate));
      if (hasPreviousMandate(candidate)) withMandate += 1;
      else firstTime += 1;
    }
    return {
      parties: [...partySet].sort(),
      races: [...raceSet].sort(
        (a, b) => OFFICIAL_RACE_FILTERS.indexOf(a as (typeof OFFICIAL_RACE_FILTERS)[number])
          - OFFICIAL_RACE_FILTERS.indexOf(b as (typeof OFFICIAL_RACE_FILTERS)[number]),
      ),
      experienceCounts: { withMandate, firstTime },
    };
  }, [candidates]);

  const filteredCandidates = useMemo(() => {
    const normalizedQuery = normalize(deferredSearchQuery.trim());
    return candidates.filter((candidate) => {
      if (partyFilter && candidate.party !== partyFilter) return false;
      if (womenOnly && candidate.gender !== 'FEMININO') return false;
      if (favoritesOnly && !savedSet.has(candidate.tse_candidate_id ?? candidate.id)) return false;
      if (raceFilter && candidateRaceFilterValue(candidate) !== raceFilter) return false;
      if (positionFilter && candidate.position !== positionFilter) return false;
      if (experienceFilter === 'mandato_anterior' && !hasPreviousMandate(candidate)) return false;
      if (experienceFilter === 'estreante' && hasPreviousMandate(candidate)) return false;

      if (normalizedQuery) {
        const nameMatches = normalize(candidate.full_name).includes(normalizedQuery);
        const ballotNameMatches = candidate.ballot_name
          ? normalize(candidate.ballot_name).includes(normalizedQuery)
          : false;
        const numberMatches =
          candidate.ballot_number != null &&
          String(candidate.ballot_number).includes(normalizedQuery);
        const partyMatches = normalize(candidate.party).includes(normalizedQuery);
        const positionMatches = normalize(candidate.position_label).includes(normalizedQuery);

        if (
          !nameMatches &&
          !ballotNameMatches &&
          !numberMatches &&
          !partyMatches &&
          !positionMatches
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    candidates,
    deferredSearchQuery,
    partyFilter,
    womenOnly,
    favoritesOnly,
    savedSet,
    raceFilter,
    positionFilter,
    experienceFilter,
  ]);

  const sharedIds = useMemo(
    () => parseSharedCandidateIds(searchParams.get('candidatos'), validCandidateIds),
    [searchParams, validCandidateIds]
  );

  const selectedIds = useMemo(() => new Set(sharedIds), [sharedIds]);

  useEffect(() => {
    if (query.isLoading) return;
    const sharedValue = serializeSelectedIds(sharedIds);
    if ((searchParams.get('candidatos') ?? '') !== sharedValue) {
      navigate({ search: sharedValue ? `?candidatos=${sharedValue}` : '' }, { replace: true });
    }
  }, [navigate, query.isLoading, searchParams, sharedIds]);

  const selected = useMemo(
    () => candidates.filter((c) => selectedIds.has(c.id)),
    [candidates, selectedIds]
  );

  const voteCategoryQuery = useQuery({
    queryKey: ['vote-category-comparison', selected.map((candidate) => candidate.id)],
    queryFn: () => fetchVoteCategoryComparisons(selected.map((candidate) => candidate.id)),
    enabled: selected.length >= 2,
    staleTime: 60_000,
  });
  const voteCategoryScoreQuery = useQuery({
    queryKey: ['vote-category-scores', selected.map((candidate) => candidate.id)],
    queryFn: () => fetchVoteCategoryScores(selected.map((candidate) => candidate.id)),
    enabled: selected.length >= 2,
    staleTime: 60_000,
  });

  const updateSharedRoute = (ids: string[]) => {
    const value = serializeSelectedIds(ids.slice(0, 4));
    navigate({ search: value ? `?candidatos=${value}` : '' }, { replace: false });
  };

  const toggleCandidate = (id: string) => {
    const next = sharedIds.includes(id)
      ? sharedIds.filter((selectedId) => selectedId !== id)
      : [...sharedIds, id].slice(0, 4);
    updateSharedRoute(next);
  };

  if (query.isLoading) {
    return (
      <main id="main-content" className="mx-auto max-w-6xl px-4 py-8">
        <LoadingSkeleton label="Carregando candidatos" />
      </main>
    );
  }

  return (
    <main id="main-content" className="mx-auto max-w-7xl px-4 py-8">
      <Link
        to="/"
        className="font-mono text-xs uppercase tracking-wider text-[var(--color-institutional)] underline-offset-4 hover:underline"
      >
        ← Voltar à lista
      </Link>

      <h1 className="mt-6 text-3xl">Comparar candidatos</h1>
      <p className="mt-1 font-mono text-xs uppercase tracking-wider text-[var(--color-muted-ink)]">
        Selecione de 2 a 4 candidatos
      </p>

      {/* Selected bar */}
      {selectedIds.size > 0 && (
        <section className="mt-6 space-y-4" aria-label="Selecionados">
          <div className="flex flex-wrap items-center gap-3">
            {selected.map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border-editorial)] bg-[color-mix(in_srgb,var(--color-institutional)_14%,var(--color-paper))] text-[var(--color-ink)] px-3 py-1 text-sm shadow-xs transition-colors"
              >
                <span className="truncate max-w-[180px] font-medium text-[var(--color-ink)]">{c.full_name}</span>
                <button
                  type="button"
                  onClick={() => toggleCandidate(c.id)}
                  className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded-full text-[var(--color-muted-ink)] hover:bg-[var(--color-ink)]/10 hover:text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-[var(--color-institutional)] transition-colors duration-150"
                  aria-label={`Remover ${c.full_name}`}
                >
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </span>
            ))}
            <span className="font-mono text-xs text-[var(--color-muted-ink)]">
              {selected.length} selecionado{selected.length > 1 ? 's' : ''}.
              {selected.length < 2
                ? ' Selecione ao menos mais um.'
                : ''}
            </span>
            <button
              type="button"
              onClick={() => {
                updateSharedRoute([]);
              }}
              className="font-mono text-xs text-[var(--color-unverified)] underline underline-offset-2"
            >
              Limpar tudo
            </button>
            {selected.length >= 2 && (
              <a
                href="#comparacao"
                className="rounded-sm bg-[var(--color-institutional)] px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-white hover:opacity-90"
              >
                Ver comparação
              </a>
            )}
          </div>

          {/* Comparison table */}
          {selected.length >= 2 && (
            <div
              id="comparacao"
              className="mt-4 scroll-mt-6 overflow-auto rounded-sm border border-[var(--color-border-editorial)]"
            >
              <table className="w-full border-collapse bg-[var(--color-paper)] text-sm">
                <thead>
                  <tr>
                    <th className="sticky top-0 min-w-[120px] bg-[var(--color-paper)] p-3 text-left font-mono text-xs uppercase tracking-wider text-[var(--color-muted-ink)]" />
                    {selected.map((c) => {
                      const exp = candidateExperienceBadge(c);
                      return (
                        <th
                          key={c.id}
                          className="sticky top-0 min-w-[240px] border-l border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-3 text-left"
                          data-experience-type={exp.type}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-sm bg-[var(--color-skeleton)]">
                                <CandidatePhoto
                                  name={c.full_name}
                                  photoUrl={c.photo_url}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-1">
                                  <p className="font-mono text-[0.6rem] uppercase tracking-wider text-[var(--color-muted-ink)]">
                                    {c.position_label}
                                  </p>
                                  {exp.type === 'mandato_anterior' ? (
                                    <span
                                      className="inline-flex items-center gap-0.5 rounded-full border border-[color-mix(in_srgb,var(--color-institutional)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-institutional)_10%,var(--color-paper))] px-1.5 py-0.2 font-mono text-[0.55rem] font-semibold uppercase tracking-wider text-[var(--color-institutional)]"
                                      title={exp.tooltip}
                                    >
                                      <svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" className="h-2 w-2 shrink-0">
                                        <path d="M8 1a1 1 0 0 1 .7.3l2.8 2.8H14a1 1 0 0 1 1 1v2.5l2.8 2.8a1 1 0 0 1 0 1.4L15 11.8V14a1 1 0 0 1-1 1h-2.5l-2.8 2.8a1 1 0 0 1-1.4 0L4.5 15H2a1 1 0 0 1-1-1v-2.2L.2 10.5a1 1 0 0 1 0-1.4L2 6.3V4a1 1 0 0 1 1-1h2.5L8.3 1.3A1 1 0 0 1 8 1zm0 4.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z" />
                                      </svg>
                                      Mandato
                                    </span>
                                  ) : (
                                    <span
                                      className="inline-flex items-center gap-0.5 rounded-full border border-[var(--color-border-editorial)] bg-[var(--color-paper)] px-1.5 py-0.2 font-mono text-[0.55rem] font-medium uppercase tracking-wider text-[var(--color-muted-ink)]"
                                      title={exp.tooltip}
                                    >
                                      1ª cand.
                                    </span>
                                  )}
                                </div>
                                <p className="font-medium leading-tight">
                                  <Link
                                    to={candidatePublicPath(c)}
                                    className="text-[var(--color-institutional)] underline-offset-2 hover:underline"
                                  >
                                    {c.full_name}
                                  </Link>
                                </p>
                                <p className="font-mono text-[0.65rem] text-[var(--color-muted-ink)]">
                                  {c.party}
                                  {c.ballot_number != null
                                    ? ` · nº ${c.ballot_number}`
                                    : ''}
                                </p>
                              </div>
                            </div>
                            <div className="shrink-0">
                              <SavedCandidateButton
                                candidateName={c.full_name}
                                saved={savedSet.has(c.tse_candidate_id ?? c.id)}
                                onToggle={() => toggleSaved(c.tse_candidate_id ?? c.id)}
                              />
                            </div>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {DOSSIER_SECTIONS.map((section) => (
                    <tr key={section.key}>
                      <td className="border-t border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-3 align-top font-mono text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-ink)]">
                        {section.label}
                      </td>
                      {selected.map((c) => (
                        <SectionCell
                          key={c.id}
                          candidate={c}
                          matchersSet={section.categoryMatchersSet}
                        />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {selected.length >= 2 && (
            <section className="mt-6 space-y-3" aria-label="Comparação de votos por categoria">
              <div>
                <h2 className="text-xl">Votos em categorias aprovadas</h2>
                <p className="mt-1 font-mono text-xs text-[var(--color-muted-ink)]">
                  Apenas eventos comuns, fontes e assessments aprovados. Os números são fatos nominais, não recomendação ou score.
                </p>
              </div>
              {voteCategoryQuery.isLoading ? <LoadingSkeleton label="Carregando comparação factual" /> : <VoteCategoryTable comparisons={voteCategoryQuery.data ?? []} candidates={selected} />}
              <div className="flex flex-col gap-2 pt-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg">Perfil de votações por grupo populacional</h3>
                  <p className="font-mono text-xs text-[var(--color-muted-ink)]">
                    Metodologia v1: saldo ponderado (−1 a +1) por grupo. &ldquo;Não avaliado&rdquo; não é zero.
                  </p>
                </div>
                <div className="flex items-center gap-1 rounded-sm border border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-0.5" role="group" aria-label="Modo de visualização dos saldos">
                  <button
                    type="button"
                    onClick={() => setScoreViewMode('bars')}
                    aria-pressed={scoreViewMode === 'bars'}
                    className={`cursor-pointer rounded-[2px] px-2.5 py-1 font-mono text-xs transition-colors ${
                      scoreViewMode === 'bars'
                        ? 'bg-[var(--color-institutional)] text-white font-medium'
                        : 'text-[var(--color-muted-ink)] hover:text-[var(--color-ink)]'
                    }`}
                  >
                    Gráfico de barras
                  </button>
                  <button
                    type="button"
                    onClick={() => setScoreViewMode('legacy')}
                    aria-pressed={scoreViewMode === 'legacy'}
                    className={`cursor-pointer rounded-[2px] px-2.5 py-1 font-mono text-xs transition-colors ${
                      scoreViewMode === 'legacy'
                        ? 'bg-[var(--color-institutional)] text-white font-medium'
                        : 'text-[var(--color-muted-ink)] hover:text-[var(--color-ink)]'
                    }`}
                  >
                    Tabela numérica
                  </button>
                </div>
              </div>
              {voteCategoryScoreQuery.isLoading ? (
                <LoadingSkeleton label="Calculando saldos por categoria" />
              ) : scoreViewMode === 'bars' ? (
                <VoteCategoryScoreTableBar scores={voteCategoryScoreQuery.data ?? []} candidates={selected} />
              ) : (
                <VoteCategoryScoreTableLegacy scores={voteCategoryScoreQuery.data ?? []} candidates={selected} />
              )}
            </section>
          )}
        </section>
      )}

      {/* Candidate selector — always visible */}
      <section className="mt-8" aria-label="Lista de candidatos">
        <div className="mb-4 flex flex-col gap-3">
          <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl">Adicionar à comparação</h2>
              <p aria-live="polite" className="mt-1 font-mono text-xs text-[var(--color-muted-ink)]">
                {filteredCandidates.length} de {candidates.length} candidatos disponíveis
                {searchQuery.trim() && ` para "${searchQuery.trim()}"`}
                {partyFilter && ` do ${partyFilter}`}
                {womenOnly && ' · mulheres'}
                {raceFilter && ` · cor/raça ${raceFilter.toLowerCase()}`}
                {positionFilter && ` · cargo ${positionLabel(positionFilter)}`}
                {experienceFilter === 'mandato_anterior' && ' · com mandato anterior'}
                {experienceFilter === 'estreante' && ' · 1ª candidatura / estreantes'}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            {/* Campo de pesquisa de candidatos */}
            <div className="relative w-full max-w-md">
              <label htmlFor="compare-search-input" className="sr-only">
                Buscar candidatos para comparar
              </label>
              <input
                id="compare-search-input"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Buscar por nome, número ou partido..."
                className="w-full rounded-sm border border-[var(--color-border-editorial)] bg-[var(--color-paper)] py-2 pl-9 pr-9 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted-ink)] focus:border-[var(--color-institutional)] focus:outline-none"
                autoComplete="off"
                aria-label="Buscar candidatos por nome, número ou partido"
              />
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="none"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-ink)]"
              >
                <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="m12.5 12.5 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-xs text-[var(--color-muted-ink)] hover:text-[var(--color-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-institutional)]"
                  aria-label="Limpar campo de pesquisa"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <select
                value={partyFilter}
                onChange={(event) => setPartyFilter(event.target.value)}
                className="cursor-pointer rounded-sm border border-[var(--color-border-editorial)] bg-[var(--color-paper)] px-3 py-2 text-sm text-[var(--color-ink)] focus:border-[var(--color-institutional)] focus:outline-none"
                aria-label="Filtrar por partido"
              >
                <option value="">Todos os partidos</option>
                {parties.map((party) => (
                  <option key={party} value={party}>{party}</option>
                ))}
              </select>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-sm border border-[var(--color-border-editorial)] bg-[var(--color-paper)] px-3 py-2 text-sm text-[var(--color-ink)] focus-within:border-[var(--color-institutional)]">
                <input
                  type="checkbox"
                  checked={womenOnly}
                  onChange={(event) => setWomenOnly(event.target.checked)}
                  className="accent-[var(--color-institutional)]"
                />
                Mostrar somente mulheres
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-sm border border-[var(--color-border-editorial)] bg-[var(--color-paper)] px-3 py-2 text-sm text-[var(--color-ink)] focus-within:border-[var(--color-institutional)]">
                <input
                  type="checkbox"
                  checked={favoritesOnly}
                  onChange={(event) => setFavoritesOnly(event.target.checked)}
                  className="accent-[var(--color-institutional)]"
                />
                Apenas favoritos ({savedSet.size})
              </label>
              <select
                value={raceFilter}
                onChange={(event) => setRaceFilter(event.target.value)}
                className="cursor-pointer rounded-sm border border-[var(--color-border-editorial)] bg-[var(--color-paper)] px-3 py-2 text-sm text-[var(--color-ink)] focus:border-[var(--color-institutional)] focus:outline-none"
                aria-label="Filtrar por cor/raça"
                title="Filtro baseado em autodeclaração oficial TSE/IBGE. Etnia indígena será detalhada quando houver cadastro específico."
              >
                <option value="">Todas as cores/raças</option>
                {races.map((race) => (
                  <option key={race} value={race}>{raceFilterLabel(race)}</option>
                ))}
              </select>
              <select
                value={positionFilter}
                onChange={(event) => setPositionFilter(event.target.value)}
                className="cursor-pointer rounded-sm border border-[var(--color-border-editorial)] bg-[var(--color-paper)] px-3 py-2 text-sm text-[var(--color-ink)] focus:border-[var(--color-institutional)] focus:outline-none"
                aria-label="Filtrar por cargo"
              >
                <option value="">Todos os cargos</option>
                {OFFICIAL_POSITIONS.map((position) => (
                  <option key={position} value={position}>{positionLabel(position)}</option>
                ))}
              </select>
              <select
                value={experienceFilter}
                onChange={(event) => setExperienceFilter(event.target.value as CandidateExperienceFilter)}
                className="cursor-pointer rounded-sm border border-[var(--color-border-editorial)] bg-[var(--color-paper)] px-3 py-2 text-sm text-[var(--color-ink)] focus:border-[var(--color-institutional)] focus:outline-none"
                aria-label="Filtrar por histórico de mandato"
                title="Filtra entre candidatos já eleitos anteriormente e candidatos concorrendo pela primeira vez."
              >
                <option value="">Todos os históricos</option>
                <option value="mandato_anterior">Já eleito(a) anteriormente ({experienceCounts.withMandate})</option>
                <option value="estreante">1ª candidatura / Estreante ({experienceCounts.firstTime})</option>
              </select>
            </div>
          </div>
        </div>

        {filteredCandidates.length === 0 ? (
          <div className="rounded-sm border border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-8 text-center">
            <p className="font-medium text-[var(--color-ink)]">Nenhum candidato encontrado</p>
            <p className="mt-1 text-xs text-[var(--color-muted-ink)]">
              Tente alterar os termos da busca ou limpar os filtros aplicados.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setPartyFilter('');
                setWomenOnly(false);
                setFavoritesOnly(false);
                setRaceFilter('');
                setPositionFilter('');
                setExperienceFilter('');
              }}
              className="mt-4 cursor-pointer rounded-sm border border-[var(--color-institutional)] bg-transparent px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-[var(--color-institutional)] hover:bg-[color-mix(in_srgb,var(--color-institutional)_10%,transparent)]"
            >
              Limpar busca e filtros
            </button>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCandidates.map((c) => {
            const isSelected = selectedIds.has(c.id);
            const isMaxed = !isSelected && selectedIds.size >= 4;
            const exp = candidateExperienceBadge(c);
            const candId = c.tse_candidate_id ?? c.id;
            return (
              <li key={c.id} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    if (!isMaxed) toggleCandidate(c.id);
                  }}
                  disabled={isMaxed}
                  aria-pressed={isSelected}
                  data-experience-type={exp.type}
                  className={`flex w-full items-center gap-3 rounded-sm border p-3 pr-14 text-left transition-colors ${
                    isSelected
                      ? 'border-[var(--color-institutional)] bg-[color-mix(in_srgb,var(--color-institutional)_8%,var(--color-paper))]'
                      : 'border-[var(--color-border-editorial)] bg-[var(--color-paper)] hover:border-[var(--color-institutional)]'
                  } ${isMaxed ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-sm bg-[var(--color-skeleton)]">
                    <CandidatePhoto
                      name={c.full_name}
                      photoUrl={c.photo_url}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-mono text-[0.65rem] uppercase tracking-wider text-[var(--color-muted-ink)]">
                        {c.position_label}
                      </p>
                      {exp.type === 'mandato_anterior' ? (
                        <span
                          className="shrink-0 rounded-full border border-[color-mix(in_srgb,var(--color-institutional)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-institutional)_12%,var(--color-paper))] px-1.5 py-0.2 font-mono text-[0.55rem] font-semibold uppercase tracking-wider text-[var(--color-institutional)]"
                          title={exp.tooltip}
                        >
                          Mandato
                        </span>
                      ) : (
                        <span
                          className="shrink-0 rounded-full border border-[var(--color-border-editorial)] bg-[var(--color-paper)] px-1.5 py-0.2 font-mono text-[0.55rem] font-medium uppercase tracking-wider text-[var(--color-muted-ink)]"
                          title={exp.tooltip}
                        >
                          1ª cand.
                        </span>
                      )}
                    </div>
                    <p className="truncate font-semibold">{c.full_name}</p>
                    <p className="font-mono text-xs text-[var(--color-muted-ink)]">
                      {c.party}
                      {c.ballot_number != null
                        ? ` · nº ${c.ballot_number}`
                        : ''}
                    </p>
                  </div>
                  {isSelected && (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-institutional)] text-white shadow-xs">
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  )}
                </button>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20">
                  <SavedCandidateButton
                    candidateName={c.full_name}
                    saved={savedSet.has(candId)}
                    onToggle={() => toggleSaved(candId)}
                  />
                </div>
              </li>
            );
          })}
        </ul>
        )}
      </section>
      {showDocsHint && (
        <p className="mt-6 text-center text-xs text-[var(--color-muted-ink)]">
          Dica: use o filtro de cargo para comparar candidatos de um mesmo mandato.
        </p>
      )}
    </main>
  );
}
