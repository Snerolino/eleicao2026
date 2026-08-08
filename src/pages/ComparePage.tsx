import { useEffect, useMemo, useState, useCallback, memo, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { fetchAllCandidates } from '@/services/candidates';
import { CandidatePhoto } from '@/components/candidates/CandidatePhoto';
import {
  DOSSIER_SECTIONS,
  type CandidateWithClaims,
  type Claim,
} from '@/types/election';
import { usePageMetadata } from '@/hooks/usePageMetadata';
import { ConfidenceBadge } from '@/components/sources/ConfidenceBadge';
import { LoadingSkeleton } from '@/components/states';
import { candidatePublicPath } from '@/utils/candidateIdentity';

function claimsForSection(
  claims: Claim[],
  matchersSet: ReadonlySet<string>
): Claim[] {
  return claims.filter((c) => matchersSet.has(c.category.toLowerCase()));
}

function SectionCell({
  candidate,
  matchersSet,
}: {
  candidate: CandidateWithClaims;
  matchersSet: ReadonlySet<string>;
}) {
  const claims = claimsForSection(candidate.claims, matchersSet);
  if (claims.length === 0) {
    return (
      <td className="border-r border-[var(--color-border-editorial)] px-4 py-4 align-top last:border-r-0">
        <p className="font-mono text-xs uppercase tracking-wide text-[var(--color-muted-ink)]">
          Ainda não verificado
        </p>
      </td>
    );
  }
  return (
    <td className="border-r border-[var(--color-border-editorial)] px-4 py-4 align-top last:border-r-0">
      <ul className="space-y-3">
        {claims.map((claim) => (
          <li key={claim.id} className="space-y-2">
            <p className="text-sm leading-relaxed">{claim.content}</p>
            <ConfidenceBadge
              score={claim.confidence_score}
              sourceName={
                claim.source_document?.source_name ?? 'Fonte não identificada'
              }
            />
          </li>
        ))}
      </ul>
    </td>
  );
}

function parseSharedCandidateIds(
  rawIds: string | null,
  validIds: ReadonlySet<string>
): string[] {
  const result: string[] = [];
  for (const rawId of (rawIds ?? '').split(',')) {
    const id = rawId.trim();
    if (!id || !validIds.has(id) || result.includes(id)) continue;
    result.push(id);
    if (result.length === 4) break;
  }
  return result;
}

function serializeSelectedIds(ids: Iterable<string>): string {
  return [...ids].join(',');
}

const OFFICIAL_RACE_FILTERS = ['AMARELA', 'BRANCA', 'INDÍGENA', 'PARDA', 'PRETA', 'NÃO INFORMADO'] as const;

function candidateRaceFilterValue(candidate: CandidateWithClaims): string {
  return candidate.race ?? 'NÃO INFORMADO';
}

function raceFilterLabel(value: string): string {
  if (value === 'NÃO INFORMADO') return 'Não informado';
  return value.charAt(0) + value.slice(1).toLowerCase();
}


const SelectableCandidateCard = memo(function SelectableCandidateCard({
  candidate: c,
  isSelected,
  isMaxed,
  onToggle
}: {
  candidate: CandidateWithClaims;
  isSelected: boolean;
  isMaxed: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => {
          if (!isMaxed) onToggle(c.id);
        }}
        disabled={isMaxed}
        aria-pressed={isSelected}
        className={`flex w-full items-center gap-3 rounded-sm border p-3 text-left transition-colors ${
          isSelected
            ? 'border-[var(--color-institutional)] bg-[color-mix(in_srgb,var(--color-institutional)_8%,var(--color-paper))]'
            : 'border-[var(--color-border-editorial)] bg-[var(--color-paper)] hover:border-[var(--color-institutional)]'
        } ${isMaxed ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      >
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-sm bg-[var(--color-skeleton)]">
          <CandidatePhoto
            name={c.full_name}
            photoUrl={c.photo_url}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[0.65rem] uppercase tracking-wider text-[var(--color-muted-ink)]">
            {c.position_label}
          </p>
          <p className="truncate font-semibold">{c.full_name}</p>
          <p className="font-mono text-xs text-[var(--color-muted-ink)]">
            {c.party}
            {c.ballot_number != null
              ? ` · nº ${c.ballot_number}`
              : ''}
          </p>
        </div>
        {isSelected && (
          <span className="shrink-0 font-mono text-sm font-bold text-[var(--color-institutional)]">
            ✓
          </span>
        )}
      </button>
    </li>
  );
});

export function ComparePage() {
  usePageMetadata(
    'Comparar candidatos — Portal Transparência Eleitoral RS',
    'Selecione e compare candidatos lado a lado nas eleições 2026 no RS.'
  );

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [partyFilter, setPartyFilter] = useState('');
  const [womenOnly, setWomenOnly] = useState(false);
  const [raceFilter, setRaceFilter] = useState('');

  const query = useQuery<CandidateWithClaims[]>({
    queryKey: ['candidates'],
    queryFn: fetchAllCandidates,
    staleTime: 60_000,
    retry: 2,
  });

  const candidates = query.data ?? [];
  const validCandidateIds = useMemo(() => new Set(candidates.map((c) => c.id)), [candidates]);
  const { parties, races } = useMemo(() => {
    const partySet = new Set<string>();
    const raceSet = new Set<string>(OFFICIAL_RACE_FILTERS);
    for (const candidate of candidates) {
      partySet.add(candidate.party);
      raceSet.add(candidateRaceFilterValue(candidate));
    }
    return {
      parties: [...partySet].sort(),
      races: [...raceSet].sort(
        (a, b) => OFFICIAL_RACE_FILTERS.indexOf(a as (typeof OFFICIAL_RACE_FILTERS)[number])
          - OFFICIAL_RACE_FILTERS.indexOf(b as (typeof OFFICIAL_RACE_FILTERS)[number]),
      ),
    };
  }, [candidates]);

  const filteredCandidates = useMemo(() => candidates.filter((candidate) => {
    if (partyFilter && candidate.party !== partyFilter) return false;
    if (womenOnly && candidate.gender !== 'FEMININO') return false;
    if (raceFilter && candidateRaceFilterValue(candidate) !== raceFilter) return false;
    return true;
  }), [candidates, partyFilter, womenOnly, raceFilter]);

  const sharedIds = useMemo(
    () => parseSharedCandidateIds(searchParams.get('candidatos'), validCandidateIds),
    [searchParams, validCandidateIds]
  );

  const selectedIds = useMemo(() => new Set(sharedIds), [sharedIds]);

  useEffect(() => {
    if (query.isLoading) return;
    const sharedValue = serializeSelectedIds(sharedIds);
    if ((searchParams.get('candidatos') ?? '') !== sharedValue) {
      navigate({ search: sharedValue ? `?candidatos=${sharedValue}` : '' }, { replace: true });
    }
  }, [navigate, query.isLoading, searchParams, sharedIds]);

  const selected = useMemo(
    () => candidates.filter((c) => selectedIds.has(c.id)),
    [candidates, selectedIds]
  );

  const updateSharedRoute = useCallback((ids: string[]) => {
    const value = serializeSelectedIds(ids.slice(0, 4));
    navigate({ search: value ? `?candidatos=${value}` : '' }, { replace: false });
  }, [navigate]);

  const sharedIdsRef = useRef(sharedIds);
  useEffect(() => {
    sharedIdsRef.current = sharedIds;
  }, [sharedIds]);

  const toggleCandidate = useCallback((id: string) => {
    const currentSharedIds = sharedIdsRef.current;
    const next = currentSharedIds.includes(id)
      ? currentSharedIds.filter((selectedId) => selectedId !== id)
      : [...currentSharedIds, id].slice(0, 4);

    const value = serializeSelectedIds(next.slice(0, 4));
    navigate({ search: value ? `?candidatos=${value}` : '' }, { replace: false });
  }, [navigate]);

  if (query.isLoading) {
    return (
      <main id="main-content" className="mx-auto max-w-6xl px-4 py-8">
        <LoadingSkeleton label="Carregando candidatos" />
      </main>
    );
  }

  return (
    <main id="main-content" className="mx-auto max-w-7xl px-4 py-8">
      <Link
        to="/"
        className="font-mono text-xs uppercase tracking-wider text-[var(--color-institutional)] underline-offset-4 hover:underline"
      >
        ← Voltar à lista
      </Link>

      <h1 className="mt-6 text-3xl">Comparar candidatos</h1>
      <p className="mt-1 font-mono text-xs uppercase tracking-wider text-[var(--color-muted-ink)]">
        Selecione de 2 a 4 candidatos
      </p>

      {/* Selected bar */}
      {selectedIds.size > 0 && (
        <section className="mt-6 space-y-4" aria-label="Selecionados">
          <div className="flex flex-wrap items-center gap-3">
            {selected.map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center gap-2 rounded-sm bg-[color-mix(in_srgb,var(--color-institutional)_12%,var(--color-paper))] px-3 py-1.5 text-sm"
              >
                <span className="truncate max-w-[180px]">{c.full_name}</span>
                <button
                  type="button"
                  onClick={() => toggleCandidate(c.id)}
                  className="text-[var(--color-muted-ink)] hover:text-[var(--color-ink)]"
                  aria-label={`Remover ${c.full_name}`}
                >
                  ✕
                </button>
              </span>
            ))}
            <span className="font-mono text-xs text-[var(--color-muted-ink)]">
              {selected.length} selecionado{selected.length > 1 ? 's' : ''}.
              {selected.length < 2
                ? ' Selecione ao menos mais um.'
                : ''}
            </span>
            <button
              type="button"
              onClick={() => {
                updateSharedRoute([]);
              }}
              className="font-mono text-xs text-[var(--color-unverified)] underline underline-offset-2"
            >
              Limpar tudo
            </button>
            {selected.length >= 2 && (
              <a
                href="#comparacao"
                className="rounded-sm bg-[var(--color-institutional)] px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-white hover:opacity-90"
              >
                Ver comparação
              </a>
            )}
          </div>

          {/* Comparison table */}
          {selected.length >= 2 && (
            <div
              id="comparacao"
              className="mt-4 scroll-mt-6 overflow-auto rounded-sm border border-[var(--color-border-editorial)]"
            >
              <table className="w-full border-collapse bg-[var(--color-paper)] text-sm">
                <thead>
                  <tr>
                    <th className="sticky top-0 min-w-[120px] bg-[var(--color-paper)] p-3 text-left font-mono text-xs uppercase tracking-wider text-[var(--color-muted-ink)]" />
                    {selected.map((c) => (
                      <th
                        key={c.id}
                        className="sticky top-0 min-w-[240px] border-l border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-3 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-sm bg-[var(--color-skeleton)]">
                            <CandidatePhoto
                              name={c.full_name}
                              photoUrl={c.photo_url}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-mono text-[0.6rem] uppercase tracking-wider text-[var(--color-muted-ink)]">
                              {c.position_label}
                            </p>
                            <p className="font-medium leading-tight">
                              <Link
                                to={candidatePublicPath(c)}
                                className="text-[var(--color-institutional)] underline-offset-2 hover:underline"
                              >
                                {c.full_name}
                              </Link>
                            </p>
                            <p className="font-mono text-[0.65rem] text-[var(--color-muted-ink)]">
                              {c.party}
                              {c.ballot_number != null
                                ? ` · nº ${c.ballot_number}`
                                : ''}
                            </p>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DOSSIER_SECTIONS.map((section) => (
                    <tr key={section.key}>
                      <td className="border-t border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-3 align-top font-mono text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-ink)]">
                        {section.label}
                      </td>
                      {selected.map((c) => (
                        <SectionCell
                          key={c.id}
                          candidate={c}
                          matchersSet={section.categoryMatchersSet}
                        />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Candidate selector — always visible */}
      <section className="mt-8" aria-label="Lista de candidatos">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl">Adicionar à comparação</h2>
            <p aria-live="polite" className="mt-1 font-mono text-xs text-[var(--color-muted-ink)]">
              {filteredCandidates.length} de {candidates.length} candidatos disponíveis
              {partyFilter && ` do ${partyFilter}`}
              {womenOnly && ' · mulheres'}
              {raceFilter && ` · cor/raça ${raceFilter.toLowerCase()}`}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <select
              value={partyFilter}
              onChange={(event) => setPartyFilter(event.target.value)}
              className="cursor-pointer rounded-sm border border-[var(--color-border-editorial)] bg-[var(--color-paper)] px-3 py-2 text-sm text-[var(--color-ink)] focus:border-[var(--color-institutional)] focus:outline-none"
              aria-label="Filtrar por partido"
            >
              <option value="">Todos os partidos</option>
              {parties.map((party) => (
                <option key={party} value={party}>{party}</option>
              ))}
            </select>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-sm border border-[var(--color-border-editorial)] bg-[var(--color-paper)] px-3 py-2 text-sm text-[var(--color-ink)] focus-within:border-[var(--color-institutional)]">
              <input
                type="checkbox"
                checked={womenOnly}
                onChange={(event) => setWomenOnly(event.target.checked)}
                className="accent-[var(--color-institutional)]"
              />
              Mostrar somente mulheres
            </label>
            <select
              value={raceFilter}
              onChange={(event) => setRaceFilter(event.target.value)}
              className="cursor-pointer rounded-sm border border-[var(--color-border-editorial)] bg-[var(--color-paper)] px-3 py-2 text-sm text-[var(--color-ink)] focus:border-[var(--color-institutional)] focus:outline-none"
              aria-label="Filtrar por cor/raça"
              title="Filtro baseado em autodeclaração oficial TSE/IBGE. Etnia indígena será detalhada quando houver cadastro específico."
            >
              <option value="">Todas as cores/raças</option>
              {races.map((race) => (
                <option key={race} value={race}>{raceFilterLabel(race)}</option>
              ))}
            </select>
          </div>
        </div>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCandidates.map((c) => {
            const isSelected = selectedIds.has(c.id);
            const isMaxed = !isSelected && selectedIds.size >= 4;
            return (
              <SelectableCandidateCard
                key={c.id}
                candidate={c}
                isSelected={isSelected}
                isMaxed={isMaxed}
                onToggle={toggleCandidate}
              />
            );
          })}
        </ul>
      </section>
    </main>
  );
}
