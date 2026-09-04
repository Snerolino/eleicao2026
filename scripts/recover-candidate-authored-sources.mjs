#!/usr/bin/env node
/**
 * Recupera evidência oficial mínima para projetos autorais da Câmara já analisados
 * e separa o universo em revisitável agora vs bloqueado por fonte/evento.
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { selectTopReviewProjects } from './lib/candidate-authored-top-review.mjs';

const root = resolve(import.meta.dirname, '..');
const factualFile = resolve(root, 'data/legislative-import/camara/candidate-authored-projects-factual-manifest-v1.json');
const triageFile = resolve(root, 'data/legislative-import/camara/authored-project-review-batches/procedural-triage.json');
const outDir = resolve(root, 'data/legislative-import/camara');
const output = resolve(outDir, 'candidate-authored-source-recovery-queue-v1.json');

const arg = (name, fallback = null) => {
  const exact = process.argv.find((x) => x.startsWith(`${name}=`));
  return exact ? exact.slice(name.length + 1) : fallback;
};
const limit = Number(arg('--limit', '1600'));
const offset = Number(arg('--offset', '0'));
const concurrency = Number(arg('--concurrency', '12'));

function isOfficialCamaraUrl(url) {
  return typeof url === 'string' && /^(https:\/\/)(www\.)?camara\.leg\.br\//i.test(url);
}

function classifyProcedural(project, triageById) {
  const triage = triageById.get(project.id);
  return triage?.classification === 'procedural_candidate';
}

function blockedReason({ procedural, fullTextUrl, eventUrl }) {
  if (procedural) return 'procedural_only';
  if (!fullTextUrl) return 'missing_full_text_source';
  if (!eventUrl) return 'missing_event_source';
  return 'revisit_ready';
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { accept: 'application/json', 'user-agent': 'eleicao2026-authored-source-recovery/1.0' },
  });
  const text = await response.text();
  const sha256 = `sha256:${createHash('sha256').update(text).digest('hex')}`;
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { url, status: response.status, ok: response.ok, bytes: Buffer.byteLength(text), sha256, json };
}

async function runPool(items, worker, poolSize) {
  const results = new Array(items.length);
  let index = 0;
  const workers = Array.from({ length: Math.min(poolSize, items.length || 1) }, async () => {
    while (true) {
      const current = index;
      index += 1;
      if (current >= items.length) return;
      results[current] = await worker(items[current], current);
    }
  });
  await Promise.all(workers);
  return results;
}

const factual = JSON.parse(await readFile(factualFile, 'utf8'));
const triage = JSON.parse(await readFile(triageFile, 'utf8'));
const triageById = new Map((triage.items ?? []).map((item) => [item.id, item]));
const selected = selectTopReviewProjects(factual, { offset, limit });

await mkdir(outDir, { recursive: true });

const items = await runPool(selected, async (project) => {
  const detail = await fetchJson(project.official_url);
  const dados = detail.json?.dados ?? {};
  const statusUrl = dados?.statusProposicao?.url;
  const tramitacoesUrl = `${project.official_url}/tramitacoes`;
  let tramitacoes = null;
  let firstEventUrl = null;
  let tramitacoesCount = 0;

  if (!isOfficialCamaraUrl(statusUrl)) {
    tramitacoes = await fetchJson(tramitacoesUrl);
    const rows = Array.isArray(tramitacoes.json?.dados) ? tramitacoes.json.dados : [];
    tramitacoesCount = rows.length;
    firstEventUrl = rows.find((row) => isOfficialCamaraUrl(row?.url))?.url ?? null;
  }

  const fullTextUrl = isOfficialCamaraUrl(dados.urlInteiroTeor) ? dados.urlInteiroTeor : null;
  const eventUrl = isOfficialCamaraUrl(statusUrl) ? statusUrl : firstEventUrl;
  const procedural = classifyProcedural(project, triageById);
  const resolution = blockedReason({ procedural, fullTextUrl, eventUrl });

  return {
    id: project.id,
    candidate_occurrences: project.candidate_occurrences,
    candidate_tse_ids: project.candidate_tse_ids,
    type: project.type,
    title: project.title,
    year: project.year,
    official_status: project.official_status,
    triage_classification: triageById.get(project.id)?.classification ?? null,
    resolution,
    revisit_ready: resolution === 'revisit_ready',
    missing_sources: [
      ...(fullTextUrl ? [] : ['texto_integral_oficial']),
      ...(eventUrl ? [] : ['evento_oficial_vinculante']),
    ],
    official_sources: {
      proposition_api: {
        url: detail.url,
        status: detail.status,
        bytes: detail.bytes,
        sha256: detail.sha256,
      },
      full_text_url: fullTextUrl,
      latest_status_event_url: eventUrl,
      tramitacoes_api: tramitacoes
        ? {
            url: tramitacoes.url,
            status: tramitacoes.status,
            bytes: tramitacoes.bytes,
            sha256: tramitacoes.sha256,
            items: tramitacoesCount,
          }
        : null,
    },
    official_summary: {
      ementa: dados.ementa ?? project.official_ementa,
      ementa_detalhada: dados.ementaDetalhada ?? null,
      justificativa_present: Boolean(dados.justificativa),
      texto_inline_present: Boolean(dados.texto),
      status_descricao: dados?.statusProposicao?.descricaoSituacao ?? null,
      status_tramitacao: dados?.statusProposicao?.descricaoTramitacao ?? null,
    },
  };
}, concurrency);

const counts = {
  selected_projects: items.length,
  revisit_ready: items.filter((item) => item.revisit_ready).length,
  procedural_only: items.filter((item) => item.resolution === 'procedural_only').length,
  missing_full_text_source: items.filter((item) => item.resolution === 'missing_full_text_source').length,
  missing_event_source: items.filter((item) => item.resolution === 'missing_event_source').length,
  with_full_text_url: items.filter((item) => item.official_sources.full_text_url).length,
  with_event_url: items.filter((item) => item.official_sources.latest_status_event_url).length,
};

const revisit_queue = items
  .filter((item) => item.revisit_ready)
  .sort((a, b) => b.candidate_occurrences - a.candidate_occurrences || a.id.localeCompare(b.id));

const result = {
  schema_version: '1.0.0',
  packet_type: 'candidate_authored_source_recovery_queue',
  mode: 'read-only',
  remote_apply: false,
  source_precedence: 'official_primary_only',
  selection: { offset, limit, basis: 'top reviewed unique projects by candidate coverage' },
  counts,
  revisit_queue,
  items,
};

await writeFile(output, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ output, counts, first_revisit_ready: revisit_queue[0]?.id ?? null }));
