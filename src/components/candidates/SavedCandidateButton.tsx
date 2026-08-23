interface SavedCandidateButtonProps {
  candidateName: string;
  saved: boolean;
  onToggle: () => void;
}

export function SavedCandidateButton({ candidateName, saved, onToggle }: SavedCandidateButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remover ${candidateName} dos salvos` : `Salvar ${candidateName} neste navegador`}
      onClick={onToggle}
      className="relative z-10 inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm border border-[var(--color-border-editorial)] bg-[var(--color-paper)] px-2 font-mono text-lg text-[var(--color-institutional)] transition-colors hover:border-[var(--color-institutional)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-institutional)]"
    >
      {saved ? '★' : '☆'}
    </button>
  );
}
