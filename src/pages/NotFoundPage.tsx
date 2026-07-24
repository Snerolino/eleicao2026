import { Link } from 'react-router-dom';
import { usePageMetadata } from '@/hooks/usePageMetadata';

export function NotFoundPage() {
  usePageMetadata(
    'Página não encontrada — Portal Transparência Eleitoral RS'
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-muted-ink)]">
        Erro 404
      </p>
      <h1 className="mt-2 text-4xl">
        Página não encontrada
      </h1>
      <p className="mt-4 text-[var(--color-muted-ink)]">
        O endereço pode estar incorreto ou o conteúdo pode ter sido
        removido.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex rounded-sm bg-[var(--color-institutional)] px-4 py-2 text-sm font-semibold text-white"
      >
        Voltar aos candidatos
      </Link>
    </main>
  );
}
