import type { ConfidenceLevel } from '@/types/election';

export function confidenceLevel(score: number): ConfidenceLevel {
  if (score >= 4) return 'verificado';
  if (score >= 2) return 'parcialmente_verificado';
  return 'nao_confirmado';
}

export const CONFIDENCE_LABEL: Record<ConfidenceLevel, string> = {
  verificado: 'Verificado',
  parcialmente_verificado: 'Parcialmente verificado',
  nao_confirmado: 'Não confirmado'
};

export const CONFIDENCE_COLOR: Record<ConfidenceLevel, string> = {
  verificado: 'var(--color-institutional)',
  parcialmente_verificado: 'var(--color-factcheck)',
  nao_confirmado: 'var(--color-unverified)'
};
