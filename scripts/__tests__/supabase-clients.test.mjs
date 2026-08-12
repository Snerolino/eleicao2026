// @vitest-environment node

import { describe, expect, it, vi } from 'vitest';

describe('src/lib/supabase/server', () => {
  it('createClient retorna null quando VITE_SUPABASE_* ausentes', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
    // limpa cache de módulo para reler os envs stubados
    vi.resetModules();
    const mod = await import('../../src/lib/supabase/server.ts');
    expect(mod.createClient()).toBeNull();
    vi.unstubAllEnvs();
  });
});

describe('src/lib/supabase/client', () => {
  it('módulo carrega sem erro de import (SPA)', async () => {
    await expect(import('../../src/lib/supabase/client.ts')).resolves.toBeDefined();
  });
});

describe('src/lib/supabase/middleware', () => {
  it('setupSessionRefresh retorna unsubscribe e chama getSession', async () => {
    const { setupSessionRefresh } = await import('../../src/lib/supabase/middleware.ts');
    const fakeSub = { unsubscribe: vi.fn() };
    const getSession = vi.fn().mockResolvedValue({ data: { session: null } });
    const fakeSupabase = {
      auth: {
        getSession,
        onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: fakeSub } }),
      },
    };
    const unsub = setupSessionRefresh(fakeSupabase, () => undefined);
    expect(typeof unsub).toBe('function');
    expect(getSession).toHaveBeenCalledTimes(1);
    unsub();
    expect(fakeSub.unsubscribe).toHaveBeenCalledTimes(1);
  });
});
