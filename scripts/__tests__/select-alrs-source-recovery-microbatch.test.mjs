// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { selectMicrobatch } from '../select-alrs-source-recovery-microbatch.mjs';

const source = (version) => new Map([[version, {
  proposition_page: `https://ww4.al.rs.gov.br/proposicao/PL/${version}/2025`,
  page_sha256: 'page-hash',
  page_bytes: 100,
  sha256: 'document-hash',
  bytes: 200,
  content_addressed_path: 'source-corpus/document-hash.pdf',
  durability_gate: 'green',
  source_bytes_preserved: true,
}]]);

const item = (n, overrides = {}) => ({
  voting_event_id: `event-${n}`,
  event_external_id: `external-${n}`,
  occurred_at: `2025-0${n}-01T00:00:00Z`,
  proposition_version_id: `version-${n}`,
  version_key: `version-key-${n}`,
  title: `PL ${n}/2025`,
  assessment_id: `assessment-${n}`,
  group_slug: 'mulheres',
  house: 'alrs',
  event_source_reference_id: `event-source-${n}`,
  version_source_reference_id: null,
  factual_vote_present: true,
  candidate_ids: ['candidate-1'],
  state: 'withheld_source',
  ...overrides,
});

describe('select-alrs-source-recovery-microbatch', () => {
  it('seleciona cinco eventos determinísticos com fonte substantiva preservada', () => {
    const inventory = { inventory: [1, 2, 3, 4, 5, 6].map((n) => item(n)) };
    const result = selectMicrobatch(inventory, new Map([1, 2, 3, 4, 5, 6].map((n) => [`version-${n}`, source(`version-${n}`).get(`version-${n}`)])), new Set(), { limit: 5 });
    expect(result.status).toBe('pending_source_recovery');
    expect(result.selected_count).toBe(5);
    expect(result.items.map((row) => row.voting_event_id)).toEqual(['event-1', 'event-2', 'event-3', 'event-4', 'event-5']);
    expect(result.items.every((row) => row.remote_apply === false && row.public_approval === false)).toBe(true);
  });

  it('exclui evento sem fonte do evento e colisão', () => {
    const inventory = { inventory: [
      item(1, { event_source_reference_id: null }),
      item(2, { version_key: 'collision-key' }),
      item(3),
    ] };
    const result = selectMicrobatch(inventory, source('version-3'), new Set(['collision-key']), { limit: 5 });
    expect(result.selected_count).toBe(1);
    expect(result.status).toBe('blocked_below_minimum');
    expect(result.items[0].voting_event_id).toBe('event-3');
  });

  it('não cria lote sem evidência substantiva verde', () => {
    const result = selectMicrobatch({ inventory: [item(1)] }, new Map(), new Set(), { limit: 5 });
    expect(result.status).toBe('blocked_no_source_candidates');
    expect(result.selected_count).toBe(0);
  });
});
