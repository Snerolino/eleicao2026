import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { CargoNavigation } from '@/components/candidates/CargoNavigation';
import { CandidateCompactRow } from '@/components/candidates/CandidateCompactRow';
import { CandidateViewToggle, type CandidateViewMode } from '@/components/candidates/CandidateViewToggle';
import { CandidateCard } from '@/components/candidates/CandidateCard';
import { DataFreshness } from '@/components/DataFreshness';
import { CandidateSearch } from '@/components/CandidateSearch';
import {
  EmptyState,
  ErrorState,
  LoadingSkeleton
} from '@/components/states';
import {
  fetchAllCandidates,
  wasLastCandidatesFetchFromSnapshot,
  wasLastClaimsFetchDegraded
} from '@/services/candidates';
import { PUBLIC_CANDIDATES_SNAPSHOT } from '@/services/publicCandidates';
import { downloadCandidatesCSV } from '@/utils/download';
import {
  POSITION_ORDER,
  POSITION_LABEL,
  type CandidateWithClaims,
  type Position
} from '@/types/election';
import { usePageMetadata } from '@/hooks/usePageMetadata';
import { useSavedCandidates } from '@/hooks/useSavedCandidates';

import { type CandidateExperienceFilter, hasPreviousMandate } from '@/utils/candidateExperience';

function normalize(text: string) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

interface CandidateSearchCache {
  partyLower?: string;
  nameNormalized?: string;
  labelNormalized?: string;
}

const EMPTY_CANDIDATES: CandidateWithClaims[] = [];

function filterCandidates(
  candidates: CandidateWithClaims[],
  cache: Map<string, CandidateSearchCache>,
  query: string,
  cargoFilter: '' | Position,
  partyFilter: string,
  womenOnly: boolean,
  raceFilter: string,
  experienceFilter: CandidateExperienceFilter = ''
): CandidateWithClaims[] {
  const normalized = normalize(query);

  return candidates.filter((c) => {
    if (cargoFilter && c.position !== cargoFilter) return false;
    if (partyFilter && c.party !== partyFilter) return false;
    if (womenOnly && c.gender !== 'FEMININO') return false;
    if (raceFilter && (c.race ?? 'NÃO INFORMADO') !== raceFilter) return false;
    if (experienceFilter === 'mandato_anterior' && !hasPreviousMandate(c)) return false;
    if (experienceFilter === 'estreante' && hasPreviousMandate(c)) return false;
    if (!normalized) return true;

    let cached = cache.get(c.id);
    if (!cached) {
      cached = {};
      cache.set(c.id, cached);
    }

    if (cached.partyLower === undefined) {
      cached.partyLower = c.party.toLowerCase();
    }
    if (cached.partyLower.includes(normalized)) return true;

    const number = c.ballot_number?.toString() ?? '';
    if (number.includes(normalized)) return true;

    if (cached.nameNormalized === undefined) {
      cached.nameNormalized = normalize(c.full_name);
    }
    if (cached.nameNormalized.includes(normalized)) return true;

    if (cached.labelNormalized === undefined) {
      cached.labelNormalized = normalize(c.position_label);
    }
    return cached.labelNormalized.includes(normalized);
  });
}

export function HomePage() {
  usePageMetadata(
    'Candidatos 2026 — Portal Transparência Eleitoral RS',
    'Lista de candidatos das eleições de 2026 no Rio Grande do Sul, com fontes e níveis de confiança.'
  );

  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [cargoFilter, setCargoFilter] = useState<'' | Position>('');
  const [partyFilter, setPartyFilter] = useState('');
  const [womenOnly, setWomenOnly] = useState(false);
  const [raceFilter, setRaceFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState<CandidateExperienceFilter>('');
  const [selectedPosition, setSelectedPosition] = useState<Position | 'saved' | ''>('');
  const [browseAllCandidates, setBrowseAllCandidates] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(60);
  const [viewMode, setViewMode] = useState<CandidateViewMode>(() => {
    try {
      return window.localStorage.getItem('votopraquem:candidate-view-mode:v1') === 'compact' ? 'compact' : 'detailed';
    } catch {
      return 'detailed';
    }
  });

  const query = useQuery<CandidateWithClaims[]>({
    queryKey: ['candidates'],
    queryFn: fetchAllCandidates,
    staleTime: 60_000,
    retry: 2,
    refetchOnWindowFocus: true
  });

  const allCandidates = query.data ?? EMPTY_CANDIDATES;
  const validCandidateIds = useMemo(() => new Set(allCandidates.map((candidate) => candidate.tse_candidate_id ?? candidate.id)), [allCandidates]);
  const { savedIds, savedSet, toggleSaved, clearSaved } = useSavedCandidates(validCandidateIds, query.isSuccess);
  const claimsDegraded = query.isSuccess && wasLastClaimsFetchDegraded();
  const usingSnapshotFallback = query.isSuccess && wasLastCandidatesFetchFromSnapshot();

  const searchCache = useMemo(() => new Map<string, CandidateSearchCache>(), [allCandidates]);

  const filtered = useMemo(
    () => filterCandidates(allCandidates, searchCache, deferredSearchQuery, cargoFilter, partyFilter, womenOnly, raceFilter, experienceFilter),
    [allCandidates, searchCache, deferredSearchQuery, cargoFilter, partyFilter, womenOnly, raceFilter, experienceFilter]
  );

  const cargoCounts = useMemo(() => {
    const counts = new Map<Position, number>();
    for (const candidate of allCandidates) {
      counts.set(candidate.position, (counts.get(candidate.position) ?? 0) + 1);
    }
    return counts;
  }, [allCandidates]);

  const visiblePositions = useMemo(() => {
    const ordered = POSITION_ORDER.filter((position) => cargoCounts.has(position));
    if (cargoCounts.has('outro')) ordered.push('outro');
    return ordered;
  }, [cargoCounts]);

  const selectedCandidates = useMemo(() => {
    if (selectedPosition === 'saved') return filtered.filter((candidate) => savedSet.has(candidate.tse_candidate_id ?? candidate.id));
    return filtered;
  }, [filtered, savedSet, selectedPosition]);

  const selectedGroups = useMemo(() => {
    const grouped = new Map<Position, CandidateWithClaims[]>();
    for (const candidate of selectedCandidates) {
      const current = grouped.get(candidate.position) ?? [];
      current.push(candidate);
      grouped.set(candidate.position, current);
    }
    return grouped;
  }, [selectedCandidates]);

  useEffect(() => {
    setVisibleCount(60);
  }, [deferredSearchQuery, cargoFilter, partyFilter, womenOnly, raceFilter, selectedPosition, viewMode]);

  function changeViewMode(mode: CandidateViewMode) {
    setViewMode(mode);
    try {
      window.localStorage.setItem('votopraquem:candidate-view-mode:v1', mode);
    } catch {
      // Optional persistence.
    }
  }

  const hasActiveFilter = searchQuery !== '' || cargoFilter !== '' || partyFilter !== '' || womenOnly || raceFilter !== '' || experienceFilter !== '';

  if (query.isLoading) {
    return (
      <main id="main-content" className="mx-auto max-w-6xl px-4 py-8">
        <LoadingSkeleton label="Carregando lista de candidatos" />
      </main>
    );
  }

  if (query.isError) {
    return (
      <main id="main-content" className="mx-auto max-w-6xl px-4 py-8">
        <ErrorState
          onRetry={() => query.refetch()}
          title="Indisponibilidade temporária"
        />
      </main>
    );
  }

  return (
    <main id="main-content" className="mx-auto max-w-6xl px-4 py-8">
      <section className="mb-6 border-b border-[var(--color-border-editorial)] pb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-muted-ink)]">
          Eleições 2026 · Rio Grande do Sul
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl">
          Candidatos 2026 no Rio Grande do Sul
        </h1>
        <p className="mt-3 leading-relaxed text-[var(--color-muted-ink)]">
          Consulta pública com candidaturas oficiais, fontes visíveis e estados de dados auditáveis.
        </p>
      </section>

      <DataFreshness
        updatedAt={query.dataUpdatedAt}
        source={usingSnapshotFallback ? 'snapshot' : 'supabase'}
        snapshotCreatedAt={PUBLIC_CANDIDATES_SNAPSHOT.createdAt}
        snapshotScope={PUBLIC_CANDIDATES_SNAPSHOT.scope}
      />

      {claimsDegraded && (
        <div
          role="status"
          aria-label="Editoria indisponível"
          aria-live="polite"
          className="mb-4 rounded-sm border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          Informações editoriais temporariamente indisponíveis. A lista oficial de candidatos continua disponível.
        </div>
      )}

      {allCandidates.length > 0 && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex-1 space-y-4">
              <CandidateSearch
                candidates={allCandidates}
                query={searchQuery}
                cargoFilter={cargoFilter}
                partyFilter={partyFilter}
                womenOnly={womenOnly}
                raceFilter={raceFilter}
                experienceFilter={experienceFilter}
                onQueryChange={setSearchQuery}
                onCargoFilterChange={setCargoFilter}
                onPartyFilterChange={setPartyFilter}
                onWomenOnlyChange={setWomenOnly}
                onRaceFilterChange={setRaceFilter}
                onExperienceFilterChange={setExperienceFilter}
                showCargoFilter={false}
                showSecondaryFilters={filtersOpen}
              />
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                onClick={() => downloadCandidatesCSV(allCandidates)}
                className="rounded-sm border border-[var(--color-border-editorial)] px-3 py-2 font-mono text-xs uppercase tracking-wider text-[var(--color-muted-ink)] hover:border-[var(--color-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-institutional)]"
                aria-label="Baixar dados como CSV"
              >
                ↓ CSV
              </button>
              <Link
                to="/comparar"
                className="rounded-sm border border-[var(--color-border-editorial)] px-3 py-2 font-mono text-xs uppercase tracking-wider text-[var(--color-institutional)] hover:border-[var(--color-institutional)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-institutional)]"
              >
                Comparar candidatos <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
          <CargoNavigation
            positions={visiblePositions}
            counts={cargoCounts}
            selected={selectedPosition}
            savedCount={savedIds.length}
            onSelect={(selection) => {
              setBrowseAllCandidates(true);
              setSelectedPosition(selection);
              setCargoFilter(selection === '' || selection === 'saved' ? '' : selection);
            }}
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CandidateViewToggle value={viewMode} onChange={changeViewMode} />
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen} className="font-mono text-xs uppercase tracking-wider text-[var(--color-muted-ink)] underline underline-offset-4">{filtersOpen ? 'Ocultar filtros' : 'Filtros'}</button>
              {selectedPosition === 'saved' ? <button type="button" onClick={clearSaved} className="font-mono text-xs uppercase tracking-wider text-[var(--color-muted-ink)] underline underline-offset-4">Limpar salvos</button> : null}
            </div>
          </div>
          {hasActiveFilter && (
            <p aria-live="polite" className="mt-2 font-mono text-xs text-[var(--color-muted-ink)]">
              {filtered.length} de {allCandidates.length} candidatos
              {deferredSearchQuery && ` para "${deferredSearchQuery}"`}
              {cargoFilter && ` em ${POSITION_LABEL[cargoFilter as keyof typeof POSITION_LABEL]?.toLowerCase() ?? cargoFilter}`}
              {partyFilter && ` do ${partyFilter}`}
              {womenOnly && ' · mulheres'}
              {raceFilter && ` · cor/raça ${raceFilter.toLowerCase()}`}
              {experienceFilter === 'mandato_anterior' && ' · com mandato anterior'}
              {experienceFilter === 'estreante' && ' · 1ª candidatura / estreantes'}
            </p>
          )}
        </div>
      )}

      {selectedCandidates.length === 0 ? (
        <div className="mt-20 text-center">
          {hasActiveFilter || selectedPosition === 'saved' ? <p className="font-mono text-sm text-[var(--color-muted-ink)]">{selectedPosition === 'saved' ? 'Nenhum candidato salvo neste navegador.' : 'Nenhum candidato corresponde aos filtros atuais.'}</p> : <EmptyState ariaLabel="Estado da lista"><p>Nenhuma candidatura oficial encontrada na fonte atual.</p><p className="mt-2">Isso indica snapshot oficial vazio, não erro de conexão. Verifique a origem dos dados no pipeline TSE.</p></EmptyState>}
          {(hasActiveFilter || selectedPosition === 'saved') ? <button type="button" onClick={() => { setSearchQuery(''); setCargoFilter(''); setSelectedPosition(''); setBrowseAllCandidates(false); setPartyFilter(''); setWomenOnly(false); setRaceFilter(''); setExperienceFilter(''); }} className="mt-4 rounded-sm bg-[var(--color-institutional)] px-4 py-2 text-sm font-semibold text-white">Limpar seleção</button> : null}
        </div>
      ) : selectedPosition === '' && !browseAllCandidates && !hasActiveFilter ? (
        <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Resumo por cargo">
          {visiblePositions.map((position) => <article key={position} className="border border-[var(--color-border-editorial)] p-5"><p className="font-mono text-xs uppercase tracking-widest text-[var(--color-muted-ink)]">{POSITION_LABEL[position]}</p><strong className="mt-2 block text-3xl">{cargoCounts.get(position) ?? 0}</strong><p className="text-sm text-[var(--color-muted-ink)]">candidatos</p><button type="button" onClick={() => { setBrowseAllCandidates(true); setSelectedPosition(position); setCargoFilter(position); }} className="mt-4 font-mono text-xs uppercase tracking-wider text-[var(--color-institutional)] underline underline-offset-4">Ver candidatos →</button></article>)}
        </section>
      ) : (
        <section className="mt-8 space-y-8">
          {[...selectedGroups.entries()].map(([position, candidatesInPosition]) => {
            const visibleCandidates = candidatesInPosition.slice(0, visibleCount);
            return <section key={position} id={`cargo-${position}`} aria-labelledby={`cargo-heading-${position}`} className="space-y-4"><header className="flex items-baseline justify-between gap-4 border-b border-[var(--color-border-editorial)] pb-2"><h2 id={`cargo-heading-${position}`} className="text-2xl">{position === 'outro' ? candidatesInPosition[0]?.position_label : POSITION_LABEL[position]}</h2><span className="font-mono text-xs uppercase tracking-wider text-[var(--color-muted-ink)]">{candidatesInPosition.length} candidatos</span></header>{viewMode === 'compact' ? <div className="border-t border-[var(--color-border-editorial)]">{visibleCandidates.map((candidate) => <CandidateCompactRow key={candidate.id} candidate={candidate} saved={savedSet.has(candidate.tse_candidate_id ?? candidate.id)} onToggleSaved={toggleSaved} />)}</div> : <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">{visibleCandidates.map((candidate) => <CandidateCard key={candidate.id} candidate={candidate} />)}</div>}{visibleCandidates.length < candidatesInPosition.length ? <div className="flex flex-col items-center gap-2 pt-4"><p className="font-mono text-xs text-[var(--color-muted-ink)]">Mostrando {visibleCandidates.length} de {candidatesInPosition.length}</p><button type="button" onClick={() => setVisibleCount((count) => count + 60)} className="rounded-sm border border-[var(--color-institutional)] px-4 py-2 font-mono text-xs uppercase tracking-wider text-[var(--color-institutional)]">Mostrar mais 60</button></div> : null}</section>;
          })}
        </section>
      )}
    </main>
  );
}
