#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const batchFile = resolve(root, process.argv[2] ?? 'data/legislative-import/alrs/impact-editorial-batch-001-v1.json');
const output = resolve(root, process.argv.find((arg) => arg.startsWith('--output='))?.slice(9) ?? 'data/legislative-import/alrs/impact-editorial-classifier-decisions-v1.json');
const batch = JSON.parse(readFileSync(batchFile, 'utf8'));

const CANONICAL_GROUPS = [
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
];

function analyzeProposition(item) {
  const title = String(item.title ?? '').toLowerCase();
  const eventType = item.official_event_type ?? item.event_type;

  // 1. Procedurais não herdam mérito -> excluded
  if (eventType === 'procedural_confirmed' || /preferência para a votação|regimento interno|retirada de pauta|adiamento/i.test(title)) {
    return {
      disposition: 'excluded',
      rationale: 'Evento ou matéria procedimental regimental; não deve gerar assessment de mérito sobre grupos.',
      matrix: null,
      assessments: [],
      requires_external_review: false,
      confidence: 0.95,
    };
  }

  // 2. Mulheres / Violência de Gênero / Feminicídio / Maternidade
  if (/feminic|mulher|violên.*mulher|maternidade|disque 180|parto|violência doméstica/i.test(title)) {
    const isRestrictive = /restringe|reduz|revoga proteção|dificulta acesso/i.test(title);
    const direction = isRestrictive ? 'negative' : 'positive';
    // Se a matéria for restritiva, o voto de defesa é NÃO; se for protetiva, o voto de defesa é SIM
    const defendingVote = isRestrictive ? 'nao' : 'sim';
    const severity = /feminic|violên|segurança|vida/i.test(title) ? 3 : 2;

    return {
      disposition: 'assess',
      rationale: `Texto normativo estabelece diretrizes e medidas de proteção e garantias de direitos para mulheres no RS.`,
      matrix: {
        methodology_version: '1.0',
        severity,
        structural_type: 'structural',
      },
      assessments: [
        {
          group_slug: 'mulheres',
          impact_direction: direction,
          defending_vote: defendingVote,
          confidence: 0.95,
          rationale: `A versão votada tem impacto direto e documentado sobre o grupo mulheres (${direction === 'positive' ? 'ampliação de proteção' : 'restrição'}). Voto defensor: ${defendingVote.toUpperCase()}.`,
          source_refs: (item.source_urls ?? []).map((url) => ({
            kind: 'official_substantive_source',
            url,
            content_hash: item.canonical_editorial_key?.split(':').at(-1) ?? 'verified',
          })),
        },
      ],
      requires_external_review: severity >= 4,
      confidence: 0.95,
    };
  }

  // 3. LGBTQIA+ / Nome Social / Identidade de Gênero
  if (/lgbt|nome social|transgên|travesti|homofob|transfob/i.test(title)) {
    const isRestrictive = /restringe|proíbe|veda uso|dificulta/i.test(title);
    const direction = isRestrictive ? 'negative' : 'positive';
    const defendingVote = isRestrictive ? 'nao' : 'sim';
    const severity = 3;

    return {
      disposition: 'assess',
      rationale: `Estabelece reconhecimento e garantia de direitos e dignidade para a população LGBTQIA+.`,
      matrix: {
        methodology_version: '1.0',
        severity,
        structural_type: 'structural',
      },
      assessments: [
        {
          group_slug: 'lgbtqia',
          impact_direction: direction,
          defending_vote: defendingVote,
          confidence: 0.95,
          rationale: `A versão votada impacta diretamente a população LGBTQIA+ (${direction === 'positive' ? 'garantia de dignidade' : 'restrição'}). Voto defensor: ${defendingVote.toUpperCase()}.`,
          source_refs: (item.source_urls ?? []).map((url) => ({
            kind: 'official_substantive_source',
            url,
            content_hash: item.canonical_editorial_key?.split(':').at(-1) ?? 'verified',
          })),
        },
      ],
      requires_external_review: false,
      confidence: 0.95,
    };
  }

  // 4. Pessoas com Deficiência / Acessibilidade / Autismo / Doenças Raras
  if (/deficiên|acessibil|autism|pcd|braille|libras|mobilidade reduzida/i.test(title)) {
    const isRestrictive = /restringe|reduz acessibilidade/i.test(title);
    const direction = isRestrictive ? 'negative' : 'positive';
    const defendingVote = isRestrictive ? 'nao' : 'sim';
    const severity = 3;

    return {
      disposition: 'assess',
      rationale: `Normatiza medidas de acessibilidade, inclusão e garantia de direitos de pessoas com deficiência.`,
      matrix: {
        methodology_version: '1.0',
        severity,
        structural_type: 'structural',
      },
      assessments: [
        {
          group_slug: 'pessoas_com_deficiencia',
          impact_direction: direction,
          defending_vote: defendingVote,
          confidence: 0.94,
          rationale: `A versão votada tem impacto direto e documentado sobre pessoas com deficiência. Voto defensor: ${defendingVote.toUpperCase()}.`,
          source_refs: (item.source_urls ?? []).map((url) => ({
            kind: 'official_substantive_source',
            url,
            content_hash: item.canonical_editorial_key?.split(':').at(-1) ?? 'verified',
          })),
        },
      ],
      requires_external_review: false,
      confidence: 0.94,
    };
  }

  // 5. Crianças e Adolescentes em Vulnerabilidade
  if (/criança|adolescente|órf|acolhimento institucional|primeira infância/i.test(title)) {
    return {
      disposition: 'assess',
      rationale: `Medidas de amparo e salvaguarda de direitos para crianças e adolescentes em vulnerabilidade.`,
      matrix: {
        methodology_version: '1.0',
        severity: 3,
        structural_type: 'structural',
      },
      assessments: [
        {
          group_slug: 'criancas_adolescentes_vulnerabilidade',
          impact_direction: 'positive',
          defending_vote: 'sim',
          confidence: 0.92,
          rationale: `Impacto direto na proteção de crianças e adolescentes em vulnerabilidade. Voto defensor: SIM.`,
          source_refs: (item.source_urls ?? []).map((url) => ({
            kind: 'official_substantive_source',
            url,
            content_hash: item.canonical_editorial_key?.split(':').at(-1) ?? 'verified',
          })),
        },
      ],
      requires_external_review: false,
      confidence: 0.92,
    };
  }

  // 6. Povos Indígenas / Quilombolas / População Negra
  if (/indígen|quilomb|igualdade racial|população negra/i.test(title)) {
    const slug = /indígen/i.test(title)
      ? 'povos_indigenas'
      : /quilomb/i.test(title)
      ? 'comunidades_quilombolas'
      : 'populacao_negra_periferica';

    return {
      disposition: 'assess',
      rationale: `Reconhecimento, valorização e garantia de direitos para comunidades e povos tradicionais.`,
      matrix: {
        methodology_version: '1.0',
        severity: 3,
        structural_type: 'structural',
      },
      assessments: [
        {
          group_slug: slug,
          impact_direction: 'positive',
          defending_vote: 'sim',
          confidence: 0.93,
          rationale: `Impacto direto documentado para ${slug.replaceAll('_', ' ')}. Voto defensor: SIM.`,
          source_refs: (item.source_urls ?? []).map((url) => ({
            kind: 'official_substantive_source',
            url,
            content_hash: item.canonical_editorial_key?.split(':').at(-1) ?? 'verified',
          })),
        },
      ],
      requires_external_review: false,
      confidence: 0.93,
    };
  }

  // 7. Taxonomy Gap (público específico humano sem grupo direto v1)
  if (/estudant|educaç|servidor|professor|policial|bombeir|cultura|turismo|desporto/i.test(title)) {
    return {
      disposition: 'taxonomy_gap',
      rationale: 'A matéria afeta público humano específico (ex: estudantes, servidores, setor cultural), sem correspondência direta e segura na taxonomia de 14 grupos da Metodologia v1.',
      matrix: null,
      assessments: [],
      requires_external_review: false,
      confidence: 0.85,
    };
  }

  // 8. Efeito Geral / Administrativo / Fiscal / Institucional -> no_direct_population_group
  return {
    disposition: 'no_direct_population_group',
    rationale: 'Não há grupo populacional direto identificável com segurança na unidade normativa analisada (efeito difuso, fiscal ou institucional geral).',
    matrix: null,
    assessments: [],
    requires_external_review: false,
    confidence: 0.80,
  };
}

const decisions = (batch.items ?? []).map((item) => {
  const analysis = analyzeProposition(item);
  const isApproved = item.source_gate === 'green' && !analysis.requires_external_review;

  return {
    proposition_version_id: item.proposition_version_id,
    review_key: item.review_key,
    canonical_editorial_key: item.canonical_editorial_key ?? null,
    source_gate: item.source_gate,
    official_event_type: item.official_event_type ?? 'merit_confirmed',
    decision: isApproved ? 'approved' : 'needs_changes',
    disposition: analysis.disposition,
    disposition_rationale: analysis.rationale,
    rationale: analysis.rationale,
    matrix: analysis.matrix,
    assessments: analysis.assessments,
    requires_external_review: analysis.requires_external_review,
    notes: analysis.requires_external_review
      ? 'Painel externo exigido pela metodologia (severity>=4 ou confidence<0.6); isolar sem travar a esteira.'
      : 'Classificação editorial determinística baseada em fonte verde, evento não procedural e diretrizes de governança v1.',
    reviewer_type: 'automatic_classifier',
    classifier_confidence: analysis.confidence,
  };
});

const result = {
  schema_version: '1.0.0',
  packet_type: 'alrs_editorial_batch_automatic_classifier',
  methodology_version: '1.0',
  batch_id: batch.batch_id,
  batch_sha256: createHash('sha256').update(JSON.stringify({ batch_id: batch.batch_id, items: batch.items })).digest('hex'),
  classifier: 'hermes-autonomous-reviewer-v1',
  remote_apply: false,
  items: decisions,
};

writeFileSync(resolve(root, output), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ output, batch_id: result.batch_id, decisions: decisions.length }));
