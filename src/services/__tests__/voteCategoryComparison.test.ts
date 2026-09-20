import { describe, expect, it } from 'vitest';
import { buildApprovedVoteFacts } from '../voteCategoryComparison';

const matrix = (review_status = 'approved') => ({
  proposition_version_id: 'v1',
  review_status,
  impact_assessments: [
    {
      id: 'a1',
      group_slug: 'mulheres',
      impact_assessment_sources: [{ source_reference_id: 's1' }],
    },
  ],
});

const attribution = {
  voting_event_id: 'e1',
  assessment_id: 'a1',
  event_defending_vote: 'sim',
  score_eligible: true,
  vote_attribution_status: 'isolated',
  review_status: 'approved',
  impact_event_attribution_sources: [
    { source_reference_id: 'event-source', source_kind: 'vote_event' },
  ],
};

describe('voteCategoryComparison service mapping v2', () => {
  it('exige matrix, assessment, fonte e atribuição de evento aprovada', () => {
    const rows = [{ candidate_id: 'a', voting_event_id: 'e1', value: 'sim' }];
    const events = [{ id: 'e1', house: 'camara', proposition_version_id: 'v1' }];

    expect(buildApprovedVoteFacts(rows, events, [matrix()], [attribution])).toHaveLength(1);
    expect(buildApprovedVoteFacts(rows, events, [matrix()], [])).toEqual([]);
    expect(
      buildApprovedVoteFacts(rows, events, [matrix('pending_review')], [attribution]),
    ).toEqual([]);
  });

  it('rejeita atribuição sem fonte própria do evento', () => {
    const noSources = { ...attribution, impact_event_attribution_sources: [] };
    expect(
      buildApprovedVoteFacts(
        [{ candidate_id: 'a', voting_event_id: 'e1', value: 'sim' }],
        [{ id: 'e1', house: 'camara', proposition_version_id: 'v1' }],
        [matrix()],
        [noSources],
      ),
    ).toEqual([]);
  });

  it('deduplica linhas repetidas do índice pela identidade completa do fato', () => {
    const rows = [
      { candidate_id: 'a', voting_event_id: 'e1', value: 'sim' },
      { candidate_id: 'a', voting_event_id: 'e1', value: 'sim' },
    ];
    expect(
      buildApprovedVoteFacts(
        rows,
        [{ id: 'e1', house: 'camara', proposition_version_id: 'v1' }],
        [matrix()],
        [attribution],
      ),
    ).toHaveLength(1);
  });
});
