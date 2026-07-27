import type { CSSProperties } from 'react';
import type { RawDocument } from '@/types/election';
import { getSafeUrl } from '@/utils/url';
import {
  confidenceLevel,
  CONFIDENCE_COLOR,
  CONFIDENCE_LABEL
} from '@/utils/confidence';
import {
  SOURCE_CATEGORY_COLOR,
  SOURCE_CATEGORY_LABEL
} from '@/utils/sourceCategory';

interface SourceReferenceBadgeProps {
  document: RawDocument | null;
  confidenceScore: number;
}

function formatDate(value: string | null): string {
  if (!value) return 'data não informada';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

export function SourceReferenceBadge({
  document,
  confidenceScore
}: SourceReferenceBadgeProps) {
  const category = document?.source_category ?? 'outro';
  const level = confidenceLevel(confidenceScore);
  const categoryColor = SOURCE_CATEGORY_COLOR[category];
  const confidenceColor = CONFIDENCE_COLOR[level];
  const isOfficial = category === 'oficial';
  const safeUrl = getSafeUrl(document?.url);

  const style = {
    '--source-color': categoryColor,
    borderLeftColor: categoryColor,
    background: isOfficial
      ? 'color-mix(in srgb, var(--color-institutional) 12%, white)'
      : '#FFFFFF',
    ...(isOfficial && {
      borderTopColor: 'color-mix(in srgb, var(--color-institutional) 20%, white)',
      borderTopWidth: '1px'
    })
  } as CSSProperties;

  const content = (
    <>
      <span className="flex flex-wrap items-center gap-2">
        <span
          className="inline-flex items-center gap-1 rounded-sm px-2 py-1 text-[0.68rem] font-medium uppercase tracking-wider text-white"
          style={{ backgroundColor: categoryColor }}
        >
          <span aria-hidden="true">■</span>
          {SOURCE_CATEGORY_LABEL[category]}
        </span>

        <span
          className="inline-flex items-center rounded-sm border-2 px-2 py-0.5 text-[0.68rem] font-medium uppercase tracking-wider"
          style={{
            borderColor: confidenceColor,
            color: confidenceColor
          }}
        >
          {CONFIDENCE_LABEL[level]}
        </span>
      </span>

      {safeUrl ? (
        <a
          href={safeUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-1 block break-all text-xs leading-relaxed underline transition-colors hover:text-[var(--color-institutional)]"
          style={{ color: categoryColor }}
        >
          {document!.source_name ?? 'Fonte'}
        </a>
      ) : (
        <span className="mt-1 block text-xs leading-relaxed text-[var(--color-muted-ink)]">
          {document!.source_name ?? 'Fonte não informada'}
        </span>
      )}

      <span className="mt-0.5 block text-[0.65rem] text-[var(--color-muted-ink)]">
        Atualizado em {formatDate(document?.fetched_at ?? null)}
      </span>
    </>
  );

  if (!safeUrl) {
    return (
      <div
        className="rounded-sm border-l-4 bg-white px-3 py-2 text-xs"
        style={style}
      >
        {content}
      </div>
    );
  }

  return (
    <a
      href={safeUrl}
      target="_blank"
      rel="noreferrer noopener"
      className="block rounded-sm border-l-4 bg-white px-3 py-2 text-xs transition-colors hover:opacity-80"
      style={style}
    >
      {content}
    </a>
  );
}
