/**
 * Script: import-raspador-export
 *
 * Importa o export canônico do raspador de histórico político
 * (../raspador-candidados-2026/docs/status-export/candidatos-rs2026-<snapshot>.json)
 * para o Supabase como claims `historico_politico` em `pending_review`.
 *
 * Regras (contrato do portal / gate editorial):
 *  - Nenhuma claim nasce publicada: status = 'pending_review', published_at = null.
 *  - Publicação continua exigindo review humano aprovado + RPC publish_claim().
 *  - Idempotente via índice único (candidate_id, category, external_id, content_hash).
 *  - Fontes dedup por content_hash (sha256), source_category = 'oficial'.
 *  - Conteúdo estruturado do export é serializado para texto legível.
 *
 * Uso:
 *   node scripts/import-raspador-export.mjs export.json            # dry-run (ler/validar/planejar)
 *   node scripts/import-raspador-export.mjs export.json --apply    # escrever pending_review
 */
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env.local');

function loadEnv() {
  try {
    return Object.fromEntries(
      readFileSync(envPath, 'utf-8')
        .split('\n')
        .filter((line) => line.trim() && !line.trim().startsWith('#') && line.includes('='))
        .map((line) => {
          const index = line.indexOf('=');
          return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^['"]|['"]$/g, '')];
        }),
    );
  } catch {
    return {};
  }
}

// ---------------------------------------------------------------------------
// Puros / testáveis
// ---------------------------------------------------------------------------

export const CARGO_LABEL = {
  deputado_federal: 'Deputado Federal',
  deputado_estadual: 'Deputado Estadual',
  senador: 'Senador',
  governador: 'Governador',
  outro: 'Outros cargos',
};

export const PROMPT_VERSION = 'raspador-canonical-1.0.0';

/** Converte um registro source do export para o formato de `source_references`. */
export function sourceToReference(source) {
  const url = source?.url || '';
  return {
    source_name: sourceNameFromUrl(url) || sourceNameFromUrl('') || 'TSE',
    source_category: source?.source_category === 'oficial' ? 'oficial' : 'oficial',
    url,
    title: sourceNameFromUrl(url),
    content_hash: requireSha(source?.sha256),
  };
}

export function sourceNameFromUrl(url) {
  if (!url) return null;
  const m = url.match(/resultados\.tse\.jus\.br/);
  if (m) return 'TSE — Resultados Eleitorais 2022';
  if (url.includes('consulta_cand_complementar')) return 'TSE — Consulta de Candidaturas (Complementar)';
  if (url.includes('consulta_cand')) return 'TSE — Consulta de Candidaturas';
  if (url.includes('datajud')) return 'DataJud — CNJ (TRE-RS)';
  return 'TSE';
}

export function requireSha(sha) {
  if (typeof sha !== 'string' || !/^[a-f0-9]{64}$/i.test(sha)) {
    throw new Error(`source.sha256 ausente/inválido: ${sha}`);
  }
  return sha.toLowerCase();
}

/** Serializa o `content` estruturado de uma claim do export para texto legível em PT. */
export function serializeClaimContent(content) {
  if (!content || typeof content !== 'object') {
    throw new Error('claim.content precisa ser um objeto estruturado do export.');
  }
  const ano = content.ano;
  const cargo = CARGO_LABEL[content.cargo] || content.cargo;
  const orgao = content.orgao || 'TSE';
  const resultado = content.resultado || content.situacao_tse_original || 'registrado';
  return `Eleito(a) em ${ano || '—'} para ${cargo || 'cargo'} (${orgao}), resultado oficial: ${resultado}.`;
}

/** Define external_id estável do coletor para a claim. */
export function deriveExternalId(claim) {
  const c = claim?.content || {};
  const seq = [
    claim?.kind || 'fato',
    c.ano,
    claim?.tse_candidate_id,
    c.cargo,
  ]
    .filter(Boolean)
    .join(':');
  return `raspador:${seq}`;
}

/** SHA-256 do conteúdo serializado — impede versão idêntica duplicada. */
export function contentHash(claim) {
  return createHash('sha256')
    .update(serializeClaimContent(claim?.content) || '')
    .digest('hex');
}

/** Monta o payload da claim para o Supabase. */
export function buildClaimPayload({ claim, candidateId, sourceDocumentId }) {
  return {
    candidate_id: candidateId,
    category: claim?.category === 'historico_politico' ? 'historico_politico' : claim?.category,
    content: serializeClaimContent(claim?.content),
    source_document_id: sourceDocumentId ?? null,
    confidence_score: clampScore(claim?.confidence_score),
    status: 'pending_review',
    external_id: deriveExternalId(claim),
    content_hash: contentHash(claim),
    generated_by_ai: claim?.generated_by_ai === true,
    prompt_version: PROMPT_VERSION,
  };
}

export function clampScore(score) {
  const n = Number(score);
  if (!Number.isFinite(n)) return 3;
  return Math.min(5, Math.max(1, Math.round(n)));
}

/** Valida o export canônico e devolve `{ ok, errors, plan }`. */
export function validateImport(exportData) {
  const errors = [];
  if (!exportData || typeof exportData !== 'object') {
    return { ok: false, errors: ['export vazio'], plan: null };
  }
  if (exportData.schema_version !== '1.0.0') {
    errors.push(`schema_version esperado 1.0.0, recebido ${exportData.schema_version}`);
  }
  const claims = Array.isArray(exportData.claims) ? exportData.claims : [];
  const sources = Array.isArray(exportData.sources) ? exportData.sources : [];

  for (const claim of claims) {
    if (claim.status !== 'pending_review' || claim.published_at != null) {
      errors.push(
        `claim ${claim.tse_candidate_id} deve estar pending_review sem published_at (veio ${claim.status}/${claim.published_at})`,
      );
    }
    if (!claim.tse_candidate_id) {
      errors.push('claim sem tse_candidate_id');
    }
    if (!claim.content || typeof claim.content !== 'object') {
      errors.push(`claim ${claim.tse_candidate_id} com content inválido`);
    }
    const src = claim?.content?.source_url;
    if (src && !sources.some((s) => s.url === src)) {
      errors.push(`claim ${claim.tse_candidate_id} referencia source_url fora de sources[]: ${src}`);
    }
  }

  for (const source of sources) {
    try {
      requireSha(source?.sha256);
    } catch {
      errors.push(`source sem sha256 válido: ${source?.url}`);
    }
    if (source?.source_category !== 'oficial') {
      errors.push(`source ${source?.url} precisa source_category=oficial`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    plan: { claims: claims.length, sources: sources.length, candidates: exportData.candidates?.length ?? 0 },
  };
}

// ---------------------------------------------------------------------------
// I/O (Supabase)
// ---------------------------------------------------------------------------

export function createSupabaseClient({ shouldApply }) {
  const env = loadEnv();
  const supabaseUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) throw new Error('VITE_SUPABASE_URL ausente.');
  if (shouldApply && !serviceRoleKey) {
    throw new Error('service role obrigatório para escrita. Defina SUPABASE_SERVICE_ROLE_KEY fora do repositório.');
  }
  if (!shouldApply && !(process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY)) {
    throw new Error('VITE_SUPABASE_ANON_KEY ausente para dry-run.');
  }
  return createClient(supabaseUrl, shouldApply ? serviceRoleKey : (process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY));
}

export async function upsertSources(supabase, sources) {
  const ids = [];
  const seen = new Set();
  for (const source of sources) {
    const payload = sourceToReference(source);
    if (seen.has(payload.content_hash)) continue;
    seen.add(payload.content_hash);
    const { data, error } = await supabase
      .from('source_references')
      .upsert(payload, { onConflict: 'content_hash', ignoreDuplicates: false })
      .select('id, content_hash')
      .single();
    if (error) throw error;
    ids.push(data);
  }
  return ids;
}

export async function candidatesById(supabase) {
  const { data, error } = await supabase.from('candidates').select('id, tse_candidate_id');
  if (error) throw error;
  return Object.fromEntries((data ?? []).map((c) => [c.tse_candidate_id, c.id]));
}

export async function insertClaims(supabase, claimPayloads) {
  if (claimPayloads.length === 0) return [];
  const unique = Array.from(
    new Map(claimPayloads.map((p) => [
      `${p.candidate_id}:${p.category}:${p.external_id}:${p.content_hash}`,
      p,
    ])).values(),
  );
  const { data, error } = await supabase
    .from('claims')
    .upsert(unique, { onConflict: 'candidate_id,category,external_id,content_hash', ignoreDuplicates: true })
    .select('id');
  if (error) throw error;
  return data ?? [];
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

async function main() {
  const input = process.argv[2];
  const shouldApply = process.argv.includes('--apply');
  if (!input) {
    console.error('Uso: node scripts/import-raspador-export.mjs <export.json> [--apply]');
    process.exit(1);
  }
  if (!existsSync(input)) {
    console.error(`❌ Arquivo não encontrado: ${input}`);
    process.exit(1);
  }

  const exportData = JSON.parse(readFileSync(input, 'utf-8'));
  const validation = validateImport(exportData);
  if (!validation.ok) {
    console.error(`❌ Validação do export falhou (${validation.errors.length}):`);
    for (const err of validation.errors.slice(0, 20)) console.error(`  - ${err}`);
    process.exit(1);
  }

  const { claims, sources } = validation.plan;
  console.log(`Modo: ${shouldApply ? 'APPLY' : 'DRY-RUN'}`);
  console.log(`Export: candidates=${validation.plan.candidates} claims=${claims} sources=${sources}`);

  const supabase = createSupabaseClient({ shouldApply });
  const candMap = await candidatesById(supabase);

  const semCandidato = [];
  const payloads = [];
  for (const claim of exportData.claims) {
    const candidateId = candMap[claim.tse_candidate_id];
    if (!candidateId) {
      semCandidato.push(claim.tse_candidate_id);
      continue;
    }
    const src = exportData.sources.find((s) => s.url === claim.content?.source_url);
    let sourceDocumentId = null;
    if (src) {
      if (shouldApply) {
        const refs = await upsertSources(supabase, [src]);
        sourceDocumentId = refs.find((r) => r?.content_hash === src.sha256?.toLowerCase())?.id ?? refs[0]?.id ?? null;
      }
      // Em dry-run, não escreve em source_references (anon não tem permissão de escrita).
    }
    payloads.push(buildClaimPayload({ claim, candidateId, sourceDocumentId }));
  }

  if (semCandidato.length > 0) {
    console.log(`⚠️  ${semCandidato.length} claim(s) sem candidato correspondente no portal (ignoradas):`);
    for (const id of semCandidato.slice(0, 20)) console.log(`  - ${id}`);
  }

  if (!shouldApply) {
    console.log(`Planejadas ${payloads.length} claims pending_review (nenhuma escrita). Use --apply para inserir.`);
    return;
  }

  const inserted = await insertClaims(supabase, payloads);
  console.log(`✅ ${inserted.length} claims pending_review garantidas (idempotente, nunca publicado).`);
  console.log('Publicação exige review humano aprovado + RPC publish_claim().');
}

// Só roda main quando executado diretamente (testes importam as funções puras).
const isDirectRun = process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href;
if (isDirectRun) {
  main().catch((error) => {
    console.error(String(error?.message ?? error).replace(/(apikey|Authorization|Bearer|service_role|token)=?\s*[^\s,}]+/gi, '$1=[REDACTED]'));
    process.exit(1);
  });
}