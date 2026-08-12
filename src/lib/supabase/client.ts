import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Cliente Supabase para o browser (SPA Vite).
 * Substitui o padrão `utils/supabase/client.ts` do quickstart Next.js,
 * adaptado para `import.meta.env` em vez de `NEXT_PUBLIC_*`.
 *
 * Uso: `const supabase = createClient();`
 */
export const createClient = () =>
  createBrowserClient(supabaseUrl!, supabaseKey!);
