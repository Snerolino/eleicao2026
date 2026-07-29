-- Migration: 20260728_fix_raw_documents_rls_and_source_references
-- Complemento: view pública + CHECK constraint + índices adicionais

-- 1. View pública sem raw_content (metadados de fonte) — sem created_at (não existe na tabela)
create or replace view public.raw_documents_metadata as
select id, source_name, source_category, url, content_hash, fetched_at
from raw_documents;

grant select on public.raw_documents_metadata to anon;

-- 2. Remover políticas antigas (compatibilidade)
drop policy if exists "public read raw_documents" on raw_documents;

-- 3. Índices para chaves estrangeiras (performance)
create index if not exists idx_claims_candidate_id on claims(candidate_id);
create index if not exists idx_claims_source_document_id on claims(source_document_id);
create index if not exists idx_claims_previous_version_id on claims(previous_version_id);
create index if not exists idx_editorial_reviews_claim_id on editorial_reviews(claim_id);
create index if not exists idx_editorial_reviews_reviewer_id on editorial_reviews(reviewer_id);

-- 4. Constraint: claim publicada precisa de candidato, fonte e published_at
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'chk_published_claim_requirements'
  ) then
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
  end if;
end $$;