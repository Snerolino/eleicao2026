#!/usr/bin/env node
/**
 * Importa dados pertinentes do "Dossiê Eleitoral RS 2026 — Lote 3" (consolidado)
 * para o portal, como claims `pending_review` (nunca `published` direto).
 *
 * Origem: documentos do usuário "novo 3.txt" (Lote 3, corte 2026-08-05 07:18),
 * "novo 4.txt" (consolidado, 2026-08-06 07:20) e "novo 5.txt" (consolidado, 2026-08-07 07:44).
 *
 * Regras do projeto:
 *  - Claims novas entram como `pending_review`; publicação exige revisão humana + RPC.
 *  - Fonte pública usada: `source_references` (sem `raw_content`).
 *  - Escrita exige service role via variável externa ao repo.
 *
 * Cobertura do Lote 3/consolidado:
 *  - Martin Cesar Kalkmann (210002533072): ex-prefeito de Ivoti/RS (2 mandatos).
 *  - Giuseppe Ricardo M. Riesgo (210002533066): ex-dep. estadual + ex-secretário (REG-2026-RS-004).
 *  - Tiago José Albrecht (210002532989): vereador em POA, ex-assessor parlamentar federal.
 *  - Demais candidatos do consolidado (UP/NOVO) sem fato concreto — sem claims.
 *
 * Uso:
 *   node scripts/import-dossier-lote3-novo-2026.mjs                  # dry-run
 *   node scripts/import-dossier-lote3-novo-2026.mjs --apply          # cria pending_review
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

// ─── Dados do dossiê (Lote 3 / consolidado) — apenas fatos com fonte oficial consultável ───
const SOURCES = [
  {
    source_name: 'Prefeitura de Ivoti/RS — portal oficial',
    source_category: 'oficial',
    url: 'https://www.ivoti.rs.gov.br/',
    title: 'Portal oficial da Prefeitura de Ivoti/RS',
    content_hash: 'dossie-lote3-2026-prefeitura-ivoti',
  },
  {
    source_name: 'Site oficial — Ramiro Stallbaum Rosário',
    source_category: 'site-do-candidato',
    url: 'https://www.tiagoalbrecht.com.br/',
    title: 'Site oficial do candidato — Tiago José Albrecht',
    content_hash: 'dossie-lote3-2026-tiago-albrecht-site',
  },
];

const CLAIMS = [
  {
    tse_candidate_id: '210002533072', // Martin Cesar Kalkmann
    claims: [
      {
        category: 'historico_politico',
        content:
          'Prefeito do Município de Ivoti/RS por dois mandatos consecutivos (2017–2024), com reeleição. Sem condenações impeditivas ativas localizadas nas fontes consultadas.',
        confidence_score: 3,
        source_hash: 'dossie-lote3-2026-prefeitura-ivoti',
      },
    ],
  },
  {
    tse_candidate_id: '210002533066', // Giuseppe Ricardo M. Riesgo
    claims: [
      {
        category: 'historico_politico',
        content:
          'Ex-deputado estadual no RS (2019–2023) e ex-secretário municipal em Porto Alegre (2023–2026). Sem condenação judicial impeditiva localizada.',
        confidence_score: 3,
        source_hash: 'hash-alrs-oficial-2026',
      },
      {
        category: 'reputacao',
        content:
          'Prestação de Contas Eleitorais (Eleições 2022) aprovadas sem sanção impeditiva pelo TRE-RS em 04/11/2022. Registro documental REG-2026-RS-004 do dossiê.',
        confidence_score: 3,
        source_hash: 'hash-tse-divulgacandcontas-portal-2026',
      },
    ],
  },
  {
    tse_candidate_id: '210002532989', // Tiago José Albrecht
    claims: [
      {
        category: 'historico_politico',
        content:
          'Vereador em Porto Alegre/RS e ex-assessor parlamentar. Sem condenações judiciais ativas localizadas nas fontes consultadas.',
        confidence_score: 2,
        source_hash: 'dossie-lote3-2026-tiago-albrecht-site',
      },
    ],
  },
];

// Fontes genéricas oficiais já existentes no portal (reuso, sem duplicar).
const GENERIC_SOURCES = [
  {
    source_name: 'AL-RS — Assembleia Legislativa do Rio Grande do Sul',
    source_category: 'oficial',
    url: 'https://www.al.rs.gov.br/',
    title: 'Portal da Assembleia Legislativa RS',
    content_hash: 'hash-alrs-oficial-2026',
  },
  {
    source_name: 'TSE — DivulgaCandContas',
    source_category: 'oficial',
    url: 'https://divulgacandcontas.tse.jus.br/',
    title: 'Divulgação de Candidaturas e Contas Eleitorais',
    content_hash: 'hash-tse-divulgacandcontas-portal-2026',
  },
];

async function upsertSource(source) {
  const { data, error } = await supabase
    .from('source_references')
    .upsert(
      {
        source_name: source.source_name,
        source_category: source.source_category === 'site-do-candidato' ? 'outro' : source.source_category,
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
  for (const source of [...SOURCES, ...GENERIC_SOURCES]) {
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

try {
  main();
} catch (error) {
  const message = String(error?.message ?? error).replace(
    /(apikey|Authorization|Bearer|service_role|token)=?\s*[^\s,}]+/gi,
    '$1=[REDACTED]',
  );
  console.error(message);
  process.exit(1);
}