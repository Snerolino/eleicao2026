// @vitest-environment node

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const config = readFileSync('vite.config.ts', 'utf8');

describe('PWA Workbox editorial data cache', () => {
  it('usa index.html como fallback de navegação para preservar rotas SPA offline', () => {
    expect(config).toContain("navigateFallback: '/index.html'");
    expect(config).not.toContain("navigateFallback: '/offline.html'");
  });

  it('usa StaleWhileRevalidate para claims', () => {
    expect(config).toContain('urlPattern: /\\/rest\\/v1\\/claims/');
    expect(config).toContain("handler: 'StaleWhileRevalidate'");
    expect(config).toContain('maxAgeSeconds: 300');
  });

  it('limita caches públicos e não grava 4xx/5xx', () => {
    expect(config).toContain("cacheName: 'supabase-candidates'");
    expect(config).toContain("cacheName: 'supabase-claims'");
    expect(config).toContain('maxEntries: 80');
    expect(config).toContain('maxEntries: 120');
    expect(config).toContain('cacheableResponse');
    expect(config).toContain('statuses: [0, 200]');
  });

  it('não muta o shape JSON das respostas de claims no service worker', () => {
    expect(config).not.toContain('_sw_cached_at');
    expect(config).not.toContain('cacheWillUpdate');
    expect(config).not.toContain('JSON.stringify({');
  });
});
