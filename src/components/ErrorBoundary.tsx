import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info.componentStack);
      return;
    }

    console.error('[ErrorBoundary] erro capturado');
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-muted-ink)]">
            Erro inesperado
          </p>
          <h1 className="mt-2 text-3xl">Algo deu errado</h1>
          <p className="mt-4 text-sm text-[var(--color-muted-ink)]">
            {import.meta.env.DEV ? (this.state.error?.message ?? 'Um erro inesperado ocorreu.') : 'Um erro inesperado ocorreu.'}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-sm bg-[var(--color-institutional)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Recarregar página
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}
