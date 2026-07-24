-- Schema inicial do Portal Transparência Eleitoral RS
-- Combina: tarefa A1 (schema), A2 (RLS), A3 (seed) + migration_candidate_photos.sql

-- ============================================================================
-- TABELAS
-- ============================================================================

create table candidates (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  party text not null,
  ballot_number int,
  position text not null,
  tse_candidate_id text unique,
  photo_url text,
  photo_source_url text,
  created_at timestamptz default now()
);

comment on column candidates.photo_url is 'URL da foto do candidato — priorizar fonte oficial (TSE) quando disponível';
comment on column candidates.photo_source_url is 'URL da página/fonte que credita a foto — exibida no card como "fonte da foto"';

create table raw_documents (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  source_category text not null check (source_category in ('oficial','imprensa','fact_check','outro')),
  url text,
  content_hash text not null unique,
  raw_content text not null,
  fetched_at timestamptz not null default now()
);

create table claims (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references candidates(id),
  category text not null,
  content text not null,
  source_document_id uuid references raw_documents(id),
  source_char_offset int,
  confidence_score int not null check (confidence_score between 1 and 5),
  status text not null default 'draft'
    check (status in ('draft','pending_review','published','corrected','retracted')),
  previous_version_id uuid references claims(id),
  created_at timestamptz default now(),
  published_at timestamptz
);

create table editor_roles (
  user_id uuid primary key references auth.users(id),
  role text not null default 'editor' check (role in ('editor','admin')),
  created_at timestamptz default now()
);

create table editorial_reviews (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid references claims(id),
  reviewer_id uuid references auth.users(id),
  decision text not null check (decision in ('approved','rejected','needs_changes')),
  notes text,
  reviewed_at timestamptz default now()
);

create table ingestion_errors (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  error_message text not null,
  occurred_at timestamptz default now(),
  resolved boolean default false
);

-- ============================================================================
-- RLS (Row Level Security)
-- ============================================================================

alter table candidates enable row level security;
alter table raw_documents enable row level security;
alter table claims enable row level security;
alter table editor_roles enable row level security;
alter table editorial_reviews enable row level security;
alter table ingestion_errors enable row level security;

-- candidates: identificação básica é sempre pública
create policy "candidates_public_read" on candidates
  for select using (true);

-- claims: público só vê o que está publicado
create policy "claims_public_read_published" on claims
  for select using (status = 'published');

-- claims: editor autenticado vê também pending_review
create policy "claims_editor_read_pending" on claims
  for select using (
    status = 'pending_review'
    and exists (select 1 from editor_roles er where er.user_id = auth.uid())
  );

-- claims: só editor autenticado escreve
create policy "claims_editor_write" on claims
  for update using (
    exists (select 1 from editor_roles er where er.user_id = auth.uid())
  );

-- raw_documents e ingestion_errors: nunca expostos ao público, só service_role
create policy "raw_documents_service_only" on raw_documents
  for all using (auth.role() = 'service_role');

create policy "ingestion_errors_service_only" on ingestion_errors
  for all using (auth.role() = 'service_role');

-- editor_roles: cada um só vê o próprio papel
create policy "editor_roles_self_read" on editor_roles
  for select using (auth.uid() = user_id);

-- editorial_reviews: só editores
create policy "editorial_reviews_editor_only" on editorial_reviews
  for all using (
    exists (select 1 from editor_roles er where er.user_id = auth.uid())
  );