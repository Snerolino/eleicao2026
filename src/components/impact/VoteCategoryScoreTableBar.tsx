import { useMemo, useState } from "react";
import { Link } from "react-router";
import { CandidatePhoto } from "@/components/candidates/CandidatePhoto";
import {
  BENEFICIARY_GROUPS_CANONICAL_ORDER,
  getBeneficiaryGroupLabel,
} from "@/domain/impact/beneficiary-groups";
import type { VoteCategoryScore } from "@/domain/impact/vote-category-score";
import type { CandidateWithClaims } from "@/types/election";
import { candidatePublicPath } from "@/utils/candidateIdentity";
import { DivergentScoreBar } from "./DivergentScoreBar";

export interface VoteCategoryScoreTableBarProps {
  scores: VoteCategoryScore[];
  candidates: CandidateWithClaims[];
  initialVisibleCount?: number;
}

export function VoteCategoryScoreTableBar({
  scores,
  candidates,
  initialVisibleCount = 5,
}: VoteCategoryScoreTableBarProps) {
  const [expanded, setExpanded] = useState(false);

  const safeScores = useMemo(
    () =>
      scores.filter(
        (score) =>
          typeof score?.group_slug === "string" &&
          typeof score?.candidate_id === "string" &&
          "score" in score
      ),
    [scores]
  );

  // Chaves únicas (house + group_slug) ordenadas canonicamente
  const rowKeys = useMemo(() => {
    const rawKeys = [...new Set(safeScores.map((score) => `${score.house}|${score.group_slug}`))];
    return rawKeys.sort((a, b) => {
      const [houseA, groupA] = a.split("|");
      const [houseB, groupB] = b.split("|");
      if (houseA !== houseB) return houseA.localeCompare(houseB);
      const idxA = BENEFICIARY_GROUPS_CANONICAL_ORDER.indexOf(groupA as any);
      const idxB = BENEFICIARY_GROUPS_CANONICAL_ORDER.indexOf(groupB as any);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return groupA.localeCompare(groupB);
    });
  }, [safeScores]);

  if (safeScores.length === 0 || candidates.length === 0) {
    return (
      <p className="font-mono text-xs uppercase tracking-wide text-[var(--color-muted-ink)]">
        Saldo por categoria não avaliado para este recorte.
      </p>
    );
  }

  const visibleKeys = expanded || rowKeys.length <= initialVisibleCount
    ? rowKeys
    : rowKeys.slice(0, initialVisibleCount);

  return (
    <div className="space-y-4" data-testid="vote-category-score-table-bar">
      {/* Disclaimer Metodológico / Anti-Ranking */}
      <div className="rounded-[2px] border border-dashed border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-3.5 font-mono text-[0.7rem] leading-relaxed text-[var(--color-muted-ink)]">
        Os números são fatos nominais derivados de votos e assessments aprovados — não são recomendação, nota ou ranking eleitoral. &ldquo;Não avaliado&rdquo; (textura hachurada) é diferente de saldo zero: significa que ainda não há proposição elegível avaliada para esse grupo, não que o candidato foi neutro.
      </div>

      {/* Grade de Comparação com Barras */}
      <div className="overflow-x-auto rounded-[2px] border border-[var(--color-border-editorial)] bg-white">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr>
              {/* Cabeçalho da coluna de grupos */}
              <th
                scope="col"
                className="sticky left-0 z-10 min-w-[190px] border-b border-r border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-3.5 font-mono text-xs uppercase tracking-wider text-[var(--color-muted-ink)]"
              >
                Grupo Populacional
              </th>
              {/* Colunas dos candidatos na ORDEM EXATA de seleção (Anti-ranking) */}
              {candidates.map((c) => (
                <th
                  key={c.id}
                  scope="col"
                  className="min-w-[180px] border-b border-r border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-3 last:border-r-0"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 shrink-0 overflow-hidden rounded-[2px] bg-[var(--color-skeleton)]">
                      <CandidatePhoto
                        name={c.full_name}
                        photoUrl={c.photo_url}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[0.6rem] uppercase tracking-wider text-[var(--color-muted-ink)] truncate">
                        {c.party} · {c.position_label}
                      </p>
                      <p className="truncate font-semibold text-xs leading-snug">
                        <Link
                          to={candidatePublicPath(c)}
                          className="text-[var(--color-ink)] hover:text-[var(--color-institutional)] hover:underline"
                        >
                          {c.full_name}
                        </Link>
                      </p>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleKeys.map((key) => {
              const [house, groupSlug] = key.split("|");
              const label = getBeneficiaryGroupLabel(groupSlug);
              const isMultiHouse = new Set(rowKeys.map((k) => k.split("|")[0])).size > 1;

              return (
                <tr key={key} className="border-b border-[var(--color-border-editorial)] last:border-b-0">
                  {/* Rótulo de grupo na primeira coluna (sticky) */}
                  <th
                    scope="row"
                    className="sticky left-0 z-10 border-r border-[var(--color-border-editorial)] bg-[var(--color-paper)] px-3.5 py-2.5 font-mono text-[0.7rem] font-medium text-[var(--color-ink)]"
                  >
                    <span>{label}</span>
                    {isMultiHouse && (
                      <span className="ml-1.5 font-mono text-[0.6rem] uppercase text-[var(--color-muted-ink)]">
                        ({house})
                      </span>
                    )}
                  </th>

                  {/* Células de barra para cada candidato */}
                  {candidates.map((c) => {
                    const scoreObj = safeScores.find(
                      (item) =>
                        item.candidate_id === c.id &&
                        item.house === house &&
                        item.group_slug === groupSlug
                    );

                    return (
                      <td
                        key={c.id}
                        className="border-r border-[var(--color-border-editorial)] px-3.5 py-2 last:border-r-0 align-middle"
                      >
                        <DivergentScoreBar
                          score={scoreObj?.score ?? null}
                          evaluatedPropositions={scoreObj?.evaluated_propositions ?? 0}
                          contestedAssessments={scoreObj?.contested_assessments ?? 0}
                          candidateName={c.full_name}
                          groupLabel={label}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Botão de Expansão / Recolhimento */}
      {rowKeys.length > initialVisibleCount && (
        <div className="flex items-center justify-between pt-1">
          <p className="font-mono text-xs text-[var(--color-muted-ink)]">
            Mostrando {visibleKeys.length} de {rowKeys.length} grupos
          </p>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="cursor-pointer font-mono text-xs text-[var(--color-institutional)] underline underline-offset-4 hover:opacity-80"
          >
            {expanded ? "Recolher grupos" : "Expandir todos os grupos"}
          </button>
        </div>
      )}

      {/* Legenda Visual */}
      <footer
        className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[var(--color-border-editorial)] pt-3 font-mono text-[0.66rem] text-[var(--color-muted-ink)]"
        aria-label="Legenda dos gráficos de votação"
      >
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-3.5 rounded-[1px] bg-[var(--color-institutional)]" />
          Saldo a favor do grupo
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-3.5 rounded-[1px] bg-[var(--color-factcheck)]" />
          Saldo contrário
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-3.5 rounded-[1px]"
            style={{
              background:
                "repeating-linear-gradient(135deg, var(--color-border-editorial) 0 2px, transparent 2px 4px)",
            }}
          />
          Não avaliado (não é zero)
        </span>
        <span className="flex items-center gap-1">
          <span className="font-bold text-[var(--color-factcheck)]">*</span>
          assessment contestado, em revisão
        </span>
      </footer>
    </div>
  );
}
