// @vitest-environment node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const migration = resolve(process.cwd(), 'supabase/migrations/20260913193000_harden_alrs_editorial_batch_apply.sql');
const sql = readFileSync(migration, 'utf8');

describe('ALRS editorial batch RPC security contract', () => {
  it('requires authenticated editor and atomic batch validation', () => {
    expect(sql).toMatch(/create or replace function public\.record_impact_editorial_batch\(\s*p_batch_id text,\s*p_batch_sha256 text,\s*p_items jsonb/is);
    expect(sql).toMatch(/auth\.uid\(\) is null or not public\.has_editor_role\(auth\.uid\(\)\)/i);
    expect(sql).toMatch(/jsonb_array_elements\(p_items\)/i);
    expect(sql).toMatch(/count\(distinct value->>'proposition_version_id'\)/i);
    expect(sql).toMatch(/for update/i);
    expect(sql).toMatch(/grant execute on function public\.record_impact_editorial_batch\(text, text, jsonb\) to authenticated/i);
    expect(sql).toMatch(/revoke all on function public\.record_impact_editorial_batch\(text, text, jsonb\) from public, anon/i);
  });

  it('preserva proveniência e não introduz service role', () => {
    expect(sql).toMatch(/add column if not exists batch_id text/i);
    expect(sql).toMatch(/add column if not exists batch_sha256 text/i);
    expect(sql).not.toMatch(/service_role|service role|SUPABASE_SECRET/i);
  });
});
