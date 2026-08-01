import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env.local');
const SHOULD_APPLY = process.argv.includes('--apply');

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

const env = loadEnv();
const supabaseUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) throw new Error('VITE_SUPABASE_URL ausente.');
if (!anonKey && !SHOULD_APPLY) throw new Error('VITE_SUPABASE_ANON_KEY ausente para dry-run.');
if (SHOULD_APPLY && !serviceRoleKey) {
  throw new Error('service role obrigatório para escrita. Defina SUPABASE_SERVICE_ROLE_KEY fora do repositório.');
}

const supabase = createClient(supabaseUrl, SHOULD_APPLY ? serviceRoleKey : anonKey);

// Fontes públicas oficiais TSE. O script cria apenas claims pending_review;
// publicação continua exigindo review aprovado + RPC transacional H4.2.
const officialDocs = [
  {
    source_name: 'TSE — Portal de Dados Abertos',
    source_category: 'oficial',
    url: 'https://dadosabertos.tse.jus.br/',
    title: 'Portal de Dados Abertos do TSE',
    content_hash: 'hash-tse-dadosabertos-portal-2026',
  },
  {
    source_name: 'TSE — DivulgaCandContas',
    source_category: 'oficial',
    url: 'https://divulgacandcontas.tse.jus.br/',
    title: 'Divulgação de Candidaturas e Contas Eleitorais',
    content_hash: 'hash-tse-divulgacandcontas-portal-2026',
  },
  {
    source_name: 'TSE — Dados Abertos: Candidatos 2026',
    source_category: 'oficial',
    url: 'https://dadosabertos.tse.jus.br/dataset/candidatos-2026',
    title: 'Candidaturas 2026 — Conjunto de dados',
    content_hash: 'hash-tse-dataset-candidatos-2026',
  },
  {
    source_name: 'TSE — Dados Abertos: Motivo da Cassação',
    source_category: 'oficial',
    url: 'https://dadosabertos.tse.jus.br/dataset/candidatos-2026-motivo-cassacao',
    title: 'Candidatos 2026 — Motivo da Cassação',
    content_hash: 'hash-tse-dataset-cassacao-2026',
  },
];

const POSITION_LABEL = {
  governador: 'Governador',
  senador: 'Senador',
  deputado_federal: 'Deputado Federal',
  deputado_estadual: 'Deputado Estadual',
  outro: 'Outros cargos',
};

function sourcePayload(doc) {
  return {
    source_name: doc.source_name,
    source_category: doc.source_category,
    url: doc.url,
    title: doc.title,
    content_hash: doc.content_hash,
  };
}

async function upsertOfficialSources() {
  const ids = [];
  for (const doc of officialDocs) {
    const payload = sourcePayload(doc);
    if (!SHOULD_APPLY) {
      ids.push({ content_hash: payload.content_hash, dryRun: true });
      continue;
    }

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

async function fetchCandidatesWithoutSummary() {
  const { data: candidates, error: candidatesError } = await supabase
    .from('candidates')
    .select('id, full_name, party, ballot_number, position')
    .eq('state', 'RS');
  if (candidatesError) throw candidatesError;

  const ids = (candidates ?? []).map((candidate) => candidate.id);
  if (ids.length === 0) return [];

  const { data: existingClaims, error: claimsError } = await supabase
    .from('claims')
    .select('candidate_id, status')
    .eq('category', 'summary')
    .in('candidate_id', ids);
  if (claimsError) throw claimsError;

  const candidatesWithSummary = new Set((existingClaims ?? []).map((claim) => claim.candidate_id));
  return (candidates ?? []).filter((candidate) => !candidatesWithSummary.has(candidate.id));
}

function buildSummaryClaim(candidate, sourceDocumentId) {
  const label = POSITION_LABEL[candidate.position] ?? candidate.position;
  return {
    candidate_id: candidate.id,
    category: 'summary',
    content: `Candidato(a) a ${label} pelo ${candidate.party}${candidate.ballot_number != null ? `, número ${candidate.ballot_number}` : ''}. Registro de candidatura protocolado na Justiça Eleitoral (fonte: TSE).`,
    source_document_id: sourceDocumentId,
    confidence_score: 4,
    status: 'pending_review',
  };
}

async function main() {
  console.log(`Modo: ${SHOULD_APPLY ? 'APPLY' : 'DRY-RUN'}`);
  const sourceIds = await upsertOfficialSources();
  const missing = await fetchCandidatesWithoutSummary();

  console.log(`Fontes oficiais: ${sourceIds.length}`);
  console.log(`Candidatos sem summary: ${missing.length}`);

  if (!SHOULD_APPLY) {
    for (const candidate of missing.slice(0, 10)) {
      console.log(`  pendente: ${candidate.full_name}`);
    }
    console.log('Nenhuma escrita executada. Use --apply com SUPABASE_SERVICE_ROLE_KEY para criar pending_review.');
    return;
  }

  const sourceDocumentId = sourceIds[0]?.id;
  if (!sourceDocumentId) throw new Error('Fonte oficial principal não foi criada/recuperada.');

  let inserted = 0;
  for (const candidate of missing) {
    const { error } = await supabase.from('claims').insert(buildSummaryClaim(candidate, sourceDocumentId));
    if (error) throw error;
    inserted += 1;
  }

  console.log(`Resumo: ${inserted} claims pending_review criadas. Publicação exige intervenção humana/review/RPC.`);
}

main().catch((error) => {
  console.error(String(error?.message ?? error).replace(/(apikey|Authorization|Bearer|service_role|token)=?\s*[^\s,}]+/gi, '$1=[REDACTED]'));
  process.exit(1);
});
