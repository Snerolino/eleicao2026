#!/usr/bin/env node
/**
 * parse-senado-votes.mjs — Parseia TXTs do relatório de votação nominal do Senado.
 * Fonte: https://legis.senado.leg.br/parlam-servicosweb/api/v1/relatorios/votacoes-nominais/ano/{ano}/parlamentar/{id}
 * Fail-closed: só emete voto com data + matéria + voto presentes.
 * Usage: node scripts/parse-senado-votes.mjs <tmpdir> <output.json>
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const dir = process.argv[2] || '/tmp';
const out = process.argv[3] || './data/senators-votes-rs.json';

const SENADORES_RS = {
  6341: { legislator_ext: '6341', name: 'Antonio Hamilton Martins Mourão', party: 'REPUBLICANOS', house: 'senado' },
  1186: { legislator_ext: '1186', name: 'Luis Carlos Heinze', party: 'PP', house: 'senado' },
  825:  { legislator_ext: '825', name: 'Paulo Paim', party: 'PT', house: 'senado' },
};

const VOTO_MAP = {
  Sim: 'sim', Não: 'nao', Abstenção: 'abstencao', Abstencao: 'abstencao',
  Ausência: 'ausente', Ausencia: 'ausente', Obstrução: 'obstrucao', Obstrucao: 'obstrucao',
  Votou: null,
};

const VALID_TYPES = ['pec','plp','pl','pld','lei','mp'];

const files = readdirSync(dir).filter(f => /^sen_(\d+)_(\d{4})\.txt$/.test(f));
const props = new Map();
const events = new Map();
const votes = [];

// capta linha de voto: data + seq + matéria + voto + resultado
const LINE_RE = /^(\d{2}\/\d{2}\/\d{4})\s+(\d+)\s+([A-Z]{2,5}\s+\d+\/\d{4})\b(.*)$/i;
const VOTO_RE = /\b(Sim|Não|Abstenção|Abstencao|Ausência|Ausencia|Obstrução|Obstrucao|Votou)\b.*?((?:Aprovado|Rejeitado|Não Aprovado|Arquivado|Transformado|Publicado|Sobredito|Convertido)[^\n]*)$/i;

for (const f of files) {
  const m = f.match(/^sen_(\d+)_(\d{4})\.txt$/);
  const parId = m[1];
  const year = m[2];
  if (!SENADORES_RS[parId]) continue;
  const meta = SENADORES_RS[parId];
  const txt = readFileSync(resolve(dir, f), 'utf-8');
  const lines = txt.split('\n').map(l => l.replace(/\r/g, '').replace(/^\s+/, '').trimEnd());

  for (const l of lines) {
    const dm = l.match(LINE_RE);
    if (!dm) continue;
    const data = dm[1], seq = dm[2], materiaRaw = dm[3], rest = dm[4];
    const votoMatch = rest.match(VOTO_RE);
    if (!votoMatch) continue;
    const voto = VOTO_MAP[votoMatch[1]];
    if (!voto) continue;
    const mm = materiaRaw.match(/^([A-Z]{2,5})\s+(\d+)\/(\d{4})/i);
    let tipo = mm ? mm[1].toLowerCase() : 'outro';
    if (!VALID_TYPES.includes(tipo)) tipo = 'outro';
    const num = mm ? mm[2] : '';
    const ano = mm ? mm[3] : year;
    const matId = `${tipo.toUpperCase()} ${num}/${ano}`;

    if (!props.has(matId)) {
      props.set(matId, { external_id: matId, house: meta.house, type: tipo, number: num ? Number(num) : undefined, year: Number(ano), title: matId, official_url: null });
    }
    const [d, mm2, y] = data.split('/');
    const occurred = `${y}-${mm2}-${d}T13:00:00Z`;
    const evId = `senado_${matId.replace(/\s|\//g, '_')}_${data}_${seq}`;
    if (!events.has(evId)) {
      events.set(evId, { external_id: evId, proposition_external_id: matId, house: meta.house, occurred_at: occurred, source: `Senado Federal — relatório ${parId} ${year}` });
    }
    votes.push({
      legislator_external_id: String(parId), house: meta.house,
      event_external_id: evId, value: voto, recorded_at: occurred,
      source: `Senado Federal — votação nominal ${matId} ${data} (parlam-servicosweb)`,
      legislator_meta: { full_name: meta.name, party: meta.party, term_start: year + '-01-01', term_end: year + '-12-31', source: `Senado Federal — parlamentar ${parId} ${year}` },
    });
  }
}

const envelope = { propositions: [...props.values()], events: [...events.values()], votes, legislators: Object.values(SENADORES_RS).map(s => ({ external_id: s.legislator_ext, house: s.house, full_name: s.name, party: s.party, term_start: '2023-01-01', term_end: '2026-12-31', source: `Senado Federal — parlamentar ${s.legislator_ext}` })) };
writeFileSync(out, JSON.stringify(envelope, null, 2));
console.log(JSON.stringify({ props: envelope.propositions.length, events: envelope.events.length, votes: envelope.votes.length, legislators: envelope.legislators.length }, null, 2));
