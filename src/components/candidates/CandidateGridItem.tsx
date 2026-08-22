import { memo } from 'react';
import type { CandidateWithClaims } from '@/types/election';
import { CandidatePhoto } from './CandidatePhoto';

interface CandidateGridItemProps {
  candidate: CandidateWithClaims;
  isSelected: boolean;
  isMaxed: boolean;
  onToggle: (id: string) => void;
}

export const CandidateGridItem = memo(function CandidateGridItem({
  candidate,
  isSelected,
  isMaxed,
  onToggle
}: CandidateGridItemProps) {
  return (
    <li>
      <button
        type="button"
        onClick={() => {
          if (!isMaxed) onToggle(candidate.id);
        }}
        disabled={isMaxed}
        aria-pressed={isSelected}
        className={`flex w-full items-center gap-3 rounded-sm border p-3 text-left transition-colors ${
          isSelected
            ? 'border-[var(--color-institutional)] bg-[color-mix(in_srgb,var(--color-institutional)_8%,var(--color-paper))]'
            : 'border-[var(--color-border-editorial)] bg-[var(--color-paper)] hover:border-[var(--color-institutional)]'
        } ${isMaxed ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      >
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-sm bg-[var(--color-skeleton)]">
          <CandidatePhoto
            name={candidate.full_name}
            photoUrl={candidate.photo_url}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[0.65rem] uppercase tracking-wider text-[var(--color-muted-ink)]">
            {candidate.position_label}
          </p>
          <p className="truncate font-semibold">{candidate.full_name}</p>
          <p className="font-mono text-xs text-[var(--color-muted-ink)]">
            {candidate.party}
            {candidate.ballot_number != null
              ? ` · nº ${candidate.ballot_number}`
              : ''}
          </p>
        </div>
        {isSelected && (
          <span className="shrink-0 font-mono text-sm font-bold text-[var(--color-institutional)]">
            ✓
          </span>
        )}
      </button>
    </li>
  );
});
