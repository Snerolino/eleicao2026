#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const input = resolve(root, 'data/legislative-import/alrs/impact-matrix-review-pack-p0-p1.json');

const RULES = [
  ['mulheres', /mulher|viol[eê]ncia contra|matern|ass[eé]dio|femin|menina/i],
  ['criancas_adolescentes_vulnerabilidade', /crian[cç]a|adolesc|inf[aâ]ncia|juventude/i],
  ['pessoas_com_deficiencia', /defici[eê]ncia|acessibilidade|pcd/i],
  ['trabalhadores_informais', /trabalhador|emprego|desemprego|aut[oô]nom|informal/i],
  ['agricultura_familiar_sem_terra', /agricultur|rural|assentamento|sem-terra|produtor rural/i],
  ['populacao_negra_periferica', /racismo|negra|negro|quilomb/i],
  ['povos_indigenas', /ind[ií]gena|povo origin[aá]rio/i],
  ['pessoas_idosas_dependentes', /idoso|terceira idade/i],
  ['populacao_rua', /situa[cç][aã]o de rua|morador de rua/i],
  ['populacao_carceraria', /pris[aã]o|carcer[aá]ri|presidi[aá]ri/i],
  ['imigrantes_refugiados', /imigrante|refugiado|migra[cç][aã]o/i],
];

export function preanalyzeGroups(items) {
  const counts = {};
  const analyzed = items.map((item) => {
    const text = `${item.title ?? ''} ${item.proposition_external_id ?? ''}`;
    const group_candidates = RULES.filter(([, pattern]) => pattern.test(text)).map(([slug]) => slug);
    for (const slug of group_candidates) counts[slug] = (counts[slug] ?? 0) + 1;
    return { ...item, group_candidates, group_candidate_basis: group_candidates.length ? 'keyword_preanalysis' : 'none' };
  });
  return { items: analyzed, preanalysis: { mode: 'non_approving_keyword_preanalysis', counts } };
}

function main() {
  const pack = JSON.parse(readFileSync(input, 'utf8'));
  const result = preanalyzeGroups(pack.items ?? []);
  writeFileSync(input, `${JSON.stringify({ ...pack, ...result }, null, 2)}\n`);
  console.log(JSON.stringify({ versions: result.items.length, with_candidates: result.items.filter((item) => item.group_candidates.length).length, counts: result.preanalysis.counts }));
}

if (process.argv[1]?.endsWith('preanalyze-alrs-impact-groups.mjs')) main();
