/**
 * Script: generate-sitemap
 *
 * Gera sitemap.xml e robots.txt a partir da lista de candidatos.
 * Executa após o build para incluir as URLs corretas.
 *
 * Uso: node scripts/generate-sitemap.mjs [--base-url <url>]
 * Default: https://portal-transparencia-rs.pages.dev
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const BASE_URL = process.argv
  .find((a) => a.startsWith('--base-url='))
  ?.split('=')[1]
  ?? 'https://portal-transparencia-rs.pages.dev';

const DIST_DIR = resolve(process.cwd(), 'dist');

function getCandidateUrls() {
  const mockPath = resolve(process.cwd(), 'src/services/mockData.ts');
  if (!existsSync(mockPath)) return [];

  const content = readFileSync(mockPath, 'utf-8');
  // Match only candidate IDs (4-space indent, not 8-space for claims/docs)
  const ids = [...content.matchAll(/^ {4}id:\s*['"]([^'"]+)['"]/gm)].map((m) => m[1]);
  return [...new Set(ids)];
}

function generateSitemap(urls) {
  const today = new Date().toISOString().split('T')[0];

  const staticPages = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/metodologia', priority: '0.7', changefreq: 'monthly' },
  ];

  const candidatePages = urls.map((id) => ({
    loc: `/candidatos/${encodeURIComponent(id)}`,
    priority: '0.8',
    changefreq: 'weekly',
  }));

  const allPages = [...staticPages, ...candidatePages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>${BASE_URL}${page.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return xml;
}

const urls = getCandidateUrls();
const sitemap = generateSitemap(urls);

const sitemapPath = resolve(DIST_DIR, 'sitemap.xml');
writeFileSync(sitemapPath, sitemap);
console.log(`✅ sitemap.xml (${urls.length} candidatos + estáticas = ${urls.length + 2} URLs)`);

const robotsPath = resolve(DIST_DIR, 'robots.txt');
writeFileSync(robotsPath, `User-agent: *
Allow: /
Sitemap: ${BASE_URL}/sitemap.xml
`);
console.log('✅ robots.txt');
