#!/usr/bin/env node
/**
 * Fase 3b — Geração de claims de perfil enriquecido via Antigravity (agy) em blocos de 25.
 *
 * - Particiona public-candidates.json em chunks de 25 candidatos.
 * - Para cada bloco, invoca agy com prompt de geração de claims:
 *     historico_politico, plataforma, reputacao, votacao_scrutiny
 * - O agy pesquisa fatos públicos sobre cada candidato e retorna JSON com as claims.
 * - Salva o output em .orchestrator/runtime/blocks/block-<N>.json para ingestão posterior.
 *
 * Uso:
 *   node scripts/agy-enrich-block.mjs           # gera todos os blocos (sequencial)
 *   node scripts/agy-enrich-block.mjs --block=0 # gera apenas o bloco 0
 *
 * Requer: Antigravity CLI instalado e authenticated (agy na PATH).
 *        .orchestrator/runtime/snapshots/antigravity/ disponível (snapshot preparado).
 *
 * AUTORIZACAO: esta tarefa usa o executor Antigravity (modelo pago Google AI Pro)
 *              para gerar conteúdo de perfil público. O agy opera somente em
 *              snapshot Git sanitizado (git archive HEAD), read-only.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const BLOCKS_DIR = resolve(ROOT, '.orchestrator', 'runtime', 'blocks');
const SNAPSHOT_DIR = resolve(ROOT, '.orchestrator', 'runtime', 'snapshots', 'antigravity');
const CANDIDATES_PATH = resolve(ROOT, 'data', 'public-candidates.json');

const BLOCK_SIZE = 25;
const MODEL = 'Gemini 3.5 Flash (Low)';

// Criar diretório de blocks se não existir
if (!existsSync(BLOCKS_DIR)) mkdirSync(BLOCKS_DIR, { recursive: true });

// Carregar candidatos
const candidates = JSON.parse(readFileSync(CANDIDATES_PATH, 'utf-8'));
console.log(`📋 Total candidatos: ${candidates.length}`);

// Particionar em blocos
function* chunkArray(arr, size) {
  for (let i = 0; i < arr.length; i += size) {
    yield arr.slice(i, i + size);
  }
}

const blocks = [...chunkArray(candidates, BLOCK_SIZE)];
console.log(`📦 Blocos: ${blocks.length} (tamanho ${BLOCK_SIZE})`);

// Prompt para o agy
function buildPrompt(block, blockIndex) {
  const candidatosFormatted = block.map((c, idx) => {
    return `### Candidato ${idx + 1}
- Nome completo: ${c.full_name}
- Partido: ${c.party}
- Cargo: ${c.position_label || c.position}
- Número na urna: ${c.ballot_number}
- Estado: ${c.state}
- Gênero: ${c.gender}
- Cor/Raça: ${c.race || 'Não informado'}
- slug: ${c.slug}
- tse_candidate_id: ${c.tse_candidate_id}
- Nome na urna: ${c.ballot_name || 'N/A'}
- Status de registro: ${c.registration_status}
`;
  }).join('\n\n');

  return `/goal
Você é um pesquisador político especializado em eleições brasileiras.
Tarefa: gerar claims de perfil enriquecido para ${block.length} candidatos.

IMPORTANTE: Para cada candidato, pesquise informações PÚBLICAS e VERIFIÁVEIS
sobre:
1. **Histórico político**: cargos anteriores, experiência política, atuação em
   legislative, governos anteriores, comissões ou participação em eventos públicos.
2. **Plataforma**: principais propostas, focos temáticos, posicionamentos em
   pautas relevantes.
3. **Reputação**: reconhecimento público, posicionamento midiático, eventuais
   controvérsias públicas documentadas em fontes confiáveis.
4. **Escrutínio/votação** (se disponível): participação em votações públicas,
   atas de sessão, posicionamentos registrados em fontes oficiais ou de imprensa.

Para cada candidato, gere UM objeto JSON com as seguintes claims, SOMENTE se
houver informação pública verificável. Se não houver informação confiável,
OUVER o campo (não invente).

OUTPUT FORMAT (JSON array, um objeto por candidato):
[
  {
    "slug": "<slug do candidato exatamente como informado>",
    "tse_candidate_id": "<id TSE>",
    "historico_politico": {
      "content": "Texto narrativo do histórico político (máximo 500 caracteres)",
      "confidence_score": <1-5>,
      "sources": ["URL1", "URL2"]
    },
    "plataforma": {
      "content": "Principais propostas e focos (máximo 500 caracteres)",
      "confidence_score": <1-5>,
      "sources": ["URL1", "URL2"]
    },
    "reputacao": {
      "content": "Posicionamento e reputação pública (máximo 300 caracteres)",
      "confidence_score": <1-5>,
      "sources": ["URL1", "URL2"]
    },
    "votacao_scrutiny": {
      "content": "Participação em votações/registro de ata (máximo 300 caracteres)",
      "confidence_score": <1-5>,
      "sources": ["URL1", "URL2"]
    }
  }
]

REGRAS:
- Use SOMENTE fontes públicas e confiáveis: site oficial do TSE, gov.br, veículos
  de imprensa com data, LinkedIn oficial, Wikipedia (com referências), Diário Oficial.
- Se um candidato é recém-chegado e não tem histórico público, deixe os campos vazios.
- Confiança: 5 = documento oficial/autorizado; 4 = imprensa confiável citando fonte;
  3 = informação de múltiplas fontes; 2 = única fonte de imprensa; 1 = insuficiente.
- NEVER invente fatos. Se não souber, o campo deve ser omitido (null).
- Mantenha o JSON válido e parseable.
- Retorne APENAS o JSON array, sem markdown, sem explicação adicional.

BLOCO ${blockIndex + 1} de ${blocks.length}:

${candidatosFormatted}

Retorne APENAS o JSON array.
`;
}

// Executar bloco
async function runBlock(blockIndex) {
  const block = blocks[blockIndex];
  const start = blockIndex * BLOCK_SIZE;
  const end = Math.min(start + BLOCK_SIZE, candidates.length);
  console.log(`\n🔍 Bloco ${blockIndex + 1}/${blocks.length}: candidatos ${start + 1}-${end}`);
  console.log(`   ${block.map(c => `${c.full_name} (${c.party}, ${c.position_label})`).join(' | ')}`);

  const prompt = buildPrompt(block, blockIndex);

  // Verificar se snapshot existe
  if (!existsSync(SNAPSHOT_DIR)) {
    console.error(`❌ Snapshot não encontrado em ${SNAPSHOT_DIR}`);
    console.error('Rode: npm run orch:prepare-snapshot -- antigravity');
    process.exit(1);
  }

  const outputFile = resolve(BLOCKS_DIR, `block-${String(blockIndex).padStart(3, '0')}-output.json`);
  const promptFile = resolve(BLOCKS_DIR, `block-${String(blockIndex).padStart(3, '0')}-prompt.txt`);
  writeFileSync(promptFile, prompt, 'utf-8');

  console.log(`📤 Enviando prompt para agy (model: ${MODEL})...`);

  try {
    // Invocar agy diretamente sobre o snapshot
    const result = execSync(
      `cd "${SNAPSHOT_DIR}" && agy --add-dir "${SNAPSHOT_DIR}" --agent eleicao2026-reader --mode=plan --sandbox --print-timeout 480s --model "${MODEL}" -p "$(cat "${promptFile}")"`,
      { encoding: 'utf-8', timeout: 480_000, stdio: ['pipe', 'pipe', 'pipe'] }
    );

    // Extrair JSON do output (agy retorna resposta textual, procurar array JSON)
    let parsed = null;
    
    // Tentativa 1: achar [ que inicia array JSON até o ] final
    const jsonStart = result.indexOf('[\n');
    if (jsonStart !== -1) {
      const closingBracket = result.lastIndexOf(']');
      if (closingBracket !== -1 && closingBracket > jsonStart) {
        const jsonStr = result.slice(jsonStart, closingBracket + 1);
        try {
          parsed = JSON.parse(jsonStr);
        } catch (e) {
          // Tentativa 2: procurar JSON entre markers
          const jsonMatch = result.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            try {
              parsed = JSON.parse(jsonMatch[0]);
            } catch (e2) {
              console.error(`⚠️ JSON inválido no output do agy para bloco ${blockIndex + 1}`);
              console.error('Output (primeiros 500 chars):', result.slice(0, 500));
              writeFileSync(outputFile.replace('.json', '-raw.txt'), result, 'utf-8');
            }
          }
        }
      }
    }

    if (parsed) {
      writeFileSync(outputFile, JSON.stringify(parsed, null, 2), 'utf-8');
      console.log(`✅ Bloco ${blockIndex + 1} salvo em ${outputFile}`);
      console.log(`   Claims geradas: ${parsed.length} candidatos`);
      for (const claim of parsed) {
        const hasAny = claim.historico_politico || claim.plataforma || claim.reputacao || claim.votacao_scrutiny;
        console.log(`   - ${claim.slug}: ${hasAny ? '✅' : '⚠️ sem dados'}`);
      }
      return parsed;
    } else {
      console.error(`❌ Não foi possível parsear output do agy para bloco ${blockIndex + 1}`);
      writeFileSync(outputFile.replace('.json', '-raw.txt'), result, 'utf-8');
      console.log(`   Output salvo em ${outputFile.replace('.json', '-raw.txt')} para debugging`);
      return null;
    }
  } catch (e) {
    console.error(`❌ Erro ao executar agy para bloco ${blockIndex + 1}:`, e.message);
    if (e.stdout) console.error('stdout:', e.stdout.slice(0, 500));
    if (e.stderr) console.error('stderr:', e.stderr.slice(0, 500));
    return null;
  }
}

// Main
async function main() {
  const blockArg = process.argv.find(a => a.startsWith('--block='))?.split('=')[1];
  const targetBlock = blockArg !== undefined ? parseInt(blockArg) : null;

  if (targetBlock !== null && targetBlock >= 0 && targetBlock < blocks.length) {
    await runBlock(targetBlock);
    process.exit(0);
  }

  // Executar todos os blocos sequencialmente
  for (let i = 0; i < blocks.length; i++) {
    const result = await runBlock(i);
    if (!result) {
      console.error(`\n⚠️ Bloco ${i + 1} falhou. Continuando com próximo bloco...`);
    }
    // Pequeno delay entre blocos para não sobrecarregar
    if (i < blocks.length - 1) {
      console.log('\n⏳ Aguardando 2 segundos antes do próximo bloco...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Resumo final
  const outputFiles = existsSync(BLOCKS_DIR)
    ? require('node:fs').readdirSync(BLOCKS_DIR).filter(f => f.startsWith('block-') && f.endsWith('-output.json'))
    : [];
  console.log(`\n\n=== RESUMO ===`);
  console.log(`Blocos processados: ${blocks.length}`);
  console.log(`Arquivos de output gerados: ${outputFiles.length}`);
  console.log(`Diretório de blocks: ${BLOCKS_DIR}`);
}

main().catch(e => { console.error('❌ Fatal:', e); process.exit(1); });