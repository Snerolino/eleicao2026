import type { Session, SupabaseClient } from '@supabase/supabase-js';

/**
 * Helper de refresh de sessão para SPA Vite.
 *
 * No Next.js o quickstart usa `utils/supabase/middleware.ts` com `next/server`
 * para renovar o cookie de sessão em cada request. Em um SPA não há middleware
 * de servidor; a renovação é feita no cliente via `onAuthStateChange` /
 * `getSession`. Este módulo centraliza esse padrão para o app.
 *
 * Retorna um `unsubscribe` para ser chamado no unmount do componente.
 */
export function setupSessionRefresh(
  supabase: SupabaseClient,
  onSession?: (session: Session | null) => void,
): () => void {
  // Garante sessão atual válida (renova token se necessário).
  void supabase.auth.getSession().then(({ data }) => onSession?.(data.session));

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    onSession?.(session);
  });

  return () => data.subscription.unsubscribe();
}
