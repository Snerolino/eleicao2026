import { describe, expect, it } from 'vitest';
import {
  classifyTseCandidateDiff,
  buildCandidateDiffReport,
} from '../tse-upsert-semantics.mjs';

const baseCandidate = {
  tse_candidate_id: '210000000001',
  full_name: 'CANDIDATA TESTE',
  ballot_name: 'TESTE',
  party: 'ABC',
  ballot_number: 1234,
  position: 'deputado_estadual',
  state: 'RS',
  registration_status: 'registration_requested',
  federation: null,
  coalition: null,
};

const baseStaging = {
  sq_candidato: '210000000001',
  nm_candidato: 'CANDIDATA TESTE',
  nm_urna_candidato: 'TESTE',
  sg_partido: 'ABC',
  nr_candidato: 1234,
  position: 'deputado_estadual',
  state: 'RS',
  registration_status: 'registration_requested',
  federation: null,
  coalition: null,
};

describe('H3.2 semântica de upsert TSE', () => {
  it('classifica inserted, unchanged e updated com comparação explícita de campos relevantes', () => {
    expect(classifyTseCandidateDiff({ staging: baseStaging, existing: null })).toMatchObject({
      acao: 'inserted',
      sq_candidato: '210000000001',
    });

    expect(classifyTseCandidateDiff({ staging: baseStaging, existing: baseCandidate })).toMatchObject({
      acao: 'unchanged',
      changed_fields: [],
    });

    expect(classifyTseCandidateDiff({
      staging: { ...baseStaging, sg_partido: 'XYZ' },
      existing: baseCandidate,
    })).toMatchObject({
      acao: 'updated',
      changed_fields: ['party'],
    });

    expect(classifyTseCandidateDiff({
      staging: { ...baseStaging, nm_urna_candidato: 'TESTE RS' },
      existing: baseCandidate,
    })).toMatchObject({
      acao: 'updated',
      changed_fields: ['ballot_name'],
      antes: { ballot_name: 'TESTE' },
      depois: { ballot_name: 'TESTE RS' },
    });
  });

  it('não marca retirada quando o dataset é parcial', () => {
    const report = buildCandidateDiffReport({
      uf: 'RS',
      stagingRows: [baseStaging],
      existingRows: [baseCandidate, { ...baseCandidate, tse_candidate_id: '210000000002', full_name: 'OUTRA' }],
      coverage: { complete: false, cargos: ['deputado_estadual'] },
    });

    expect(report.totals.withdrawn_candidate).toBe(0);
    expect(report.totals.needs_review).toBe(1);
    expect(report.needs_review[0]).toMatchObject({
      acao: 'needs_review',
      reason: 'missing_from_partial_dataset',
      tse_candidate_id: '210000000002',
    });
  });

  it('só classifica retirada com cobertura completa declarada', () => {
    const report = buildCandidateDiffReport({
      uf: 'RS',
      stagingRows: [baseStaging],
      existingRows: [baseCandidate, { ...baseCandidate, tse_candidate_id: '210000000002', full_name: 'OUTRA' }],
      coverage: { complete: true, cargos: ['deputado_estadual'] },
    });

    expect(report.totals.withdrawn_candidate).toBe(1);
    expect(report.withdrawn_candidate[0]).toMatchObject({
      acao: 'withdrawn_candidate',
      reason: 'missing_from_complete_dataset',
      tse_candidate_id: '210000000002',
    });
  });
});
