#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fetchConcurrent } from './lib/http-pool.mjs';

const root = resolve(import.meta.dirname, '..');
const metadataFile = resolve(root, 'data/legislative-import/alrs/proposition-version-metadata-v1.json');
const outputFile = resolve(root, 'data/legislative-import/alrs/alrs-substantive-source-manifest-v1.json');
const corpusDir = resolve(root, 'data/legislative-import/alrs/source-corpus');
const base = 'https://ww4.al.rs.gov.br/proposicao';
const limit = Number(process.argv.find((arg) => arg.startsWith('--limit='))?.slice(8) ?? Infinity);
const force = process.argv.includes('--force');
const freshHours = 6;
if (!force && existsSync(outputFile) && (Date.now() - statSync(outputFile).mtimeMs) < freshHours * 3_600_000) {
  const cached = JSON.parse(readFileSync(outputFile, 'utf8'));
  console.log(JSON.stringify({ output: outputFile, status: 'fresh_cache', propositions: cached.totals?.propositions ?? 0, green_versions: cached.totals?.green_versions ?? 0 }));
  process.exit(0);
}
const metadata = JSON.parse(readFileSync(metadataFile, 'utf8')).items ?? {};
const propositions = new Map();
for (const [versionId, item] of Object.entries(metadata)) {
  const type = String(item.proposition_type ?? '').toLowerCase();
  if (!['pl', 'pec'].includes(type)) continue;
  const key = `${type}:${item.number}:${item.year}`;
  const current = propositions.get(key) ?? { type, number: item.number, year: item.year, version_ids: [], title: item.title };
  current.version_ids.push(versionId); propositions.set(key, current);
}
const selected = [...propositions.values()].sort((a, b) => `${a.type}:${a.number}:${a.year}`.localeCompare(`${b.type}:${b.number}:${b.year}`)).slice(0, limit);
function extractPdfUrls(html) { return [...html.matchAll(/https?:\/\/api-nopaper\.al\.rs\.gov\.br\/[^"'<>\s]+?\.pdf[^"'<>\s]*/gi)].map((match) => match[0].replace(/&amp;/g, '&')).filter((url, index, all) => all.indexOf(url) === index); }
const pageTasks = selected.map((prop) => { const url = `${base}/${prop.type}/${prop.number}/${prop.year}`; return { url, headers: { accept: 'text/html', 'user-agent': 'eleicao2026-alrs-substantive-source/1.0' }, parse: async ({ response, body }) => ({ ...prop, url, http_status: response.status, page_bytes: Buffer.byteLength(body), page_sha256: createHash('sha256').update(body).digest('hex'), pdf_urls: response.ok ? extractPdfUrls(body) : [] }), onError: async (error) => ({ ...prop, url, http_status: null, page_bytes: 0, page_sha256: null, pdf_urls: [], error: String(error?.message ?? error) }) }; });
const pages = await fetchConcurrent(pageTasks, { concurrency: 16, retries: 2 });
const pdfUrls = [...new Set(pages.flatMap((page) => page.pdf_urls))];
mkdirSync(corpusDir, { recursive: true });
const pdfResults = []; let cursor = 0;
async function pdfWorker() { while (true) { const index = cursor++; if (index >= pdfUrls.length) return; const url = pdfUrls[index]; try { const response = await fetch(url, { redirect: 'follow', headers: { accept: 'application/pdf', 'user-agent': 'eleicao2026-alrs-substantive-source/1.0' }, signal: AbortSignal.timeout(30_000) }); const bytes = Buffer.from(await response.arrayBuffer()); const sha256 = createHash('sha256').update(bytes).digest('hex'); const path = resolve(corpusDir, `${sha256}.pdf`); if (response.ok && bytes.length > 4 && bytes.subarray(0, 4).toString() === '%PDF') writeFileSync(path, bytes); pdfResults.push({ url, http_status: response.status, bytes: bytes.length, sha256, path: response.ok ? `source-corpus/${sha256}.pdf` : null, valid_pdf: response.ok && bytes.subarray(0, 4).toString() === '%PDF' }); } catch (error) { pdfResults.push({ url, http_status: null, bytes: 0, sha256: null, path: null, valid_pdf: false, error: String(error?.message ?? error) }); } } }
await Promise.all(Array.from({ length: Math.min(16, pdfUrls.length) }, pdfWorker));
const pdfByUrl = new Map(pdfResults.map((item) => [item.url, item]));
const items = {};
for (const page of pages) { const pdf = page.pdf_urls.map((url) => pdfByUrl.get(url)).find((item) => item?.valid_pdf); const green = page.http_status === 200 && page.page_bytes > 0 && Boolean(pdf); for (const versionId of page.version_ids) items[versionId] = { proposition_external_id: `${page.type.toUpperCase()} ${page.number}/${page.year}`, proposition_page: page.url, proposition_page_sha256: page.page_sha256, proposition_page_bytes: page.page_bytes, document_url: pdf?.url ?? null, document_sha256: pdf?.sha256 ?? null, document_bytes: pdf?.bytes ?? 0, document_path: pdf?.path ?? null, source_bytes_preserved: Boolean(pdf?.valid_pdf), renewable_locator_verified: page.http_status === 200, durability_gate: green ? 'green' : 'blocked', source_durability_gate: green ? 'green' : 'blocked' }; }
const result = { schema_version: '1.0.0', packet_type: 'alrs_substantive_source_manifest', remote_apply: false, source_kind: 'official_alrs_proposition_page_and_pdf', concurrency: 16, totals: { propositions: selected.length, versions: Object.keys(items).length, green_versions: Object.values(items).filter((item) => item.durability_gate === 'green').length, pages_http_ok: pages.filter((page) => page.http_status === 200).length, pdf_urls: pdfUrls.length, valid_pdfs: pdfResults.filter((item) => item.valid_pdf).length }, items };
writeFileSync(outputFile, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ output: outputFile, totals: result.totals }));
