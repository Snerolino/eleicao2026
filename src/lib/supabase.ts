import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const hasCredentials = Boolean(supabaseUrl && supabaseAnonKey);

export const isSupabaseConfigured = hasCredentials;

export const supabase = hasCredentials
  ? createClient<Database>(supabaseUrl!, supabaseAnonKey!)
  : null;