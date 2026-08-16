#!/usr/bin/env node
/**
 * ETL para importar claims de blocos do agy (Antigravity) no Supabase.
 *
 * Lê os arquivos `block-N-output.json` de `.orchestrator/runtime/blocks/`,
 * prepara os claims para inserção em `pending_review` no Supabase.
 *
 * Usage:
 *   node scripts/import-agy-block.mjs <block_index> [--dry-run|--apply]
 *
 * - `--dry-run`: valida os dados sem inserir (default).
 * - `--apply`: insere no Supabase via service_role.
 *
 * O script resolve o UUID do candidato no Supabase remoto pelo tse_candidate_id.
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CANDIDATES_JSON_PATH = resolve(__dirname, '../data/public-candidates.json');
const BLOCKS_DIR = resolve(__dirname, '../.orchestrator/runtime/blocks');

/**
 * Coleta o ambiente de build a partir de `.env.local` (se presente) e
 * verifica a existência das variáveis de URL e service role key.
 */
async function resolveEnv() {
  const envLocalPath = resolve(__dirname, '../.env.local');
  if (existsSync(envLocalPath)) {
    const content = readFileSync(envLocalPath, 'utf-8');
    for (const line of content.split('\n')) {
      const lineTrimmed = line.trim();
      if (!lineTrimmed || lineTrimmed.startsWith('#')) continue;
      const eqIdx = lineTrimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = lineTrimmed.slice(0, eqIdx).trim();
      const value = lineTrimmed.slice(eqIdx + 1).trim();
      const unquoted = value.replace(/^["']|["']$/g, '');
      process.env[key] = unquoted || value;
    }
  }

  // Também carregar raspador .env para service_role
  const raspadorEnvPath = '/home/lourenco/Projetos/raspador-candidados-2026/.env';
  if (existsSync(raspadorEnvPath)) {
    const content = readFileSync(raspadorEnvPath, 'utf-8');
    for (const line of content.split('\n')) {
      const lineTrimmed = line.trim();
      if (!lineTrimmed || lineTrimmed.startsWith('#')) continue;
      const eqIdx = lineTrimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = lineTrimmed.slice(0, eqIdx).trim();
      const value = lineTrimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      process.env[key] = value;
    }
  }

  const url = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error('VITE_SUPABASE_URL não configurada. Defina .env.local.');
  if (!serviceRoleKey) throw new Error('SUPABASE_SECRET_KEY ou SUPABASE_SERVICE_ROLE_KEY não configurada.');

  return { url, serviceRoleKey, anonKey };
}

/**
 * Carrega o snapshot público de candidatos e retorna um mapa slug→candidato.
 */
async function loadLocalCandidates() {
  const raw = readFileSync(CANDIDATES_JSON_PATH, 'utf-8');
  const candidates = JSON.parse(raw);
  const map = new Map();
  for (const c of candidates) {
    map.set(c.slug, c);
  }
  return map;
}

/**
 * Resolve o UUID de um candidato no Supabase remoto pelo tse_candidate_id.
 * Retorna o UUID ou null se não encontrado.
 */
async function resolveCandidateIdInSupabase(supabase, tseCandidateId) {
  const { data, error } = await supabase
    .from('candidates')
    .select('id')
    .eq('tse_candidate_id', tseCandidateId)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

function describeError(err) {
  if (typeof err === 'string') return err;
  if (err && err.message) return err.message;
  return String(err);
}

/**
 * Tenta parsear texto como JSON; retorna null em caso de erro.
 */
function parseJsonMaybe(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * Converte block-N-output.txt para block-N-output.json se necessário.
 */
function ensureJsonBlock(blockIndex) {
  const txtPath = resolve(BLOCKS_DIR, `block-${String(blockIndex).padStart(3, '0')}-output.txt`);
  const jsonPath = resolve(BLOCKS_DIR, `block-${String(blockIndex).padStart(3, '0')}-output.json`);

  if (existsSync(jsonPath)) return jsonPath;

  if (!existsSync(txtPath)) {
    throw new Error(`Nem block-${String(blockIndex).padStart(3, '0')}-output.txt nem .json encontrados em ${BLOCKS_DIR}`);
  }

  const raw = readFileSync(txtPath, 'utf-8');
  let output = parseJsonMaybe(raw);
  if (!output) {
    // Tentar extrair JSON entre fences ```json ... ```
    const jsonMatch = raw.match(/```json\s*\n?([\s\S]*?)```/);
    if (jsonMatch) {
      output = parseJsonMaybe(jsonMatch[1]);
    }
  }
  if (!output || !Array.isArray(output)) {
    throw new Error(`Não foi possível parsear ${txtPath} como JSON array`);
  }

  writeFileSync(jsonPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`Convertido: ${txtPath} → ${jsonPath} (${output.length} candidatos)`);
  return jsonPath;
}

/**
 * Lê o output do bloco, converte para claims e insere (ou simula) no Supabase.
 */
async function insertBlock(supabase, localCandidates, blockIndex, apply) {
  const jsonPath = ensureJsonBlock(blockIndex);
  const raw = readFileSync(jsonPath, 'utf-8');
  const output = parseJsonMaybe(raw);
  if (!output || !Array.isArray(output)) {
    throw new Error(`Arquivo ${jsonPath} não é um JSON de array válido.`);
  }

  let inserted = 0;
  const errors = [];
  const byCandidate = [];

  const typeToCategory = {
    'historico_politico': 'historico_politico',
    'historico': 'historico_politico',
    'plataforma': 'plataforma',
    'reputacao': 'reputacao',
    'votacao_scrutiny': 'votacao_scrutiny',
    'estruturio': 'votacao_scrutiny',
  };

  // Cache de UUIDs resolvidos do Supabase
  const supabaseIdCache = new Map();

  for (const rec of output) {
    const slug = rec.slug;
    const localCandidate = localCandidates.get(slug);
    if (!localCandidate) {
      errors.push(`Candidato não encontrado no snapshot para slug ${slug}`);
      byCandidate.push({ slug, claims: 0, error: 'não encontrado no snapshot' });
      continue;
    }

    const tseId = localCandidate.tse_candidate_id;
    if (!tseId) {
      errors.push(`Sem tse_candidate_id para ${slug}`);
      byCandidate.push({ slug, claims: 0, error: 'sem tse_candidate_id' });
      continue;
    }

    // Resolver UUID no Supabase (cache)
    let candidateUuid = supabaseIdCache.get(tseId);
    if (!candidateUuid) {
      candidateUuid = await resolveCandidateIdInSupabase(supabase, tseId);
      supabaseIdCache.set(tseId, candidateUuid);
    }

    if (!candidateUuid) {
      errors.push(`Candidato ${slug} (TSE ${tseId}) não encontrado no Supabase remoto`);
      byCandidate.push({ slug, claims: 0, error: 'não encontrado no Supabase' });
      continue;
    }

    const claimsToInsert = rec.claims || [];
    if (claimsToInsert.length === 0) {
      byCandidate.push({ slug, claims: 0 });
      continue;
    }

    for (const claim of claimsToInsert) {
      const category = typeToCategory[claim.type] || 'historico_politico';
      const content = claim.claim;
      const contentHash = createHash('sha256').update(content).digest('hex');
      const now = new Date().toISOString();

      // Fonte: o AGY produz `source` como texto livre (ex: "TSE e ALRS") ou
      // texto+URL. Extrai URL se houver uma presente no texto.
      const sourceText = typeof claim.source === 'string' ? claim.source.trim() : null;
      let sourceUrl = null;
      if (sourceText) {
        const urlMatch = sourceText.match(/https?:\/\/[^\s)\]]+/);
        if (urlMatch) sourceUrl = urlMatch[0];
      }

      const record = {
        candidate_id: candidateUuid, // UUID do Supabase remoto
        category: category,
        content: content,
        external_id: `${slug}_${category}_${Date.now()}`,
        content_hash: contentHash,
        generated_by_ai: true,
        prompt_version: '1.0',
        source_document_id: null,
        source_char_offset: 0,
        source_text: sourceText,
        source_url: sourceUrl,
        confidence_score: claim.confidence,
        status: 'pending_review',
        created_at: now,
        published_at: now,
      };

      if (!apply) {
        inserted++;
        byCandidate.push({ slug, claims: claimsToInsert.length });
        continue;
      }

      const result = await supabase
        .from('claims')
        .insert(record)
        .select()
        .single();

      if (result.error) {
        errors.push(
          `Erro ao inserir claim para ${slug} (${claim.type}): ${describeError(result.error)}`
        );
        byCandidate.push({ slug, claims: claimsToInsert.length, error: result.error?.message });
        continue;
      }

      inserted++;
      byCandidate.push({ slug, claims: claimsToInsert.length });
      console.log(`  + ${localCandidate.full_name} (${localCandidate.party}, ${localCandidate.position_label}): ${category} (conf: ${claim.confidence})`);
    }
  }

  return { inserted, errors, byCandidate };
}

async function main() {
  const args = process.argv.slice(2);
  const blockIndexArg = args[0];
  const applyFlag = args.includes('--apply');
  const dryRunFlag = args.includes('--dry-run') || !applyFlag;

  if (!blockIndexArg || isNaN(Number(blockIndexArg))) {
    console.error('Usage: node scripts/import-agy-block.mjs <block_index> [--dry-run|--apply]');
    process.exit(1);
  }

  const blockIndex = Number(blockIndexArg);
  console.log(`Bloco ${blockIndex}: ${applyFlag ? 'APLICAR' : 'DRY-RUN'}`);

  const env = await resolveEnv();
  const supabase = createClient(env.url, env.serviceRoleKey, {
    auth: { persist: false },
  });

  const localCandidates = await loadLocalCandidates();
  console.log(`Candidatos locais carregados: ${localCandidates.size}`);

  const report = await insertBlock(supabase, localCandidates, blockIndex, applyFlag);
  console.log(`\n=== Resultado ===`);
  console.log(`Inseridos: ${report.inserted}`);
  console.log(`Erros: ${report.errors.length}`);
  if (report.errors.length > 0) {
    for (const err of report.errors.slice(0, 15)) {
      console.error(`  ERRO: ${err}`);
    }
  }
  console.log(`Candidatos processados: ${report.byCandidate.length}`);
}

main().catch((err) => {
  console.error('Erro:', describeError(err));
  process.exit(1);
});
