#!/usr/bin/env node
/**
 * Coletor somente leitura da API oficial da Câmara.
 *
 * Uso:
 *   node scripts/collect-camara-votes.mjs --vote-id 2580259-24
 *
 * O coletor preserva o JSON bruto e só emite envelope factual quando a API
 * fornece votos individualizados. Não possui --apply nem acesso ao Supabase.
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const API = 'https://dadosabertos.camara.leg.br/api/v2';
const DEFAULT_OUT = 'data/legislative-import/camara/collector-pilot';
const VOTE_MAP = new Map([
  ['Sim', 'sim'],
  ['Não', 'nao'],
  ['Abstenção', 'abstencao'],
  ['Obstrução', 'obstrucao'],
  ['Ausente', 'ausente'],
]);

export function normalizeVote(raw) {
  return VOTE_MAP.get(String(raw ?? '').trim()) ?? null;
}

export function classifyEvent(detail, votes) {
  const individualized = Array.isArray(votes) && votes.length > 0;
  const description = String(detail?.descricao ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  return {
    vote_method: individualized ? 'nominal' : (description.includes('simbolic') ? 'simbolica' : 'outro'),
    is_individualized: individualized,
    reason: individualized ? 'endpoint /votos retornou registros individuais' : 'endpoint /votos não retornou registros individuais',
  };
}

function propositionType(sigla) {
  const normalized = String(sigla ?? '').toLowerCase();
  return ['pec', 'pl', 'plp', 'pld', 'lei'].includes(normalized) ? normalized : 'outro';
}

function isoDate(value) {
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) return date.toISOString();
  return `${String(value).slice(0, 10)}T00:00:00.000Z`;
}

function textHash(value) {
  return `sha256:${createHash('sha256').update(String(value ?? '')).digest('hex')}`;
}

export function buildEnvelope(detail, votes, proposition, voteId, targetUf = 'RS') {
  const eventClass = classifyEvent(detail, votes);
  if (!eventClass.is_individualized) return { eventClass, envelope: null };
  const affected = proposition ?? detail?.proposicoesAfetadas?.[0] ?? detail?.objetosPossiveis?.[0];
  if (!affected?.id) throw new Error(`Votação ${voteId} não tem proposição oficial associada`);
  const occurredAt = isoDate(detail.dataHoraRegistro ?? detail.data);
  const externalId = `camara-proposicao-${affected.id}-${affected.siglaTipo ?? 'outro'}`.toLowerCase();
  const versionKey = `event-${voteId}`;
  const versionRef = `proposition_versions:camara:${externalId}:${versionKey}`;
  const eventRef = `voting_events:camara:camara-votacao-${voteId}`;
  const source = `${API}/votacoes/${voteId}/votos`;
  const normalizedVotes = [];
  for (const item of votes.filter((candidateVote) => candidateVote.deputado_?.siglaUf === targetUf)) {
    const value = normalizeVote(item.tipoVoto);
    if (!value) continue;
    normalizedVotes.push({
      voting_event_id: eventRef,
      deputy_id: `camara-deputado-${item.deputado_?.id ?? 'unknown'}`,
      proposition_version_id: versionRef,
      value,
      ...(value === 'ausente' || value === 'obstrucao' ? { absence_type: 'justificada' } : {}),
      recorded_at: isoDate(item.dataRegistroVoto ?? occurredAt),
      source,
    });
  }
  return {
    eventClass,
    envelope: {
      schema_version: '1.0.0', country: 'BR', state: 'RS', election_year: 2026,
      propositions: [{
        external_id: externalId,
        house: 'camara',
        proposition_type: propositionType(affected.siglaTipo),
        number: Number(affected.numero) || 1,
        year: Number(affected.ano) || Number(String(occurredAt).slice(0, 4)),
        title: `${affected.siglaTipo ?? 'Proposição'} ${affected.numero ?? affected.id}`,
        summary: affected.ementa || detail.descricao || null,
        official_url: affected.uri ?? `${API}/proposicoes/${affected.id}`,
        versions: [{
          version_key: versionKey,
          version_label: detail.descricao || `Evento ${voteId}`,
          text_hash: textHash(affected.ementa || affected.id),
          effective_from: occurredAt,
          source: affected.uri ?? `${API}/proposicoes/${affected.id}`,
          voting_events: [{
            external_id: `camara-votacao-${voteId}`,
            house: 'camara',
            session_id: String(detail.idEvento ?? ''),
            vote_round: detail.descUltimaAberturaVotacao || null,
            occurred_at: occurredAt,
            source: `${API}/votacoes/${voteId}`,
          }],
        }],
      }],
      votes: normalizedVotes,
    },
  };
}

async function getJson(url) {
  const response = await fetch(url, { headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error(`Câmara API HTTP ${response.status}: ${url}`);
  return response.json();
}

async function main() {
  const args = process.argv.slice(2);
  const ids = args.flatMap((arg, index) => arg === '--vote-id' ? [args[index + 1]] : []).filter(Boolean);
  const outIndex = args.indexOf('--out-dir');
  const outDir = resolve(outIndex >= 0 ? args[outIndex + 1] : DEFAULT_OUT);
  if (ids.length === 0 || args.includes('--apply')) {
    console.error('Uso: node scripts/collect-camara-votes.mjs --vote-id <id> [--vote-id <id>] [--out-dir <dir>]');
    process.exit(1);
  }
  await mkdir(outDir, { recursive: true });
  const manifest = { schema_version: '1.0.0', mode: 'dry-run', source: API, events: [] };
  for (const id of ids) {
    const detail = (await getJson(`${API}/votacoes/${encodeURIComponent(id)}`)).dados;
    const votes = (await getJson(`${API}/votacoes/${encodeURIComponent(id)}/votos`)).dados ?? [];
    const built = buildEnvelope(detail, votes, detail.proposicoesAfetadas?.[0], id, 'RS');
    await writeFile(resolve(outDir, `${id}.raw.json`), `${JSON.stringify({ detail, votes }, null, 2)}\n`);
    if (built.envelope) await writeFile(resolve(outDir, `${id}.json`), `${JSON.stringify(built.envelope, null, 2)}\n`);
    manifest.events.push({ vote_id: id, detail_url: `${API}/votacoes/${id}`, votes_url: `${API}/votacoes/${id}/votos`, raw_file: `${id}.raw.json`, envelope_file: built.envelope ? `${id}.json` : null, target_uf: 'RS', ...built.eventClass, raw_vote_count: votes.length, envelope_vote_count: built.envelope?.votes.length ?? 0 });
  }
  await writeFile(resolve(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  for (const event of manifest.events) console.log(`${event.vote_id}: ${event.vote_method} individualized=${event.is_individualized} raw=${event.raw_vote_count} envelope=${event.envelope_vote_count}`);
  console.log(`DRY-RUN: artefatos gravados em ${outDir}; nenhuma escrita remota realizada.`);
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) main().catch((error) => { console.error(error.message); process.exit(1); });
