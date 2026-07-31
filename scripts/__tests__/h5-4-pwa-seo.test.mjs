import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { generateRobotsTxt, generateSitemap } from '../generate-sitemap.mjs';

const root = process.cwd();
const viteConfig = readFileSync(join(root, 'vite.config.ts'), 'utf8');
const indexHtml = readFileSync(join(root, 'index.html'), 'utf8');
const publicRobots = readFileSync(join(root, 'public/robots.txt'), 'utf8');
const smoke = readFileSync(join(root, 'scripts/smoke-browser.mjs'), 'utf8');

describe('H5.4 manifest, instalação e SEO', () => {
  it('manifest declara escopo instalável e ícones any/maskable 192/512 existentes', () => {
    expect(viteConfig).toMatch(/scope:\s*'\/'/);
    expect(viteConfig).toMatch(/start_url:\s*'\/'/);
    expect(viteConfig).toMatch(/display:\s*'standalone'/);
    expect(viteConfig).toMatch(/lang:\s*'pt-BR'/);
    expect(viteConfig).toMatch(/theme_color:\s*'#2B4C3F'/);
    expect(viteConfig).toMatch(/background_color:\s*'#F5F6F1'/);
    expect(viteConfig).toMatch(/sizes:\s*'192x192'[\s\S]*purpose:\s*'any'/);
    expect(viteConfig).toMatch(/sizes:\s*'512x512'[\s\S]*purpose:\s*'any'/);
    expect(viteConfig).toMatch(/sizes:\s*'192x192'[\s\S]*purpose:\s*'maskable'/);
    expect(viteConfig).toMatch(/sizes:\s*'512x512'[\s\S]*purpose:\s*'maskable'/);

    for (const file of ['public/icon-192.png', 'public/icon-512.png', 'public/pwa-192.png', 'public/pwa-512.png']) {
      expect(existsSync(join(root, file)), `${file} deve existir`).toBe(true);
    }
  });

  it('HTML base expõe canonical, manifest, theme-color e apple touch sem rotas privadas', () => {
    expect(indexHtml).toMatch(/<link rel="canonical" href="https:\/\/portal-transparencia-rs\.pages\.dev\/"/);
    expect(indexHtml).toMatch(/<link rel="manifest" href="\/manifest\.webmanifest"/);
    expect(indexHtml).toMatch(/<meta name="theme-color" content="#2B4C3F"/);
    expect(indexHtml).toMatch(/<link rel="apple-touch-icon" href="\/icon-192\.png"/);
    expect(indexHtml).not.toMatch(/\/admin|\/editorial|service_role|raw_documents/i);
  });

  it('sitemap e robots referenciam apenas URLs públicas e canônicas', () => {
    const sitemap = generateSitemap([
      { id: '7098b705-765c-56fa-b8c1-7258ab492c7f', slug: 'joao_batista_garcia_dias_210002532992' },
    ], { baseUrl: 'https://portal-transparencia-rs.pages.dev', today: '2026-07-31' });
    const robots = generateRobotsTxt({ baseUrl: 'https://portal-transparencia-rs.pages.dev' });

    expect(sitemap).toContain('/candidatos/joao_batista_garcia_dias_210002532992');
    expect(sitemap).not.toMatch(/7098b705-765c-56fa-b8c1-7258ab492c7f|\/admin|\/editorial|\/login/i);
    expect(robots).toContain('Sitemap: https://portal-transparencia-rs.pages.dev/sitemap.xml');
    expect(robots).toMatch(/Disallow:\s*\/admin/);
    expect(robots).toMatch(/Disallow:\s*\/editorial/);
    expect(publicRobots).toMatch(/Sitemap: https:\/\/portal-transparencia-rs\.pages\.dev\/sitemap\.xml/);
  });

  it('smoke de produção valida manifest e service worker no escopo correto', () => {
    expect(smoke).toMatch(/manifest\.webmanifest/);
    expect(smoke).toMatch(/serviceWorker\.getRegistration\('\/'\)/);
    expect(smoke).toMatch(/display\s*!==\s*'standalone'/);
    expect(smoke).toMatch(/scope\s*!==\s*'\/'/);
  });
});
