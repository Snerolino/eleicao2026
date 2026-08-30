import fs from 'node:fs';
import readline from 'node:readline';
import path from 'node:path';

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

export async function parseBens() {
  const root = process.cwd();
  const filePath = path.resolve(root, '../dataset2026/candidatos/bem_candidato_2026_RS.csv');
  const publicCandPath = path.resolve(root, 'data/public-candidates.json');
  const outPath = path.resolve(root, 'data/candidate-declared-assets.json');

  if (!fs.existsSync(filePath)) {
    console.log('Arquivo bem_candidato não localizado em:', filePath);
    return;
  }

  const publicCandidates = JSON.parse(fs.readFileSync(publicCandPath, 'utf8'));
  const fileStream = fs.createReadStream(filePath, { encoding: 'latin1' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let header = null;
  const bensByCand = new Map();

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

    const candData = bensByCand.get(sqCand) || {
      tse_candidate_id: sqCand,
      ano_recente: anoEleicao,
      total_declarado: 0,
      declaracoes_por_ano: [],
    };

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
    bensByCand.set(sqCand, candData);
  }

  const outObj = {};
  for (const [sqCand, candData] of bensByCand.entries()) {
    // Ordena anos decrescente (2026, 2022, 2018...).
    candData.declaracoes_por_ano.sort((a, b) => b.ano - a.ano);

    // Ordena itens por valor decrescente
    candData.declaracoes_por_ano.forEach((y) => {
      y.itens.sort((a, b) => b.valor - a.valor);
    });

    // Não inferir evolução patrimonial sem declarações históricas oficiais versionadas.
    candData.evolucao_nominal = null;
    candData.evolucao_percentual = null;
    candData.auditoria_evolucao = null;

    outObj[sqCand] = candData;
  }

  // Grava o catálogo consolidado
  fs.writeFileSync(outPath, JSON.stringify(outObj, null, 2) + '\n');
  console.log(`✅ Gerado ${outPath} com ${Object.keys(outObj).length} candidaturas com bens declarados.`);

  // Atualiza o snapshot público versionado injetando declared_assets nos candidatos
  let updatedSnapshotCount = 0;
  for (const cand of publicCandidates) {
    const assets = outObj[cand.tse_candidate_id];
    if (assets) {
      cand.declared_assets = assets;
      updatedSnapshotCount++;
    } else {
      cand.declared_assets = null;
    }
  }

  fs.writeFileSync(publicCandPath, JSON.stringify(publicCandidates, null, 2) + '\n');
  console.log(`✅ Snapshot público ${publicCandPath} atualizado com declared_assets para ${updatedSnapshotCount} candidatos.`);
}

parseBens();
