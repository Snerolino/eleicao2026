import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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

function claimsForSection(
  claims: Claim[],
  matchers: readonly string[]
): Claim[] {
  const accepted = new Set(matchers.map((m) => m.toLowerCase()));
  return claims.filter((c) => accepted.has(c.category.toLowerCase()));
}

function SectionCell({
  candidate,
  matchers,
}: {
  candidate: CandidateWithClaims;
  matchers: readonly string[];
}) {
  const claims = claimsForSection(candidate.claims, matchers);
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

export function ComparePage() {
  usePageMetadata(
    'Comparar candidatos — Portal Transparência Eleitoral RS',
    'Selecione e compare candidatos lado a lado nas eleições 2026 no RS.'
  );

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const query = useQuery<CandidateWithClaims[]>({
    queryKey: ['candidates'],
    queryFn: fetchAllCandidates,
    staleTime: 60_000,
    retry: 2,
  });

  const candidates = query.data ?? [];
  const selected = useMemo(
    () => candidates.filter((c) => selectedIds.has(c.id)),
    [candidates, selectedIds]
  );

  const toggleCandidate = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 4) next.add(id);
      return next;
    });
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

      {/* Selector */}
      {selected.length === 0 && (
        <section className="mt-6" aria-label="Selecionar candidatos">
          <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-muted-ink)]">
            Selecione de 2 a 4 candidatos
          </p>
          <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {candidates.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => toggleCandidate(c.id)}
                  className="flex w-full items-center gap-3 rounded-sm border border-[var(--color-border-editorial)] bg-white p-3 text-left hover:border-[var(--color-institutional)]"
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
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Selected bar */}
      {selected.length > 0 && (
        <section className="mt-6 space-y-4" aria-label="Selecionados">
          <div className="flex flex-wrap items-center gap-3">
            {selected.map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center gap-2 rounded-sm bg-[color-mix(in_srgb,var(--color-institutional)_12%,white)] px-3 py-1.5 text-sm"
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
            {selected.length >= 2 && (
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="font-mono text-xs text-[var(--color-unverified)] underline underline-offset-2"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Comparison table */}
          {selected.length >= 2 && (
            <div className="mt-4 overflow-auto rounded-sm border border-[var(--color-border-editorial)]">
              <table className="w-full border-collapse bg-white text-sm">
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
                                to={`/candidatos/${encodeURIComponent(c.id)}`}
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
                          matchers={section.categoryMatchers}
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
