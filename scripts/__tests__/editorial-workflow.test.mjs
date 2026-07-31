// @vitest-environment node

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const script = 'scripts/editorial-workflow.mjs';

describe('editorial-workflow H4.2', () => {
  it('publica/corrige/retrata por RPC transacional, não por PATCH direto em claims', () => {
    const content = readFileSync(script, 'utf8');

    expect(content).toContain('/rpc/publish_claim');
    expect(content).toContain('/rpc/correct_claim');
    expect(content).toContain('/rpc/retract_claim');
    expect(content).not.toMatch(/method:\s*['"]PATCH['"][\s\S]*status:\s*['"]published['"]/i);
  });
});
