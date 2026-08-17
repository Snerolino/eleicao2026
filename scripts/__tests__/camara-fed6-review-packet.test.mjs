// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { validateImpactContract } from '../../src/domain/impact/contract.ts';

const root = resolve(process.cwd());
const matrix = JSON.parse(readFileSync(resolve(root, 'data/impact-matrices/pending-review/plp-230-2025-sbt-1-pending-review.json'), 'utf8'));
const packet = JSON.parse(readFileSync(resolve(root, 'data/impact-matrices/pending-review/camara-plp-230-2025-review-packet.json'), 'utf8'));

describe('FED-6: matriz Câmara pending_review', () => {
  it('é válida no contrato e não está aprovada', () => {
    expect(validateImpactContract(matrix)).toEqual({ ok: true, errors: [] });
    expect(matrix.review_status).toBe('pending_review');
    expect(matrix.assessments[0]).toMatchObject({ impact_direction: 'unclear', defending_vote: null });
    expect(matrix.assessments[0]).not.toHaveProperty('reviewed');
  });

  it('liga quatro candidatos apenas a votos factuais e bloqueia publicação automática', () => {
    expect(packet.review_status).toBe('pending_review');
    expect(packet.public_approval).toBe(false);
    expect(packet.remote_apply).toBe(false);
    expect(packet.candidates).toHaveLength(4);
    expect(packet.candidates.every((candidate) => candidate.factual_vote_count === 1)).toBe(true);
    expect(packet.safeguards).toEqual(expect.arrayContaining([
      'matriz não aprovada',
      'votos factuais não são convertidos em alinhamento sem revisão',
    ]));
  });

  it('usa somente fontes oficiais no assessment', () => {
    expect(matrix.assessments[0].sources.every((source) =>
      source.startsWith('https://dadosabertos.camara.leg.br/') || source.startsWith('https://www.camara.leg.br/'))).toBe(true);
  });
});
