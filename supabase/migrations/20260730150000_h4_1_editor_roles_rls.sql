-- Migration: H4.1 — Funções de papel e RLS explícito por tabela protegida
-- Data: 2026-07-30
-- Objetivo: centralizar autorização em public.editor_roles (nunca em claims de JWT),
-- policies explícitas TO authenticated com USING/WITH CHECK, e fechar escrita de anon.
-- PG14 compatible. service_role preservado (BYPASSRLS) com grants administrativos.

alter table public.claims enable row level security;
alter table public.raw_documents enable row level security;
alter table public.source_references enable row level security;
alter table public.editor_roles enable row level security;
alter table public.editorial_reviews enable row level security;

-- ============================================================================
-- 1. FUNÇÕES DE PAPEL (autorização por tabela protegida)
-- ============================================================================

create or replace function public.has_editor_role(uid uuid default auth.uid())
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.editor_roles er
    where er.user_id = uid
      and er.role in ('editor', 'admin')
  );
$$;

create or replace function public.has_admin_role(uid uuid default auth.uid())
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.editor_roles er
    where er.user_id = uid
      and er.role = 'admin'
  );
$$;

-- Execução restrita: anon não precisa saber papéis; policies rodam como authenticated.
revoke all on function public.has_editor_role(uuid) from public;
revoke all on function public.has_admin_role(uuid) from public;
grant execute on function public.has_editor_role(uuid) to authenticated, service_role;
grant execute on function public.has_admin_role(uuid) to authenticated, service_role;

-- ============================================================================
-- 2. CLAIMS — leitura pública mínima + mutações editoriais explícitas
-- ============================================================================

drop policy if exists "claims_public_read_published" on claims;
create policy "claims_public_read_published" on claims
  for select using (status = 'published');

-- Editor enxerga todas as claims para operar o workflow editorial
-- (publicado/corrigido/retratado precisam ser legíveis para o WITH CHECK do UPDATE).
drop policy if exists "claims_editor_read_pending" on claims;
drop policy if exists "claims_editor_read_all" on claims;
create policy "claims_editor_read_all" on claims
  for select to authenticated
  using (public.has_editor_role());

drop policy if exists "claims_editor_write" on claims;
drop policy if exists "claims_editor_insert" on claims;
create policy "claims_editor_insert" on claims
  for insert to authenticated
  with check (public.has_editor_role());

drop policy if exists "claims_editor_update" on claims;
create policy "claims_editor_update" on claims
  for update to authenticated
  using (public.has_editor_role())
  with check (public.has_editor_role());

-- ============================================================================
-- 3. EDITORIAL_REVIEWS — apenas editor autenticado, com WITH CHECK
-- ============================================================================

drop policy if exists "editorial_reviews_editor_only" on editorial_reviews;
drop policy if exists "editorial_reviews_editor_select" on editorial_reviews;
create policy "editorial_reviews_editor_select" on editorial_reviews
  for select to authenticated
  using (public.has_editor_role());

drop policy if exists "editorial_reviews_editor_insert" on editorial_reviews;
create policy "editorial_reviews_editor_insert" on editorial_reviews
  for insert to authenticated
  with check (public.has_editor_role());

drop policy if exists "editorial_reviews_editor_update" on editorial_reviews;
create policy "editorial_reviews_editor_update" on editorial_reviews
  for update to authenticated
  using (public.has_editor_role())
  with check (public.has_editor_role());

drop policy if exists "editorial_reviews_editor_delete" on editorial_reviews;
create policy "editorial_reviews_editor_delete" on editorial_reviews
  for delete to authenticated
  using (public.has_editor_role());

-- ============================================================================
-- 4. EDITOR_ROLES — autoleitura + gestão apenas por admin
-- ============================================================================

drop policy if exists "editor_roles_self_read" on editor_roles;
create policy "editor_roles_self_read" on editor_roles
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "editor_roles_admin_manage" on editor_roles;
create policy "editor_roles_admin_manage" on editor_roles
  for all to authenticated
  using (public.has_admin_role())
  with check (public.has_admin_role());

-- ============================================================================
-- 5. RAW_DOCUMENTS — privado para editor/admin; metadados via view pública
-- ============================================================================

drop policy if exists "raw_documents_public_read" on raw_documents;
drop policy if exists "public read raw_documents" on raw_documents;
drop policy if exists "editor read raw_documents" on raw_documents;

drop policy if exists "raw_documents_editor_read" on raw_documents;
create policy "raw_documents_editor_read" on raw_documents
  for select to authenticated
  using (public.has_editor_role());

drop policy if exists "raw_documents_editor_write" on raw_documents;
create policy "raw_documents_editor_write" on raw_documents
  for insert to authenticated
  with check (public.has_editor_role());

drop policy if exists "raw_documents_service_only" on raw_documents;
create policy "raw_documents_service_only" on raw_documents
  for all using (auth.role() = 'service_role');

-- ============================================================================
-- 6. PRIVILÉGIOS DE TABELA — anon só leitura mínima; escrita só authenticated/policy
-- ============================================================================

revoke all on table public.claims from public, anon, authenticated;
revoke all on table public.raw_documents from public, anon, authenticated;
revoke all on table public.source_references from public, anon, authenticated;
revoke all on table public.candidates from public, anon, authenticated;
revoke all on table public.editorial_reviews from public, anon, authenticated;
revoke all on table public.editor_roles from public, anon, authenticated;

-- Leitura pública mínima (RLS filtra linhas)
grant select on table public.claims to anon, authenticated;
grant select on table public.source_references to anon, authenticated;
grant select on table public.candidates to anon, authenticated;

-- Escrita editorial restrita a authenticated (policies exigem papel)
grant insert, update on table public.claims to authenticated;
grant select, insert, update, delete on table public.editorial_reviews to authenticated;
grant select, insert, update, delete on table public.editor_roles to authenticated;
grant select, insert on table public.raw_documents to authenticated;

-- service_role preservado: operação administrativa completa
grant select, insert, update, delete on table public.claims to service_role;
grant select, insert, update, delete on table public.source_references to service_role;
grant select, insert, update, delete on table public.candidates to service_role;
grant select, insert, update, delete on table public.raw_documents to service_role;
grant select, insert, update, delete on table public.editorial_reviews to service_role;
grant select, insert, update, delete on table public.editor_roles to service_role;
