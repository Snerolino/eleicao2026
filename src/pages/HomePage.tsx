import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { CargoSection } from '@/components/candidates/CargoSection';
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

function normalize(text: string) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

interface CandidateSearchCache {
  partyLower?: string;
  nameNormalized?: string;
  labelNormalized?: string;
}

function filterCandidates(
  candidates: CandidateWithClaims[],
  cache: Map<string, CandidateSearchCache>,
  query: string,
  cargoFilter: '' | Position,
  partyFilter: string,
  womenOnly: boolean,
  raceFilter: string
): CandidateWithClaims[] {
  const normalized = normalize(query);

  return candidates.filter((c) => {
    if (cargoFilter && c.position !== cargoFilter) return false;
    if (partyFilter && c.party !== partyFilter) return false;
    if (womenOnly && c.gender !== 'FEMININO') return false;
    if (raceFilter && (c.race ?? 'NÃO INFORMADO') !== raceFilter) return false;
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
  const [cargoFilter, setCargoFilter] = useState<'' | Position>('');
  const [partyFilter, setPartyFilter] = useState('');
  const [womenOnly, setWomenOnly] = useState(false);
  const [raceFilter, setRaceFilter] = useState('');

  const query = useQuery<CandidateWithClaims[]>({
    queryKey: ['candidates'],
    queryFn: fetchAllCandidates,
    staleTime: 60_000,
    retry: 2,
    refetchOnWindowFocus: true
  });

  const allCandidates = query.data ?? [];
  const claimsDegraded = query.isSuccess && wasLastClaimsFetchDegraded();
  const usingSnapshotFallback = query.isSuccess && wasLastCandidatesFetchFromSnapshot();

  const searchCache = useMemo(() => new Map<string, CandidateSearchCache>(), [allCandidates]);

  const filtered = useMemo(
    () => filterCandidates(allCandidates, searchCache, searchQuery, cargoFilter, partyFilter, womenOnly, raceFilter),
    [allCandidates, searchCache, searchQuery, cargoFilter, partyFilter, womenOnly, raceFilter]
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

  function openCargo(position: Position) {
    setSearchQuery('');
    setPartyFilter('');
    setWomenOnly(false);
    setRaceFilter('');
    setCargoFilter(position);

    const scrollToCargo = () => {
      const section = document.getElementById(`cargo-${position}`);
      if (typeof section?.scrollIntoView !== 'function') return;
      section.scrollIntoView({
        block: 'start',
        behavior: 'smooth',
      });
    };
    if (typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(scrollToCargo);
    } else {
      window.setTimeout(scrollToCargo, 0);
    }
  }

  const hasActiveFilter = searchQuery !== '' || cargoFilter !== '' || partyFilter !== '' || womenOnly || raceFilter !== '';

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
          message="Não foi possível confirmar a lista oficial agora. Tente novamente em instantes."
        />
      </main>
    );
  }

  return (
    <main id="main-content" className="mx-auto max-w-6xl px-4 py-8">
      <section className="mb-6 max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-muted-ink)]">
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
                onQueryChange={setSearchQuery}
                onCargoFilterChange={setCargoFilter}
                onPartyFilterChange={setPartyFilter}
                onWomenOnlyChange={setWomenOnly}
                onRaceFilterChange={setRaceFilter}
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
                Comparar candidatos ↗
              </Link>
            </div>
          </div>
          {hasActiveFilter && (
            <p aria-live="polite" className="mt-2 font-mono text-xs text-[var(--color-muted-ink)]">
              {filtered.length} de {allCandidates.length} candidatos
              {searchQuery && ` para "${searchQuery}"`}
              {cargoFilter && ` em ${POSITION_LABEL[cargoFilter as keyof typeof POSITION_LABEL]?.toLowerCase() ?? cargoFilter}`}
              {partyFilter && ` do ${partyFilter}`}
              {womenOnly && ' · mulheres'}
              {raceFilter && ` · cor/raça ${raceFilter.toLowerCase()}`}
            </p>
          )}
          {visiblePositions.length > 0 && (
            <nav
              aria-label="Atalhos por cargo"
              className="flex flex-wrap gap-2 border-t border-dashed border-[var(--color-border-editorial)] pt-4"
            >
              {visiblePositions.map((position) => (
                <button
                  key={position}
                  type="button"
                  onClick={() => openCargo(position)}
                  className={`rounded-sm border px-3 py-2 text-left font-mono text-xs uppercase tracking-wider transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-institutional)] ${
                    cargoFilter === position
                      ? 'border-[var(--color-institutional)] bg-[color-mix(in_srgb,var(--color-institutional)_10%,var(--color-paper))] text-[var(--color-institutional)]'
                      : 'border-[var(--color-border-editorial)] text-[var(--color-muted-ink)] hover:border-[var(--color-institutional)] hover:text-[var(--color-ink)]'
                  }`}
                >
                  <span>{POSITION_LABEL[position]}</span>{' '}
                  <span aria-label={`${cargoCounts.get(position) ?? 0} candidatos`}>
                    {cargoCounts.get(position) ?? 0}
                  </span>
                </button>
              ))}
            </nav>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="mt-20 text-center">
          {hasActiveFilter ? (
            <p className="font-mono text-sm text-[var(--color-muted-ink)]">
              Nenhum candidato corresponde aos filtros atuais.
            </p>
          ) : (
            <EmptyState ariaLabel="Estado da lista">
              <p>
                Nenhuma candidatura oficial encontrada na fonte atual.
              </p>
              <p className="mt-2">
                Isso indica snapshot oficial vazio, não erro de conexão. Verifique a origem dos dados no pipeline TSE.
              </p>
            </EmptyState>
          )}
          {hasActiveFilter && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setCargoFilter('');
                setPartyFilter('');
                setWomenOnly(false);
                setRaceFilter('');
              }}
                className="mt-4 rounded-sm bg-[var(--color-institutional)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-institutional)]"
            >
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <section className="mt-8 space-y-12">
          {(() => {
            const grouped = new Map<Position, CandidateWithClaims[]>();
            for (const c of filtered) {
              const g = grouped.get(c.position);
              if (g) g.push(c);
              else grouped.set(c.position, [c]);
            }
            const sections = [];
            const positionsToRender = cargoFilter ? [cargoFilter] : visiblePositions;
            for (const position of positionsToRender) {
              const candidatesInPosition = grouped.get(position) ?? [];
              if (candidatesInPosition.length === 0) continue;
              sections.push(
                <CargoSection
                  key={position}
                  position={position}
                  candidates={candidatesInPosition}
                />
              );
            }
            return sections;
          })()}
        </section>
      )}
    </main>
  );
}
