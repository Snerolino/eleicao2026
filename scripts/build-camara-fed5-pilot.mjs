#!/usr/bin/env node
/**
 * Recorta o lote factual piloto a partir de envelope oficial já coletado.
 * Falha fechado: somente entradas matched entram no envelope candidato.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const catalogPath = resolve(root, 'data/legislative-import/camara/candidate-catalog.json');
const sourcePath = resolve(root, 'data/legislative-import/camara/collector-pilot/2580259-24.json');
const outputDir = resolve(root, 'data/legislative-import/camara/fed5-pilot');
const selectedNames = ['Fernanda Melchionna', 'Maria do Rosário', 'Afonso Hamm', 'Osmar Terra'];
const regression = { name: 'Marcel van Hattem', camara_deputado_id: 156190, status: 'regression_fixture_identity_pending' };

export function buildPilot(catalog, envelope, names = selectedNames) {
  const matched = catalog.entries.filter((entry) => entry.identity_status === 'matched');
  const byName = new Map(matched.map((entry) => [entry.camara_name, entry]));
  const selected = names.map((name) => {
    const entry = byName.get(name);
    if (!entry) throw new Error(`Candidato não possui vínculo determinístico: ${name}`);
    return entry;
  });
  const selectedDeputyIds = new Set(selected.map((entry) => `camara-deputado-${entry.camara_deputado_id}`));
  const votes = envelope.votes.filter((vote) => selectedDeputyIds.has(vote.deputy_id));
  if (votes.length === 0) throw new Error('Piloto não contém votos para os candidatos selecionados');
  return {
    envelope: { ...envelope, votes },
    manifest: {
      schema_version: '1.0.0',
      mode: 'dry-run',
      source_envelope: 'collector-pilot/2580259-24.json',
      selected_candidates: selected.map((entry) => ({
        camara_deputado_id: entry.camara_deputado_id,
        camara_name: entry.camara_name,
        candidate_id: entry.candidate_id,
        tse_candidate_id: entry.tse_candidate_id,
        identity_status: entry.identity_status,
        match_method: entry.match_method,
      })),
      regression_fixture: regression,
      counts: {
        selected_candidates: selected.length,
        safe_votes: votes.length,
        propositions: envelope.propositions.length,
        versions: envelope.propositions.reduce((sum, proposition) => sum + proposition.versions.length, 0),
        events: envelope.propositions.reduce((sum, proposition) => sum + proposition.versions.reduce((inner, version) => inner + version.voting_events.length, 0), 0),
      },
      excluded_identity_pending: catalog.entries.filter((entry) => entry.identity_status === 'identity_pending').length,
      remote_apply: false,
    },
  };
}

const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));
const envelope = JSON.parse(await readFile(sourcePath, 'utf8'));
const pilot = buildPilot(catalog, envelope);
await mkdir(outputDir, { recursive: true });
await writeFile(resolve(outputDir, '2580259-24-pilot.json'), `${JSON.stringify(pilot.envelope, null, 2)}\n`);
await writeFile(resolve(outputDir, 'manifest.json'), `${JSON.stringify(pilot.manifest, null, 2)}\n`);
console.log(JSON.stringify(pilot.manifest.counts));
console.log(`Wrote ${outputDir}`);
