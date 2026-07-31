import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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

export function ComparePage() {
  usePageMetadata(
    'Comparar candidatos — Portal Transparência Eleitoral RS',
    'Selecione e compare candidatos lado a lado nas eleições 2026 no RS.'
  );

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const query = useQuery<CandidateWithClaims[]>({
    queryKey: ['candidates'],
    queryFn: fetchAllCandidates,
    staleTime: 60_000,
    retry: 2,
  });

  const candidates = query.data ?? [];
  const validCandidateIds = useMemo(() => new Set(candidates.map((c) => c.id)), [candidates]);

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

  const updateSharedRoute = (ids: string[]) => {
    const value = serializeSelectedIds(ids.slice(0, 4));
    navigate({ search: value ? `?candidatos=${value}` : '' }, { replace: false });
  };

  const toggleCandidate = (id: string) => {
    const next = sharedIds.includes(id)
      ? sharedIds.filter((selectedId) => selectedId !== id)
      : [...sharedIds, id].slice(0, 4);
    updateSharedRoute(next);
  };

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

      {/* Candidate selector — always visible */}
      <section className="mt-4" aria-label="Lista de candidatos">
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {candidates.map((c) => {
            const isSelected = selectedIds.has(c.id);
            const isMaxed = !isSelected && selectedIds.size >= 4;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (!isMaxed) toggleCandidate(c.id);
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
          })}
        </ul>
      </section>

      {/* Selected bar */}
      {selectedIds.size > 0 && (
        <section className="mt-4 space-y-2" aria-label="Selecionados">
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
          </div>

          {/* Comparison table */}
          {selected.length >= 2 && (
            <div className="mt-4 overflow-auto rounded-sm border border-[var(--color-border-editorial)]">
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
    </main>
  );
}
