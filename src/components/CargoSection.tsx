import { CandidateCard } from './CandidateCard';
import type { CandidateWithSummary } from '../types';

interface CargoSectionProps {
  cargo: string;
  candidates: CandidateWithSummary[];
}

export function CargoSection({ cargo, candidates }: CargoSectionProps) {
  if (!candidates.length) return null;

  return (
    <section
      className="border-t border-neutral-200 py-8 first:border-t-0"
      aria-labelledby={`cargo-${cargo}`}
    >
      <h2
        id={`cargo-${cargo}`}
        className="mb-4 text-2xl"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}
      >
        {cargo}
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {candidates.map((c) => (
          <CandidateCard key={c.id} {...c} />
        ))}
      </div>
    </section>
  );
}
