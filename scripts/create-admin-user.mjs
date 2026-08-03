import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env.local');

function loadEnv() {
  try {
    return Object.fromEntries(
      readFileSync(envPath, 'utf-8')
        .split('\n')
        .filter((line) => line.trim() && !line.trim().startsWith('#') && line.includes('='))
        .map((line) => {
          const index = line.indexOf('=');
          return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^['"]|['"]$/g, '')];
        }),
    );
  } catch {
    return {};
  }
}

function requireEnv(name, value) {
  if (!value) throw new Error(`${name} ausente.`);
  return value;
}

function resolveConfig() {
  const env = loadEnv();
  const supabaseUrl = requireEnv('VITE_SUPABASE_URL', process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL);
  const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY);
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@votopraquem.org';
  const adminPassword = requireEnv('ADMIN_PASSWORD', process.env.ADMIN_PASSWORD);

  if (adminPassword.length < 12) {
    throw new Error('ADMIN_PASSWORD deve ter pelo menos 12 caracteres.');
  }

  return { supabaseUrl, serviceRoleKey, adminEmail, adminPassword };
}

function buildClient(supabaseUrl, serviceRoleKey) {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function findUserByEmail(supabase, email) {
  let page = 1;
  const perPage = 100;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === email.toLowerCase());
    if (user) return user;
    if (data.users.length < perPage) return null;
    page += 1;
  }
}

async function ensureAdminUser(supabase, adminEmail, adminPassword) {
  const existing = await findUserByEmail(supabase, adminEmail);

  if (existing) {
    const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        ...(existing.user_metadata ?? {}),
        role: 'admin',
        project: 'eleicao2026',
      },
    });
    if (error) throw error;
    return data.user;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: {
      role: 'admin',
      project: 'eleicao2026',
    },
  });

  if (error) throw error;
  return data.user;
}

async function upsertEditorRole(supabase, userId) {
  const { error } = await supabase
    .from('editor_roles')
    .upsert({ user_id: userId, role: 'admin' }, { onConflict: 'user_id' });

  if (error) throw error;
}

async function main() {
  const { supabaseUrl, serviceRoleKey, adminEmail, adminPassword } = resolveConfig();
  const supabase = buildClient(supabaseUrl, serviceRoleKey);
  const user = await ensureAdminUser(supabase, adminEmail, adminPassword);
  if (!user?.id) throw new Error('Falha ao criar ou localizar usuário admin.');

  await upsertEditorRole(supabase, user.id);

  console.log(`✅ Admin pronto: ${adminEmail}`);
  console.log('✅ Papel editorial administrativo aplicado. Credenciais não foram exibidas.');
}

main().catch((error) => {
  const safe = String(error?.message ?? error).replace(/(eyJ[a-zA-Z0-9._-]+|sb_[a-zA-Z0-9._-]+|password\s*[:=]\s*\S+)/g, '[REDACTED]');
  console.error(`❌ ${safe}`);
  process.exit(1);
});
