#!/usr/bin/env node
/**
 * Importa dados pertinentes do "Dossiê Eleitoral RS 2026 — Lote 1" (NOVO / Deputado Federal)
 * para o portal, como claims `pending_review` (nunca `published` direto).
 *
 * Origem dos dados: documento do usuário "novo 1.txt" (levantamento com data de corte
 * 2026-08-03 07:00, classificação preliminar). Fatos com fonte oficial rastreável são
 * importados; "Informação não localizada" NÃO gera claim (ausência de registro ≠ certeza).
 *
 * Regras do projeto:
 *  - Claims novas entram como `pending_review`; publicação exige revisão humana + RPC.
 *  - Fonte pública usada: `source_references` (sem `raw_content`).
 *  - Escrita exige service role via variável externa ao repo (nunca commitar segredo).
 *
 * Uso:
 *   node scripts/import-dossier-lote1-novo-2026.mjs                  # dry-run (somente leitura)
 *   node scripts/import-dossier-lote1-novo-2026.mjs --apply          # cria/atualiza pending_review
 *
 * Service role: lerá de SUPABASE_SECRET_KEY (env) — no fluxo padrão do projeto,
 * exportada a partir de ../raspador-candidados-2026/.env (não versionado).
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SHOULD_APPLY = process.argv.includes('--apply');

function loadEnvFile(path) {
  if (!existsSync(path)) return {};
  return Object.fromEntries(
    readFileSync(path, 'utf-8')
      .split('\n')
      .filter((line) => line.trim() && !line.trim().startsWith('#') && line.includes('='))
      .map((line) => {
        const index = line.indexOf('=');
        return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^['"]|['"]$/g, '')];
      }),
  );
}

const env = loadEnvFile(resolve(__dirname, '..', '.env.local'));
const raspadorEnv = loadEnvFile(resolve(__dirname, '..', '..', 'raspador-candidados-2026', '.env'));

const supabaseUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SECRET_KEY || raspadorEnv.SUPABASE_SECRET_KEY;

if (!supabaseUrl) throw new Error('VITE_SUPABASE_URL ausente.');
if (!SHOULD_APPLY) {
  console.log('Modo: DRY-RUN (somente leitura). Use --apply com SUPABASE_SECRET_KEY para escrever.');
} else if (!serviceRoleKey) {
  throw new Error('SUPABASE_SECRET_KEY (service role) é obrigatório para --apply e não pode vir de .env versionado.');
}

const supabase = createClient(supabaseUrl, SHOULD_APPLY ? serviceRoleKey : env.VITE_SUPABASE_ANON_KEY);

// ─── Dados do dossiê (Lote 1) — apenas fatos com fonte oficial consultável ───
// content_hash: identificador estável da fonte no scheme do projeto.
const SOURCES = [
  {
    source_name: 'TRE-RS — Sessão pública: voto do relator (Ada Cristina Munaretto)',
    source_category: 'oficial',
    url: 'https://sessoespub.tre-rs.jus.br/votos/50929/show_text?membro_id=10180&processo_id=29088&sessao_id=13055',
    title: 'Voto do relator — TRE-RS (sessão pública) referente à prestação de contas de 2022 de Ada Cristina Munaretto',
    content_hash: 'dossie-lote1-2026-tre-rs-ada-munaretto-contas2022',
  },
  {
    source_name: 'TSE — DivulgaCandContas: prestação de contas 2022 (Felipe Zortéa Camozzato)',
    source_category: 'oficial',
    url: 'https://divulgacandcontas.tse.jus.br/divulga/#/candidato/SUL/RS/2040602022/210001597019/2022/RS?hidemenu=true',
    title: 'Prestação de Contas Eleitorais 2022 — Felipe Zortéa Camozzato (REG-2026-RS-002)',
    content_hash: 'dossie-lote1-2026-tse-camozzato-contas2022',
  },
];

const CLAIMS = [
  {
    tse_candidate_id: '210002532998', // Ada Cristina Munaretto
    claims: [
      {
        category: 'reputacao',
        content:
          'Prestação de Contas Eleitorais das Eleições 2022 (processo 0602908-88.2022.6.21.0000) julgada aprovada com ressalvas pelo TRE-RS em 24/10/2023. Registro documental REG-2026-RS-001 do dossiê.',
        confidence_score: 3,
        source_hash: 'dossie-lote1-2026-tre-rs-ada-munaretto-contas2022',
      },
      {
        category: 'historico_politico',
        content:
          'Vereadora reeleita em Passo Fundo/RS (mandato originário e reeleição). Fonte: votos/registros públicos do TRE-RS citados no dossiê.',
        confidence_score: 2,
        source_hash: 'dossie-lote1-2026-tre-rs-ada-munaretto-contas2022',
      },
    ],
  },
  {
    tse_candidate_id: '210002533002', // Felipe Zortéa Camozzato
    claims: [
      {
        category: 'reputacao',
        content:
          'Prestação de Contas Eleitorais das Eleições 2022 (processo 0601597-19.2022.6.21.0000) aprovada pelo TRE-RS em 04/11/2022, sem sanção impeditiva. Registro documental REG-2026-RS-002 do dossiê.',
        confidence_score: 4,
        source_hash: 'dossie-lote1-2026-tse-camozzato-contas2022',
      },
    ],
  },
  {
    tse_candidate_id: '210002533003', // Marco Antonio M. dos Santos
    claims: [
      {
        category: 'historico_politico',
        content:
          'Oficial da reserva das Forças Armadas; condição de militar da reserva mencionada na ficha de registro de candidatura. Sem condenação criminal transitada em julgado localizada nas bases consultadas (DivulgaCandContas/TSE).',
        confidence_score: 2,
        source_hash: 'hash-tse-divulgacandcontas-portal-2026',
      },
    ],
  },
];

// Fonte genérica oficial (portal TSE) para os casos sem link primário no dossiê.
const GENERIC_TSE_SOURCE = {
  source_name: 'TSE — DivulgaCandContas',
  source_category: 'oficial',
  url: 'https://divulgacandcontas.tse.jus.br/',
  title: 'Divulgação de Candidaturas e Contas Eleitorais',
  content_hash: 'hash-tse-divulgacandcontas-portal-2026',
};

async function upsertSource(source) {
  const { data, error } = await supabase
    .from('source_references')
    .upsert(
      {
        source_name: source.source_name,
        source_category: source.source_category,
        url: source.url,
        title: source.title ?? null,
        content_hash: source.content_hash,
      },
      { onConflict: 'content_hash', ignoreDuplicates: false },
    )
    .select('id, content_hash')
    .single();
  if (error) throw error;
  return data;
}

async function fetchCandidateByTseId(tseCandidateId) {
  const { data, error } = await supabase
    .from('candidates')
    .select('id, full_name, position')
    .eq('tse_candidate_id', tseCandidateId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function claimExists(candidateId, category) {
  const { data, error } = await supabase
    .from('claims')
    .select('id')
    .eq('candidate_id', candidateId)
    .eq('category', category)
    .in('status', ['pending_review', 'published', 'corrected'])
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

async function main() {
  const sourceIds = {};
  for (const source of [...SOURCES, GENERIC_TSE_SOURCE]) {
    if (sourceIds[source.content_hash]) continue;
    if (SHOULD_APPLY) {
      const upserted = await upsertSource(source);
      sourceIds[source.content_hash] = upserted?.id ?? null;
    } else {
      const { data, error } = await supabase
        .from('source_references')
        .select('id')
        .eq('content_hash', source.content_hash)
        .maybeSingle();
      if (error) throw error;
      sourceIds[source.content_hash] = data?.id ?? null;
    }
  }

  let created = 0;
  const report = [];
  for (const { tse_candidate_id, claims } of CLAIMS) {
    const candidate = await fetchCandidateByTseId(tse_candidate_id);
    if (!candidate) {
      report.push({ tse_candidate_id, status: 'candidato_nao_encontrado' });
      continue;
    }

    for (const claim of claims) {
      if (await claimExists(candidate.id, claim.category)) {
        report.push({ tse_candidate_id, category: claim.category, status: 'ja_existe' });
        continue;
      }

      const sourceId = sourceIds[claim.source_hash] ?? null;
      if (!sourceId) {
        if (SHOULD_APPLY) {
          report.push({ tse_candidate_id, category: claim.category, status: 'fonte_nao_resolvida', source_hash: claim.source_hash });
        } else {
          report.push({ tse_candidate_id, category: claim.category, status: 'dry_run_fonte_nova_seria_criada', source_hash: claim.source_hash });
        }
        continue;
      }

      if (!SHOULD_APPLY) {
        report.push({ tse_candidate_id, category: claim.category, status: 'dry_run_iria_criar' });
        continue;
      }

      const { error } = await supabase.from('claims').insert({
        candidate_id: candidate.id,
        category: claim.category,
        content: claim.content,
        confidence_score: claim.confidence_score,
        source_document_id: sourceId,
        status: 'pending_review',
      });
      if (error) throw error;
      created += 1;
      report.push({ tse_candidate_id, category: claim.category, status: 'created_pending_review' });
    }
  }

  console.log(`Modo: ${SHOULD_APPLY ? 'APPLY' : 'DRY-RUN'}`);
  console.table(report);
  console.log(`Claims criadas (pending_review): ${created}`);
}

main().catch((error) => {
  const message = String(error?.message ?? error).replace(
    /(apikey|Authorization|Bearer|service_role|token)=?\s*[^\s,}]+/gi,
    '$1=[REDACTED]',
  );
  console.error(message);
  process.exit(1);
});