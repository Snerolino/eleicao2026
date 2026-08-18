// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const envelope = JSON.parse(readFileSync('data/legislative-import/alrs-fed10/fed10-envelope.json', 'utf8'));
const manifest = JSON.parse(readFileSync('data/legislative-import/alrs-fed10/manifest.json', 'utf8'));

describe('FED-10 ALRS envelope', () => {
  it('mantém contagens, fonte oficial e identidade TSE em todos os votos', () => {
    expect(envelope.propositions).toHaveLength(102);
    expect(envelope.events).toHaveLength(491);
    expect(envelope.votes).toHaveLength(526);
    expect(envelope.votes.every((vote) => /^\d+$/.test(vote.candidate_tse_id))).toBe(true);
    expect(envelope.votes.every((vote) => vote.source_url.includes('transparencia.al.rs.gov.br'))).toBe(true);
    expect(envelope.votes.every((vote) => /^\d{4}-\d{2}-\d{2}T/.test(vote.recorded_at))).toBe(true);
    expect(new Set(envelope.votes.map((vote) => vote.value))).toEqual(new Set(['sim', 'nao']));
  });

  it('não contém pendências e não mistura impacto', () => {
    expect(manifest.pending_matches).toBe(0);
    expect(manifest.impact_touched).toBe(false);
    expect(manifest.idempotent_reapply).toBe(true);
  });
});
