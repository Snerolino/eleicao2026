import { NavLink } from 'react-router';
import { ThemeToggle } from './ThemeToggle';
import { VersionBadge } from './VersionBadge';

function linkClass({ isActive }: { isActive: boolean }) {
  return [
    'border-b-2 border-transparent pb-1 font-mono text-[0.68rem] uppercase tracking-[0.12em] underline-offset-4 hover:border-[var(--color-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-institutional)]',
    isActive
      ? 'border-[var(--color-institutional)] font-semibold text-[var(--color-institutional)]'
      : 'text-[var(--color-ink)]'
  ].join(' ');
}

export function SiteHeader() {
  return (
    <header className="border-b-[3px] border-double border-[var(--color-ink)] bg-[var(--color-paper)]">
      <div className="mx-auto max-w-6xl px-4 pb-4 pt-5 sm:pt-7">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b border-[var(--color-border-editorial)] pb-3 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--color-muted-ink)]">
          <span>Eleições 2026 · Rio Grande do Sul</span>
          <span>Fonte, data e confiança em cada informação</span>
        </div>

        <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <NavLink
            to="/"
            aria-label="Transparência Eleitoral RS — página inicial"
            className="flex max-w-3xl items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-institutional)]"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 64 64"
              className="h-11 w-11 shrink-0"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="64" height="64" rx="2" fill="var(--color-institutional)" />
              <path d="M18 16h28v6H35v27h-6V22H18z" fill="var(--color-paper)" />
              <circle cx="46" cy="45" r="6" fill="var(--color-factcheck)" />
            </svg>
            <span>
              <span className="block font-[family-name:var(--font-display)] text-2xl font-semibold leading-none tracking-tight sm:text-[2rem]">
                Transparência Eleitoral{' '}
                <span className="text-[var(--color-institutional)]">RS</span>
              </span>
              <span className="mt-1.5 block max-w-2xl font-mono text-[0.68rem] leading-relaxed text-[var(--color-muted-ink)]">
                Dossiê público de candidatos — cada dado com fonte, data de coleta e confiança verificáveis.
              </span>
            </span>
          </NavLink>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <nav
              aria-label="Navegação principal"
              className="flex items-center gap-4 sm:gap-5"
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
            </nav>
            <ThemeToggle />
            <span className="flex items-center">
              <VersionBadge />
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
