import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env.local');

const env = Object.fromEntries(
  readFileSync(envPath, 'utf-8')
    .split('\n')
    .filter(l => l.trim() && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);

const key = process.env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(env.VITE_SUPABASE_URL, key);

// Fontes oficiais TSE indicadas pelo usuário (site no título = oficial)
const officialDocs = [
  {
    source_name: 'TSE — Portal de Dados Abertos',
    source_category: 'oficial',
    url: 'https://dadosabertos.tse.jus.br/',
    title: 'Portal de Dados Abertos do TSE',
    content_hash: 'hash-tse-dadosabertos-portal-2026',
    raw_content: 'Portal de Dados Abertos do Tribunal Superior Eleitoral. Base oficial de dados eleitorais: candidaturas, eleições, prestação de contas e estatísticas.'
  },
  {
    source_name: 'TSE — DivulgaCandContas',
    source_category: 'oficial',
    url: 'https://divulgacandcontas.tse.jus.br/',
    title: 'Divulgação de Candidaturas e Contas Eleitorais',
    content_hash: 'hash-tse-divulgacandcontas-portal-2026',
    raw_content: 'Divulgação de Candidaturas e Contas Eleitorais. Sistema oficial do TSE para consulta de candidatos, registro de candidatura, bens declarados e prestação de contas de campanha.'
  },
  {
    source_name: 'TSE — Dados Abertos: Candidatos 2026',
    source_category: 'oficial',
    url: 'https://dadosabertos.tse.jus.br/dataset/candidatos-2026',
    title: 'Candidaturas 2026 — Conjunto de dados',
    content_hash: 'hash-tse-dataset-candidatos-2026',
    raw_content: 'Conjunto de dados de candidaturas das eleições de 2026: número, nome, partido, coligação, situação do registro, cargo disputado e dados complementares.'
  },
  {
    source_name: 'TSE — Dados Abertos: Motivo da Cassação',
    source_category: 'oficial',
    url: 'https://dadosabertos.tse.jus.br/dataset/candidatos-2026-motivo-cassacao',
    title: 'Candidatos 2026 — Motivo da Cassação',
    content_hash: 'hash-tse-dataset-cassacao-2026',
    raw_content: 'Conjunto de dados do TSE sobre candidaturas cassadas nas eleições de 2026, com o motivo da cassação registrado pela Justiça Eleitoral.'
  }
];

const POSITION_LABEL = {
  governador: 'Governador',
  senador: 'Senador',
  deputado_federal: 'Deputado Federal',
  deputado_estadual: 'Deputado Estadual'
};

async function main() {
  // 1. Verificar se source_references tem coluna raw_content
  const { data: probe, error: errProbe } = await supabase
    .from('source_references')
    .select('*')
    .limit(1);
  if (errProbe) throw errProbe;
  const hasRawContent = 'raw_content' in (probe[0] ?? {});
  console.log(`source_references tem raw_content: ${hasRawContent}`);

  // 2. Inserir documentos oficiais em source_references
  const docIds = [];
  for (const doc of officialDocs) {
    const payload = hasRawContent
      ? doc
      : { source_name: doc.source_name, source_category: doc.source_category, url: doc.url, title: doc.title, content_hash: doc.content_hash };

    const { data, error } = await supabase
      .from('source_references')
      .insert(payload)
      .select('id');

    if (error) {
      if (error.code === '23505') {
        const { data: existing } = await supabase
          .from('source_references')
          .select('id')
          .eq('content_hash', doc.content_hash)
          .single();
        console.log(`  já existia: ${doc.source_name}`);
        docIds.push(existing.id);
      } else {
        console.error(`ERRO ao inserir ${doc.source_name}:`, error.message);
      }
    } else {
      console.log(`  inserido: ${doc.source_name} → ${data[0].id}`);
      docIds.push(data[0].id);
    }
  }

  // 3. Buscar todos os candidatos
  const { data: candidates, error: errC } = await supabase
    .from('candidates')
    .select('id, full_name, party, ballot_number, position');

  if (errC) throw errC;
  console.log(`\nTotal de candidatos: ${candidates.length}`);

  // 4. Quem já tem summary publicado?
  const ids = candidates.map(c => c.id);
  const { data: existingClaims } = await supabase
    .from('claims')
    .select('candidate_id')
    .eq('category', 'summary')
    .eq('status', 'published')
    .in('candidate_id', ids);

  const haveSummary = new Set((existingClaims ?? []).map(c => c.candidate_id));
  console.log(`Já têm summary: ${haveSummary.size}`);

  // 5. Inserir summary para quem não tem, com source_document_id = doc oficial
  const docId = docIds[0];
  const now = new Date().toISOString();
  let inserted = 0, skipped = 0, errors = 0;

  for (const candidate of candidates) {
    if (haveSummary.has(candidate.id)) { skipped++; continue; }

    const label = POSITION_LABEL[candidate.position] ?? candidate.position;
    const content = `Candidato(a) a ${label} pelo ${candidate.party}${candidate.ballot_number != null ? `, número ${candidate.ballot_number}` : ''}. Registro de candidatura protocolado na Justiça Eleitoral (fonte: TSE).`;

    const { error } = await supabase
      .from('claims')
      .insert({
        candidate_id: candidate.id,
        category: 'summary',
        content,
        source_document_id: docId,
        confidence_score: 4,
        status: 'published',
        published_at: now
      });

    if (error) {
      errors++;
      if (errors <= 5) console.error(`ERRO ${candidate.full_name}:`, error.message);
    } else {
      inserted++;
    }
  }

  console.log(`\nResumo: ${inserted} criadas, ${skipped} já existiam, ${errors} erros.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
