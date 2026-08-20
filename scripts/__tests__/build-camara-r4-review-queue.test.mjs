// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { buildReviewQueue } from '../build-camara-r4-review-queue.mjs';

describe('camara-r4-review-queue', () => {
  it('mantém fatos e exige revisão sem inventar grupos', () => {
    const result = buildReviewQueue([{ propositions: [{ house: 'camara', external_id: 'p-1', title: 'P', versions: [{ version_key: 'v1', voting_events: [{ external_id: 'e1' }] }] }], votes: [{ voting_event_id: 'voting_events:camara:e1' }] }], [{ urls: [{ url: 'https://dadosabertos.camara.leg.br/api/v2/proposicoes/1' }] }]);
    expect(result).toMatchObject({ review_status: 'pending_review', remote_apply: false });
    expect(result.items[0]).toMatchObject({ factual_vote_count: 1, suggested_groups: [], suggested_direction: null, human_review_required: true });
  });
});
