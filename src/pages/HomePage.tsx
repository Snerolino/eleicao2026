import { useQuery } from '@tanstack/react-query';
import { CargoSection } from '@/components/candidates/CargoSection';
import { DataFreshness } from '@/components/DataFreshness';
import {
  EmptyState,
  ErrorState,
  LoadingSkeleton
} from '@/components/states';
import { fetchAllCandidates } from '@/services/candidates';
import {
  POSITION_ORDER,
  type CandidateWithClaims,
  type Position
} from '@/types/election';
import { usePageMetadata } from '@/hooks/usePageMetadata';

export function HomePage() {
  usePageMetadata(
    'Candidatos 2026 — Portal Transparência Eleitoral RS',
    'Lista de candidatos das eleições de 2026 no Rio Grande do Sul, com fontes e níveis de confiança.'
  );

  const query = useQuery<CandidateWithClaims[]>({
    queryKey: ['candidates'],
    queryFn: fetchAllCandidates,
    staleTime: 60_000,
    retry: 2,
    refetchOnWindowFocus: true
  });

  if (query.isLoading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <LoadingSkeleton label="Carregando lista de candidatos" />
      </main>
    );
  }

  if (query.isError) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <ErrorState
          onRetry={() => query.refetch()}
          message="Não foi possível carregar a lista de candidatos."
        />
      </main>
    );
  }

  const candidates = query.data ?? [];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <DataFreshness updatedAt={query.dataUpdatedAt} />

      {candidates.length === 0 ? (
        <div className="mt-8">
          <EmptyState>
            Nenhum candidato está disponível no momento.
          </EmptyState>
        </div>
      ) : (
        <div className="mt-8 space-y-12">
          {POSITION_ORDER.map((position) => (
            <CargoSection
              key={position}
              position={position}
              candidates={candidates.filter(
                (candidate) => candidate.position === position
              )}
            />
          ))}

          {candidates.some(
            (candidate) => candidate.position === 'outro'
          ) && (
            <CargoSection
              position={'outro' as Position}
              candidates={candidates.filter(
                (candidate) => candidate.position === 'outro'
              )}
            />
          )}
        </div>
      )}
    </main>
  );
}
