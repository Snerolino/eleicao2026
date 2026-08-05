import { useMemo } from 'react';
import type { CandidateWithClaims, Position } from '@/types/election';
import { POSITION_LABEL } from '@/types/election';

interface CandidateSearchProps {
  candidates: CandidateWithClaims[];
  query: string;
  cargoFilter: '' | Position;
  partyFilter: string;
  womenOnly: boolean;
  raceFilter: string;
  onQueryChange: (value: string) => void;
  onCargoFilterChange: (value: '' | Position) => void;
  onPartyFilterChange: (value: string) => void;
  onWomenOnlyChange: (value: boolean) => void;
  onRaceFilterChange: (value: string) => void;
}

const OFFICIAL_RACE_FILTERS = ['AMARELA', 'BRANCA', 'INDÍGENA', 'PARDA', 'PRETA', 'NÃO INFORMADO'] as const;

function candidateRaceFilterValue(candidate: CandidateWithClaims): string {
  return candidate.race ?? 'NÃO INFORMADO';
}

function raceFilterLabel(value: string): string {
  if (value === 'NÃO INFORMADO') return 'Não informado';
  return value.charAt(0) + value.slice(1).toLowerCase();
}

export function CandidateSearch({
  candidates,
  query,
  cargoFilter,
  partyFilter,
  womenOnly,
  raceFilter,
  onQueryChange,
  onCargoFilterChange,
  onPartyFilterChange,
  onWomenOnlyChange,
  onRaceFilterChange,
}: CandidateSearchProps) {
  const { positions, parties, races } = useMemo(() => {
    const posSet = new Set<Position>();
    const partySet = new Set<string>();
    const raceSet = new Set<string>(OFFICIAL_RACE_FILTERS);

    for (const c of candidates) {
      posSet.add(c.position);
      partySet.add(c.party);
      raceSet.add(candidateRaceFilterValue(c));
    }

    const order: Position[] = ['governador', 'senador', 'deputado_federal', 'deputado_estadual'];
    const sortedPositions = [...posSet].sort((a, b) => order.indexOf(a) - order.indexOf(b));
    const sortedParties = [...partySet].sort();
    const sortedRaces = [...raceSet].sort(
      (a, b) => OFFICIAL_RACE_FILTERS.indexOf(a as (typeof OFFICIAL_RACE_FILTERS)[number])
        - OFFICIAL_RACE_FILTERS.indexOf(b as (typeof OFFICIAL_RACE_FILTERS)[number]),
    );

    return { positions: sortedPositions, parties: sortedParties, races: sortedRaces };
  }, [candidates]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <div className="relative flex-1 sm:min-w-[260px]">
        <label htmlFor="candidate-search" className="sr-only">
          Buscar candidatos
        </label>
        <input
          id="candidate-search"
          type="search"
          placeholder="Buscar por nome, partido, nº…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="w-full rounded-sm border border-[var(--color-border-editorial)] bg-[var(--color-paper)] px-3 py-2 text-sm font-[family-name:var(--font-body)] text-[var(--color-ink)] placeholder:text-[var(--color-muted-ink)] focus:border-[var(--color-institutional)] focus:outline-none"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-muted-ink)] hover:text-[var(--color-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-institutional)] rounded-full"
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

      <label className="inline-flex cursor-pointer items-center gap-2 rounded-sm border border-[var(--color-border-editorial)] bg-[var(--color-paper)] px-3 py-2 text-sm text-[var(--color-ink)] focus-within:border-[var(--color-institutional)]">
        <input
          type="checkbox"
          checked={womenOnly}
          onChange={(e) => onWomenOnlyChange(e.target.checked)}
          className="accent-[var(--color-institutional)]"
        />
        Mostrar somente mulheres
      </label>

      <select
        value={raceFilter}
        onChange={(e) => onRaceFilterChange(e.target.value)}
        className="cursor-pointer rounded-sm border border-[var(--color-border-editorial)] bg-[var(--color-paper)] px-3 py-2 text-sm font-[family-name:var(--font-body)] text-[var(--color-ink)] focus:border-[var(--color-institutional)] focus:outline-none"
        aria-label="Filtrar por cor/raça"
        title="Filtro baseado em autodeclaração oficial TSE/IBGE. Etnia indígena será detalhada quando houver cadastro específico."
      >
        <option value="">Todas as cores/raças</option>
        {races.map((race) => (
          <option key={race} value={race}>
            {raceFilterLabel(race)}
          </option>
        ))}
      </select>
    </div>
  );
}
