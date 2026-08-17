#!/usr/bin/env node
/**
 * Prepara pacote de revisão humana FED-6. Não publica matriz nem executa RPC.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const pilotManifestPath = resolve(root, 'data/legislative-import/camara/fed5-pilot/manifest.json');
const pilotEnvelopePath = resolve(root, 'data/legislative-import/camara/fed5-pilot/2580259-24-pilot.json');
const outputDir = resolve(root, 'data/impact-matrices/pending-review');

const sources = [
  'https://dadosabertos.camara.leg.br/api/v2/proposicoes/2580259',
  'https://www.camara.leg.br/proposicoesWeb/prop_mostrarintegra?codteor=3170169',
  'https://dadosabertos.camara.leg.br/api/v2/votacoes/2580259-24/votos',
];

const matrix = {
  schema_version: '1.0.0',
  methodology_version: '1.0.0',
  severity: 2,
  structural_type: 'budgetary',
  assessments: [{
    group: 'pessoas_com_deficiencia',
    impact_direction: 'unclear',
    defending_vote: null,
    rationale: 'O texto oficial trata do FUST e pode afetar conectividade relevante para acessibilidade e inclusão digital, mas não segmenta explicitamente pessoas com deficiência; a direção permanece unclear até revisão humana específica.',
    confidence: 0.55,
    sources,
  }],
  review_status: 'pending_review',
};

const pilotManifest = JSON.parse(await readFile(pilotManifestPath, 'utf8'));
const pilotEnvelope = JSON.parse(await readFile(pilotEnvelopePath, 'utf8'));
const packet = {
  schema_version: '1.0.0',
  packet_type: 'camara_impact_review',
  review_status: 'pending_review',
  remote_apply: false,
  public_approval: false,
  matrix_file: 'plp-230-2025-sbt-1-pending-review.json',
  proposition: {
    external_id: pilotEnvelope.propositions[0].external_id,
    voting_event_id: pilotEnvelope.propositions[0].versions[0].voting_events[0].external_id,
    sources,
  },
  candidates: pilotManifest.selected_candidates.map((candidate) => ({
    camara_deputado_id: candidate.camara_deputado_id,
    camara_name: candidate.camara_name,
    candidate_id: candidate.candidate_id,
    tse_candidate_id: candidate.tse_candidate_id,
    factual_vote_count: pilotEnvelope.votes.filter((vote) => vote.deputy_id === `camara-deputado-${candidate.camara_deputado_id}`).length,
  })),
  regression_fixture: pilotManifest.regression_fixture,
  safeguards: [
    'matriz não aprovada',
    'matriz não carregada automaticamente pela UI pública',
    'votos factuais não são convertidos em alinhamento sem revisão',
    'defending_vote null porque a direção é unclear',
  ],
};

await mkdir(outputDir, { recursive: true });
await writeFile(resolve(outputDir, 'plp-230-2025-sbt-1-pending-review.json'), `${JSON.stringify(matrix, null, 2)}\n`);
await writeFile(resolve(outputDir, 'camara-plp-230-2025-review-packet.json'), `${JSON.stringify(packet, null, 2)}\n`);
console.log(JSON.stringify({ review_status: packet.review_status, candidates: packet.candidates.length, votes: packet.candidates.reduce((sum, candidate) => sum + candidate.factual_vote_count, 0) }));
