-- Migration: Separar raw_documents (privado) de source_references (público)
-- Data: 2026-07-28
-- Resolve: exposição indevida de raw_content via API pública
-- NOTA: created_at não existe na tabela raw_documents, removido das queries

-- ============================================================================
-- 1. CRIAR TABELA PÚBLICA DE REFERÊNCIAS (sem raw_content)
-- ============================================================================
create table if not exists source_references (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  source_category text not null check (source_category in ('oficial','imprensa','fact_check','outro')),
  url text,
  title text,
  published_at timestamptz,
  fetched_at timestamptz not null default now(),
  content_hash text not null unique
);

comment on table source_references is 'Metadados públicos de fontes — sem conteúdo bruto';

-- ============================================================================
-- 2. MIGRAR DADOS EXISTENTES (sem created_at, que não existe em raw_documents)
-- ============================================================================
insert into source_references (id, source_name, source_category, url, title, published_at, fetched_at, content_hash)
select 
  id,
  source_name,
  source_category,
  url,
  null as title,
  null as published_at,
  fetched_at,
  content_hash
from raw_documents
on conflict (content_hash) do nothing;

-- ============================================================================
-- 3. ATUALIZAR CLAIMS PARA APONTAR PARA source_references
-- ============================================================================
-- A FK já aponta para UUID compatível (mesma PK), só mudar a referência
alter table claims
  drop constraint if exists claims_source_document_id_fkey,
  add constraint claims_source_document_id_fkey
    foreign key (source_document_id) references source_references(id);

-- ============================================================================
-- 4. RLS: source_references público (só leitura), raw_documents privado
-- ============================================================================
alter table if exists source_references enable row level security;
alter table if exists raw_documents enable row level security;

-- source_references: público lê tudo
drop policy if exists "source_references_public_read" on source_references;
create policy "source_references_public_read" on source_references
  for select using (true);

-- raw_documents: remover política pública, só editor autenticado
drop policy if exists "raw_documents_public_read" on raw_documents;
drop policy if exists "raw_documents_editor_read" on raw_documents;

drop policy if exists "raw_documents_editor_read" on raw_documents;

create policy "raw_documents_editor_read" on raw_documents
  for select using (
    exists (select 1 from editor_roles er where er.user_id = auth.uid())
  );

drop policy if exists "raw_documents_editor_write" on raw_documents;

create policy "raw_documents_editor_write" on raw_documents
  for insert with check (
    exists (select 1 from editor_roles er where er.user_id = auth.uid())
  );

-- ============================================================================
-- 5. ÍNDICES PARA PERFORMANCE
-- ============================================================================
create index if not exists idx_source_references_category on source_references(source_category);
create index if not exists idx_source_references_fetched_at on source_references(fetched_at desc);
create index if not exists idx_claims_source_document on claims(source_document_id);