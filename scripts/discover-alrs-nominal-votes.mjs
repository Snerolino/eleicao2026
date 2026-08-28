#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fetchConcurrent } from './lib/http-pool.mjs';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'data/legislative-import/alrs/alrs-nominal-discovery-manifest-v1.json');
const candidatesFile = resolve(root, 'data/public-candidates.json');
const years = (process.argv.find((arg) => arg.startsWith('--years='))?.slice(8) ?? '2019,2020,2021,2022,2023,2024,2025,2026').split(',').map(Number);
const base = 'https://transparencia.al.rs.gov.br/parlamentares/votos-plenario';
const headers = { accept: 'text/html', 'user-agent': 'eleicao2026-alrs-discovery/1.0' };

function decode(value) { return value.replace(/&quot;|&#34;|&#x22;/gi, '"').replace(/&apos;|&#39;|&#x27;/gi, "'").replace(/&lt;|&#60;|&#x3c;/gi, '<').replace(/&gt;|&#62;|&#x3e;/gi, '>').replace(/&amp;|&#38;|&#x26;/gi, '&').replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16))).replace(/&#([0-9]+);/g, (_, dec) => String.fromCodePoint(Number(dec))); }
function dataItems(html) { return [...html.matchAll(/\bdata-item(?![\w:-])\s*=\s*(["'])([\s\S]*?)\1/gi)].flatMap((match) => { try { return [JSON.parse(decode(match[2]))]; } catch { return []; } }); }
function normalize(value) { return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim(); }
function stripTitles(value) { return String(value ?? '').replace(/\b(DR|DRA|PROF|PROFA|DELEGADO|DELEGADA|CAPITAO|TENENTE|SARGENTO|CORONEL|PASTOR|PASTORA|PADRE|BOMBEIRO|ENGENHEIRO)\b\.?/gi, '').replace(/\s+/g, ' ').trim(); }
function candidatesByName() {
  const data = JSON.parse(readFileSync(candidatesFile, 'utf8'));
  const rows = Array.isArray(data) ? data : data.candidates ?? [];
  const map = new Map();
  for (const row of rows) {
    const names = [row.full_name, row.ballot_name, row.nome_urna, stripTitles(row.full_name), stripTitles(row.ballot_name ?? row.nome_urna)].map(normalize).filter(Boolean);
    for (const name of new Set(names)) {
      const list = map.get(name) ?? [];
      if (!list.some((candidate) => candidate.candidate_id === row.id)) list.push({ candidate_id: row.id, tse_candidate_id: row.tse_candidate_id, name: row.full_name, ballot_name: row.ballot_name ?? row.nome_urna });
      map.set(name, list);
    }
  }
  return map;
}
async function get(url) { const response = await fetch(url, { headers, redirect: 'follow', signal: AbortSignal.timeout(20_000) }); const body = await response.text(); return { url, http_status: response.status, bytes: Buffer.byteLength(body), sha256: createHash('sha256').update(body).digest('hex'), items: response.ok ? dataItems(body) : [] }; }
function makeTask(parliamentarian, year) {
  const url = `${base}/pesquisa?solicitante=${encodeURIComponent(parliamentarian.solicitante_id)}&ano=${year}`;
  const meta = { solicitante_id: parliamentarian.solicitante_id, name: parliamentarian.name, year, candidate_match_count: parliamentarian.exact_candidate_matches.length };
  return { url, headers, parse: async ({ response, body }) => { const items = response.ok ? dataItems(body) : []; return { ...meta, url, http_status: response.status, bytes: Buffer.byteLength(body), sha256: createHash('sha256').update(body).digest('hex'), data_item_count: items.length, items: items.map((item) => ({ tipoProjeto: item.tipoProjeto, numProposicao: item.numProposicao, anoProposicao: item.anoProposicao, dataVotacao: item.dataVotacao, voto: item.voto, resultadoVotacao: item.resultadoVotacao, materia: item.materia })) }; }, onError: async (error) => ({ ...meta, url, http_status: null, bytes: 0, sha256: null, data_item_count: 0, error: String(error?.message ?? error), items: [] }) };
}
const main = await get(base);
if (main.http_status !== 200) throw new Error(`ALRS principal HTTP ${main.http_status}`);
const html = await (await fetch(base, { headers, signal: AbortSignal.timeout(20_000) })).text();
const options = [...html.matchAll(/<option[^>]+value=["']([^"']+)["'][^>]*>([\s\S]*?)<\/option>/gi)].map((match) => ({ solicitante_id: match[1], name: match[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() })).filter((row) => row.solicitante_id && row.name && row.solicitante_id !== '0');
const byName = candidatesByName();
const catalog = options.map((row) => ({ ...row, normalized_name: normalize(row.name), exact_candidate_matches: byName.get(normalize(row.name)) ?? [] }));
const tasks = catalog.flatMap((parliamentarian) => years.map((year) => makeTask(parliamentarian, year)));
const pages = await fetchConcurrent(tasks, { concurrency: 16, retries: 2 });
const result = { schema_version: '1.0.0', packet_type: 'alrs_nominal_vote_discovery_manifest', remote_apply: false, source: base, years, generated_at: new Date().toISOString(), totals: { parliamentarians: catalog.length, pages: pages.length, http_ok: pages.filter((page) => page.http_status === 200).length, pages_with_data_items: pages.filter((page) => page.data_item_count > 0).length, data_items: pages.reduce((sum, page) => sum + page.data_item_count, 0), exact_candidate_matches: catalog.filter((row) => row.exact_candidate_matches.length === 1).length, ambiguous_candidate_matches: catalog.filter((row) => row.exact_candidate_matches.length > 1).length, unmatched_candidate_names: catalog.filter((row) => row.exact_candidate_matches.length === 0).length }, catalog, pages };
mkdirSync(resolve(root, 'data/legislative-import/alrs'), { recursive: true });
writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ output, totals: result.totals }));
