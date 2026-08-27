import { useMemo } from 'react';
import type { CandidateWithClaims, Position } from '@/types/election';
import { POSITION_LABEL } from '@/types/election';
import { type CandidateExperienceFilter, hasPreviousMandate } from '@/utils/candidateExperience';

interface CandidateSearchProps {
  candidates: CandidateWithClaims[];
  query: string;
  cargoFilter: '' | Position;
  partyFilter: string;
  womenOnly: boolean;
  raceFilter: string;
  experienceFilter?: CandidateExperienceFilter;
  onQueryChange: (value: string) => void;
  onCargoFilterChange: (value: '' | Position) => void;
  onPartyFilterChange: (value: string) => void;
  onWomenOnlyChange: (value: boolean) => void;
  onRaceFilterChange: (value: string) => void;
  onExperienceFilterChange?: (value: CandidateExperienceFilter) => void;
  showCargoFilter?: boolean;
  showSecondaryFilters?: boolean;
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
  experienceFilter = '',
  onQueryChange,
  onCargoFilterChange,
  onPartyFilterChange,
  onWomenOnlyChange,
  onRaceFilterChange,
  onExperienceFilterChange,
  showCargoFilter = true,
  showSecondaryFilters = true,
}: CandidateSearchProps) {
  const selectClass = 'w-full appearance-none cursor-pointer rounded-sm border border-[var(--color-border-editorial)] bg-card px-3 py-2 pr-8 font-mono text-[0.72rem] uppercase tracking-[0.06em] text-[var(--color-ink)] focus:border-[var(--color-institutional)] focus:outline-none sm:w-auto';
  const { positions, parties, races, experienceCounts } = useMemo(() => {
    const posSet = new Set<Position>();
    const partySet = new Set<string>();
    const raceSet = new Set<string>(OFFICIAL_RACE_FILTERS);
    let withMandate = 0;
    let firstTime = 0;

    for (const c of candidates) {
      posSet.add(c.position);
      partySet.add(c.party);
      raceSet.add(candidateRaceFilterValue(c));
      if (hasPreviousMandate(c)) withMandate += 1;
      else firstTime += 1;
    }

    const order: Position[] = ['governador', 'senador', 'deputado_federal', 'deputado_estadual'];
    const sortedPositions = [...posSet].sort((a, b) => order.indexOf(a) - order.indexOf(b));
    const sortedParties = [...partySet].sort();
    const sortedRaces = [...raceSet].sort(
      (a, b) => OFFICIAL_RACE_FILTERS.indexOf(a as (typeof OFFICIAL_RACE_FILTERS)[number])
        - OFFICIAL_RACE_FILTERS.indexOf(b as (typeof OFFICIAL_RACE_FILTERS)[number]),
    );

    return {
      positions: sortedPositions,
      parties: sortedParties,
      races: sortedRaces,
      experienceCounts: { withMandate, firstTime },
    };
  }, [candidates]);

  return (
    <div className={`flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center ${showSecondaryFilters ? '' : '[&>div:not(:first-child)]:hidden [&>label]:hidden'}`}>
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
          className="w-full rounded-sm border border-[var(--color-border-editorial)] bg-card py-2 pl-9 pr-9 text-sm font-[family-name:var(--font-body)] text-[var(--color-ink)] placeholder:text-[var(--color-muted-ink)] focus:border-[var(--color-institutional)] focus:outline-none"
          autoComplete="off"
        />
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-ink)]"
        >
          <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="m12.5 12.5 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-1 text-[var(--color-muted-ink)] hover:text-[var(--color-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-institutional)]"
            aria-label="Limpar busca"
          >
            ✕
          </button>
        )}
      </div>

      {showCargoFilter ? (
        <div className="relative">
          <select
            value={cargoFilter}
            onChange={(e) => onCargoFilterChange(e.target.value as '' | Position)}
            className={selectClass}
            aria-label="Filtrar por cargo"
          >
            <option value="">Todos os cargos</option>
            {positions.map((p) => (
              <option key={p} value={p}>
                {POSITION_LABEL[p]}
              </option>
            ))}
          </select>
          <span aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[0.65rem] text-[var(--color-institutional)]">▼</span>
        </div>
      ) : null}

      <div className="relative">
        <select
          value={partyFilter}
          onChange={(e) => onPartyFilterChange(e.target.value)}
          className={selectClass}
          aria-label="Filtrar por partido"
        >
          <option value="">Todos os partidos</option>
          {parties.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <span aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[0.65rem] text-[var(--color-institutional)]">▼</span>
      </div>

      {onExperienceFilterChange ? (
        <div className="relative">
          <select
            value={experienceFilter}
            onChange={(e) => onExperienceFilterChange(e.target.value as CandidateExperienceFilter)}
            className={selectClass}
            aria-label="Filtrar por histórico de mandato"
            title="Filtra entre candidatos já eleitos anteriormente e candidatos concorrendo pela primeira vez."
          >
            <option value="">Todos os históricos</option>
            <option value="mandato_anterior">Já eleito(a) anteriormente ({experienceCounts.withMandate})</option>
            <option value="estreante">1ª candidatura / Estreante ({experienceCounts.firstTime})</option>
          </select>
          <span aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[0.65rem] text-[var(--color-institutional)]">▼</span>
        </div>
      ) : null}

      <label className={`inline-flex cursor-pointer items-center justify-center rounded-full border px-3.5 py-2 font-mono text-[0.7rem] uppercase tracking-[0.06em] focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--color-institutional)] ${
        womenOnly
          ? 'border-[var(--color-institutional)] bg-[color-mix(in_srgb,var(--color-institutional)_8%,var(--color-paper))] text-[var(--color-institutional)]'
          : 'border-[var(--color-border-editorial)] bg-card text-[var(--color-muted-ink)]'
      }`}>
        <input
          type="checkbox"
          aria-label="Mostrar somente mulheres"
          checked={womenOnly}
          onChange={(e) => onWomenOnlyChange(e.target.checked)}
          className="sr-only"
        />
        Mulheres
      </label>

      <div className="relative">
        <select
          value={raceFilter}
          onChange={(e) => onRaceFilterChange(e.target.value)}
          className={selectClass}
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
        <span aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[0.65rem] text-[var(--color-institutional)]">▼</span>
      </div>
    </div>
  );
}
