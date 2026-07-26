import type { CandidateWithClaims, Position } from '@/types/election';
import { POSITION_LABEL } from '@/types/election';

interface CandidateSearchProps {
  candidates: CandidateWithClaims[];
  query: string;
  cargoFilter: '' | Position;
  onQueryChange: (value: string) => void;
  onCargoFilterChange: (value: '' | Position) => void;
}

export function CandidateSearch({
  candidates,
  query,
  cargoFilter,
  onQueryChange,
  onCargoFilterChange,
}: CandidateSearchProps) {
  const positions = [...new Set(candidates.map((c) => c.position))].sort((a, b) => {
    const order: Position[] = ['governador', 'senador', 'deputado_federal', 'deputado_estadual'];
    return order.indexOf(a) - order.indexOf(b);
  });

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <label htmlFor="candidate-search" className="sr-only">
          Buscar candidatos
        </label>
        <input
          id="candidate-search"
          type="search"
          placeholder="Buscar por nome, partido, nº ou cargo…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="w-full rounded-sm border border-[var(--color-border-editorial)] bg-white px-3 py-2 text-sm font-[family-name:var(--font-body)] text-[var(--color-ink)] placeholder:text-[var(--color-muted-ink)] focus:border-[var(--color-institutional)] focus:outline-none"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-muted-ink)] hover:text-[var(--color-ink)]"
            aria-label="Limpar busca"
          >
            ✕
          </button>
        )}
      </div>

      <select
        value={cargoFilter}
        onChange={(e) => onCargoFilterChange(e.target.value as '' | Position)}
        className="cursor-pointer rounded-sm border border-[var(--color-border-editorial)] bg-white px-3 py-2 text-sm font-[family-name:var(--font-body)] text-[var(--color-ink)] focus:border-[var(--color-institutional)] focus:outline-none"
        aria-label="Filtrar por cargo"
      >
        <option value="">Todos os cargos</option>
        {positions.map((p) => (
          <option key={p} value={p}>
            {POSITION_LABEL[p]}
          </option>
        ))}
      </select>
    </div>
  );
}
