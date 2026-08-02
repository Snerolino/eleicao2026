import { memo } from 'react';
import type {
  CandidateWithClaims,
  Position
} from '@/types/election';
import { POSITION_LABEL } from '@/types/election';
import { CandidateCard } from './CandidateCard';

interface CargoSectionProps {
  position: Position;
  candidates: CandidateWithClaims[];
}

export const CargoSection = memo(function CargoSection({
  position,
  candidates
}: CargoSectionProps) {
  if (candidates.length === 0) return null;

  const label =
    position === 'outro'
      ? candidates[0]?.position_label ?? POSITION_LABEL.outro
      : POSITION_LABEL[position];

  return (
    <section
      aria-labelledby={`cargo-${position}`}
      className="space-y-4"
    >
      <header className="flex items-baseline justify-between gap-4 border-b border-[var(--color-border-editorial)] pb-2">
        <h2
          id={`cargo-${position}`}
          className="text-2xl"
        >
          {label}
        </h2>

        <span className="font-mono text-xs uppercase tracking-wider text-[var(--color-muted-ink)]">
          {candidates.length}{' '}
          {candidates.length === 1 ? 'candidato' : 'candidatos'}
        </span>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {candidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
          />
        ))}
      </div>
    </section>
  );
});
