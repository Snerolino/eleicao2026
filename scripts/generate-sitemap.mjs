/**
 * Script: generate-sitemap
 *
 * Gera sitemap.xml a partir dos CSVs TSE em ../dataset2026/
 * Lê os IDs UUID diretamente do mockData.ts gerado, ou dos CSVs TSE.
 *
 * Uso: node scripts/generate-sitemap.mjs [--base-url <url>]
 * Default: https://portal-transparencia-rs.pages.dev
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { v5 as uuidv5 } from 'uuid';
import { parse } from 'csv-parse/sync';

const BASE_URL = process.argv
  .find((a) => a.startsWith('--base-url='))
  ?.split('=')[1]
  ?? 'https://portal-transparencia-rs.pages.dev';

const ROOT = resolve(process.cwd());
const DIST_DIR = resolve(ROOT, 'dist');
const DATASET_DIR = resolve(ROOT, '../dataset2026/candidatos');
const UUID_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

function umlautToAscii(text) {
  return text
    .replace(/[ÀÁÂÃÄ]/g, 'A')
    .replace(/[àáâãä]/g, 'a')
    .replace(/[ÈÉÊË]/g, 'E')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ÌÍÎÏ]/g, 'I')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[ÒÓÔÕÖ]/g, 'O')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ÙÚÛÜ]/g, 'U')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[Ç]/g, 'C')
    .replace(/[ç]/g, 'c')
    .replace(/[Ñ]/g, 'N')
    .replace(/[ñ]/g, 'n');
}

function makeId(name, party) {
  const raw = `${umlautToAscii(name)}-${party}`;
  return uuidv5(raw, UUID_NAMESPACE);
}

function getCandidateIds() {
  const candDir = resolve(DATASET_DIR, 'consulta_cand_2026');
  if (!existsSync(candDir)) {
    console.log('⚠️  TSE dataset não encontrado, sitemap vazio.');
    return [];
  }

  const csvFiles = readdirSync(candDir)
    .filter((f) => f.endsWith('.csv') && /consulta_cand_2026_/.test(f))
    .sort();

  const ids = [];

  for (const csvFile of csvFiles) {
    const csvPath = resolve(candDir, csvFile);
    const raw = readFileSync(csvPath, 'latin1');
    const rows = parse(raw, {
      delimiter: ';',
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_quotes: true,
      relax_column_count: true,
    });

    for (const row of rows) {
      const name = row.NM_CANDIDATO?.trim();
      const party = row.SG_PARTIDO?.trim();
      if (name && party && name !== '#NULO' && party !== '#NULO') {
        ids.push(makeId(name, party));
      }
    }
  }

  return [...new Set(ids)];
}

function generateSitemap(ids) {
  const today = new Date().toISOString().split('T')[0];

  const staticPages = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/metodologia', priority: '0.7', changefreq: 'monthly' },
  ];

  const candidatePages = ids.map((id) => ({
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

function main() {
  console.log('🔄 Gerando sitemap do dataset TSE 2026...');

  const ids = getCandidateIds();
  const sitemap = generateSitemap(ids);

  const sitemapPath = resolve(DIST_DIR, 'sitemap.xml');
  writeFileSync(sitemapPath, sitemap);
  console.log(`✅ sitemap.xml (${ids.length} candidatos + estáticas = ${ids.length + 2} URLs)`);

  const robotsPath = resolve(DIST_DIR, 'robots.txt');
  writeFileSync(robotsPath, `User-agent: *
Allow: /
Sitemap: ${BASE_URL}/sitemap.xml
`);
  console.log('✅ robots.txt');
}

main();