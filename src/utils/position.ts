import type { Position } from '@/types/election';
import { POSITION_LABEL } from '@/types/election';

function slug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, '_');
}

export function normalizePosition(raw: string | null | undefined): {
  position: Position;
  label: string;
} {
  const original = (raw ?? '').trim();
  const normalized = slug(original);

  const aliases: Partial<Record<string, Exclude<Position, 'outro'>>> = {
    governador: 'governador',
    governor: 'governador',
    senador: 'senador',
    senator: 'senador',
    deputado_federal: 'deputado_federal',
    federal_deputy: 'deputado_federal',
    deputado_estadual: 'deputado_estadual',
    state_deputy: 'deputado_estadual'
  };

  const position = aliases[normalized] ?? 'outro';

  return {
    position,
    label: position === 'outro' ? original || POSITION_LABEL.outro : POSITION_LABEL[position]
  };
}
