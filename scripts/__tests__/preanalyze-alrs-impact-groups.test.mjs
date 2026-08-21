// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { preanalyzeGroups } from '../preanalyze-alrs-impact-groups.mjs';

describe('preanalyze-alrs-impact-groups', () => {
  it('produz candidatos de grupo sem criar assessment', () => {
    const result = preanalyzeGroups([{ title: 'Proteção de mulheres vítimas de violência', proposition_external_id: 'p1', assessments: [] }]);
    expect(result.items[0].group_candidates).toEqual(['mulheres']);
    expect(result.items[0].group_candidate_basis).toBe('keyword_preanalysis');
    expect(result.preanalysis.mode).toBe('non_approving_keyword_preanalysis');
  });
});
