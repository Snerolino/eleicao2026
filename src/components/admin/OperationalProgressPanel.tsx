import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { HouseProgress, LegislativeHouse, SharedEditorialProgress } from '@/domain/impact/operationalProgress';

type House = LegislativeHouse;
type SharedProgress = SharedEditorialProgress;

const HOUSES: Array<{ id: House; label: string }> = [
  { id: 'alrs', label: 'Assembleia Legislativa (ALRS)' },
  { id: 'camara', label: 'Câmara dos Deputados' },
  { id: 'senado', label: 'Senado Federal' },
];

const EMPTY_SHARED: SharedProgress = {
  pendingDispositions: null,
  approvedDispositions: null,
  pendingMatrices: null,
  approvedMatrices: null,
  assessments: null,
};

function countValue(count: number | null) {
  return count === null ? '—' : count.toLocaleString('pt-BR');
}

export function OperationalProgressPanel() {
  const [houses, setHouses] = useState<HouseProgress[]>([]);
  const [shared, setShared] = useState<SharedProgress>(EMPTY_SHARED);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!supabase) return;
    const client = supabase as any;
    setLoading(true);
    setError(null);
    const safe = async (query: () => Promise<any>) => {
      try {
        return await query();
      } catch (caught) {
        return { count: null, error: { message: caught instanceof Error ? caught.message : 'consulta indisponível' } };
      }
    };
    const houseResults = await Promise.all(HOUSES.map(async ({ id }) => {
      const [events, votes, profiles] = await Promise.all([
        safe(() => client.from('voting_events').select('id', { count: 'exact', head: true }).eq('house', id)),
        safe(() => client.from('legislative_votes').select('id, voting_events!inner(house)', { count: 'exact', head: true }).eq('voting_events.house', id)),
        safe(() => client.from('legislator_vote_profile').select('candidate_id', { count: 'exact', head: true }).eq('house', id)),
      ]);
      const firstError = events.error ?? votes.error ?? profiles.error;
      return {
        house: id,
        events: events.count ?? null,
        votes: votes.count ?? null,
        profiles: profiles.count ?? null,
        error: firstError?.message,
      } satisfies HouseProgress;
    }));

    const [pendingDispositions, approvedDispositions, pendingMatrices, approvedMatrices, assessments] = await Promise.all([
      safe(() => client.from('impact_editorial_dispositions').select('id', { count: 'exact', head: true }).eq('status', 'pending_review')),
      safe(() => client.from('impact_editorial_dispositions').select('id', { count: 'exact', head: true }).eq('status', 'approved')),
      safe(() => client.from('impact_matrices').select('id', { count: 'exact', head: true }).eq('review_status', 'pending_review')),
      safe(() => client.from('impact_matrices').select('id', { count: 'exact', head: true }).eq('review_status', 'approved')),
      safe(() => client.from('impact_assessments').select('id', { count: 'exact', head: true })),
    ]);
    const sharedErrors = [pendingDispositions, approvedDispositions, pendingMatrices, approvedMatrices, assessments].filter((result) => result.error);
    setHouses(houseResults);
    setShared({
      pendingDispositions: pendingDispositions.count ?? null,
      approvedDispositions: approvedDispositions.count ?? null,
      pendingMatrices: pendingMatrices.count ?? null,
      approvedMatrices: approvedMatrices.count ?? null,
      assessments: assessments.count ?? null,
    });
    setUpdatedAt(new Date().toISOString());
    setError(houseResults.find((item) => item.error)?.error ?? sharedErrors[0]?.error?.message ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="mt-6 rounded-md border-2 border-[var(--color-ink)] bg-[var(--color-paper)] p-5" aria-label="Evolução operacional por casa legislativa">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-muted-ink)]">Acompanhamento ao vivo</p>
          <h2 className="mt-2 text-2xl">Evolução por casa legislativa</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--color-muted-ink)]">
            Contagens lidas do Supabase. Votos e perfis são separados da fila editorial compartilhada; nenhum item pendente é tratado como publicado.
          </p>
        </div>
        <button type="button" onClick={() => void load()} disabled={loading} className="rounded-sm border border-[var(--color-border-editorial)] px-3 py-2 font-mono text-xs uppercase tracking-wider disabled:opacity-60">
          {loading ? 'Atualizando…' : 'Atualizar agora'}
        </button>
      </div>

      {error ? <p className="mt-4 rounded-sm border border-amber-700 bg-amber-50 px-3 py-2 text-sm text-amber-950" role="alert">Algumas contagens não puderam ser lidas: {error}</p> : null}

      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {houses.map((item) => {
          const label = HOUSES.find((house) => house.id === item.house)?.label ?? item.house;
          return (
            <article key={item.house} className="rounded-sm border border-[var(--color-border-editorial)] p-4">
              <h3 className="font-semibold">{label}</h3>
              <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div><dt className="font-mono text-[0.65rem] uppercase text-[var(--color-muted-ink)]">eventos</dt><dd className="mt-1 text-lg font-semibold">{countValue(item.events)}</dd></div>
                <div><dt className="font-mono text-[0.65rem] uppercase text-[var(--color-muted-ink)]">votos</dt><dd className="mt-1 text-lg font-semibold">{countValue(item.votes)}</dd></div>
                <div><dt className="font-mono text-[0.65rem] uppercase text-[var(--color-muted-ink)]">perfis</dt><dd className="mt-1 text-lg font-semibold">{countValue(item.profiles)}</dd></div>
              </dl>
            </article>
          );
        })}
      </div>

      <div className="mt-5 border-t border-[var(--color-border-editorial)] pt-4">
        <h3 className="font-semibold">Fila editorial compartilhada</h3>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
          <div><dt className="text-[var(--color-muted-ink)]">disposições pendentes</dt><dd className="font-semibold">{countValue(shared.pendingDispositions)}</dd></div>
          <div><dt className="text-[var(--color-muted-ink)]">disposições aprovadas</dt><dd className="font-semibold">{countValue(shared.approvedDispositions)}</dd></div>
          <div><dt className="text-[var(--color-muted-ink)]">matrizes pendentes</dt><dd className="font-semibold">{countValue(shared.pendingMatrices)}</dd></div>
          <div><dt className="text-[var(--color-muted-ink)]">matrizes aprovadas</dt><dd className="font-semibold">{countValue(shared.approvedMatrices)}</dd></div>
          <div><dt className="text-[var(--color-muted-ink)]">assessments</dt><dd className="font-semibold">{countValue(shared.assessments)}</dd></div>
        </dl>
      </div>
      <p className="mt-4 font-mono text-[0.68rem] uppercase tracking-wider text-[var(--color-muted-ink)]">
        {updatedAt ? `Última leitura: ${new Date(updatedAt).toLocaleString('pt-BR')}` : 'Aguardando leitura'} · score só após assessment e matriz aprovados
      </p>
    </section>
  );
}
