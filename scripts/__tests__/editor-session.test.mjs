// @vitest-environment node
import { mkdtempSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { ensureEditorSession, persistEditorSession } from '../lib/editor-session.mjs';

describe('editor-session', () => {
  it('persiste sessão renovada atomicamente com permissão 0600', () => {
    const dir = mkdtempSync(join(tmpdir(), 'editor-session-'));
    const file = join(dir, 'session.json');
    persistEditorSession(file, { access_token: 'new-access', refresh_token: 'new-refresh', expires_at: 123 }, 'user-1');
    expect(JSON.parse(readFileSync(file, 'utf8'))).toMatchObject({ access_token: 'new-access', refresh_token: 'new-refresh', user_id: 'user-1' });
    expect(statSync(file).mode & 0o777).toBe(0o600);
  });

  it('renova, valida papel e grava os tokens retornados', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'editor-session-'));
    const file = join(dir, 'session.json');
    writeFileSync(file, JSON.stringify({ access_token: 'old-access', refresh_token: 'old-refresh' }));
    const maybeSingle = vi.fn().mockResolvedValue({ data: { role: 'editor' }, error: null });
    const supabase = {
      auth: { setSession: vi.fn().mockResolvedValue({ data: { session: { access_token: 'new-access', refresh_token: 'new-refresh', expires_at: 456 }, user: { id: 'user-1' } }, error: null }) },
      from: vi.fn(() => ({ select: () => ({ eq: () => ({ maybeSingle }) }) })),
    };
    const result = await ensureEditorSession(supabase, file);
    expect(result.role).toBe('editor');
    expect(JSON.parse(readFileSync(file, 'utf8')).refresh_token).toBe('new-refresh');
  });

  it('indica reautenticação quando o refresh token foi invalidado', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'editor-session-'));
    const file = join(dir, 'session.json');
    writeFileSync(file, JSON.stringify({ access_token: 'old-access', refresh_token: 'old-refresh' }));
    const supabase = { auth: { setSession: vi.fn().mockResolvedValue({ data: { session: null, user: null }, error: { message: 'Invalid Refresh Token' } }) } };
    await expect(ensureEditorSession(supabase, file)).rejects.toThrow(/EDITOR_REAUTH_REQUIRED/);
  });
});
