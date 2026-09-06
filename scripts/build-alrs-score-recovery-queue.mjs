#!/usr/bin/env node
/** Separa votos pertinentes sem score por motivo metodológico verificável. */
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const input = resolve(root, 'data/candidate-nominal-votes.json');
const output = resolve(root, 'data/legislative-import/alrs/alrs-score-recovery-queue-v1.json');
const canonical = new Set([
  'mulheres','povos_indigenas','comunidades_quilombolas','populacao_negra_periferica','lgbtqia',
  'pessoas_com_deficiencia','populacao_rua','populacao_carceraria','criancas_adolescentes_vulnerabilidade',
  'pessoas_idosas_dependentes','trabalhadores_informais','agricultura_familiar_sem_terra','povos_de_terreiro',
  'imigrantes_refugiados','estudantes','trabalhadores_formais','servidores_publicos','usuarios_sus',
  'pessoas_com_ludopatia','candidatos_concursos_publicos','pescadores_artesanais_comunidades_pesqueiras',
]);
const data = JSON.parse(await readFile(input, 'utf8'));
const items = [];
for (const [candidate_id, votes] of Object.entries(data.c ?? {})) {
  for (const [proposition_index, value, date] of votes) {
    const proposition = data.p?.[proposition_index];
    if (proposition?.h !== 'alrs' || !canonical.has(proposition.g) || proposition.score_eligible === true) continue;
    const reason = proposition.vote_attribution_status ?? 'score_eligibility_missing';
    items.push({
      candidate_id,
      proposition_index,
      proposition_id: proposition.p,
      title: proposition.t,
      group: proposition.g,
      value,
      date,
      reason,
      textual_defending_vote: proposition.textual_defending_vote ?? null,
      event_defending_vote: proposition.event_defending_vote ?? null,
      source_url: proposition.u,
      source_label: proposition.l,
      resolution_required: reason === 'event_binding_missing'
        ? 'vincular evento nominal oficial exato'
        : 'separar votação composta em eventos/proposições elegíveis',
    });
  }
}
items.sort((a, b) => a.reason.localeCompare(b.reason) || a.proposition_id.localeCompare(b.proposition_id) || a.candidate_id.localeCompare(b.candidate_id));
const counts = Object.fromEntries([...new Set(items.map((item) => item.reason))].map((reason) => [reason, items.filter((item) => item.reason === reason).length]));
const result = {
  schema_version: '1.0.0',
  packet_type: 'alrs_score_recovery_queue',
  mode: 'read-only',
  remote_apply: false,
  source: 'data/candidate-nominal-votes.json',
  counts: { total: items.length, ...counts },
  items,
};
await writeFile(output, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ output, counts: result.counts }));
