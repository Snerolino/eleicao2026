import { useEffect, useState } from 'react';
import { CargoSection } from '../components/CargoSection';
import { fetchCandidatesWithSummary, groupByCargo } from '../lib/queries';
import type { CandidateWithSummary } from '../types';

// Ordem de exibição: ajuste conforme os cargos do pleito em curso.
const CARGO_ORDER = ['Governador', 'Senador', 'Deputado Federal', 'Deputado Estadual'];

export function CandidateListPage() {
  const [candidates, setCandidates] = useState<CandidateWithSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCandidatesWithSummary()
      .then(setCandidates)
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="p-8 text-center">Carregando candidatos…</p>;
  }

  if (error) {
    return (
      <p className="p-8 text-center text-red-700">
        Não foi possível carregar os candidatos agora. Tente novamente em instantes.
      </p>
    );
  }

  const byCargo = groupByCargo(candidates);

  return (
    <main className="mx-auto max-w-5xl px-4" style={{ background: 'var(--color-paper)' }}>
      {CARGO_ORDER.filter((cargo) => byCargo[cargo]?.length).map((cargo) => (
        <CargoSection key={cargo} cargo={cargo} candidates={byCargo[cargo]} />
      ))}
    </main>
  );
}
