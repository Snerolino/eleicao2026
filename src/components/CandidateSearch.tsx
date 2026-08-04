import { useMemo, useEffect, useRef } from 'react';
import type { CandidateWithClaims, Position } from '@/types/election';
import { POSITION_LABEL } from '@/types/election';

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        if (
          document.activeElement?.tagName === 'INPUT' ||
          document.activeElement?.tagName === 'TEXTAREA' ||
          document.activeElement?.tagName === 'SELECT' ||
          (document.activeElement as HTMLElement)?.isContentEditable
        ) {
          return;
        }
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const { positions, parties } = useMemo(() => {
    const posSet = new Set<Position>();
    const partySet = new Set<string>();

    for (const c of candidates) {
      posSet.add(c.position);
      partySet.add(c.party);
    }

    const order: Position[] = ['governador', 'senador', 'deputado_federal', 'deputado_estadual'];
    const sortedPositions = [...posSet].sort((a, b) => order.indexOf(a) - order.indexOf(b));
    const sortedParties = [...partySet].sort();

    return { positions: sortedPositions, parties: sortedParties };
  }, [candidates]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <div className="relative flex-1 sm:min-w-[260px]">
        <label htmlFor="candidate-search" className="sr-only">
          Buscar candidatos
        </label>
        <input
          ref={inputRef}
          id="candidate-search"
          type="search"
          placeholder="Buscar por nome, partido, nº…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="w-full rounded-sm border border-[var(--color-border-editorial)] bg-[var(--color-paper)] pl-3 pr-8 py-2 text-sm font-[family-name:var(--font-body)] text-[var(--color-ink)] placeholder:text-[var(--color-muted-ink)] focus:border-[var(--color-institutional)] focus:outline-none"
          autoComplete="off"
        />
        {!query && (
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-ink)] opacity-60" aria-hidden="true">
            <kbd className="rounded-[3px] border border-[var(--color-border-editorial)] bg-[var(--color-skeleton)] px-1.5 py-0.5 font-mono text-[0.6rem] font-medium">/</kbd>
          </div>
        )}
        {query && (
          <button
            type="button"
            onClick={() => {
              onQueryChange('');
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-ink)] hover:text-[var(--color-ink)]"
            aria-label="Limpar busca"
          >
            ✕
          </button>
        )}
      </div>

      <select
        value={cargoFilter}
        onChange={(e) => onCargoFilterChange(e.target.value as '' | Position)}
        className="cursor-pointer rounded-sm border border-[var(--color-border-editorial)] bg-[var(--color-paper)] px-3 py-2 text-sm font-[family-name:var(--font-body)] text-[var(--color-ink)] focus:border-[var(--color-institutional)] focus:outline-none"
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
        className="cursor-pointer rounded-sm border border-[var(--color-border-editorial)] bg-[var(--color-paper)] px-3 py-2 text-sm font-[family-name:var(--font-body)] text-[var(--color-ink)] focus:border-[var(--color-institutional)] focus:outline-none"
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
