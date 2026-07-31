// @vitest-environment node

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = 'supabase/migrations/20260730150000_h4_1_editor_roles_rls.sql';

function sql() {
  return readFileSync(migration, 'utf8');
}

describe('H4.1 editor roles e RLS', () => {
  it('define autorização por tabela protegida, nunca por user_metadata', () => {
    const content = sql();

    expect(content).toMatch(/create or replace function public\.has_editor_role/i);
    expect(content).toMatch(/create or replace function public\.has_admin_role/i);
    expect(content).toMatch(/from public\.editor_roles/i);
    expect(content).not.toMatch(/raw_user_meta_data|user_metadata/i);
  });

  it('usa policies explícitas TO authenticated com USING e WITH CHECK em mutações editoriais', () => {
    const content = sql();

    expect(content).toMatch(/create policy "claims_editor_update"[\s\S]*for update to authenticated[\s\S]*using[\s\S]*with check/i);
    expect(content).toMatch(/create policy "claims_editor_insert"[\s\S]*for insert to authenticated[\s\S]*with check/i);
    expect(content).toMatch(/create policy "editorial_reviews_editor_insert"[\s\S]*for insert to authenticated[\s\S]*with check/i);
    expect(content).toMatch(/create policy "editor_roles_admin_manage"[\s\S]*for all to authenticated[\s\S]*using[\s\S]*with check/i);
  });

  it('bloqueia escrita direta de anon e mantém leitura pública mínima', () => {
    const content = sql();

    expect(content).toMatch(/revoke all on table public\.claims from public, anon, authenticated/i);
    expect(content).toMatch(/revoke all on table public\.raw_documents from public, anon, authenticated/i);
    expect(content).toMatch(/revoke all on table public\.source_references from public, anon, authenticated/i);
    expect(content).toMatch(/grant select on table public\.claims to anon, authenticated/i);
    expect(content).toMatch(/grant select on table public\.source_references to anon, authenticated/i);
    expect(content).toMatch(/grant select on table public\.candidates to anon, authenticated/i);
  });
});
