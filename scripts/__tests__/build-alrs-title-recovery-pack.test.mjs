// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { buildTitleRecoveryPack } from '../build-alrs-title-recovery-pack.mjs';

describe('alrs-title-recovery-pack', () => {
  it('separa títulos genéricos e preserva identidade/fontes', () => {
    const result = buildTitleRecoveryPack({ items: [{ proposition_version_id: 'v1', review_key: 'k', version_key: 'h', proposition_external_id: 'p', title: 'PL 1/2026', title_quality: 'generic', event_external_ids: ['e'], source_urls: ['u'] }, { title_quality: 'complete_or_unverified' }] });
    expect(result.totals).toMatchObject({ items: 1, generic: 1 });
    expect(result.items[0]).toMatchObject({ resolution_status: 'needs_official_full_title_and_version_text', human_review_required: true, remote_apply: false });
  });
});
