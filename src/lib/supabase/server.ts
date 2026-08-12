import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

/**
 * Cliente Supabase para execução em Node (scripts de ingestão/import,
 * rotinas de manutenção). Em um SPA Vite não há `next/headers`/`next/server`;
 * o equivalente ao `utils/supabase/server.ts` do Next usa `process.env`.
 *
 * ATENÇÃO: use a CHAVE ANON (VITE_SUPABASE_ANON_KEY) para leitura pública.
 * Para escrita privilegiada (service_role), use o script dedicado com
 * SUPABASE_SERVICE_ROLE_KEY — nunca exposto no bundle do frontend.
 */
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

export const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const createClient = () =>
  isConfigured
    ? createSupabaseClient<Database>(supabaseUrl!, supabaseAnonKey!)
    : null;
