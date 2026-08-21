// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { buildCollisionResolutionPack } from '../build-alrs-version-collision-resolution-pack.mjs';

describe('alrs-version-collision-resolution-pack', () => {
  it('classifica colisão de mesmo título em datas distintas sem resolver automaticamente', () => {
    const result = buildCollisionResolutionPack({ collisions: [{ version_key: 'h', proposition_version_ids: ['v1', 'v2'], entries: [
      { proposition_external_id: 'p', title: 'Altera lei', occurred_at: '2026-01-01', event_external_id: 'e1', source_url: 'https://al.rs.gov.br/1' },
      { proposition_external_id: 'p', title: 'Altera lei', occurred_at: '2026-02-01', event_external_id: 'e2', source_url: 'https://al.rs.gov.br/2' },
    ] }] });
    expect(result.items[0]).toMatchObject({ technical_hypothesis: 'same_text_multiple_events_possible', resolution_status: 'needs_official_text_hash_review', remote_apply: false, human_review_required: true });
  });
});
