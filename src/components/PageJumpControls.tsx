export function PageJumpControls() {
  return (
    <nav
      aria-label="Atalhos da página"
      className="fixed bottom-4 right-4 z-40 flex flex-col gap-2 print:hidden"
    >
      <a
        href="#main-content"
        className="rounded-full border border-[var(--color-border-editorial)] bg-[var(--color-paper)] px-3 py-2 text-center font-mono text-[0.65rem] uppercase tracking-wider text-[var(--color-ink)] shadow-sm hover:border-[var(--color-institutional)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-institutional)]"
      >
        Voltar ao topo
      </a>
      <a
        href="#page-end"
        className="rounded-full border border-[var(--color-border-editorial)] bg-[var(--color-paper)] px-3 py-2 text-center font-mono text-[0.65rem] uppercase tracking-wider text-[var(--color-ink)] shadow-sm hover:border-[var(--color-institutional)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-institutional)]"
      >
        Ir ao final
      </a>
    </nav>
  );
}
