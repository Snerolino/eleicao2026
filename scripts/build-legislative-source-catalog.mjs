#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA_RE = /^sha256:[0-9a-f]{64}$/;
const ALLOWED_CATEGORIES = new Set(['oficial', 'jornalistica', 'academica', 'institucional', 'outro']);

function usage() {
  return `Uso: node scripts/build-legislative-source-catalog.mjs [--emit-sql] [--resolve-from-file ids.json] <sources.json>`;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function parseArgs(argv) {
  const args = [...argv];
  let emitSql = false;
  let resolveFromFile = null;
  const positional = [];
  while (args.length > 0) {
    const arg = args.shift();
    if (arg === '--emit-sql') {
      emitSql = true;
      continue;
    }
    if (arg === '--resolve-from-file') {
      const file = args.shift();
      if (!file) fail(`${usage()}\nErro: --resolve-from-file exige caminho.`);
      resolveFromFile = file;
      continue;
    }
    if (arg?.startsWith('--')) fail(`${usage()}\nErro: flag desconhecida: ${arg}`);
    positional.push(arg);
  }
  if (positional.length !== 1) fail(`${usage()}\nErro: informe exatamente um arquivo sources.json.`);
  return { emitSql, resolveFromFile, sourcesPath: positional[0] };
}

function normKey(value) {
  return String(value).trim().toLowerCase();
}

function readJson(path) {
  return JSON.parse(readFileSync(resolve(path), 'utf8'));
}

function validateSource(source, index) {
  const where = `sources[${index}]`;
  for (const field of ['key', 'source_name', 'source_category', 'url', 'title', 'content_hash']) {
    if (typeof source[field] !== 'string' || source[field].trim() === '') {
      throw new Error(`${where}.${field} obrigatório`);
    }
  }
  if (source.key !== source.url) throw new Error(`${where}.key deve ser igual a url`);
  if (!source.url.startsWith('https://dadosabertos.camara.leg.br/') && !source.url.startsWith('https://www.camara.leg.br/')) {
    throw new Error(`${where}.url fora das fontes públicas oficiais da Câmara`);
  }
  if (!ALLOWED_CATEGORIES.has(source.source_category)) throw new Error(`${where}.source_category inválida`);
  if (!SHA_RE.test(source.content_hash)) throw new Error(`${where}.content_hash deve ser sha256:<64 hex>`);
  if (source.hash_method && !['canonical-json-v1', 'raw-bytes-v1'].includes(source.hash_method)) {
    throw new Error(`${where}.hash_method inválido`);
  }
}

function loadSources(path) {
  const data = readJson(path);
  if (data.schema_version !== '1.0.0') throw new Error('schema_version deve ser 1.0.0');
  if (!Array.isArray(data.sources)) throw new Error('sources deve ser array');
  const seenKeys = new Set();
  const seenHashes = new Set();
  const sources = data.sources.map((source, index) => {
    validateSource(source, index);
    const key = normKey(source.key);
    if (seenKeys.has(key)) throw new Error(`Fonte duplicada por key: ${source.key}`);
    if (seenHashes.has(source.content_hash)) throw new Error(`Fonte duplicada por content_hash: ${source.content_hash}`);
    seenKeys.add(key);
    seenHashes.add(source.content_hash);
    return {
      key,
      source_name: source.source_name,
      source_category: source.source_category,
      url: source.url,
      title: source.title,
      content_hash: source.content_hash,
    };
  });
  sources.sort((a, b) => a.key.localeCompare(b.key));
  return sources;
}

function loadResolvedIds(path) {
  if (!path) return {};
  const ids = readJson(path);
  if (!ids || typeof ids !== 'object' || Array.isArray(ids)) throw new Error('Arquivo de resolução deve ser objeto content_hash -> uuid');
  for (const [hash, uuid] of Object.entries(ids)) {
    if (!SHA_RE.test(hash)) throw new Error(`content_hash inválido no arquivo de resolução: ${hash}`);
    if (typeof uuid !== 'string' || !UUID_RE.test(uuid)) throw new Error(`UUID inválido para ${hash}: ${uuid}`);
  }
  return ids;
}

function buildCatalog(sources, resolvedIds = {}) {
  const sourceReferenceByKey = {};
  const unresolved = [];
  for (const source of sources) {
    const uuid = resolvedIds[source.content_hash] ?? null;
    sourceReferenceByKey[source.key] = uuid;
    if (uuid === null) unresolved.push(`source_references:${source.key}`);
  }
  return { sourceReferenceByKey, sourceReferences: sources, unresolved };
}

function sqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function emitSql(sources) {
  if (sources.length === 0) return '-- Nenhuma source_reference a gerar.\n';
  const rows = sources.map((source) => `(${[
    source.source_name,
    source.source_category,
    source.url,
    source.title,
    source.content_hash,
  ].map(sqlString).join(', ')})`);
  return `insert into source_references (source_name, source_category, url, title, content_hash) values\n${rows.join(',\n')}\non conflict (content_hash) do update set\n  source_name = excluded.source_name,\n  source_category = excluded.source_category,\n  url = excluded.url,\n  title = excluded.title\nreturning id, content_hash;\n`;
}

try {
  const args = parseArgs(process.argv.slice(2));
  const sources = loadSources(args.sourcesPath);
  if (args.emitSql) {
    process.stdout.write(emitSql(sources));
  } else {
    const resolvedIds = loadResolvedIds(args.resolveFromFile);
    process.stdout.write(`${JSON.stringify(buildCatalog(sources, resolvedIds), null, 2)}\n`);
  }
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
