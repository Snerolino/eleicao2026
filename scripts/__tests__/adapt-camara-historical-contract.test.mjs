// @vitest-environment node

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { planLegislativeImport } from '../../src/domain/impact/legislative-importer.ts';
import { collectSupportRefs, resolveSupportRefs } from '../../src/domain/impact/legislative-support-resolver.ts';
import { adaptCamaraHistoricalContract } from '../adapt-camara-historical-contract.mjs';

const root = resolve(import.meta.dirname, '..', '..');

function readJson(path) {
  return JSON.parse(readFileSync(resolve(root, path), 'utf8'));
}

function inputs() {
  return {
    envelope: readJson('data/legislative-import/camara/historical-resolved-envelope.json'),
    candidateCatalog: readJson('data/legislative-import/camara/historical-resolved-catalog.json'),
    sourceManifest: readJson('data/legislative-import/camara/historical-resolved-source-manifest.json'),
    sourceCatalog: readJson('data/legislative-import/camara/historical-nominal-vote-source-catalog.json'),
  };
}

describe('adapt-camara-historical-contract', () => {
  it('deriva o contrato do planner sem carregar UUID ou identidade no envelope', () => {
    const result = adaptCamaraHistoricalContract(inputs());
    const [pec, pl] = result.envelope.propositions;

    expect(result.totals).toEqual({
      propositions: 2,
      versions: 6,
      events: 6,
      votes: 84,
      candidates: 18,
      official_sources: 7,
      blocked_exact_records: 8,
    });
    expect(pec).toMatchObject({ number: 6, year: 2019, proposition_type: 'pec' });
    expect(pl).toMatchObject({ number: 3723, year: 2019, proposition_type: 'pl' });
    expect(pec.versions[0].text_hash).toBe('sha256:1e7e76c9da6680c1eb9f044dfbb2b5fec057a29dc05d5282a55c2be51938ad5c');

    expect(result.envelope.votes.every((vote) => !('candidate_id' in vote) && !('tse_candidate_id' in vote))).toBe(true);
    expect(result.envelope.votes.every((vote) => /^tse-candidate-\d+$/.test(vote.deputy_id))).toBe(true);
    expect(result.envelope.votes.filter((vote) => vote.value === 'obstrucao').every((vote) => vote.absence_type === 'obstrucao_coordenada')).toBe(true);
    expect(JSON.stringify(result.envelope)).not.toMatch(/210002547816|210002533583/);

    const planned = planLegislativeImport(result.envelope);
    expect(planned.ok).toBe(true);
    expect(planned.plan?.counts).toEqual({
      legislative_propositions: 2,
      proposition_versions: 6,
      voting_events: 6,
      legislative_votes: 84,
    });

    const refs = collectSupportRefs(planned.plan);
    const resolution = resolveSupportRefs(refs, result.supportCatalog);
    expect(resolution.unresolved.every((ref) => ref.startsWith('source_references:'))).toBe(true);
    expect(refs.filter((ref) => ref.startsWith('legislators:')).every((ref) => resolution.resolved[ref])).toBe(true);
  });

  it('resolve cada URL usada para evidência oficial versionada sem inventar source_reference UUID', () => {
    const result = adaptCamaraHistoricalContract(inputs());
    const sources = Object.values(result.contract.officialSourceByUrl);

    expect(sources).toHaveLength(7);
    expect(sources.every((source) => source.status === 200 && source.bytes > 0)).toBe(true);
    expect(sources.every((source) => /^sha256:[0-9a-f]{64}$/.test(source.content_hash))).toBe(true);
    expect(Object.values(result.supportCatalog.sourceReferenceByKey).every((id) => id === null)).toBe(true);
    expect(result.contract.unresolvedRemoteSourceReferences).toHaveLength(7);
  });

  it('é determinístico para os mesmos quatro artefatos versionados', () => {
    expect(adaptCamaraHistoricalContract(inputs())).toEqual(adaptCamaraHistoricalContract(inputs()));
  });

  it('falha fechado se URL/hash oficial não estiver no manifesto e catálogo', () => {
    const missing = inputs();
    missing.sourceManifest.urls = missing.sourceManifest.urls.slice(1);
    expect(() => adaptCamaraHistoricalContract(missing)).toThrow(/fonte oficial não resolvida/i);

    const mismatch = inputs();
    mismatch.sourceCatalog.propositions[0].nominal_vote_sources[0].sha256 = '0'.repeat(64);
    expect(() => adaptCamaraHistoricalContract(mismatch)).toThrow(/hash oficial divergente/i);
  });

  it('falha fechado para candidato ausente ou UUID divergente do catálogo TSE', () => {
    const absent = inputs();
    const tseId = absent.envelope.votes[0].tse_candidate_id;
    delete absent.candidateCatalog.candidateByTse[tseId];
    expect(() => adaptCamaraHistoricalContract(absent)).toThrow(/tse_candidate_id não resolvido/i);

    const divergent = inputs();
    divergent.envelope.votes[0].candidate_id = '00000000-0000-4000-8000-000000000000';
    expect(() => adaptCamaraHistoricalContract(divergent)).toThrow(/candidate_id diverge do catálogo TSE/i);
  });
});
