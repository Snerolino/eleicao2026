import { useRef, useMemo } from 'react';
import type { CandidateWithClaims, Position } from '@/types/election';
import { POSITION_LABEL } from '@/types/election';
import { Search, X } from 'lucide-react';

interface CandidateSearchProps {
  candidates: CandidateWithClaims[];
  query: string;
  cargoFilter: '' | Position;
  partyFilter: string;
  onQueryChange: (value: string) => void;
  onCargoFilterChange: (value: '' | Position) => void;
  onPartyFilterChange: (value: string) => void;
}

export function CandidateSearch({
  candidates,
  query,
  cargoFilter,
  partyFilter,
  onQueryChange,
  onCargoFilterChange,
  onPartyFilterChange,
}: CandidateSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const positions = useMemo(() => [...new Set(candidates.map((c) => c.position))].sort((a, b) => {
    const order: Position[] = ['governador', 'senador', 'deputado_federal', 'deputado_estadual'];
    return order.indexOf(a) - order.indexOf(b);
  }), [candidates]);

  const parties = useMemo(() => [...new Set(candidates.map((c) => c.party))].sort(), [candidates]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <div className="relative flex-1 sm:min-w-[260px]">
        <label htmlFor="candidate-search" className="sr-only">
          Buscar candidatos
        </label>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--color-muted-ink)]">
          <Search size={16} aria-hidden="true" />
        </div>
        <input
          ref={inputRef}
          id="candidate-search"
          type="search"
          placeholder="Buscar por nome, partido, nº…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="w-full rounded-sm border border-[var(--color-border-editorial)] bg-white py-2 pl-9 pr-8 text-sm font-[family-name:var(--font-body)] text-[var(--color-ink)] placeholder:text-[var(--color-muted-ink)] focus:border-[var(--color-institutional)] focus:outline-none"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => { onQueryChange(''); inputRef.current?.focus(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-[var(--color-muted-ink)] transition-colors hover:bg-[var(--color-skeleton)] hover:text-[var(--color-ink)]"
            aria-label="Limpar busca"
          >
            <X size={14} aria-hidden="true" />
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

      <select
        value={partyFilter}
        onChange={(e) => onPartyFilterChange(e.target.value)}
        className="cursor-pointer rounded-sm border border-[var(--color-border-editorial)] bg-white px-3 py-2 text-sm font-[family-name:var(--font-body)] text-[var(--color-ink)] focus:border-[var(--color-institutional)] focus:outline-none"
        aria-label="Filtrar por partido"
      >
        <option value="">Todos os partidos</option>
        {parties.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
    </div>
  );
}
