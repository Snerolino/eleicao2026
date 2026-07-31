import { describe, expect, it } from 'vitest';
import { onlyPublished } from '../claims';

describe('onlyPublished', () => {
  it('mantém claims published e corrected na superfície pública', () => {
    const claims = [
      { id: 'draft', status: 'draft' as const },
      { id: 'pending', status: 'pending_review' as const },
      { id: 'published', status: 'published' as const },
      { id: 'corrected', status: 'corrected' as const },
      { id: 'retracted', status: 'retracted' as const },
    ];

    expect(onlyPublished(claims).map((claim) => claim.id)).toEqual([
      'published',
      'corrected',
    ]);
  });
});
