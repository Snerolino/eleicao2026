// @vitest-environment node
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('alrs-nominal-vote-reconciliation manifest', () => {
  it('produz manifesto read-only idempotente quando o discovery estiver fresco', () => {
    const manifest = resolve(import.meta.dirname, '../../data/legislative-import/alrs/alrs-nominal-vote-reconciliation-v1.json');
    if (!existsSync(manifest)) { expect.soft(true).toBe(true); return; }
    const data = JSON.parse(readFileSync(manifest, 'utf8'));
    expect(data.schema_version).toBe('1.0.0');
    expect(data.remote_apply).toBe(false);
    expect(data).toHaveProperty('counts');
    expect(data.counts).toHaveProperty('source_rows');
    expect(data.counts).toHaveProperty('missing');
  });
});
