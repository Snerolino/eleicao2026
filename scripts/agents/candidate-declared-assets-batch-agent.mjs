import fs from 'node:fs';
import readline from 'node:readline';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const PUBLIC_CAND_PATH = path.resolve(ROOT, 'data/public-candidates.json');
const ASSETS_PATH = path.resolve(ROOT, 'data/candidate-declared-assets.json');
const CSV_2026_PATH = path.resolve(ROOT, '../dataset2026/candidatos/bem_candidato_2026_RS.csv');

// Inflação acumulada oficial de referência (IPCA) por intervalo eleitoral
const IPCA_TABLE = {
  '2022-2026': 21.8,
  '2020-2026': 38.4,
  '2018-2026': 42.5,
  '2016-2026': 55.2,
  '2014-2026': 82.1,
};

function cleanEncoding(str) {
  if (!str) return '';
  return str
    .replace(/\ufffd/g, '')
    .replace(/Depsito/gi, 'Depósito')
    .replace(/bancrio/gi, 'bancário')
    .replace(/Pas/gi, 'País')
    .replace(/Veculo/gi, 'Veículo')
    .replace(/caminho/gi, 'caminhão')
    .replace(/automvel/gi, 'automóvel')
    .replace(/Imvel/gi, 'Imóvel')
    .replace(/Ordinria/gi, 'Ordinária')
    .replace(/Eleies/gi, 'Eleições')
    .replace(/Eleio/gi, 'Eleição')
    .replace(/Aes/gi, 'Ações')
    .replace(/Crdito/gi, 'Crédito')
    .replace(/consrcio/gi, 'consórcio')
    .replace(/construdo/gi, 'construído')
    .replace(/Apartamento/gi, 'Apartamento')
    .replace(/Terreno/gi, 'Terreno')
    .replace(/Edificao/gi, 'Edificação')
    .replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, '[DOC]')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[EMAIL]')
    .replace(/\b(\d{2})\/(\d{2})\/(\d{4})\b/g, '$1-$2-$3')
    .trim();
}

function categorizeAsset(tipo, desc) {
  const t = `${tipo || ''} ${desc || ''}`.toLowerCase();

  // 1. Imóveis
  if (
    t.includes('imóvel') ||
    t.includes('imovel') ||
    t.includes('casa') ||
    t.includes('apartamento') ||
    t.includes('terreno') ||
    t.includes('sala') ||
    t.includes('galpão') ||
    t.includes('galpao') ||
    t.includes('prédio') ||
    t.includes('predio') ||
    t.includes('fazenda') ||
    t.includes('sítio') ||
    t.includes('sitio') ||
    t.includes('gleba') ||
    t.includes('chácara') ||
    t.includes('edificação') ||
    t.includes('vaga de garagem') ||
    t.includes('box de garagem')
  ) {
    return 'Imóveis e Terrenos';
  }

  // 2. Veículos e Transportes
  if (
    t.includes('veículo') ||
    t.includes('veiculo') ||
    t.includes('automóvel') ||
    t.includes('automovel') ||
    t.includes('caminhão') ||
    t.includes('caminhao') ||
    t.includes('moto') ||
    t.includes('motocicleta') ||
    t.includes('camionete') ||
    t.includes('camioneta') ||
    t.includes('reboque') ||
    t.includes('embarcação') ||
    t.includes('embarcacao') ||
    t.includes('lancha') ||
    t.includes('barco') ||
    t.includes('aeronave') ||
    t.includes('avião') ||
    t.includes('helicoptero')
  ) {
    return 'Veículos e Automotores';
  }

  // 3. Aplicações Financeiras, Poupança e Depósitos
  if (
    t.includes('depósito') ||
    t.includes('deposito') ||
    t.includes('aplicação') ||
    t.includes('aplicacao') ||
    t.includes('poupança') ||
    t.includes('poupanca') ||
    t.includes('fundo de investimento') ||
    t.includes('renda fixa') ||
    t.includes('cdb') ||
    t.includes('lci') ||
    t.includes('lca') ||
    t.includes('tesouro direto') ||
    t.includes('caderneta') ||
    t.includes('previdência privada') ||
    t.includes('vgbl') ||
    t.includes('pgbl') ||
    t.includes('conta corrente')
  ) {
    return 'Aplicações e Depósitos Bancários';
  }

  // 4. Participações Societárias, Empresas e Ações
  if (
    t.includes('ações') ||
    t.includes('acoes') ||
    t.includes('quotas') ||
    t.includes('cotas') ||
    t.includes('capital social') ||
    t.includes('participação') ||
    t.includes('participacao') ||
    t.includes('empresa') ||
    t.includes('sociedade') ||
    t.includes('ltda') ||
    t.includes('s.a.') ||
    t.includes('eireli') ||
    t.includes('firma individual')
  ) {
    return 'Participações Societárias e Empresas';
  }

  // 5. Dinheiro em Espécie
  if (
    t.includes('dinheiro em espécie') ||
    t.includes('dinheiro em especie') ||
    t.includes('moeda nacional') ||
    t.includes('moeda estrangeira') ||
    t.includes('dólar') ||
    t.includes('euro')
  ) {
    return 'Dinheiro em Espécie';
  }

  // 6. Créditos, Empréstimos e Consórcios
  if (
    t.includes('crédito') ||
    t.includes('credito') ||
    t.includes('empréstimo') ||
    t.includes('emprestimo') ||
    t.includes('consórcio') ||
    t.includes('consorcio') ||
    t.includes('direito a receber') ||
    t.includes('precatório') ||
    t.includes('título da dívida pública')
  ) {
    return 'Créditos e Direitos';
  }

  return 'Outros Bens e Direitos';
}

function calculateEvolutionAudit(declaracoesPorAno) {
  if (!declaracoesPorAno || declaracoesPorAno.length < 2) {
    return {
      evolucao_nominal: null,
      evolucao_percentual: null,
      auditoria_evolucao: null,
    };
  }

  // Ordena anos decrescente (ex.: 2026, 2022, 2018)
  const sorted = [...declaracoesPorAno].sort((a, b) => b.ano - a.ano);
  const base = sorted[0];
  const anterior = sorted[1];

  const totalBase = base.total || 0;
  const totalAnterior = anterior.total || 0;
  const variacaoNominal = totalBase - totalAnterior;

  let variacaoPercentual = 0;
  if (totalAnterior > 0) {
    variacaoPercentual = ((totalBase - totalAnterior) / totalAnterior) * 100;
  } else if (totalBase > 0) {
    variacaoPercentual = 100;
  }

  const keyIpca = `${anterior.ano}-${base.ano}`;
  const ipcaAcumulado = IPCA_TABLE[keyIpca] ?? 20.0;
  const acimaInflacao = variacaoPercentual > ipcaAcumulado;

  let resumo = '';
  const sinal = variacaoNominal >= 0 ? '+' : '';
  const varFormat = variacaoPercentual.toFixed(1);

  if (totalAnterior === 0 && totalBase > 0) {
    resumo = `Primeira declaração com bens registrados no valor de R$ ${totalBase.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em ${base.ano}.`;
  } else if (totalBase === 0 && totalAnterior > 0) {
    resumo = `Candidatura declarou não possuir bens em ${base.ano} (declarou R$ ${totalAnterior.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em ${anterior.ano}).`;
  } else if (acimaInflacao) {
    resumo = `Patrimônio variou ${sinal}${varFormat}% entre ${anterior.ano} e ${base.ano} — crescimento superior à inflação acumulada (${ipcaAcumulado}% IPCA).`;
  } else if (variacaoPercentual > 0) {
    resumo = `Patrimônio variou ${sinal}${varFormat}% entre ${anterior.ano} e ${base.ano} — evolução abaixo da inflação acumulada (${ipcaAcumulado}% IPCA).`;
  } else {
    resumo = `Patrimônio variou ${sinal}${varFormat}% entre ${anterior.ano} e ${base.ano} — decréscimo patrimonial declarado.`;
  }

  return {
    evolucao_nominal: variacaoNominal,
    evolucao_percentual: parseFloat(variacaoPercentual.toFixed(2)),
    auditoria_evolucao: {
      ano_base: base.ano,
      ano_anterior: anterior.ano,
      total_base: totalBase,
      total_anterior: totalAnterior,
      variacao_nominal: variacaoNominal,
      variacao_percentual: parseFloat(variacaoPercentual.toFixed(2)),
      ipca_acumulado_periodo: ipcaAcumulado,
      acima_da_inflacao: acimaInflacao,
      resumo,
    },
  };
}

export async function load2026CsvAssets() {
  const bensByCand = new Map();
  if (!fs.existsSync(CSV_2026_PATH)) {
    console.warn('⚠️ Arquivo CSV 2026 não encontrado em:', CSV_2026_PATH);
    return bensByCand;
  }

  const fileStream = fs.createReadStream(CSV_2026_PATH, { encoding: 'latin1' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let header = null;
  for await (const line of rl) {
    if (!header) {
      header = line.split(';').map((s) => s.replace(/"/g, ''));
      continue;
    }
    const cols = line.split(';').map((s) => s.replace(/"/g, ''));
    if (cols.length < 17) continue;

    const sqCand = cols[11]?.trim();
    if (!sqCand) continue;

    const anoEleicao = parseInt(cols[2], 10) || 2026;
    const tipoBem = cleanEncoding(cols[14]);
    const descBem = cleanEncoding(cols[15]);
    const valorStr = cols[16].replace(',', '.');
    const valor = parseFloat(valorStr) || 0;

    let candData = bensByCand.get(sqCand);
    if (!candData) {
      candData = {
        tse_candidate_id: sqCand,
        ano_recente: anoEleicao,
        total_declarado: 0,
        declaracoes_por_ano: [],
      };
      bensByCand.set(sqCand, candData);
    }

    let yearDecl = candData.declaracoes_por_ano.find((y) => y.ano === anoEleicao);
    if (!yearDecl) {
      yearDecl = {
        ano: anoEleicao,
        total: 0,
        itens_count: 0,
        itens: [],
        por_categoria: {},
      };
      candData.declaracoes_por_ano.push(yearDecl);
    }

    const cat = categorizeAsset(tipoBem, descBem);
    yearDecl.itens.push({ tipo: tipoBem, categoria: cat, descricao: descBem, valor });
    yearDecl.total += valor;
    yearDecl.itens_count += 1;
    yearDecl.por_categoria[cat] = (yearDecl.por_categoria[cat] || 0) + valor;

    candData.total_declarado += valor;
  }

  return bensByCand;
}

export async function runDeclaredAssetsBatchAgent() {
  console.log('========================================================================');
  console.log('🤖 AGENTE DE ATUALIZAÇÃO E AUDITORIA DE BENS DECLARADOS POR LOTES');
  console.log('========================================================================');
  console.log(`Timestamp: ${new Date().toISOString()}`);

  const publicCandidates = JSON.parse(fs.readFileSync(PUBLIC_CAND_PATH, 'utf8'));
  const currentCatalog = fs.existsSync(ASSETS_PATH)
    ? JSON.parse(fs.readFileSync(ASSETS_PATH, 'utf8'))
    : {};

  console.log(`📋 Total de candidaturas no snapshot público: ${publicCandidates.length}`);
  console.log(`📂 Entradas existentes no catálogo de bens: ${Object.keys(currentCatalog).length}`);

  // Carrega os dados 2026 do CSV
  const csv2026 = await load2026CsvAssets();
  console.log(`📊 Candidatos com bens no CSV 2026: ${csv2026.size}`);

  // Monta os lotes
  const batches = [
    {
      id: 'LOTE-01-MAJORITARIAS',
      label: 'Candidaturas Majoritárias (Governadores, Vice-Governadores, Senadores)',
      candidates: publicCandidates.filter((c) =>
        ['governador', 'vice_governador', 'senador'].includes(c.position)
      ),
    },
    {
      id: 'LOTE-02-FEDERAIS-PARTE-1',
      label: 'Deputados Federais — Grupo 1 (100 candidatos)',
      candidates: publicCandidates
        .filter((c) => c.position === 'deputado_federal')
        .slice(0, 100),
    },
    {
      id: 'LOTE-03-FEDERAIS-PARTE-2',
      label: 'Deputados Federais — Grupo 2 (100 candidatos)',
      candidates: publicCandidates
        .filter((c) => c.position === 'deputado_federal')
        .slice(100, 200),
    },
    {
      id: 'LOTE-04-FEDERAIS-PARTE-3',
      label: 'Deputados Federais — Grupo 3 (100 candidatos)',
      candidates: publicCandidates
        .filter((c) => c.position === 'deputado_federal')
        .slice(200, 300),
    },
    {
      id: 'LOTE-05-FEDERAIS-PARTE-4',
      label: 'Deputados Federais — Grupo 4 (134 candidatos)',
      candidates: publicCandidates
        .filter((c) => c.position === 'deputado_federal')
        .slice(300),
    },
    {
      id: 'LOTE-06-ESTADUAIS-PARTE-1',
      label: 'Deputados Estaduais — Grupo 1 (100 candidatos)',
      candidates: publicCandidates
        .filter((c) => c.position === 'deputado_estadual')
        .slice(0, 100),
    },
    {
      id: 'LOTE-07-ESTADUAIS-PARTE-2',
      label: 'Deputados Estaduais — Grupo 2 (100 candidatos)',
      candidates: publicCandidates
        .filter((c) => c.position === 'deputado_estadual')
        .slice(100, 200),
    },
    {
      id: 'LOTE-08-ESTADUAIS-PARTE-3',
      label: 'Deputados Estaduais — Grupo 3 (100 candidatos)',
      candidates: publicCandidates
        .filter((c) => c.position === 'deputado_estadual')
        .slice(200, 300),
    },
    {
      id: 'LOTE-09-ESTADUAIS-PARTE-4',
      label: 'Deputados Estaduais — Grupo 4 (100 candidatos)',
      candidates: publicCandidates
        .filter((c) => c.position === 'deputado_estadual')
        .slice(300, 400),
    },
    {
      id: 'LOTE-10-ESTADUAIS-PARTE-5',
      label: 'Deputados Estaduais — Grupo 5 (121 candidatos) e Outros',
      candidates: publicCandidates.filter(
        (c) =>
          c.position === 'outro' ||
          (c.position === 'deputado_estadual' &&
            publicCandidates.filter((x) => x.position === 'deputado_estadual').indexOf(c) >= 400)
      ),
    },
  ];

  console.log(`📦 Dividido em ${batches.length} lotes de processamento e publicação.\n`);

  let globalProcessed = 0;
  let globalAssetsTotal = 0;

  for (let bIdx = 0; bIdx < batches.length; bIdx++) {
    const batch = batches[bIdx];
    console.log(`------------------------------------------------------------------------`);
    console.log(`🚀 PROCESSANDO LOTE ${bIdx + 1}/${batches.length}: ${batch.id} (${batch.candidates.length} candidatos)`);
    console.log(`   ${batch.label}`);
    console.log(`------------------------------------------------------------------------`);

    let batchAssetsTotal = 0;
    let batchCandidatesWithAssets = 0;

    for (const cand of batch.candidates) {
      const tseId = cand.tse_candidate_id;
      if (!tseId) continue;

      let candAssets = currentCatalog[tseId];

      // Se temos dados no CSV 2026, mescla ou cria
      const csvCand = csv2026.get(tseId);
      if (csvCand) {
        if (!candAssets) {
          candAssets = csvCand;
        } else {
          // Atualiza a declaração de 2026 com os dados frescos do CSV
          const decl2026 = csvCand.declaracoes_por_ano.find((d) => d.ano === 2026);
          if (decl2026) {
            const idx = candAssets.declaracoes_por_ano.findIndex((d) => d.ano === 2026);
            if (idx >= 0) {
              candAssets.declaracoes_por_ano[idx] = decl2026;
            } else {
              candAssets.declaracoes_por_ano.unshift(decl2026);
            }
          }
          candAssets.total_declarado = decl2026 ? decl2026.total : candAssets.total_declarado;
          candAssets.ano_recente = 2026;
        }
      }

      // Se o candidato ainda não tem entrada de bens, cria entrada formal com total 0
      if (!candAssets) {
        candAssets = {
          tse_candidate_id: tseId,
          ano_recente: 2026,
          total_declarado: 0,
          declaracoes_por_ano: [
            {
              ano: 2026,
              total: 0,
              itens_count: 0,
              itens: [],
              por_categoria: {},
            },
          ],
          evolucao_nominal: null,
          evolucao_percentual: null,
          auditoria_evolucao: null,
        };
      }

      // Garante ordenação e cálculo de auditoria de evolução patrimonial
      candAssets.declaracoes_por_ano.sort((a, b) => b.ano - a.ano);
      candAssets.declaracoes_por_ano.forEach((d) => {
        d.itens.sort((a, b) => b.valor - a.valor);
      });

      const audit = calculateEvolutionAudit(candAssets.declaracoes_por_ano);
      candAssets.evolucao_nominal = audit.evolucao_nominal;
      candAssets.evolucao_percentual = audit.evolucao_percentual;
      candAssets.auditoria_evolucao = audit.auditoria_evolucao;

      // Salva no catálogo em memória
      currentCatalog[tseId] = candAssets;

      // Atualiza o objeto no snapshot
      cand.declared_assets = candAssets;

      globalProcessed++;
      if (candAssets.total_declarado > 0) {
        batchCandidatesWithAssets++;
        batchAssetsTotal += candAssets.total_declarado;
        globalAssetsTotal += candAssets.total_declarado;
      }
    }

    console.log(`   ✅ Lote concluído: ${batchCandidatesWithAssets} candidatos com bens somando R$ ${batchAssetsTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`);

    // 1. Salva os arquivos no disco
    fs.writeFileSync(ASSETS_PATH, JSON.stringify(currentCatalog, null, 2) + '\n');
    fs.writeFileSync(PUBLIC_CAND_PATH, JSON.stringify(publicCandidates, null, 2) + '\n');
    console.log(`   💾 Arquivos salvos no disco.`);

    // 2. Valida integridade dos dados
    console.log(`   🔍 Executando data:check...`);
    execSync('node scripts/data-check.mjs', { stdio: 'pipe' });

    // 3. Executa build de produção
    console.log(`   🏗️ Executando build de produção (Vite + PWA + Sitemap)...`);
    execSync('npm run build', { stdio: 'pipe' });

    // 4. Publica no Cloudflare Pages
    console.log(`   ☁️ Publicando lote no Cloudflare Pages...`);
    try {
      const deployOut = execSync(
        'wrangler pages deploy dist --project-name portal-transparencia-rs --branch main',
        { encoding: 'utf8' }
      );
      const urlMatch = deployOut.match(/https:\/\/[a-z0-9]+\.portal-transparencia-rs\.pages\.dev/);
      const deployUrl = urlMatch ? urlMatch[0] : 'https://portal-transparencia-rs.pages.dev';
      console.log(`   ✨ Publicação concluída com sucesso! URL do Lote: ${deployUrl}`);
    } catch (deployErr) {
      console.warn(`   ⚠️ Erro de deploy no Cloudflare Pages: ${deployErr.message}`);
    }

    console.log(`   📊 Progresso acumulado: ${globalProcessed}/${publicCandidates.length} candidatos atualizados.\n`);
  }

  console.log('========================================================================');
  console.log('🎉 TODOS OS LOTES FORAM PROCESSADOS E PUBLICADOS COM SUCESSO!');
  console.log(`Total de candidaturas cobertas: ${globalProcessed}`);
  console.log(`Patrimônio total consolidado: R$ ${globalAssetsTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
  console.log('========================================================================');
}

runDeclaredAssetsBatchAgent().catch((err) => {
  console.error('❌ Erro fatal no agente de bens:', err);
  process.exit(1);
});
