import type { SourceCategory } from '../types';

const CATEGORY_LABEL: Record<SourceCategory, string> = {
  oficial: 'Fonte oficial',
  fact_check: 'Checagem de fatos',
  imprensa: 'Imprensa',
  outro: 'Outra fonte',
};

const CATEGORY_COLOR_VAR: Record<SourceCategory, string> = {
  oficial: 'var(--color-institutional)',
  fact_check: 'var(--color-factcheck)',
  imprensa: 'var(--color-press)',
  outro: 'var(--color-unverified)',
};

interface SourceReferenceProps {
  sourceName: string;
  sourceCategory: SourceCategory;
  sourceUrl?: string;
  confidenceScore: number;
  fetchedAt: string;
}

export function SourceReference({
  sourceName,
  sourceCategory,
  sourceUrl,
  confidenceScore,
  fetchedAt,
}: SourceReferenceProps) {
  const trustLabel =
    confidenceScore >= 4 ? 'Verificado' : confidenceScore >= 2 ? 'Parcialmente verificado' : 'Não confirmado';

  const body = (
    <span
      className="inline-flex flex-wrap items-center gap-2 text-xs"
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      <span
        className="rounded-sm px-1.5 py-0.5 text-white"
        style={{ backgroundColor: CATEGORY_COLOR_VAR[sourceCategory] }}
      >
        {CATEGORY_LABEL[sourceCategory]}
      </span>
      <span>{trustLabel}</span>
      <span className="text-neutral-500">
        {sourceName} · {new Date(fetchedAt).toLocaleDateString('pt-BR')}
      </span>
    </span>
  );

  // toda referência é clicável até a fonte original — nunca uma citação "cega"
  return sourceUrl ? (
    <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
      {body}
    </a>
  ) : (
    body
  );
}
