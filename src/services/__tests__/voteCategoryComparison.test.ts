import { describe, expect, it } from 'vitest';
import { buildApprovedVoteFacts } from '../voteCategoryComparison';

describe('voteCategoryComparison service mapping', () => {
  it('exige assessment aprovado e fonte associada', () => {
    const facts = buildApprovedVoteFacts(
      [{ candidate_id: 'a', voting_event_id: 'e1', value: 'sim' }],
      [{ id: 'e1', house: 'camara', proposition_version_id: 'v1' }],
      [{ proposition_version_id: 'v1', review_status: 'approved', impact_assessments: [{ group_slug: 'mulheres', impact_assessment_sources: [{ source_reference_id: 's1' }] }] }],
    );
    expect(facts).toHaveLength(1);
    expect(buildApprovedVoteFacts([{ candidate_id: 'a', voting_event_id: 'e1', value: 'sim' }], [{ id: 'e1', house: 'camara', proposition_version_id: 'v1' }], [{ proposition_version_id: 'v1', review_status: 'pending_review', impact_assessments: [{ group_slug: 'mulheres', impact_assessment_sources: [{ source_reference_id: 's1' }] }] }])).toEqual([]);
  });
});
