// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { buildCandidateIndex, normalizeName, resolveExactIdentity } from '../reconcile-camara-q1-identities.mjs';

describe('reconcile-camara-q1-identities', () => {
  it('normaliza somente acentos e separadores', () => {
    expect(normalizeName('Márcio-Biolchi')).toBe('MARCIOBIOLCHI');
  });

  it('aceita uma correspondência exata única e rejeita ausência', () => {
    const index = buildCandidateIndex([{ position: 'deputado_federal', tse_candidate_id: '1', full_name: 'NOME COMPLETO', ballot_name: 'NOME' }]);
    expect(resolveExactIdentity('Nome', index)).toMatchObject({ status: 'matched_exact' });
    expect(resolveExactIdentity('Outro', index)).toMatchObject({ status: 'identity_pending' });
  });

  it('deduplica full_name e ballot_name do mesmo candidato', () => {
    const index = buildCandidateIndex([{ position: 'deputado_federal', tse_candidate_id: '1', full_name: 'NOME', ballot_name: 'NOME' }]);
    expect(index.get('NOME')).toHaveLength(1);
  });
});
