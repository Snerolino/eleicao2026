#!/usr/bin/env node
/** Descobre vote-ids na API oficial da Câmara; somente leitura, sem Supabase. */
import { resolve } from 'node:path';

const API = 'https://dadosabertos.camara.leg.br/api/v2';
const DEFAULT_START = '2025-01-01';
const DEFAULT_END = '2026-12-31';

export function buildVotesUrl({ start = DEFAULT_START, end = DEFAULT_END, page = 1, items = 100 } = {}) {
  const url = new URL(`${API}/votacoes`);
  url.searchParams.set('dataInicio', start);
  url.searchParams.set('dataFim', end);
  url.searchParams.set('itens', String(items));
  url.searchParams.set('pagina', String(page));
  url.searchParams.set('ordem', 'ASC');
  url.searchParams.set('ordenarPor', 'DataHoraRegistro');
  return url.toString();
}

export function buildDateWindows(start = DEFAULT_START, end = DEFAULT_END) {
  const first = new Date(`${start}T00:00:00Z`);
  const last = new Date(`${end}T00:00:00Z`);
  if (Number.isNaN(first.getTime()) || Number.isNaN(last.getTime()) || first > last) throw new Error('intervalo de datas inválido');
  const windows = [];
  let cursor = first;
  while (cursor <= last) {
    const next = new Date(cursor);
    next.setUTCMonth(next.getUTCMonth() + 3);
    next.setUTCDate(next.getUTCDate() - 1);
    const windowEnd = next < last ? next : last;
    windows.push({ start: cursor.toISOString().slice(0, 10), end: windowEnd.toISOString().slice(0, 10) });
    cursor = new Date(windowEnd);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return windows;
}

export function classifyDiscoveryResponse({ status, error = null }) {
  if (error) return { status: 'blocked', reason: 'network_error', detail: String(error) };
  if (status === 405) return { status: 'blocked', reason: 'method_not_allowed' };
  if (status >= 400) return { status: 'blocked', reason: `http_${status}` };
  return { status: 'ok', reason: null };
}

export function collectVoteIds(pages) {
  const ids = new Set();
  for (const page of pages) {
    for (const vote of page?.dados ?? []) {
      if (vote?.id !== undefined && vote?.id !== null) ids.add(String(vote.id));
    }
  }
  return [...ids];
}

async function getPage(url) {
  try {
    const response = await fetch(url, { headers: { accept: 'application/json' } });
    const payload = await response.json().catch(() => ({}));
    const classification = classifyDiscoveryResponse({ status: response.status });
    return { url, status: response.status, ...classification, payload: classification.status === 'ok' ? payload : null };
  } catch (error) {
    return { url, ...classifyDiscoveryResponse({ error: error.message }), payload: null };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const start = args[args.indexOf('--start') + 1] || DEFAULT_START;
  const end = args[args.indexOf('--end') + 1] || DEFAULT_END;
  const maxPages = Number(args[args.indexOf('--max-pages') + 1] || 1);
  if (!Number.isInteger(maxPages) || maxPages < 1 || maxPages > 100) throw new Error('--max-pages deve estar entre 1 e 100');

  const pages = [];
  for (const window of buildDateWindows(start, end)) {
    for (let page = 1; page <= maxPages; page += 1) {
      const result = await getPage(buildVotesUrl({ ...window, page }));
      pages.push({ ...result, window });
      if (result.status !== 'ok' || (result.payload?.dados ?? []).length === 0) break;
    }
  }

  const blocked = pages.filter((page) => page.status === 'blocked');
  console.log(JSON.stringify({
    mode: 'read-only',
    source: API,
    query: { start, end, max_pages: maxPages },
    pages: pages.map(({ payload: _payload, ...page }) => page),
    vote_ids: blocked.length > 0 ? [] : collectVoteIds(pages.map((page) => page.payload)),
    blocked: blocked.length > 0 ? blocked.map(({ reason, detail = null, window }) => ({ reason, detail, window })) : null,
  }, null, 2));
  if (blocked.length > 0) process.exitCode = 2;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)) {
  main().catch((error) => { console.error(`camara-discover: ${error.message}`); process.exitCode = 1; });
}
