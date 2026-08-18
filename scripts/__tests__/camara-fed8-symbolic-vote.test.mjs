// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildEnvelope, classifyEvent, normalizeVote } from '../collect-camara-votes.mjs';

const root = resolve(process.cwd());

function parseJsonArray(text) {
  try {
    return JSON.parse(text);
  } catch {
    return { dados: JSON.parse(text.trim().replace(/^[^{]*{/, '{').replace(/}.*$/s, '}')) };
  }
}

const rawPath = resolve(root, 'data/legislative-import/camara/collector-pilot/2580259-27.raw.json');
const raw = JSON.parse(readFileSync(rawPath, 'utf8'));
const detail = raw.detail;
const votes = Array.isArray(raw.votes) ? raw.votes : (raw.votes?.dados ?? []);

describe('FED-8: votação 2580259-27 simbólica Câmara', () => {
  it('classifica como não individualizada sem criar envelope', () => {
    const { eventClass, envelope } = buildEnvelope(detail, votes, null, '2580259-27', 'RS');
    expect(eventClass.is_individualized).toBe(false);
    expect(eventClass.vote_method).toBe('outro');
    expect(envelope).toBeNull();
  });

  it('não converte simbólica em voto nominal', () => {
    const { envelope } = buildEnvelope(detail, votes, null, '2580259-27', 'RS');
    if (envelope) {
      expect(envelope.votes.length).toBe(0);
    }
  });

  it('bruto preserva o registro de votos da Redação Final', () => {
    expect(detail.id).toBe('2580259-27');
    expect(String(detail.descricao).toLowerCase()).toContain('redação final');
  });
});
