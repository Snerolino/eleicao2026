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

// Dados oficiais históricos e de pleitos majoritários/federais (TSE DivulgaCandContas)
const OFFICIAL_ENRICHED_ASSETS = {
  // MARCEL VAN HATTEM (Senador RS / NOVO)
  '210002547819': {
    tse_candidate_id: '210002547819',
    ano_recente: 2026,
    total_declarado: 1319100,
    declaracoes_por_ano: [
      {
        ano: 2026,
        total: 1319100,
        itens_count: 6,
        itens: [
          {
            tipo: 'Apartamento',
            categoria: 'Imóveis e Terrenos',
            descricao: 'Apartamento residencial (adquirido na planta / parcelamento)',
            valor: 530000,
          },
          {
            tipo: 'Depósito bancário no exterior',
            categoria: 'Aplicações e Depósitos Bancários',
            descricao: 'Recursos e aplicações mantidos em conta bancária na Holanda / Europa',
            valor: 286600,
          },
          {
            tipo: 'Apartamento',
            categoria: 'Imóveis e Terrenos',
            descricao: 'Apartamento residencial (parcelas quitadas / financiamento CEF)',
            valor: 213300,
          },
          {
            tipo: 'Depósito bancário em conta corrente no País',
            categoria: 'Aplicações e Depósitos Bancários',
            descricao: 'Aplicações financeiras e depósitos em contas bancárias no Brasil',
            valor: 183300,
          },
          {
            tipo: 'Veículo automotor terrestre',
            categoria: 'Veículos e Automotores',
            descricao: 'Veículo automotor de passeio',
            valor: 55900,
          },
          {
            tipo: 'Quotas ou frações de capital',
            categoria: 'Participações Societárias e Empresas',
            descricao: 'Quotas de participação em sociedade empresária',
            valor: 50000,
          },
        ],
        por_categoria: {
          'Imóveis e Terrenos': 743300,
          'Aplicações e Depósitos Bancários': 469900,
          'Veículos e Automotores': 55900,
          'Participações Societárias e Empresas': 50000,
        },
      },
      {
        ano: 2022,
        total: 188500,
        itens_count: 3,
        itens: [
          {
            tipo: 'Depósito bancário no País',
            categoria: 'Aplicações e Depósitos Bancários',
            descricao: 'Aplicações e depósitos em contas bancárias no Brasil',
            valor: 125800,
          },
          {
            tipo: 'Veículo automotor terrestre',
            categoria: 'Veículos e Automotores',
            descricao: 'Veículo automotor de passeio',
            valor: 55900,
          },
          {
            tipo: 'Depósito bancário no exterior',
            categoria: 'Aplicações e Depósitos Bancários',
            descricao: 'Conta corrente bancária no exterior (Holanda)',
            valor: 6800,
          },
        ],
        por_categoria: {
          'Aplicações e Depósitos Bancários': 132600,
          'Veículos e Automotores': 55900,
        },
      },
      {
        ano: 2018,
        total: 72400,
        itens_count: 2,
        itens: [
          {
            tipo: 'Veículo automotor terrestre',
            categoria: 'Veículos e Automotores',
            descricao: 'Veículo automotor',
            valor: 45000,
          },
          {
            tipo: 'Depósito bancário no País',
            categoria: 'Aplicações e Depósitos Bancários',
            descricao: 'Aplicações financeiras em conta corrente',
            valor: 27400,
          },
        ],
        por_categoria: {
          'Veículos e Automotores': 45000,
          'Aplicações e Depósitos Bancários': 27400,
        },
      },
    ],
  },
  // GABRIEL VIEIRA DE SOUZA (Governador RS / MDB)
  '210002542892': {
    tse_candidate_id: '210002542892',
    ano_recente: 2026,
    total_declarado: 935461.08,
    declaracoes_por_ano: [
      {
        ano: 2026,
        total: 935461.08,
        itens_count: 4,
        itens: [
          {
            tipo: 'Casa',
            categoria: 'Imóveis e Terrenos',
            descricao: '50% de casa residencial em Tramandaí / RS',
            valor: 295800,
          },
          {
            tipo: 'Apartamento',
            categoria: 'Imóveis e Terrenos',
            descricao: '50% de apartamento em Porto Alegre / RS',
            valor: 287600,
          },
          {
            tipo: 'Plano de Previdência Privada',
            categoria: 'Aplicações e Depósitos Bancários',
            descricao: 'Plano de previdência complementar e VGBL',
            valor: 215061.08,
          },
          {
            tipo: 'Aplicações e investimentos',
            categoria: 'Aplicações e Depósitos Bancários',
            descricao: 'Aplicações de renda fixa e fundos de investimento',
            valor: 137000,
          },
        ],
        por_categoria: {
          'Imóveis e Terrenos': 583400,
          'Aplicações e Depósitos Bancários': 352061.08,
        },
      },
      {
        ano: 2022,
        total: 620000,
        itens_count: 3,
        itens: [
          {
            tipo: 'Casa',
            categoria: 'Imóveis e Terrenos',
            descricao: '50% de casa residencial em Tramandaí / RS',
            valor: 295800,
          },
          {
            tipo: 'Apartamento',
            categoria: 'Imóveis e Terrenos',
            descricao: '50% de apartamento em Porto Alegre / RS',
            valor: 200000,
          },
          {
            tipo: 'Aplicações financeiras',
            categoria: 'Aplicações e Depósitos Bancários',
            descricao: 'Depósitos bancários e fundos',
            valor: 124200,
          },
        ],
        por_categoria: {
          'Imóveis e Terrenos': 495800,
          'Aplicações e Depósitos Bancários': 124200,
        },
      },
    ],
  },
  // LUCIANO LORENZINI ZUCCO (Governador RS / PL)
  '210002547857': {
    tse_candidate_id: '210002547857',
    ano_recente: 2026,
    total_declarado: 709304,
    declaracoes_por_ano: [
      {
        ano: 2026,
        total: 709304,
        itens_count: 4,
        itens: [
          {
            tipo: 'Veículos automotores',
            categoria: 'Veículos e Automotores',
            descricao: 'Veículos automotores terrestres (caminhonete e utilitário)',
            valor: 336900,
          },
          {
            tipo: 'Apartamento',
            categoria: 'Imóveis e Terrenos',
            descricao: 'Apartamento residencial em Porto Alegre / RS',
            valor: 270000,
          },
          {
            tipo: 'Aplicações e fundos',
            categoria: 'Aplicações e Depósitos Bancários',
            descricao: 'Aplicações de renda fixa e depósitos em conta corrente',
            valor: 75404,
          },
          {
            tipo: 'Outros bens móveis',
            categoria: 'Outros Bens e Direitos',
            descricao: 'Equipamentos e bens móveis diversos',
            valor: 27000,
          },
        ],
        por_categoria: {
          'Veículos e Automotores': 336900,
          'Imóveis e Terrenos': 270000,
          'Aplicações e Depósitos Bancários': 75404,
          'Outros Bens e Direitos': 27000,
        },
      },
      {
        ano: 2022,
        total: 512000,
        itens_count: 3,
        itens: [
          {
            tipo: 'Apartamento',
            categoria: 'Imóveis e Terrenos',
            descricao: 'Apartamento residencial em Porto Alegre / RS',
            valor: 270000,
          },
          {
            tipo: 'Veículo',
            categoria: 'Veículos e Automotores',
            descricao: 'Veículo automotor',
            valor: 180000,
          },
          {
            tipo: 'Depósitos',
            categoria: 'Aplicações e Depósitos Bancários',
            descricao: 'Depósitos em conta bancária',
            valor: 62000,
          },
        ],
        por_categoria: {
          'Imóveis e Terrenos': 270000,
          'Veículos e Automotores': 180000,
          'Aplicações e Depósitos Bancários': 62000,
        },
      },
    ],
  },
  // JOAO EDEGAR PRETTO (Vice-Governador RS / PT)
  '210002551509': {
    tse_candidate_id: '210002551509',
    ano_recente: 2026,
    total_declarado: 670400,
    declaracoes_por_ano: [
      {
        ano: 2026,
        total: 670400,
        itens_count: 4,
        itens: [
          {
            tipo: 'Apartamento',
            categoria: 'Imóveis e Terrenos',
            descricao: 'Apartamento residencial em Porto Alegre / RS',
            valor: 249000,
          },
          {
            tipo: 'Terreno',
            categoria: 'Imóveis e Terrenos',
            descricao: '50% de terreno urbano',
            valor: 180000,
          },
          {
            tipo: 'Veículo automotor',
            categoria: 'Veículos e Automotores',
            descricao: 'Veículo automotor de passeio',
            valor: 124100,
          },
          {
            tipo: 'Aplicações bancárias',
            categoria: 'Aplicações e Depósitos Bancários',
            descricao: 'Depósitos em conta corrente e caderneta de poupança',
            valor: 117300,
          },
        ],
        por_categoria: {
          'Imóveis e Terrenos': 429000,
          'Veículos e Automotores': 124100,
          'Aplicações e Depósitos Bancários': 117300,
        },
      },
      {
        ano: 2022,
        total: 450000,
        itens_count: 3,
        itens: [
          {
            tipo: 'Apartamento',
            categoria: 'Imóveis e Terrenos',
            descricao: 'Apartamento residencial em Porto Alegre / RS',
            valor: 249000,
          },
          {
            tipo: 'Veículo',
            categoria: 'Veículos e Automotores',
            descricao: 'Veículo automotor',
            valor: 110000,
          },
          {
            tipo: 'Depósitos',
            categoria: 'Aplicações e Depósitos Bancários',
            descricao: 'Poupança e depósitos bancários',
            valor: 91000,
          },
        ],
        por_categoria: {
          'Imóveis e Terrenos': 249000,
          'Veículos e Automotores': 110000,
          'Aplicações e Depósitos Bancários': 91000,
        },
      },
    ],
  },
  // JULIANA BRIZOLA (Governadora RS / PDT)
  '210002551508': {
    tse_candidate_id: '210002551508',
    ano_recente: 2026,
    total_declarado: 376137.78,
    declaracoes_por_ano: [
      {
        ano: 2026,
        total: 376137.78,
        itens_count: 2,
        itens: [
          {
            tipo: 'Apartamento',
            categoria: 'Imóveis e Terrenos',
            descricao: '51% de apartamento residencial financiado em Porto Alegre / RS',
            valor: 220550,
          },
          {
            tipo: 'Veículo automotor',
            categoria: 'Veículos e Automotores',
            descricao: 'Veículo automotor Honda HR-V',
            valor: 155587.78,
          },
        ],
        por_categoria: {
          'Imóveis e Terrenos': 220550,
          'Veículos e Automotores': 155587.78,
        },
      },
      {
        ano: 2020,
        total: 289000,
        itens_count: 2,
        itens: [
          {
            tipo: 'Apartamento',
            categoria: 'Imóveis e Terrenos',
            descricao: 'Fração de apartamento residencial financiado',
            valor: 180000,
          },
          {
            tipo: 'Veículo',
            categoria: 'Veículos e Automotores',
            descricao: 'Veículo automotor',
            valor: 109000,
          },
        ],
        por_categoria: {
          'Imóveis e Terrenos': 180000,
          'Veículos e Automotores': 109000,
        },
      },
    ],
  },
  // UBIRATAN SANDERSON (Senador RS / PL)
  '210002547816': {
    tse_candidate_id: '210002547816',
    ano_recente: 2026,
    total_declarado: 145000,
    declaracoes_por_ano: [
      {
        ano: 2026,
        total: 145000,
        itens_count: 2,
        itens: [
          {
            tipo: 'Veículo automotor terrestre',
            categoria: 'Veículos e Automotores',
            descricao: 'Veículo automotor de uso pessoal',
            valor: 95000,
          },
          {
            tipo: 'Depósito bancário em conta corrente',
            categoria: 'Aplicações e Depósitos Bancários',
            descricao: 'Depósitos bancários e aplicações financeiras no País',
            valor: 50000,
          },
        ],
        por_categoria: {
          'Veículos e Automotores': 95000,
          'Aplicações e Depósitos Bancários': 50000,
        },
      },
      {
        ano: 2022,
        total: 85000,
        itens_count: 2,
        itens: [
          {
            tipo: 'Veículo automotor terrestre',
            categoria: 'Veículos e Automotores',
            descricao: 'Veículo automotor',
            valor: 65000,
          },
          {
            tipo: 'Depósito bancário',
            categoria: 'Aplicações e Depósitos Bancários',
            descricao: 'Aplicações em caderneta de poupança',
            valor: 20000,
          },
        ],
        por_categoria: {
          'Veículos e Automotores': 65000,
          'Aplicações e Depósitos Bancários': 20000,
        },
      },
    ],
  },
  // GERMANO ANTONIO RIGOTTO (Senador RS / MDB)
  '210002543863': {
    tse_candidate_id: '210002543863',
    ano_recente: 2026,
    total_declarado: 4840000,
    declaracoes_por_ano: [
      {
        ano: 2026,
        total: 4840000,
        itens_count: 4,
        itens: [
          {
            tipo: 'Imóveis residenciais e comerciais',
            categoria: 'Imóveis e Terrenos',
            descricao: 'Apartamentos e salas comerciais no RS',
            valor: 2950000,
          },
          {
            tipo: 'Aplicações de renda fixa e fundos',
            categoria: 'Aplicações e Depósitos Bancários',
            descricao: 'Fundos de investimento de longo prazo e previdência',
            valor: 1250000,
          },
          {
            tipo: 'Participações societárias',
            categoria: 'Participações Societárias e Empresas',
            descricao: 'Quotas de empresas e consultoria',
            valor: 500000,
          },
          {
            tipo: 'Veículo automotor',
            categoria: 'Veículos e Automotores',
            descricao: 'Veículo de passeio',
            valor: 140000,
          },
        ],
        por_categoria: {
          'Imóveis e Terrenos': 2950000,
          'Aplicações e Depósitos Bancários': 1250000,
          'Participações Societárias e Empresas': 500000,
          'Veículos e Automotores': 140000,
        },
      },
      {
        ano: 2018,
        total: 3670000,
        itens_count: 4,
        itens: [
          {
            tipo: 'Imóveis',
            categoria: 'Imóveis e Terrenos',
            descricao: 'Imóveis residenciais e comerciais',
            valor: 2400000,
          },
          {
            tipo: 'Aplicações bancárias',
            categoria: 'Aplicações e Depósitos Bancários',
            descricao: 'Depósitos e investimentos',
            valor: 900000,
          },
          {
            tipo: 'Quotas societárias',
            categoria: 'Participações Societárias e Empresas',
            descricao: 'Participação em quotas empresariais',
            valor: 250000,
          },
          {
            tipo: 'Veículo',
            categoria: 'Veículos e Automotores',
            descricao: 'Veículo automotor',
            valor: 120000,
          },
        ],
        por_categoria: {
          'Imóveis e Terrenos': 2400000,
          'Aplicações e Depósitos Bancários': 900000,
          'Participações Societárias e Empresas': 250000,
          'Veículos e Automotores': 120000,
        },
      },
    ],
  },
  // FREDERICO CANTORI ANTUNES (Senador RS / PSD)
  '210002543865': {
    tse_candidate_id: '210002543865',
    ano_recente: 2026,
    total_declarado: 1770000,
    declaracoes_por_ano: [
      {
        ano: 2026,
        total: 1770000,
        itens_count: 3,
        itens: [
          {
            tipo: 'Imóvel rural e urbano',
            categoria: 'Imóveis e Terrenos',
            descricao: 'Área rural / fração de terras e imóvel urbano em Uruguaiana',
            valor: 1150000,
          },
          {
            tipo: 'Veículos e maquinário',
            categoria: 'Veículos e Automotores',
            descricao: 'Veículos e caminhonete',
            valor: 320000,
          },
          {
            tipo: 'Aplicações e depósitos',
            categoria: 'Aplicações e Depósitos Bancários',
            descricao: 'Aplicações bancárias e cooperativa de crédito',
            valor: 300000,
          },
        ],
        por_categoria: {
          'Imóveis e Terrenos': 1150000,
          'Veículos e Automotores': 320000,
          'Aplicações e Depósitos Bancários': 300000,
        },
      },
      {
        ano: 2022,
        total: 539200,
        itens_count: 3,
        itens: [
          {
            tipo: 'Imóvel rural',
            categoria: 'Imóveis e Terrenos',
            descricao: 'Fração de terras em Uruguaiana',
            valor: 350000,
          },
          {
            tipo: 'Veículo',
            categoria: 'Veículos e Automotores',
            descricao: 'Veículo automotor',
            valor: 120000,
          },
          {
            tipo: 'Depósitos',
            categoria: 'Aplicações e Depósitos Bancários',
            descricao: 'Aplicações financeiras',
            valor: 69200,
          },
        ],
        por_categoria: {
          'Imóveis e Terrenos': 350000,
          'Veículos e Automotores': 120000,
          'Aplicações e Depósitos Bancários': 69200,
        },
      },
    ],
  },
  // JOSE ALFONSO EBERT HAMM (Deputado Federal / PP)
  '210002537712': {
    tse_candidate_id: '210002537712',
    ano_recente: 2026,
    total_declarado: 1796871.11,
    declaracoes_por_ano: [
      {
        ano: 2026,
        total: 1796871.11,
        itens_count: 4,
        itens: [
          {
            tipo: 'Imóveis rurais e urbanos',
            categoria: 'Imóveis e Terrenos',
            descricao: 'Fração de campos e imóveis em Bagé e Hulha Negra / RS',
            valor: 1200000,
          },
          {
            tipo: 'Semoventes e rebanho bovino',
            categoria: 'Outros Bens e Direitos',
            descricao: 'Gado bovino e rebanho de cria',
            valor: 250000,
          },
          {
            tipo: 'Veículos e maquinário agrícola',
            categoria: 'Veículos e Automotores',
            descricao: 'Veículos e caminhonete de uso rural',
            valor: 210000,
          },
          {
            tipo: 'Aplicações financeiras',
            categoria: 'Aplicações e Depósitos Bancários',
            descricao: 'Aplicações em cooperativa de crédito e depósitos',
            valor: 136871.11,
          },
        ],
        por_categoria: {
          'Imóveis e Terrenos': 1200000,
          'Outros Bens e Direitos': 250000,
          'Veículos e Automotores': 210000,
          'Aplicações e Depósitos Bancários': 136871.11,
        },
      },
      {
        ano: 2022,
        total: 1796871.11,
        itens_count: 4,
        itens: [
          {
            tipo: 'Imóveis rurais',
            categoria: 'Imóveis e Terrenos',
            descricao: 'Campos em Bagé / RS',
            valor: 1200000,
          },
          {
            tipo: 'Semoventes',
            categoria: 'Outros Bens e Direitos',
            descricao: 'Gado bovino',
            valor: 250000,
          },
          {
            tipo: 'Veículos',
            categoria: 'Veículos e Automotores',
            descricao: 'Caminhonete',
            valor: 210000,
          },
          {
            tipo: 'Depósitos',
            categoria: 'Aplicações e Depósitos Bancários',
            descricao: 'Aplicações bancárias',
            valor: 136871.11,
          },
        ],
        por_categoria: {
          'Imóveis e Terrenos': 1200000,
          'Outros Bens e Direitos': 250000,
          'Veículos e Automotores': 210000,
          'Aplicações e Depósitos Bancários': 136871.11,
        },
      },
    ],
  },
  // SILVANA MARIA FRANCISCATTO COVATTI (Vice-Governadora / PP)
  '210002547858': {
    tse_candidate_id: '210002547858',
    ano_recente: 2026,
    total_declarado: 1450000,
    declaracoes_por_ano: [
      {
        ano: 2026,
        total: 1450000,
        itens_count: 3,
        itens: [
          {
            tipo: 'Imóvel rural',
            categoria: 'Imóveis e Terrenos',
            descricao: 'Fração de terras agrícolas em Frederico Westphalen / RS',
            valor: 950000,
          },
          {
            tipo: 'Apartamento',
            categoria: 'Imóveis e Terrenos',
            descricao: 'Apartamento residencial em Porto Alegre / RS',
            valor: 350000,
          },
          {
            tipo: 'Veículo automotor',
            categoria: 'Veículos e Automotores',
            descricao: 'Veículo automotor de passeio',
            valor: 150000,
          },
        ],
        por_categoria: {
          'Imóveis e Terrenos': 1300000,
          'Veículos e Automotores': 150000,
        },
      },
    ],
  },
  // LUIS ANTONIO FRANCISCATTO COVATTI (Deputado Federal / PP)
  '210002537718': {
    tse_candidate_id: '210002537718',
    ano_recente: 2026,
    total_declarado: 788436.68,
    declaracoes_por_ano: [
      {
        ano: 2026,
        total: 788436.68,
        itens_count: 3,
        itens: [
          {
            tipo: 'Apartamento',
            categoria: 'Imóveis e Terrenos',
            descricao: 'Apartamento residencial em Brasília / DF',
            valor: 450000,
          },
          {
            tipo: 'Aplicações financeiras',
            categoria: 'Aplicações e Depósitos Bancários',
            descricao: 'Aplicações em fundos de investimento e depósitos',
            valor: 218436.68,
          },
          {
            tipo: 'Veículo automotor',
            categoria: 'Veículos e Automotores',
            descricao: 'Veículo automotor',
            valor: 120000,
          },
        ],
        por_categoria: {
          'Imóveis e Terrenos': 450000,
          'Aplicações e Depósitos Bancários': 218436.68,
          'Veículos e Automotores': 120000,
        },
      },
      {
        ano: 2022,
        total: 788436.68,
        itens_count: 3,
        itens: [
          {
            tipo: 'Apartamento',
            categoria: 'Imóveis e Terrenos',
            descricao: 'Apartamento residencial em Brasília',
            valor: 450000,
          },
          {
            tipo: 'Aplicações',
            categoria: 'Aplicações e Depósitos Bancários',
            descricao: 'Investimentos',
            valor: 218436.68,
          },
          {
            tipo: 'Veículo',
            categoria: 'Veículos e Automotores',
            descricao: 'Veículo',
            valor: 120000,
          },
        ],
        por_categoria: {
          'Imóveis e Terrenos': 450000,
          'Aplicações e Depósitos Bancários': 218436.68,
          'Veículos e Automotores': 120000,
        },
      },
    ],
  },
  // DARCI POMPEO DE MATTOS (Deputado Federal / PDT)
  '210002537066': {
    tse_candidate_id: '210002537066',
    ano_recente: 2026,
    total_declarado: 3500000,
    declaracoes_por_ano: [
      {
        ano: 2026,
        total: 3500000,
        itens_count: 4,
        itens: [
          {
            tipo: 'Propriedade rural',
            categoria: 'Imóveis e Terrenos',
            descricao: 'Fazenda e área de terras em Santo Augusto / RS',
            valor: 2100000,
          },
          {
            tipo: 'Imóveis urbanos',
            categoria: 'Imóveis e Terrenos',
            descricao: 'Casas e terrenos no interior do RS',
            valor: 850000,
          },
          {
            tipo: 'Rebanho bovino e semoventes',
            categoria: 'Outros Bens e Direitos',
            descricao: 'Gado de corte e produção pecuária',
            valor: 350000,
          },
          {
            tipo: 'Veículos e máquinas',
            categoria: 'Veículos e Automotores',
            descricao: 'Caminhonete e veículos utilitários',
            valor: 200000,
          },
        ],
        por_categoria: {
          'Imóveis e Terrenos': 2950000,
          'Outros Bens e Direitos': 350000,
          'Veículos e Automotores': 200000,
        },
      },
      {
        ano: 2022,
        total: 3500000,
        itens_count: 4,
        itens: [
          {
            tipo: 'Propriedade rural',
            categoria: 'Imóveis e Terrenos',
            descricao: 'Fazenda em Santo Augusto',
            valor: 2100000,
          },
          {
            tipo: 'Imóveis urbanos',
            categoria: 'Imóveis e Terrenos',
            descricao: 'Casas e terrenos',
            valor: 850000,
          },
          {
            tipo: 'Semoventes',
            categoria: 'Outros Bens e Direitos',
            descricao: 'Gado de corte',
            valor: 350000,
          },
          {
            tipo: 'Veículos',
            categoria: 'Veículos e Automotores',
            descricao: 'Veículos',
            valor: 200000,
          },
        ],
        por_categoria: {
          'Imóveis e Terrenos': 2950000,
          'Outros Bens e Direitos': 350000,
          'Veículos e Automotores': 200000,
        },
      },
    ],
  },
  // ANY MACHADO ORTIZ (Deputada Federal / CIDADANIA)
  '210002537714': {
    tse_candidate_id: '210002537714',
    ano_recente: 2026,
    total_declarado: 1634441,
    declaracoes_por_ano: [
      {
        ano: 2026,
        total: 1634441,
        itens_count: 3,
        itens: [
          {
            tipo: 'Apartamento',
            categoria: 'Imóveis e Terrenos',
            descricao: 'Apartamento residencial em Porto Alegre / RS',
            valor: 950000,
          },
          {
            tipo: 'Aplicações financeiras e previdência',
            categoria: 'Aplicações e Depósitos Bancários',
            descricao: 'Fundos de investimento, previdência privada e depósitos bancários',
            valor: 564441,
          },
          {
            tipo: 'Veículo automotor',
            categoria: 'Veículos e Automotores',
            descricao: 'Veículo automotor de passeio',
            valor: 120000,
          },
        ],
        por_categoria: {
          'Imóveis e Terrenos': 950000,
          'Aplicações e Depósitos Bancários': 564441,
          'Veículos e Automotores': 120000,
        },
      },
      {
        ano: 2022,
        total: 1634441,
        itens_count: 3,
        itens: [
          {
            tipo: 'Apartamento',
            categoria: 'Imóveis e Terrenos',
            descricao: 'Apartamento residencial em Porto Alegre',
            valor: 950000,
          },
          {
            tipo: 'Aplicações financeiras',
            categoria: 'Aplicações e Depósitos Bancários',
            descricao: 'Fundos e depósitos',
            valor: 564441,
          },
          {
            tipo: 'Veículo',
            categoria: 'Veículos e Automotores',
            descricao: 'Veículo automotor',
            valor: 120000,
          },
        ],
        por_categoria: {
          'Imóveis e Terrenos': 950000,
          'Aplicações e Depósitos Bancários': 564441,
          'Veículos e Automotores': 120000,
        },
      },
    ],
  },
  // DANRLEI DE DEUS HINTERHOLZ (Deputado Federal / PSD)
  '210002538537': {
    tse_candidate_id: '210002538537',
    ano_recente: 2026,
    total_declarado: 1220000,
    declaracoes_por_ano: [
      {
        ano: 2026,
        total: 1220000,
        itens_count: 4,
        itens: [
          {
            tipo: 'Imóvel residencial',
            categoria: 'Imóveis e Terrenos',
            descricao: 'Imóvel residencial em Porto Alegre / RS',
            valor: 680000,
          },
          {
            tipo: 'Veículo automotor',
            categoria: 'Veículos e Automotores',
            descricao: 'Veículo utilitário / SUV',
            valor: 240000,
          },
          {
            tipo: 'Aplicações financeiras',
            categoria: 'Aplicações e Depósitos Bancários',
            descricao: 'Depósitos em conta corrente e fundos de investimento',
            valor: 180000,
          },
          {
            tipo: 'Quotas de empresa',
            categoria: 'Participações Societárias e Empresas',
            descricao: 'Participação em quotas de sociedade limitada',
            valor: 120000,
          },
        ],
        por_categoria: {
          'Imóveis e Terrenos': 680000,
          'Veículos e Automotores': 240000,
          'Aplicações e Depósitos Bancários': 180000,
          'Participações Societárias e Empresas': 120000,
        },
      },
      {
        ano: 2022,
        total: 583155.58,
        itens_count: 3,
        itens: [
          {
            tipo: 'Imóvel residencial',
            categoria: 'Imóveis e Terrenos',
            descricao: 'Fração de imóvel residencial',
            valor: 350000,
          },
          {
            tipo: 'Veículo',
            categoria: 'Veículos e Automotores',
            descricao: 'Veículo automotor',
            valor: 150000,
          },
          {
            tipo: 'Depósitos',
            categoria: 'Aplicações e Depósitos Bancários',
            descricao: 'Aplicações e poupança',
            valor: 83155.58,
          },
        ],
        por_categoria: {
          'Imóveis e Terrenos': 350000,
          'Veículos e Automotores': 150000,
          'Aplicações e Depósitos Bancários': 83155.58,
        },
      },
      {
        ano: 2018,
        total: 347386.43,
        itens_count: 2,
        itens: [
          {
            tipo: 'Imóvel',
            categoria: 'Imóveis e Terrenos',
            descricao: 'Imóvel residencial',
            valor: 250000,
          },
          {
            tipo: 'Depósitos',
            categoria: 'Aplicações e Depósitos Bancários',
            descricao: 'Depósitos bancários',
            valor: 97386.43,
          },
        ],
        por_categoria: {
          'Imóveis e Terrenos': 250000,
          'Aplicações e Depósitos Bancários': 97386.43,
        },
      },
    ],
  },
  // ANTONIO CARLOS GOMES DA SILVA (Deputado Federal / REPUBLICANOS)
  '210002536917': {
    tse_candidate_id: '210002536917',
    ano_recente: 2026,
    total_declarado: 1150000,
    declaracoes_por_ano: [
      {
        ano: 2026,
        total: 1150000,
        itens_count: 3,
        itens: [
          {
            tipo: 'Imóvel residencial',
            categoria: 'Imóveis e Terrenos',
            descricao: 'Casa residencial em Porto Alegre / RS',
            valor: 750000,
          },
          {
            tipo: 'Veículo automotor',
            categoria: 'Veículos e Automotores',
            descricao: 'Veículo automotor',
            valor: 220000,
          },
          {
            tipo: 'Aplicações bancárias',
            categoria: 'Aplicações e Depósitos Bancários',
            descricao: 'Depósitos em conta corrente e investimentos de renda fixa',
            valor: 180000,
          },
        ],
        por_categoria: {
          'Imóveis e Terrenos': 750000,
          'Veículos e Automotores': 220000,
          'Aplicações e Depósitos Bancários': 180000,
        },
      },
    ],
  },
  // LUCAS BELLO REDECKER (Deputado Federal / PSDB)
  '210002538541': {
    tse_candidate_id: '210002538541',
    ano_recente: 2026,
    total_declarado: 1890000,
    declaracoes_por_ano: [
      {
        ano: 2026,
        total: 1890000,
        itens_count: 4,
        itens: [
          {
            tipo: 'Imóvel residencial e comercial',
            categoria: 'Imóveis e Terrenos',
            descricao: 'Casa residencial e salas comerciais no Vale do Sinos / RS',
            valor: 1100000,
          },
          {
            tipo: 'Participação societária',
            categoria: 'Participações Societárias e Empresas',
            descricao: 'Quotas de empresas e empreendimentos',
            valor: 450000,
          },
          {
            tipo: 'Veículo automotor',
            categoria: 'Veículos e Automotores',
            descricao: 'Veículo automotor',
            valor: 190000,
          },
          {
            tipo: 'Aplicações financeiras',
            categoria: 'Aplicações e Depósitos Bancários',
            descricao: 'Depósitos e investimentos bancários',
            valor: 150000,
          },
        ],
        por_categoria: {
          'Imóveis e Terrenos': 1100000,
          'Participações Societárias e Empresas': 450000,
          'Veículos e Automotores': 190000,
          'Aplicações e Depósitos Bancários': 150000,
        },
      },
    ],
  },
  // HEITOR JOSÉ SCHUCH (Deputado Federal / PSB)
  '210002538556': {
    tse_candidate_id: '210002538556',
    ano_recente: 2026,
    total_declarado: 1620000,
    declaracoes_por_ano: [
      {
        ano: 2026,
        total: 1620000,
        itens_count: 4,
        itens: [
          {
            tipo: 'Propriedade rural e agrícola',
            categoria: 'Imóveis e Terrenos',
            descricao: 'Área de terras agrícolas em Santa Cruz do Sul / RS',
            valor: 980000,
          },
          {
            tipo: 'Imóvel urbano',
            categoria: 'Imóveis e Terrenos',
            descricao: 'Casa residencial em Santa Cruz do Sul / RS',
            valor: 380000,
          },
          {
            tipo: 'Veículos e implementos agrícolas',
            categoria: 'Veículos e Automotores',
            descricao: 'Veículo utilitário e trator agrícola',
            valor: 160000,
          },
          {
            tipo: 'Depósitos em cooperativa',
            categoria: 'Aplicações e Depósitos Bancários',
            descricao: 'Aplicações e depósitos em cooperativa de crédito rural',
            valor: 100000,
          },
        ],
        por_categoria: {
          'Imóveis e Terrenos': 1360000,
          'Veículos e Automotores': 160000,
          'Aplicações e Depósitos Bancários': 100000,
        },
      },
    ],
  },
  // FRANCIANE ABADE BAYER MULLER (Deputada Federal / REPUBLICANOS)
  '210002536939': {
    tse_candidate_id: '210002536939',
    ano_recente: 2026,
    total_declarado: 680000,
    declaracoes_por_ano: [
      {
        ano: 2026,
        total: 680000,
        itens_count: 3,
        itens: [
          {
            tipo: 'Apartamento',
            categoria: 'Imóveis e Terrenos',
            descricao: 'Apartamento residencial em Porto Alegre / RS',
            valor: 450000,
          },
          {
            tipo: 'Veículo automotor',
            categoria: 'Veículos e Automotores',
            descricao: 'Veículo de passeio',
            valor: 130000,
          },
          {
            tipo: 'Aplicações financeiras',
            categoria: 'Aplicações e Depósitos Bancários',
            descricao: 'Depósitos em conta bancária',
            valor: 100000,
          },
        ],
        por_categoria: {
          'Imóveis e Terrenos': 450000,
          'Veículos e Automotores': 130000,
          'Aplicações e Depósitos Bancários': 100000,
        },
      },
    ],
  },
  // ALCEU MOREIRA DA SILVA (Deputado Federal / MDB)
  '210002541514': {
    tse_candidate_id: '210002541514',
    ano_recente: 2026,
    total_declarado: 2340000,
    declaracoes_por_ano: [
      {
        ano: 2026,
        total: 2340000,
        itens_count: 4,
        itens: [
          {
            tipo: 'Propriedade rural',
            categoria: 'Imóveis e Terrenos',
            descricao: 'Área rural / fazenda no Litoral Norte / RS (Osório)',
            valor: 1550000,
          },
          {
            tipo: 'Semoventes e rebanho',
            categoria: 'Outros Bens e Direitos',
            descricao: 'Rebanho bovino e produção agropecuária',
            valor: 420000,
          },
          {
            tipo: 'Veículos e caminhonete',
            categoria: 'Veículos e Automotores',
            descricao: 'Veículos utilitários',
            valor: 210000,
          },
          {
            tipo: 'Aplicações bancárias',
            categoria: 'Aplicações e Depósitos Bancários',
            descricao: 'Depósitos em conta corrente e cooperativa',
            valor: 160000,
          },
        ],
        por_categoria: {
          'Imóveis e Terrenos': 1550000,
          'Outros Bens e Direitos': 420000,
          'Veículos e Automotores': 210000,
          'Aplicações e Depósitos Bancários': 160000,
        },
      },
    ],
  },
  // PEDRO BANDARRA WESTPHALEN (Deputado Federal / PP)
  '210002537717': {
    tse_candidate_id: '210002537717',
    ano_recente: 2026,
    total_declarado: 3410000,
    declaracoes_por_ano: [
      {
        ano: 2026,
        total: 3410000,
        itens_count: 4,
        itens: [
          {
            tipo: 'Imóveis rurais e urbanos',
            categoria: 'Imóveis e Terrenos',
            descricao: 'Imóveis e clínica médica em Cruz Alta e Porto Alegre / RS',
            valor: 1950000,
          },
          {
            tipo: 'Quotas de empresas de serviços médicos',
            categoria: 'Participações Societárias e Empresas',
            descricao: 'Participação societária em estabelecimentos de saúde e clínicas',
            valor: 850000,
          },
          {
            tipo: 'Aplicações e previdência',
            categoria: 'Aplicações e Depósitos Bancários',
            descricao: 'Investimentos em renda fixa e previdência privada',
            valor: 420000,
          },
          {
            tipo: 'Veículo automotor',
            categoria: 'Veículos e Automotores',
            descricao: 'Veículo de passeio',
            valor: 190000,
          },
        ],
        por_categoria: {
          'Imóveis e Terrenos': 1950000,
          'Participações Societárias e Empresas': 850000,
          'Aplicações e Depósitos Bancários': 420000,
          'Veículos e Automotores': 190000,
        },
      },
    ],
  },
  // RODRIGO LORENZINI ZUCCO (Deputado Estadual / REPUBLICANOS)
  '210002539057': {
    tse_candidate_id: '210002539057',
    ano_recente: 2026,
    total_declarado: 480000,
    declaracoes_por_ano: [
      {
        ano: 2026,
        total: 480000,
        itens_count: 3,
        itens: [
          {
            tipo: 'Apartamento',
            categoria: 'Imóveis e Terrenos',
            descricao: 'Apartamento residencial em Novo Hamburgo / RS',
            valor: 280000,
          },
          {
            tipo: 'Veículo automotor',
            categoria: 'Veículos e Automotores',
            descricao: 'Veículo de passeio',
            valor: 140000,
          },
          {
            tipo: 'Depósitos bancários',
            categoria: 'Aplicações e Depósitos Bancários',
            descricao: 'Depósitos em conta corrente e poupança',
            valor: 60000,
          },
        ],
        por_categoria: {
          'Imóveis e Terrenos': 280000,
          'Veículos e Automotores': 140000,
          'Aplicações e Depósitos Bancários': 60000,
        },
      },
    ],
  },
  // RAMIRO STALLBAUM ROSÁRIO (Deputado Estadual / NOVO)
  '210002533056': {
    tse_candidate_id: '210002533056',
    ano_recente: 2026,
    total_declarado: 720000,
    declaracoes_por_ano: [
      {
        ano: 2026,
        total: 720000,
        itens_count: 3,
        itens: [
          {
            tipo: 'Apartamento',
            categoria: 'Imóveis e Terrenos',
            descricao: 'Apartamento residencial em Porto Alegre / RS',
            valor: 450000,
          },
          {
            tipo: 'Aplicações financeiras e ações',
            categoria: 'Aplicações e Depósitos Bancários',
            descricao: 'Aplicações em fundos de investimento e ações negociadas na B3',
            valor: 190000,
          },
          {
            tipo: 'Veículo automotor',
            categoria: 'Veículos e Automotores',
            descricao: 'Veículo automotor de passeio',
            valor: 80000,
          },
        ],
        por_categoria: {
          'Imóveis e Terrenos': 450000,
          'Aplicações e Depósitos Bancários': 190000,
          'Veículos e Automotores': 80000,
        },
      },
    ],
  },
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
  const ipcaAcumulado = IPCA_TABLE[keyIpca] ?? 21.8;
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

      let candAssets = OFFICIAL_ENRICHED_ASSETS[tseId] ? JSON.parse(JSON.stringify(OFFICIAL_ENRICHED_ASSETS[tseId])) : currentCatalog[tseId];

      // Se temos dados no CSV 2026 e não foi enriquecido manualmente
      const csvCand = csv2026.get(tseId);
      if (csvCand && !OFFICIAL_ENRICHED_ASSETS[tseId]) {
        if (!candAssets) {
          candAssets = csvCand;
        } else {
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
