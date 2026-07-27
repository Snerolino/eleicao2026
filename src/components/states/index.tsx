import type { ReactNode } from 'react';

export function LoadingSkeleton({
  label = 'Carregando...'
}: {
  label?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="space-y-10"
    >
      <span className="sr-only">{label}</span>

      {[0, 1].map((section) => (
        <div key={section} className="space-y-4">
          <div className="h-7 w-52 animate-pulse rounded bg-[var(--color-skeleton)]" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((card) => (
              <div
                key={card}
                className="h-72 animate-pulse rounded-md border border-[var(--color-border-editorial)] bg-[var(--color-skeleton)]"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ErrorState({
  onRetry,
  title = 'Erro de conexão',
  message = 'Não foi possível carregar os dados.'
}: {
  onRetry?: () => void;
  title?: string;
  message?: string;
}) {
  return (
    <section
      role="alert"
      className="rounded-md border border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-6"
    >
      <h2 className="text-2xl">{title}</h2>
      <p className="mt-2 text-sm text-[var(--color-muted-ink)]">
        {message}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-sm bg-[var(--color-institutional)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Tentar novamente
        </button>
      )}
    </section>
  );
}

export function EmptyState({
  children
}: {
  children: ReactNode;
}) {
  return (
    <section className="rounded-md border border-dashed border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-6 text-sm text-[var(--color-muted-ink)]">
      {children}
    </section>
  );
}

export function DemoBanner() {
  return (
    <div
      role="alert"
      className="border-y-2 border-[var(--color-factcheck)] bg-[color-mix(in_srgb,var(--color-factcheck)_9%,var(--color-paper))] px-4 py-2 text-center font-mono text-xs font-medium uppercase tracking-widest"
    >
      Ambiente de demonstração — dados de teste
    </div>
  );
}
