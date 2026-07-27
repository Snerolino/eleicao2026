import { NavLink } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

function linkClass({ isActive }: { isActive: boolean }) {
  return [
    'font-mono text-xs uppercase tracking-wider underline-offset-4 hover:underline',
    isActive
      ? 'font-semibold text-[var(--color-institutional)] underline'
      : 'text-[var(--color-ink)]'
  ].join(' ');
}

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--color-border-editorial)] bg-[var(--color-paper)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <NavLink
            to="/"
            className="block text-2xl leading-tight sm:text-3xl"
          >
            Portal Transparência Eleitoral{' '}
            <span className="text-[var(--color-institutional)]">
              RS
            </span>
          </NavLink>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-muted-ink)]">
            Consulta pública a candidatos das eleições de 2026 no
            Rio Grande do Sul. Cada informação mostra sua fonte,
            data de coleta e nível de confiança.
          </p>
        </div>

        <nav
          aria-label="Navegação principal"
          className="flex items-center gap-5"
        >
          <NavLink to="/" end className={linkClass}>
            Candidatos
          </NavLink>
          <NavLink to="/comparar" className={linkClass}>
            Comparar
          </NavLink>
          <NavLink to="/metodologia" className={linkClass}>
            Metodologia
          </NavLink>
          <span className="ml-2">
            <ThemeToggle />
          </span>
        </nav>
      </div>
    </header>
  );
}
