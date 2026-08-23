export type CandidateViewMode = 'detailed' | 'compact';

interface CandidateViewToggleProps {
  value: CandidateViewMode;
  onChange: (value: CandidateViewMode) => void;
}

export function CandidateViewToggle({ value, onChange }: CandidateViewToggleProps) {
  return (
    <div className="flex items-center gap-2" aria-label="Modo de visualização">
      <span className="font-mono text-xs uppercase tracking-wider text-[var(--color-muted-ink)]">Visualização:</span>
      <div className="flex rounded-sm border border-[var(--color-border-editorial)] p-0.5">
        {(['detailed', 'compact'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            aria-pressed={value === mode}
            onClick={() => onChange(mode)}
            className={`min-h-10 px-3 font-mono text-xs uppercase tracking-wider focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-institutional)] ${value === mode ? 'bg-[var(--color-institutional)] text-white' : 'text-[var(--color-muted-ink)]'}`}
          >
            {mode === 'detailed' ? 'Detalhada' : 'Compacta'}
          </button>
        ))}
      </div>
    </div>
  );
}
