import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CargoSection } from '@/components/candidates/CargoSection';
import { DataFreshness } from '@/components/DataFreshness';
import { CandidateSearch } from '@/components/CandidateSearch';
import {
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

function filterCandidates(
  candidates: CandidateWithClaims[],
  query: string,
  cargoFilter: '' | Position,
  partyFilter: string
): CandidateWithClaims[] {
  const normalized = normalize(query);

  return candidates.filter((c) => {
    if (cargoFilter && c.position !== cargoFilter) return false;
    if (partyFilter && c.party !== partyFilter) return false;
    if (!normalized) return true;

    // Short-circuit evaluations to avoid expensive `normalize` calls
    if (c.party.toLowerCase().includes(normalized)) return true;

    const number = c.ballot_number?.toString() ?? '';
    if (number.includes(normalized)) return true;

    const name = normalize(c.full_name);
    if (name.includes(normalized)) return true;

    const label = normalize(c.position_label);
    return label.includes(normalized);
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

  const filtered = useMemo(
    () => filterCandidates(allCandidates, searchQuery, cargoFilter, partyFilter),
    [allCandidates, searchQuery, cargoFilter, partyFilter]
  );

  const hasActiveFilter = searchQuery !== '' || cargoFilter !== '' || partyFilter !== '';

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
          message="Não foi possível carregar a lista de candidatos."
        />
      </main>
    );
  }

  return (
    <main id="main-content" className="mx-auto max-w-6xl px-4 py-8">
      <DataFreshness
        updatedAt={query.dataUpdatedAt}
        source={usingSnapshotFallback ? 'snapshot' : 'supabase'}
        snapshotCreatedAt={PUBLIC_CANDIDATES_SNAPSHOT.createdAt}
        snapshotScope={PUBLIC_CANDIDATES_SNAPSHOT.scope}
      />

      {claimsDegraded && (
        <div
          role="status"
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
                onQueryChange={setSearchQuery}
                onCargoFilterChange={setCargoFilter}
                onPartyFilterChange={setPartyFilter}
              />
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                onClick={() => downloadCandidatesCSV(allCandidates)}
                className="rounded-sm border border-[var(--color-border-editorial)] px-3 py-2 font-mono text-xs uppercase tracking-wider text-[var(--color-muted-ink)] hover:border-[var(--color-ink)]"
                aria-label="Baixar dados como CSV"
              >
                ↓ CSV
              </button>
              <Link
                to="/comparar"
                className="rounded-sm border border-[var(--color-border-editorial)] px-3 py-2 font-mono text-xs uppercase tracking-wider text-[var(--color-institutional)] hover:border-[var(--color-institutional)]"
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
            </p>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="mt-20 text-center">
          <p className="font-mono text-sm text-[var(--color-muted-ink)]">
            {hasActiveFilter
              ? 'Nenhum candidato encontrado para essa busca.'
              : 'Nenhum candidato está disponível no momento.'}
          </p>
          {hasActiveFilter && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setCargoFilter('');
                setPartyFilter('');
              }}
              className="mt-4 rounded-sm bg-[var(--color-institutional)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
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
            const sections: ReactNode[] = [];
            for (const position of POSITION_ORDER) {
              const candidatesInPosition = grouped.get(position) ?? [];
              if (candidatesInPosition.length === 0 && !hasActiveFilter) continue;
              sections.push(
                <CargoSection
                  key={position}
                  position={position}
                  candidates={candidatesInPosition}
                />
              );
            }
            const outros = grouped.get('outro' as Position);
            if (outros) {
              sections.push(
                <CargoSection
                  key="outro"
                  position={'outro' as Position}
                  candidates={outros}
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
