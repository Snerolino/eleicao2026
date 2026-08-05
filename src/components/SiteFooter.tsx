import { Link } from 'react-router';

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-[var(--color-border-editorial)] bg-[var(--color-paper)]">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <nav
          aria-label="Navegação secundária"
          className="flex flex-wrap gap-x-6 gap-y-2"
        >
          <Link
            to="/"
            className="font-mono text-xs uppercase tracking-wider text-[var(--color-muted-ink)] underline-offset-4 hover:text-[var(--color-ink)] hover:underline rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-institutional)]"
          >
            Candidatos
          </Link>
          <Link
            to="/comparar"
            className="font-mono text-xs uppercase tracking-wider text-[var(--color-muted-ink)] underline-offset-4 hover:text-[var(--color-ink)] hover:underline rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-institutional)]"
          >
            Comparar
          </Link>
          <Link
            to="/metodologia"
            className="font-mono text-xs uppercase tracking-wider text-[var(--color-muted-ink)] underline-offset-4 hover:text-[var(--color-ink)] hover:underline rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-institutional)]"
          >
            Metodologia
          </Link>
        </nav>
        <p className="mt-3 max-w-xl font-mono text-xs leading-relaxed text-[var(--color-muted-ink)]">
          Projeto de transparência eleitoral. O portal apresenta
          informações atribuídas às respectivas fontes e não emite
          avaliação política dos candidatos.
        </p>
      </div>
    </footer>
  );
}
