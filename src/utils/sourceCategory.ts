import type { SourceCategory } from '@/types/election';

export function normalizeSourceCategory(
  raw: string | null | undefined
): SourceCategory {
  const value = (raw ?? '').toLowerCase().trim();

  if (['oficial', 'official', 'governo'].includes(value)) return 'oficial';
  if (['imprensa', 'press', 'media', 'mídia'].includes(value)) return 'imprensa';
  if (
    [
      'fact_check',
      'factcheck',
      'fact-check',
      'checagem',
      'checagem_de_fatos'
    ].includes(value)
  ) {
    return 'fact_check';
  }

  return 'outro';
}

export const SOURCE_CATEGORY_LABEL: Record<SourceCategory, string> = {
  oficial: 'Fonte oficial',
  imprensa: 'Imprensa',
  fact_check: 'Checagem de fatos',
  outro: 'Outra fonte'
};

export const SOURCE_CATEGORY_COLOR: Record<SourceCategory, string> = {
  oficial: 'var(--color-institutional)',
  imprensa: 'var(--color-press)',
  fact_check: 'var(--color-factcheck)',
  outro: 'var(--color-unverified)'
};
