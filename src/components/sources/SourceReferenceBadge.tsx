import type { CSSProperties, ReactNode } from 'react';
import { sanitizeUrl } from '@/utils/sanitizeUrl';
import type { RawDocument } from '@/types/election';
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
          {CONFIDENCE_LABEL[level]} · {confidenceScore}/5
        </span>
      </span>

      <span className="flex flex-wrap gap-x-3 gap-y-1 text-[0.72rem] leading-snug">
        <strong className="font-medium">
          {document?.source_name ?? 'Fonte não identificada'}
        </strong>
        <span className="text-[var(--color-muted-ink)]">
          coletado em {formatDate(document?.fetched_at ?? null)}
        </span>
      </span>

      <span className="text-[0.68rem]">
        {document?.url ? 'Ver fonte original ↗' : 'URL da fonte não disponível'}
      </span>
    </>
  );

  const className =
    'inline-flex w-full flex-col gap-2 rounded-sm border border-[var(--color-border-editorial)] border-l-4 px-3 py-2 font-mono text-xs text-[var(--color-ink)]';

  return document?.url ? (
    <a
      href={sanitizeUrl(document.url)}
      target="_blank"
      rel="noreferrer noopener"
      className={`${className} transition-colors hover:bg-[var(--color-paper)]`}
      style={style}
      aria-label={`Abrir fonte original: ${document.source_name}`}
    >
      {content}
    </a>
  ) : (
    <span className={className} style={style}>
      {content}
    </span>
  );
}

export function CitationMetadata({
  children
}: {
  children: ReactNode;
}) {
  return <span className="font-mono">{children}</span>;
}
