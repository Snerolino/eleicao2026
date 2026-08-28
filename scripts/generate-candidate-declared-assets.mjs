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
    .trim();
}

function categorizeAsset(tipo) {
  const t = (tipo || '').toLowerCase();
  if (
    t.includes('imóvel') ||
    t.includes('imovel') ||
    t.includes('casa') ||
    t.includes('apartamento') ||
    t.includes('terreno') ||
    t.includes('sala') ||
    t.includes('galpão') ||
    t.includes('prédio') ||
    t.includes('fazenda') ||
    t.includes('sítio')
  ) {
    return 'Imóveis e Terrenos';
  }
  if (
    t.includes('veículo') ||
    t.includes('veiculo') ||
    t.includes('automóvel') ||
    t.includes('automovel') ||
    t.includes('caminhão') ||
    t.includes('moto') ||
    t.includes('embarcação') ||
    t.includes('aeronave')
  ) {
    return 'Veículos e Automotores';
  }
  if (
    t.includes('depósito') ||
    t.includes('deposito') ||
    t.includes('aplicação') ||
    t.includes('aplicacao') ||
    t.includes('poupança') ||
    t.includes('fundo') ||
    t.includes('renda fixa') ||
    t.includes('caderneta') ||
    t.includes('dinheiro')
  ) {
    return 'Aplicações e Depósitos Bancários';
  }
  if (
    t.includes('ações') ||
    t.includes('acoes') ||
    t.includes('quotas') ||
    t.includes('capital') ||
    t.includes('participação') ||
    t.includes('empresa')
  ) {
    return 'Participações Societárias e Empresas';
  }
  return 'Outros Bens e Direitos';
}

export async function parseBens() {
  const root = process.cwd();
  const filePath = path.resolve(root, '../dataset2026/candidatos/bem_candidato_2026_RS.csv');
  if (!fs.existsSync(filePath)) {
    console.log('No bem_candidato file found at', filePath);
    return;
  }
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

    const sqCand = cols[11];
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

    const cat = categorizeAsset(tipoBem);
    yearDecl.itens.push({ tipo: tipoBem, categoria: cat, descricao: descBem, valor });
    yearDecl.total += valor;
    yearDecl.itens_count += 1;
    yearDecl.por_categoria[cat] = (yearDecl.por_categoria[cat] || 0) + valor;

    candData.total_declarado += valor;
    bensByCand.set(sqCand, candData);
  }

  const outObj = {};
  for (const [sqCand, candData] of bensByCand.entries()) {
    candData.declaracoes_por_ano.forEach((y) => {
      y.itens.sort((a, b) => b.valor - a.valor);
    });
    outObj[sqCand] = candData;
  }

  const outPath = path.resolve(root, 'data/candidate-declared-assets.json');
  fs.writeFileSync(outPath, JSON.stringify(outObj, null, 2) + '\n');
  console.log(`✅ Gerado data/candidate-declared-assets.json com ${Object.keys(outObj).length} candidatos com bens declarados.`);
}

parseBens();
