// @vitest-environment node

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = 'supabase/migrations/20260730170000_h4_2_claims_workflow.sql';

function sql() {
  return readFileSync(migration, 'utf8');
}

describe('H4.2 aprovação transacional de claims', () => {
  it('cria funções transacionais restritas, sem execução pública/anon', () => {
    const content = sql();

    expect(content).toMatch(/create or replace function public\.publish_claim\(/i);
    expect(content).toMatch(/create or replace function public\.correct_claim\(/i);
    expect(content).toMatch(/create or replace function public\.retract_claim\(/i);
    expect(content).toMatch(/security definer/i);
    expect(content).toMatch(/revoke all on function public\.publish_claim\(uuid\) from public, anon/i);
    expect(content).toMatch(/grant execute on function public\.publish_claim\(uuid\) to authenticated, service_role/i);
    expect(content).not.toMatch(/raw_user_meta_data|user_metadata/i);
  });

  it('publicação valida status, fonte pública, revisão aprovada, revisor autorizado e published_at', () => {
    const content = sql();

    expect(content).toMatch(/status\s*<>\s*'pending_review'/i);
    expect(content).toMatch(/source_document_id\s+is\s+null/i);
    expect(content).toMatch(/from public\.source_references/i);
    expect(content).toMatch(/from public\.editorial_reviews/i);
    expect(content).toMatch(/decision\s*=\s*'approved'/i);
    expect(content).toMatch(/public\.has_editor_role\(.*reviewer_id/i);
    expect(content).toMatch(/published_at\s*=\s*coalesce\(.*published_at.*now\(\)/i);
  });

  it('correção/retração preservam histórico com previous_version_id e não apagam claim original', () => {
    const content = sql();

    expect(content).toMatch(/insert\s+into\s+public\.claims[\s\S]*previous_version_id/i);
    expect(content).toMatch(/previous_version_id[\s\S]*p_claim_id/i);
    expect(content).toMatch(/status[\s\S]*'corrected'/i);
    expect(content).toMatch(/status[\s\S]*'retracted'/i);
    expect(content).not.toMatch(/delete\s+from\s+public\.claims/i);
  });
});
