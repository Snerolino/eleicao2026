import { createHash } from 'node:crypto';

export const ALRS_VOTE_IMPORT_SCHEMA_VERSION = '1.0.0';

const REQUIRED_ITEM_FIELDS = [
  'nomeDeputado',
  'dataVotacao',
  'tipoProjeto',
  'numProposicao',
  'anoProposicao',
  'materia',
  'voto',
  'resultadoVotacao',
] as const;

const VOTE_VALUES = new Map([
  ['Sim', 'sim'],
  ['Não', 'nao'],
  ['Abstenção', 'abstencao'],
  ['Ausente', 'ausente'],
  ['Obstrução', 'obstrucao'],
] as const);

type RequiredItemField = (typeof REQUIRED_ITEM_FIELDS)[number];
export type AlrsVoteValue = 'sim' | 'nao' | 'abstencao' | 'ausente' | 'obstrucao';

export type AlrsDataItem = Record<RequiredItemField, string>;

export interface AlrsIdCatalogEntry {
  alrs_solicitante_id: string;
  tse_candidate_id: string;
}

export interface AlrsIdCatalog {
  schema_version: typeof ALRS_VOTE_IMPORT_SCHEMA_VERSION;
  entries: AlrsIdCatalogEntry[];
}

export interface CandidateCatalogEntry {
  id: string;
  tse_candidate_id?: string | null;
  full_name?: string;
}

export interface AlrsVotePlan {
  idempotency_key: string;
  natural_key: {
    source_url: string;
    alrs_solicitante_id: string;
    tse_candidate_id: string;
    data_votacao: string;
    tipo_projeto: string;
    num_proposicao: string;
    ano_proposicao: string;
    materia_hash: string;
  };
  candidate_id: string;
  tse_candidate_id: string;
  alrs_solicitante_id: string;
  nome_deputado: string;
  data_votacao: string;
  tipo_projeto: string;
  num_proposicao: string;
  ano_proposicao: string;
  materia: string;
  value: AlrsVoteValue;
  resultado_votacao: string;
  source: {
    url: string;
    content_hash: string;
  };
}

export interface AlrsPendingMatch {
  reason: 'alrs_id_not_cataloged' | 'tse_candidate_not_found';
  alrs_solicitante_id: string;
  tse_candidate_id: string | null;
  item: AlrsDataItem;
}

export interface AlrsDryRunPlan {
  schema_version: typeof ALRS_VOTE_IMPORT_SCHEMA_VERSION;
  mode: 'dry-run';
  source: {
    url: string;
    content_hash: string;
    raw_html: string;
  };
  counts: {
    data_items: number;
    duplicate_items: number;
    votes: number;
    pending_matches: number;
  };
  candidate_match: {
    alrs_solicitante_id: string;
    tse_candidate_id: string;
    candidate_id: string;
  } | null;
  votes: AlrsVotePlan[];
  pending_matches: AlrsPendingMatch[];
}

interface PlanAlrsVoteImportInput {
  rawHtml: string;
  sourceUrl: string;
  solicitanteId: string;
  catalog: unknown;
  candidates: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sha256(value: string): string {
  return `sha256:${createHash('sha256').update(value, 'utf8').digest('hex')}`;
}

function decodeHtmlAttribute(value: string): string {
  return value
    .replace(/&quot;|&#34;|&#x22;/gi, '"')
    .replace(/&apos;|&#39;|&#x27;/gi, "'")
    .replace(/&lt;|&#60;|&#x3c;/gi, '<')
    .replace(/&gt;|&#62;|&#x3e;/gi, '>')
    .replace(/&amp;|&#38;|&#x26;/gi, '&')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_, decimal: string) => String.fromCodePoint(Number.parseInt(decimal, 10)));
}

function requiredScalar(item: Record<string, unknown>, field: RequiredItemField, index: number): string {
  const value = item[field];
  if ((typeof value !== 'string' && typeof value !== 'number') || String(value).trim().length === 0) {
    throw new Error(`data-item[${index}].${field} é obrigatório e deve ser texto não vazio`);
  }
  return String(value).trim();
}

function parseCatalog(value: unknown): AlrsIdCatalog {
  if (!isRecord(value) || value.schema_version !== ALRS_VOTE_IMPORT_SCHEMA_VERSION || !Array.isArray(value.entries)) {
    throw new Error('Catálogo ALRS inválido: esperado schema_version 1.0.0 e entries[]');
  }

  const entries = value.entries.map((entry, index) => {
    if (!isRecord(entry)) throw new Error(`Catálogo ALRS entries[${index}] deve ser objeto`);
    const alrsId = typeof entry.alrs_solicitante_id === 'string' ? entry.alrs_solicitante_id.trim() : '';
    const tseId = typeof entry.tse_candidate_id === 'string' ? entry.tse_candidate_id.trim() : '';
    if (!alrsId || !tseId) {
      throw new Error(`Catálogo ALRS entries[${index}] exige alrs_solicitante_id e tse_candidate_id`);
    }
    return { alrs_solicitante_id: alrsId, tse_candidate_id: tseId };
  });

  const seen = new Map<string, string>();
  for (const entry of entries) {
    const previous = seen.get(entry.alrs_solicitante_id);
    if (previous && previous !== entry.tse_candidate_id) {
      throw new Error(`Catálogo ALRS ambíguo para solicitante ${entry.alrs_solicitante_id}`);
    }
    seen.set(entry.alrs_solicitante_id, entry.tse_candidate_id);
  }

  return { schema_version: ALRS_VOTE_IMPORT_SCHEMA_VERSION, entries };
}

function parseCandidates(value: unknown): CandidateCatalogEntry[] {
  if (!Array.isArray(value)) throw new Error('Catálogo de candidatos deve ser um array');
  return value.map((candidate, index) => {
    if (!isRecord(candidate) || typeof candidate.id !== 'string' || candidate.id.trim().length === 0) {
      throw new Error(`Candidato[${index}] exige id existente`);
    }
    if (candidate.tse_candidate_id !== undefined && candidate.tse_candidate_id !== null && typeof candidate.tse_candidate_id !== 'string') {
      throw new Error(`Candidato[${index}].tse_candidate_id deve ser string ou null`);
    }
    return candidate as unknown as CandidateCatalogEntry;
  });
}

function normalizeVote(value: string, index: number): AlrsVoteValue {
  const normalized = VOTE_VALUES.get(value as 'Sim' | 'Não' | 'Abstenção' | 'Ausente' | 'Obstrução');
  if (!normalized) {
    throw new Error(
      `data-item[${index}].voto inválido: ${value}. Bancada, subscrição, preferência e outros valores não são voto de mérito`,
    );
  }
  return normalized;
}

function naturalKey(item: AlrsDataItem, sourceUrl: string, solicitanteId: string, tseCandidateId: string) {
  return {
    source_url: sourceUrl,
    alrs_solicitante_id: solicitanteId,
    tse_candidate_id: tseCandidateId,
    data_votacao: item.dataVotacao,
    tipo_projeto: item.tipoProjeto,
    num_proposicao: item.numProposicao,
    ano_proposicao: item.anoProposicao,
    materia_hash: sha256(item.materia),
  };
}

function stableNaturalKey(value: ReturnType<typeof naturalKey>): string {
  return JSON.stringify(value);
}

export function buildAlrsSourceUrl(solicitanteId: string, ano: string | number): string {
  const id = String(solicitanteId).trim();
  const year = String(ano).trim();
  if (!id || !year) throw new Error('solicitante e ano são obrigatórios');
  const url = new URL('https://transparencia.al.rs.gov.br/parlamentares/votos-plenario/pesquisa');
  url.searchParams.set('solicitante', id);
  url.searchParams.set('ano', year);
  return url.toString();
}

export function parseAlrsDataItems(rawHtml: string): AlrsDataItem[] {
  if (typeof rawHtml !== 'string' || rawHtml.trim().length === 0) throw new Error('HTML da ALRS está vazio');

  const attributes = [...rawHtml.matchAll(/\bdata-item(?![\w:-])\s*=\s*(["'])([\s\S]*?)\1/gi)];
  if (attributes.length === 0) throw new Error('Nenhum atributo data-item encontrado no HTML da ALRS');

  return attributes.map((match, index) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(decodeHtmlAttribute(match[2]));
    } catch (error) {
      throw new Error(`data-item[${index}] não contém JSON válido: ${String((error as Error).message)}`);
    }
    if (!isRecord(parsed)) throw new Error(`data-item[${index}] deve conter um objeto JSON`);

    return Object.fromEntries(
      REQUIRED_ITEM_FIELDS.map((field) => [field, requiredScalar(parsed, field, index)]),
    ) as AlrsDataItem;
  });
}

export function planAlrsVoteImport(input: PlanAlrsVoteImportInput): AlrsDryRunPlan {
  const solicitanteId = String(input.solicitanteId).trim();
  if (!solicitanteId) throw new Error('solicitanteId é obrigatório');
  const expectedUrl = new URL(input.sourceUrl);
  if (expectedUrl.protocol !== 'https:' || expectedUrl.hostname !== 'transparencia.al.rs.gov.br') {
    throw new Error('sourceUrl deve apontar para transparencia.al.rs.gov.br via HTTPS');
  }

  const catalog = parseCatalog(input.catalog);
  const candidates = parseCandidates(input.candidates);
  const items = parseAlrsDataItems(input.rawHtml);
  const sourceHash = sha256(input.rawHtml);
  const catalogEntry = catalog.entries.find((entry) => entry.alrs_solicitante_id === solicitanteId) ?? null;

  let candidate: CandidateCatalogEntry | null = null;
  if (catalogEntry) {
    const matches = candidates.filter((item) => item.tse_candidate_id === catalogEntry.tse_candidate_id);
    if (matches.length > 1) throw new Error(`Snapshot ambíguo para tse_candidate_id ${catalogEntry.tse_candidate_id}`);
    candidate = matches[0] ?? null;
  }

  const pendingMatches: AlrsPendingMatch[] = [];
  const votes: AlrsVotePlan[] = [];
  const seen = new Map<string, string>();
  let duplicateItems = 0;

  for (const [index, item] of items.entries()) {
    const value = normalizeVote(item.voto, index);
    if (!catalogEntry || !candidate) {
      pendingMatches.push({
        reason: catalogEntry ? 'tse_candidate_not_found' : 'alrs_id_not_cataloged',
        alrs_solicitante_id: solicitanteId,
        tse_candidate_id: catalogEntry?.tse_candidate_id ?? null,
        item,
      });
      continue;
    }

    const key = naturalKey(item, input.sourceUrl, solicitanteId, catalogEntry.tse_candidate_id);
    const stableKey = stableNaturalKey(key);
    const fingerprint = JSON.stringify({ ...item, value });
    const previous = seen.get(stableKey);
    if (previous) {
      if (previous !== fingerprint) throw new Error(`data-item[${index}] conflita com voto já visto para a mesma chave natural`);
      duplicateItems += 1;
      continue;
    }
    seen.set(stableKey, fingerprint);

    votes.push({
      idempotency_key: sha256(stableKey),
      natural_key: key,
      candidate_id: candidate.id,
      tse_candidate_id: catalogEntry.tse_candidate_id,
      alrs_solicitante_id: solicitanteId,
      nome_deputado: item.nomeDeputado,
      data_votacao: item.dataVotacao,
      tipo_projeto: item.tipoProjeto,
      num_proposicao: item.numProposicao,
      ano_proposicao: item.anoProposicao,
      materia: item.materia,
      value,
      resultado_votacao: item.resultadoVotacao,
      source: { url: input.sourceUrl, content_hash: sourceHash },
    });
  }

  return {
    schema_version: ALRS_VOTE_IMPORT_SCHEMA_VERSION,
    mode: 'dry-run',
    source: { url: input.sourceUrl, content_hash: sourceHash, raw_html: input.rawHtml },
    counts: {
      data_items: items.length,
      duplicate_items: duplicateItems,
      votes: votes.length,
      pending_matches: pendingMatches.length,
    },
    candidate_match: catalogEntry && candidate
      ? {
          alrs_solicitante_id: solicitanteId,
          tse_candidate_id: catalogEntry.tse_candidate_id,
          candidate_id: candidate.id,
        }
      : null,
    votes,
    pending_matches: pendingMatches,
  };
}
