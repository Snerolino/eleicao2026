#!/usr/bin/env node
/**
 * ETL de claims de perfil (histórico, plataforma, reputação, escrutínio)
 * para Candidato Dossier Page.
 *
 * Insere no Supabase como `pending_review`, pronto para revisão humana + publicação.
 *
 * Uso:
 *   node scripts/import-candidate-dossier-claims.mjs --apply
 *
 * Requer service_role key (SUPABASE_SERVICE_ROLE_KEY / SUPABASE_SECRET_KEY).
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve('/home/lourenco/Projetos/raspador-candidados-2026/.env');
const env = readFileSync(envPath, 'utf8')
  .split('\n')
  .filter(line => line.trim() && !line.startsWith('#'))
  .reduce((acc, line) => {
    const [key, ...valueParts] = line.split('=');
    if (key) {
      const value = valueParts.join('=');
      acc[key.trim()] = value.trim();
    }
    return acc;
  }, {});

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const BLOCKS_DIR = resolve('/home/lourenco/Projetos/eleicao2026', '.orchestrator', 'runtime', 'blocks');
const BATCH = 500;
const SOURCE_DOC = 'c646525c-6f1f-47bf-b715-9af8d01e4b09';

function demandaPorCategoria() {
  return {
    historico_politico: 'hist',
    plataforma: 'plat',
    reputacao: 'rep',
    votacao_scrutiny: 'scr',
  };
}

function gerarContent(claimType, candidato, dados) {
  const tipo = claimType;
  const nome = candidato.full_name;
  
  switch (tipo) {
    case 'historico_politico':
      return dados.historico_politico?.content || 
        `Histórico político de ${nome}: ${dados.historico_politico?.content || 'Informação não disponível na fonte pública.'}`;
    case 'plataforma':
      return dados.plataforma?.content ||
        `Plataforma de ${nome}: ${dados.plataforma?.content || 'Informação não disponível na fonte pública.'}`;
    case 'reputacao':
      return dados.reputacao?.content ||
        `Reputação de ${nome}: ${dados.reputacao?.content || 'Informação não disponível na fonte pública.'}`;
    case 'votacao_scrutiny':
      return dados.votacao_scrutiny?.content ||
        `Escrutínio/votação de ${nome}: ${dados.votacao_scrutiny?.content || 'Informação não disponível na fonte pública.'}`;
    default:
      throw new Error(`Categoria desconhecida: ${tipo}`);
  }
}

async function importarBloco(blocoIndex) {
  const outputFile = resolve(BLOCKS_DIR, `block-${String(blocoIndex).padStart(3, '0')}-output.json`);
  
  if (!existsSync(outputFile)) {
    console.error(`❌ Arquivo de output não encontrado: ${outputFile}`);
    return 0;
  }
  
  const blocData = JSON.parse(readFileSync(outputFile, 'utf-8'));
  console.log(`📦 Bloco ${blocoIndex}: ${blocData.length} candidatos`);
  
  const claims = [];
  
  for (const item of blocData) {
    if (!item.slug || !item.tse_candidate_id) {
      console.warn(`⚠️  Candidato sem slug/tse_candidate_id:`, JSON.stringify(item).slice(0,100));
      continue;
    }
    
    // Pesquisa o candidato no Supabase por tse_candidate_id
    const { data: cand, error: candError } = await supabase
      .from('candidates')
      .select('id, tse_candidate_id, full_name, slug')
      .eq('tse_candidate_id', item.tse_candidate_id)
      .maybeSingle();
    
    if (candError) {
      console.error(`❌Erro ao buscar candidato ${item.tse_candidate_id}:`, candError.message);
      continue;
    }
    
    if (!cand) {
      console.warn(`⚠️ Candidato não encontrado no Supabase: ${item.slug} (${item.tse_candidate_id})`);
      continue;
    }
    
    const categoriaMap = demandaPorCategoria();
    const agora = new Date().toISOString();
    
    // Gera claims para cada categoria que tem dados
    for (const [tipo, sigla] of Object.entries(categoriaMap)) {
      const dados = item[tipo];
      if (!dados) continue;  // Campo não gerado pelo agy
      
      const content = dados.content || `Informação não disponível para ${tipo} de ${cand.full_name}.`;
      const confidence = Math.max(1, Math.min(5, dados.confidence_score || 1));
      const sources = Array.isArray(dados.sources) && dados.sources.length > 0 ? dados.sources : [];
      
      claims.push({
        candidate_id: cand.id,
        category: tipo,
        content: content,
        confidence_score: confidence,
        status: 'pending_review',
        source_document_id: SOURCE_DOC,
        published_at: agora,
        generated_by_ai: true,
        external_id: `${tipo}_${item.slug}_${agora}`,
        content_hash: Buffer.from(`${cand.id}|${tipo}|${content}`).toString('base64'),
      });
    }
  }
  
  if (claims.length === 0) {
    console.log(`ℹ️ Nenhuma claim para importar do bloco ${blocoIndex}`);
    return 0;
  }
  
  // Insere em lotes
  let inseridas = 0;
  for (let i = 0; i < claims.length; i += BATCH) {
    const batch = claims.slice(i, i + BATCH);
    const { data, error } = await supabase.from('claims').insert(batch);
    if (error) {
      console.error(`❌Erro ao inserir bloco ${blocoIndex} batch ${i}-${i+batch.length}:`, error.message);
      // Log detalhes do erro
      console.error('Detalhes:', error);
      throw error;
    }
    inseridas += data?.length || 0;
    console.log(`  ✅ Inseridas ${inseridas}/${claims.length} claims (batch ${i}-${i+batch.length})`);
  }
  
  console.log(`✅ Bloco ${blocoIndex}: ${inseridas} claims inseridas como pending_review`);
  return inseridas;
}

async function main() {
  const apply = process.argv.includes('--apply');
  if (!apply) {
    console.log('🔍 Modo preview. Use --apply para inserir claims no Supabase.');
    // Listar blocos disponíveis
    const { readdirSync, existsSync } = await import('fs');
    if (!existsSync(BLOCKS_DIR)) {
      console.log('Diretório de blocks não existe.');
      return;
    }
    const files = readdirSync(BLOCKS_DIR);
    const blocks = files.filter(f => f.startsWith('block-') && f.endsWith('-output.json')).sort();
    return;
  }
  
  console.log('🚀 Importando claims de perfil no Supabase...');
  
  const { readdirSync, existsSync } = await import('fs');
  if (!existsSync(BLOCKS_DIR)) {
    console.error('Diretório de blocks não existe.');
    process.exit(1);
  }
  
  const blocks = readdirSync(BLOCKS_DIR).filter(f => f.startsWith('block-') && f.endsWith('-output.json')).sort();
  console.log(`Blocos encontrados: ${blocks.length}`);
  
  let totalInseridas = 0;
  for (const file of blocks) {
    const match = file.match(/block-(\d+)-output\.json/);
    if (!match) continue;
    const blockIndex = parseInt(match[1], 10);
    try {
      const count = await importarBloco(blockIndex);
      totalInseridas += count;
    } catch (e) {
      console.error(`❌ Falha no bloco ${blockIndex}:`, e.message);
      // Continua com o próximo bloco
    }
  }
  
  console.log(`\n✅ Total: ${totalInseridas} claims inseridas como pending_review`);
}

main().catch(err => {
  console.error('❌ Fatal:', err);
  process.exit(1);
});