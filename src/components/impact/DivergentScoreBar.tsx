import { formatCategoryScore } from "@/domain/impact/vote-category-score";

export interface DivergentScoreBarProps {
  score: number | null;
  evaluatedPropositions: number;
  contestedAssessments?: number;
  candidateName: string;
  groupLabel: string;
}

export function DivergentScoreBar({
  score,
  evaluatedPropositions,
  contestedAssessments = 0,
  candidateName,
  groupLabel,
}: DivergentScoreBarProps) {
  const isEvaluated = score !== null && typeof score === "number" && !Number.isNaN(score);
  const clampedScore = isEvaluated ? Math.max(-1, Math.min(1, score)) : 0;
  const isPositive = isEvaluated && clampedScore > 0.004;
  const isNegative = isEvaluated && clampedScore < -0.004;
  const magnitude = Math.abs(clampedScore);
  const widthPercent = (magnitude * 50).toFixed(1);
  const leftPercent = isNegative
    ? (50 - Number(widthPercent)).toFixed(1)
    : "50";

  const formattedScore = isEvaluated ? formatCategoryScore(clampedScore) : "não avaliado";

  const accessibleLabel = isEvaluated
    ? `${groupLabel} para ${candidateName}: saldo ${formattedScore}, avaliado em ${evaluatedPropositions} item(s)${
        contestedAssessments > 0
          ? `, com ${contestedAssessments} avaliação(ões) contestada(s) em revisão`
          : ""
      }`
    : `${groupLabel} para ${candidateName}: não avaliado (ainda não há proposição elegível avaliada)`;

  return (
    <div
      className="flex min-h-[52px] flex-col justify-center gap-1 py-1"
      role="group"
      aria-label={accessibleLabel}
    >
      {isEvaluated ? (
        <div className="relative h-3 w-full" aria-hidden="true" data-testid="bar-track">
          {/* Trilho de fundo */}
          <div className="absolute inset-x-0 top-1 bottom-1 rounded-[1px] bg-[var(--color-paper)]" />
          {/* Linha divisória neutra no centro */}
          <span className="absolute top-[-2px] bottom-[-2px] left-1/2 w-[1px] -translate-x-1/2 bg-[var(--color-border-editorial)]" />
          {/* Barra preenchida divergente */}
          {(isPositive || isNegative) && (
            <div
              data-testid={isPositive ? "bar-fill-positive" : "bar-fill-negative"}
              className="absolute top-0.5 bottom-0.5 rounded-[1px]"
              style={{
                left: `${leftPercent}%`,
                width: `${widthPercent}%`,
                backgroundColor: isPositive
                  ? "var(--color-institutional)"
                  : "var(--color-factcheck)",
              }}
            />
          )}
        </div>
      ) : (
        <div className="relative h-3 w-full" aria-hidden="true" data-testid="noeval-track">
          <div
            className="absolute inset-x-0 top-1 bottom-1 rounded-[1px]"
            style={{
              background:
                "repeating-linear-gradient(135deg, var(--color-border-editorial) 0 3px, transparent 3px 7px)",
            }}
          />
        </div>
      )}

      {/* Rótulo de rodapé com valor formatado e contagem de itens */}
      <div className="flex items-center gap-1.5 font-mono text-[0.62rem] text-[var(--color-muted-ink)]">
        {isEvaluated ? (
          <>
            <span
              data-testid="score-value"
              className={`font-semibold ${
                isPositive
                  ? "text-[var(--color-institutional)]"
                  : isNegative
                  ? "text-[var(--color-factcheck)]"
                  : "text-[var(--color-ink)]"
              }`}
            >
              {formattedScore}
            </span>
            <span className="text-[var(--color-muted-ink)]">· {evaluatedPropositions} {evaluatedPropositions === 1 ? "item" : "itens"}</span>
            {contestedAssessments > 0 && (
              <span
                data-testid="contested-marker"
                className="cursor-help font-bold text-[var(--color-factcheck)]"
                title={`${contestedAssessments} assessment(s) contestado(s) — em revisão`}
                aria-label={`${contestedAssessments} contestado(s)`}
              >
                *
              </span>
            )}
          </>
        ) : (
          <span data-testid="noeval-label" className="text-[var(--color-muted-ink)]">
            não avaliado
          </span>
        )}
      </div>
    </div>
  );
}
