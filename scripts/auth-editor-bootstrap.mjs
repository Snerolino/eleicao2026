#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { persistEditorSession } from './lib/editor-session.mjs';

function loadEnv() {
  const out = { ...process.env };
  try { for (const line of readFileSync(resolve(import.meta.dirname, '..', '.env.local'), 'utf8').split('\n')) { const i = line.indexOf('='); if (i > 0 && !line.trim().startsWith('#')) out[line.slice(0, i).trim()] ??= line.slice(i + 1).trim().replace(/^["']|["']$/g, ''); } } catch {}
  return out;
}
const env = loadEnv();
const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const anonKey = env.SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY;
const email = env.SUPABASE_EDITOR_EMAIL || 'admin@votopraquem.org';
if (!url || !anonKey || !process.stdin.isTTY) throw new Error('SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY e TTY são obrigatórios.');
let password = '';
process.stdout.write(`Senha Supabase Auth para ${email}: `);
process.stdin.setRawMode(true); process.stdin.resume();
await new Promise((resolveInput, reject) => { process.stdin.on('data', (chunk) => { for (const char of String(chunk)) { if (char === '\u0003') reject(new Error('cancelado')); else if (char === '\r' || char === '\n') { process.stdin.setRawMode(false); process.stdin.pause(); process.stdout.write('\n'); resolveInput(); } else if (char === '\u007f') password = password.slice(0, -1); else password += char; } }); });
const sb = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
const { data, error } = await sb.auth.signInWithPassword({ email, password }); password = '';
if (error || !data.session || !data.user) throw new Error(`Auth falhou: ${error?.message ?? 'sessão ausente'}`);
const { data: role, error: roleError } = await sb.from('editor_roles').select('role').eq('user_id', data.user.id).maybeSingle();
if (roleError || !role || !['editor', 'admin'].includes(role.role)) throw new Error('usuário sem papel editor/admin');
const stateFile = resolve(env.XDG_STATE_HOME || resolve(homedir(), '.local', 'state'), 'eleicao2026/supabase-editor-session.json');
persistEditorSession(stateFile, data.session, data.user.id);
console.log(JSON.stringify({ ok: true, user_id: data.user.id, role: role.role, state_file: stateFile, password_persisted: false }));
