import { confidenceLevel, CONFIDENCE_COLOR, CONFIDENCE_LABEL } from '@/utils/confidence';
import { normalizeSourceCategory, SOURCE_CATEGORY_COLOR, SOURCE_CATEGORY_LABEL } from '@/utils/sourceCategory';

interface ConfidenceBadgeProps {
  score: number;
  sourceName: string;
  sourceCategory?: string;
}

export function ConfidenceBadge({
  score,
  sourceName,
  sourceCategory,
}: ConfidenceBadgeProps) {
  const level = confidenceLevel(score);
  const confidenceColor = CONFIDENCE_COLOR[level];
  const category = sourceCategory ? normalizeSourceCategory(sourceCategory) : null;

  return (
    <span className="inline-flex flex-wrap items-center gap-2 font-mono text-[0.68rem] leading-tight text-[var(--color-muted-ink)]">
      {category && (
        <span
          className="inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 font-medium uppercase tracking-wider text-white"
          style={{ backgroundColor: SOURCE_CATEGORY_COLOR[category] }}
        >
          {SOURCE_CATEGORY_LABEL[category]}
        </span>
      )}
      <span
        className="inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-medium uppercase tracking-wider"
        style={{ borderColor: confidenceColor, color: confidenceColor }}
      >
        {CONFIDENCE_LABEL[level]} · {score}/5
      </span>
      <span className="truncate">{sourceName}</span>
    </span>
  );
}
