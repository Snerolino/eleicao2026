#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

export const CANONICAL_GROUPS = [
  'povos_indigenas',
  'comunidades_quilombolas',
  'populacao_negra_periferica',
  'mulheres',
  'lgbtqia',
  'pessoas_com_deficiencia',
  'populacao_rua',
  'populacao_carceraria',
  'criancas_adolescentes_vulnerabilidade',
  'pessoas_idosas_dependentes',
  'trabalhadores_informais',
  'agricultura_familiar_sem_terra',
  'povos_de_terreiro',
  'imigrantes_refugiados',
  'estudantes',
  'trabalhadores_formais',
  'servidores_publicos',
  'usuarios_sus',
  'pessoas_com_ludopatia',
  'candidatos_concursos_publicos',
  'pescadores_artesanais_comunidades_pesqueiras',
];

const GROUP_KEYWORDS = {
  povos_indigenas: [
    /indígena|indigena|aldeia|etnia indígena|demarcação de terra|funai|terras indígenas|indigenato/i,
  ],
  comunidades_quilombolas: [
    /quilombo|quilombola|remanescentes de quilombo|titulação de terra quilombola/i,
  ],
  populacao_negra_periferica: [
    /população negra|antirracis|igualdade racial|racismo|periferia|favel|cota racial|ação afirmativa racial/i,
  ],
  mulheres: [
    /mulher|feminic|violência doméstica|violencia contra a mulher|maternidade|parto|saúde da mulher|maria da penha|disque 180|misoginia|meninas e mulheres/i,
  ],
  lgbtqia: [
    /lgbt|homofob|transfob|identidade de gênero|nome social|travesti|transexual|transgênero|população trans|orientação sexual/i,
  ],
  pessoas_com_deficiencia: [
    /pessoa com deficiência|pcd|acessibilidade|autismo|tea|braille|libras|inclusão de deficientes|síndrome de down|órtese|prótese|cirurgia plástica reparadora/i,
  ],
  populacao_rua: [
    /população de rua|população em situação de rua|pessoas em situação de rua|moradores de rua|acolhimento emergencial/i,
  ],
  populacao_carceraria: [
    /presídio|penitenciár|população carcerária|sistema prisional|ressocialização|detento|preso|execução penal/i,
  ],
  criancas_adolescentes_vulnerabilidade: [
    /criança|adolescente|estatuto da criança|eca|infância|menor de idade|órfão|abuso infantil|acolhimento institucional|meninas e mulheres/i,
  ],
  pessoas_idosas_dependentes: [
    /idoso|pessoa idosa|estatuto do idoso|instituição de longa permanência|ilpi|envelhecimento saudável|dependência de idosos/i,
  ],
  trabalhadores_informais: [
    /trabalhador informal|ambulante|camelô|autônomo de baixa renda|aplicativo|entregador|motorista de app/i,
  ],
  agricultura_familiar_sem_terra: [
    /agricultura familiar|pequeno produtor|pequenos produtores rurais|produtor de subsistência|reforma agrária|crédito fundiário|pronaf/i,
  ],
  povos_de_terreiro: [
    /terreiro|matriz africana|religiões de matriz africana|umbanda|candomblé|liberdade religiosa de terreiro/i,
  ],
  imigrantes_refugiados: [
    /imigrante|refugiado|migrante|asilo humanitário|acolhida humanitária|estrangeiro refugiado|repatriado/i,
  ],
  estudantes: [
    /estudante|escola pública|educação básica|ensino médio|bolsa de estudo|conectividade escolar|fust nas escolas|passe livre estudantil|merenda escolar/i,
  ],
  trabalhadores_formais: [
    /trabalhadores formais|clt|carteira assinada|piso salarial|jornada de trabalho|descanso intrajornada|salário mínimo|segurança do trabalho/i,
  ],
  servidores_publicos: [
    /servidor público|servidores públicos|magistério público|carreira pública|reajuste salarial de servidores|estatuto dos servidores|polícia civil|brigada militar/i,
  ],
  usuarios_sus: [
    /usuários do sus|usuário do sus|sistema único de saúde|medicamentos pelo sus|fila do sus|atendimento médico público|leitos sus|hospital público/i,
  ],
  pessoas_com_ludopatia: [
    /ludopatia|jogos de apostas|transtorno do jogo|apostas de quota fixa|bets|jogo compulsivo|superendividamento por apostas/i,
  ],
  candidatos_concursos_publicos: [
    /concurso público|concursos públicos|candidatos aprovados|cadastro de reserva|prazo de validade de concurso|isenção de taxa de concurso/i,
  ],
  pescadores_artesanais_comunidades_pesqueiras: [
    /pescador artesanal|pescadores artesanais|comunidades pesqueiras|seguro defeso|pesca artesanal|colônia de pescadores/i,
  ],
};

/**
 * Carrega a base de conhecimento de proposições aprovadas da ALRS para cruzamento.
 */
export function loadAlrsKnowledgeBase() {
  const alrsFiles = [
    'data/legislative-import/alrs/impact-editorial-batch-001-v1.json',
    'data/legislative-import/alrs/impact-editorial-reviewed-decisions-v1.json',
    'data/impact-matrices/gabarito-materias-aprovadas.json',
  ];

  const precedents = [];

  for (const relativePath of alrsFiles) {
    const filePath = resolve(root, relativePath);
    if (!existsSync(filePath)) continue;
    try {
      const data = JSON.parse(readFileSync(filePath, 'utf8'));
      if (Array.isArray(data.items)) {
        for (const item of data.items) {
          precedents.push({
            title: item.title ?? '',
            summary: item.summary ?? item.recommended_rationale ?? '',
            disposition: item.disposition ?? item.recommended_disposition,
            assessments: item.assessments ?? [],
            house: 'alrs',
          });
        }
      } else if (Array.isArray(data.propositions)) {
        for (const p of data.propositions) {
          precedents.push({
            title: p.title ?? '',
            summary: p.summary ?? '',
            disposition: 'assess',
            assessments: p.assessments ?? [],
            house: p.house ?? 'national',
          });
        }
      }
    } catch {}
  }

  return precedents;
}

/**
 * Calcula a verossimilhança de uma matéria federal contra os 14 grupos canônicos e precedentes.
 */
export function matchCrossHouseSimilarity(federalProposition, precedents = []) {
  const text = `${federalProposition.title ?? ''} ${federalProposition.summary ?? ''} ${federalProposition.version_label ?? ''}`.toLowerCase();

  // 1. Verificação procedimental
  const isProcedural = /requerimento de urgência|art\. 155 do ricd|retirada de pauta|adiamento da votação|preferência para a votação/i.test(text);
  if (isProcedural) {
    return {
      disposition: 'excluded',
      matched_groups: [],
      similarity_score: 0.98,
      suggested_defending_vote: null,
      suggested_structural_type: null,
      suggested_severity: null,
      rationale: 'Matéria ou votação estritamente procedimental/regimental (Urgência Art. 155 RICD ou retirada de pauta). Sem mérito normativo.',
      precedent_match: 'ALRS Procedurais Regimentais',
    };
  }

  // 2. Análise direta dos 14 grupos canônicos via taxonomia de palavras-chave
  const matchedGroups = [];
  for (const [groupSlug, patterns] of Object.entries(GROUP_KEYWORDS)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        matchedGroups.push(groupSlug);
        break;
      }
    }
  }

  // 3. Cruzamento com precedentes ALRS e Gabarito
  let bestPrecedent = null;
  let highestPrecedentScore = 0;

  for (const precedent of precedents) {
    const precText = `${precedent.title} ${precedent.summary}`.toLowerCase();
    const commonWords = text.split(/\s+/).filter((w) => w.length > 4 && precText.includes(w));
    const score = commonWords.length;
    if (score > highestPrecedentScore) {
      highestPrecedentScore = score;
      bestPrecedent = precedent;
    }
  }

  if (matchedGroups.length > 0) {
    const isRestrictive = /restringe|reduz|revoga|dificulta|veda|penaliza|sustação|susta|anula proteção/i.test(text);
    const defendingVote = isRestrictive ? 'nao' : 'sim';
    const severity = /feminic|violên|segurança|vida|penal|subsistência/i.test(text) ? 3 : 2;

    return {
      disposition: 'assess',
      matched_groups: matchedGroups,
      similarity_score: Math.min(0.95, 0.75 + (matchedGroups.length * 0.1)),
      suggested_defending_vote: defendingVote,
      suggested_structural_type: 'structural',
      suggested_severity: severity,
      impact_direction: isRestrictive ? 'negative' : 'positive',
      rationale: `Texto normativo federal correlacionado diretamente com ${matchedGroups.join(', ')}. Direção: ${isRestrictive ? 'restritiva' : 'ampliadora'}. Voto defensor: ${defendingVote.toUpperCase()}.`,
      precedent_match: bestPrecedent ? bestPrecedent.title : 'Metodologia v1 Diretrizes Canônicas',
    };
  }

  // 4. Verificação de lacuna de taxonomia (estudantes, servidores, categorias profissionais específicas)
  const isTaxonomyGap = /regulamentação da profissão|estatuto da advocacia|oab|conservador-restaurador|artista visual|indústria química/i.test(text);
  if (isTaxonomyGap) {
    return {
      disposition: 'taxonomy_gap',
      matched_groups: [],
      similarity_score: 0.85,
      suggested_defending_vote: null,
      suggested_structural_type: null,
      suggested_severity: null,
      rationale: 'Público profissional ou setorial específico sem correspondência direta nos 14 grupos canônicos v1.',
      precedent_match: 'ALRS Taxonomia Profissões Setoriais',
    };
  }

  // 5. Sem grupo populacional direto (infraestrutura, macroeconomia, agências reguladoras, direito processual geral)
  return {
    disposition: 'no_direct_population_group',
    matched_groups: [],
    similarity_score: 0.8,
    suggested_defending_vote: null,
    suggested_structural_type: null,
    suggested_severity: null,
    rationale: 'Matéria de regulação macroeconômica, institucional, tributária geral ou procedimental difusa.',
    precedent_match: 'ALRS Regulação Institucional e Tributária Difusa',
  };
}
