// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { buildOfficialVoteSources, buildVoteSourceReferenceIds, buildRequestPack } from '../build-alrs-substantive-source-request-pack.mjs';

describe('build-alrs-substantive-source-request-pack', () => {
  it('preserva URLs oficiais e IDs de source_reference separadamente', () => {
    const item = {
      source_urls: ['https://official/votes?solicitante=1505'],
      candidate_source_links: [{ source_url: 'https://official/votes?solicitante=1505', source_reference_id: 'ref-1' }],
    };
    expect(buildOfficialVoteSources(item)[0]).toMatchObject({
      url: 'https://official/votes?solicitante=1505',
      source_kind: 'official_vote_source',
    });
    expect(buildVoteSourceReferenceIds(item)).toEqual(['ref-1']);
  });

  it('mantém pedidos por grupo e versões distintas', () => {
    const pack = buildRequestPack({ items: [
      { proposition_version_id: 'v1', substantive_source_gate: 'blocked', source_urls: ['u'], proposed_assessments: [{ group_slug: 'a' }] },
      { proposition_version_id: 'v2', substantive_source_gate: 'blocked', source_urls: ['u2'], proposed_assessments: [{ group_slug: 'a' }, { group_slug: 'b' }] },
    ] });
    expect(pack.totals).toMatchObject({ requests: 3, versions: 2 });
  });
});
