/**
 * Script: generate-sitemap
 *
 * Gera sitemap.xml a partir do snapshot público versionado em data/public-candidates.json.
 * O build não lê ../dataset2026 e falha se o snapshot estiver ausente ou inválido.
 *
 * Uso: node scripts/generate-sitemap.mjs [--base-url=<url>]
 * Default: https://rs.votopraquem.org
 */

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadPublicCandidateSnapshot } from './public-candidate-snapshot.mjs';

const BASE_URL = process.argv
  .find((arg) => arg.startsWith('--base-url='))
  ?.split('=')[1]
  ?? 'https://rs.votopraquem.org';

const ROOT = resolve(process.cwd());
const DIST_DIR = resolve(ROOT, 'dist');

export function generateSitemap(candidates, options = {}) {
  const today = options.today ?? new Date().toISOString().split('T')[0];
  const baseUrl = options.baseUrl ?? BASE_URL;

  const staticPages = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/metodologia', priority: '0.7', changefreq: 'monthly' },
  ];

  const candidatePages = candidates.map((candidate) => ({
    loc: `/candidatos/${encodeURIComponent(candidate.slug)}`,
    priority: '0.8',
    changefreq: 'weekly',
  }));

  const allPages = [...staticPages, ...candidatePages];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${page.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;
}

export function generateRobotsTxt(options = {}) {
  const baseUrl = options.baseUrl ?? BASE_URL;
  return `User-agent: *
Allow: /
Disallow: /admin
Disallow: /editorial
Disallow: /login
Sitemap: ${baseUrl}/sitemap.xml
`;
}

function main() {
  console.log('🔄 Gerando sitemap do snapshot público versionado...');

  const candidates = loadPublicCandidateSnapshot({ root: ROOT });
  const sitemap = generateSitemap(candidates);

  writeFileSync(resolve(DIST_DIR, 'sitemap.xml'), sitemap);
  console.log(`✅ sitemap.xml (${candidates.length} candidatos + estáticas = ${candidates.length + 2} URLs)`);

  writeFileSync(resolve(DIST_DIR, 'robots.txt'), generateRobotsTxt());
  console.log('✅ robots.txt');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
