import { Link } from 'react-router-dom';
import { usePageMetadata } from '@/hooks/usePageMetadata';

const adminOwner = 'admin@votopraquem.org';

const actionCards = [
  {
    title: 'Atualizações TSE',
    description: 'Pedir refresh do snapshot público, revisar diffs de candidatos e confirmar sitemap antes do deploy.',
    action: 'Solicitar atualização TSE',
  },
  {
    title: 'Dados editoriais',
    description: 'Ajustar ou incluir claims como pending_review, anexar fonte pública e publicar só por review aprovado.',
    action: 'Criar rascunho editorial',
  },
  {
    title: 'Operação e rollback',
    description: 'Concentrar autorizações temporárias de SQL remoto, merge sensível, deploy manual e rollback.',
    action: 'Abrir checklist operacional',
  },
];

export function AdminPage() {
  usePageMetadata(
    'Administração — Portal Transparência Eleitoral RS',
    'Painel operacional seguro para acompanhar atualização de dados, editoria e release do portal.'
  );

  return (
    <main id="main-content" className="mx-auto max-w-6xl px-4 py-8">
      <Link
        to="/"
        className="font-mono text-xs uppercase tracking-wider text-[var(--color-institutional)] underline-offset-4 hover:underline"
      >
        ← Voltar à lista pública
      </Link>

      <section className="mt-6 rounded-md border border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-muted-ink)]">
          Operação interna
        </p>
        <h1 className="mt-2 text-3xl">Administração</h1>
        <p className="mt-3 max-w-3xl leading-relaxed text-[var(--color-muted-ink)]">
          Painel preparatório para centralizar rotinas úteis sem expor credenciais no frontend. Responsável provisório por SQL remoto, merge sensível, deploy manual e rollback: <strong>{adminOwner}</strong>.
        </p>
        <p className="mt-3 rounded-sm border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Modo seguro: sem service role no navegador. Escrita real só depois de autenticação e RLS/RPCs editoriais configuradas.
        </p>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3" aria-label="Ações administrativas planejadas">
        {actionCards.map((card) => (
          <article
            key={card.title}
            className="flex min-h-full flex-col rounded-md border border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-5"
          >
            <h2 className="text-xl">{card.title}</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--color-muted-ink)]">
              {card.description}
            </p>
            <button
              type="button"
              disabled
              className="mt-4 cursor-not-allowed rounded-sm border border-[var(--color-border-editorial)] px-3 py-2 font-mono text-xs uppercase tracking-wider text-[var(--color-muted-ink)] opacity-70"
            >
              {card.action}
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}
