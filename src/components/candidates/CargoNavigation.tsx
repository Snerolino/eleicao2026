import type { Position } from '@/types/election';
import { POSITION_LABEL, POSITION_ORDER } from '@/types/election';

interface CargoNavigationProps {
  positions: Position[];
  counts: Map<Position, number>;
  selected: Position | 'saved' | '';
  savedCount: number;
  onSelect: (position: Position | 'saved' | '') => void;
}

export function CargoNavigation({ positions, counts, selected, savedCount, onSelect }: CargoNavigationProps) {
  const items = positions.filter((position) => POSITION_ORDER.includes(position) || position === 'outro');
  return (
    <nav aria-label="Navegação por cargo" className="flex gap-2 overflow-x-auto border-y border-[var(--color-border-editorial)] py-3 [scrollbar-width:thin]">
      <button type="button" aria-current={selected === '' ? 'page' : undefined} onClick={() => onSelect('')} className={`min-h-11 shrink-0 rounded-sm border px-3 font-mono text-xs uppercase tracking-wider focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-institutional)] ${selected === '' ? 'border-[var(--color-institutional)] bg-[color-mix(in_srgb,var(--color-institutional)_10%,var(--color-paper))] text-[var(--color-institutional)]' : 'border-[var(--color-border-editorial)] text-[var(--color-muted-ink)] hover:border-[var(--color-institutional)] hover:text-[var(--color-ink)]'}`}>Todos</button>
      {items.map((position) => (
        <button key={position} type="button" aria-current={selected === position ? 'page' : undefined} onClick={() => onSelect(position)} className={`min-h-11 shrink-0 rounded-sm border px-3 font-mono text-xs uppercase tracking-wider focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-institutional)] ${selected === position ? 'border-[var(--color-institutional)] bg-[color-mix(in_srgb,var(--color-institutional)_10%,var(--color-paper))] text-[var(--color-institutional)]' : 'border-[var(--color-border-editorial)] text-[var(--color-muted-ink)] hover:border-[var(--color-institutional)] hover:text-[var(--color-ink)]'}`}>
          {POSITION_LABEL[position]} · {counts.get(position) ?? 0}
        </button>
      ))}
      <button type="button" aria-current={selected === 'saved' ? 'page' : undefined} onClick={() => onSelect('saved')} className={`min-h-11 shrink-0 rounded-sm border px-3 font-mono text-xs uppercase tracking-wider focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-institutional)] ${selected === 'saved' ? 'border-[var(--color-institutional)] bg-[color-mix(in_srgb,var(--color-institutional)_10%,var(--color-paper))] text-[var(--color-institutional)]' : 'border-[var(--color-border-editorial)] text-[var(--color-muted-ink)] hover:border-[var(--color-institutional)] hover:text-[var(--color-ink)]'}`}><span aria-hidden="true">★</span> Salvos · {savedCount}</button>
    </nav>
  );
}
