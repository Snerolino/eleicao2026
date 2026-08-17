#!/usr/bin/env node
/**
 * Importer local dos votos de plenário publicados pela ALRS.
 *
 * Dry-run estrito: não importa cliente Supabase, não lê `.env*` e não possui
 * caminho de escrita. Sem `--html`, busca apenas a URL oficial construída a
 * partir de `--solicitante` e `--ano`; a fixture permite execução offline.
 *
 * Uso:
 *   npm run impact:alrs -- --solicitante <id> --ano <ano> --catalog <ids.json>
 *   npm run impact:alrs -- --solicitante <id> --ano <ano> --catalog <ids.json> --html <captura.html> --json
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildAlrsSourceUrl, planAlrsVoteImport } from '../src/domain/impact/alrs-vote-importer.ts';

const ALLOWED_FLAGS = new Set(['--solicitante', '--ano', '--catalog', '--candidates', '--html', '--json']);
const VALUE_FLAGS = new Set(['--solicitante', '--ano', '--catalog', '--candidates', '--html']);

function usage() {
  return 'Uso: node scripts/import-alrs-votes.mjs --solicitante <id> --ano <ano> --catalog <ids.json> [--candidates <snapshot.json>] [--html <captura.html>] [--json]';
}

export function parseArgs(args) {
  const values = new Map();
  let json = false;

  for (let index = 0; index < args.length; index += 1) {
    const flag = args[index];
    if (!ALLOWED_FLAGS.has(flag)) throw new Error(`Flag não suportada: ${flag}. Este CLI é somente dry-run (sem --apply).`);
    if (flag === '--json') {
      json = true;
      continue;
    }
    const value = args[index + 1];
    if (!VALUE_FLAGS.has(flag) || !value || value.startsWith('--')) throw new Error(`Valor ausente para ${flag}`);
    if (values.has(flag)) throw new Error(`Flag duplicada: ${flag}`);
    values.set(flag, value);
    index += 1;
  }

  for (const required of ['--solicitante', '--ano', '--catalog']) {
    if (!values.has(required)) throw new Error(`${required} é obrigatório. ${usage()}`);
  }

  return {
    solicitanteId: values.get('--solicitante'),
    ano: values.get('--ano'),
    catalogFile: values.get('--catalog'),
    candidatesFile: values.get('--candidates') ?? 'data/public-candidates.json',
    htmlFile: values.get('--html') ?? null,
    json,
  };
}

function readJson(file, label) {
  const absolute = resolve(file);
  if (!existsSync(absolute)) throw new Error(`${label} não encontrado: ${file}`);
  try {
    return JSON.parse(readFileSync(absolute, 'utf8'));
  } catch (error) {
    throw new Error(`${label} contém JSON inválido: ${String(error?.message ?? error)}`);
  }
}

async function readSourceHtml(htmlFile, sourceUrl) {
  if (htmlFile) {
    const absolute = resolve(htmlFile);
    if (!existsSync(absolute)) throw new Error(`HTML não encontrado: ${htmlFile}`);
    return readFileSync(absolute, 'utf8');
  }

  const response = await fetch(sourceUrl, {
    headers: { accept: 'text/html', 'user-agent': 'eleicao2026-alrs-dry-run/1.0' },
    redirect: 'follow',
  });
  if (!response.ok) throw new Error(`ALRS respondeu HTTP ${response.status}`);
  return response.text();
}

export function renderAlrsPlan(plan) {
  return [
    'Modo: DRY-RUN ALRS',
    `Fonte: ${plan.source.url}`,
    `Hash HTML: ${plan.source.content_hash}`,
    `data-item: ${plan.counts.data_items}`,
    `duplicados idempotentes: ${plan.counts.duplicate_items}`,
    `votos planejados: ${plan.counts.votes}`,
    `pendências de match: ${plan.counts.pending_matches}`,
    'Nenhuma escrita realizada.',
  ].join('\n');
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const sourceUrl = buildAlrsSourceUrl(options.solicitanteId, options.ano);
  const [rawHtml, catalog, candidates] = await Promise.all([
    readSourceHtml(options.htmlFile, sourceUrl),
    Promise.resolve(readJson(options.catalogFile, 'Catálogo ALRS')),
    Promise.resolve(readJson(options.candidatesFile, 'Catálogo de candidatos')),
  ]);

  const plan = planAlrsVoteImport({
    rawHtml,
    sourceUrl,
    solicitanteId: options.solicitanteId,
    catalog,
    candidates,
  });

  if (options.json) process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
  else console.log(renderAlrsPlan(plan));
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);
if (isDirectRun) {
  main().catch((error) => {
    console.error(`❌ ${String(error?.message ?? error)}`);
    process.exit(1);
  });
}
