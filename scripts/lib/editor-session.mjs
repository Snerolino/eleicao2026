import { chmodSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

export function readEditorSession(stateFile) {
  if (!existsSync(stateFile)) {
    throw new Error(`EDITOR_REAUTH_REQUIRED: sessão ausente; execute npm run auth:editor:bootstrap em TTY.`);
  }
  const session = JSON.parse(readFileSync(stateFile, 'utf8'));
  if (!session.access_token || !session.refresh_token) {
    throw new Error('EDITOR_REAUTH_REQUIRED: sessão incompleta; execute npm run auth:editor:bootstrap em TTY.');
  }
  return session;
}

export function persistEditorSession(stateFile, session, userId = null) {
  const stateDir = dirname(stateFile);
  mkdirSync(stateDir, { recursive: true, mode: 0o700 });
  const temp = `${stateFile}.tmp-${process.pid}`;
  writeFileSync(temp, `${JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at,
    user_id: userId ?? session.user?.id ?? null,
    refreshed_at: new Date().toISOString(),
  }, null, 2)}\n`, { mode: 0o600 });
  renameSync(temp, stateFile);
  chmodSync(stateFile, 0o600);
}

export async function ensureEditorSession(supabase, stateFile) {
  const stored = readEditorSession(stateFile);
  const { data, error } = await supabase.auth.setSession({
    access_token: stored.access_token,
    refresh_token: stored.refresh_token,
  });
  if (error || !data.session || !data.user) {
    const detail = error?.message ?? 'sessão ausente';
    throw new Error(`EDITOR_REAUTH_REQUIRED: ${detail}; execute npm run auth:editor:bootstrap em TTY.`);
  }
  persistEditorSession(stateFile, data.session, data.user.id);
  const { data: role, error: roleError } = await supabase
    .from('editor_roles')
    .select('role')
    .eq('user_id', data.user.id)
    .maybeSingle();
  if (roleError || !role || !['editor', 'admin'].includes(role.role)) {
    throw new Error('EDITOR_ROLE_REQUIRED: sessão sem papel editor/admin');
  }
  return { session: data.session, user: data.user, role: role.role };
}
