-- Migration: 20260728_fix_raw_documents_rls_and_source_references
-- Corrige exposição de raw_content e cria layer pública source_references

-- 1. View pública sem raw_content (metadados de fonte)
create or replace view public.raw_documents_metadata as
select id, source_name, source_category, url, content_hash, fetched_at, created_at
from raw_documents;

grant select on public.raw_documents_metadata to anon;

-- 2. Remover política pública de SELECT em raw_documents (se existir)
drop policy if exists "public read raw_documents" on raw_documents;

-- 3. Política de SELECT apenas para authenticated/editor em raw_documents
create policy "editor read raw_documents" on raw_documents
  for select
  to authenticated
  using (
    exists (
      select 1 from editor_roles
      where user_id = (select auth.uid())
      and role in ('editor', 'admin')
    )
  );

-- 4. Índices para chaves estrangeiras (performance)
create index if not exists idx_claims_candidate_id on claims(candidate_id);
create index if not exists idx_claims_source_document_id on claims(source_document_id);
create index if not exists idx_claims_previous_version_id on claims(previous_version_id);
create index if not exists idx_editorial_reviews_claim_id on editorial_reviews(claim_id);
create index if not exists idx_editorial_reviews_reviewer_id on editorial_reviews(reviewer_id);

-- 5. Constraint: claim publicada precisa de candidato, fonte e published_at
alter table claims
  add constraint chk_published_claim_requirements
  check (
    status <> 'published'
    or (
      candidate_id is not null
      and source_document_id is not null
      and published_at is not null
    )
  );

-- 6. Trigger: claim só pode virar published se tiver editorial_review aprovado
-- (será implementado na Fase 4 - função transacional approve_claim)