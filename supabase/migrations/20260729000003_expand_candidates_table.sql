-- Migration: 20260729_expand_candidates_table
-- Expande tabela candidates com campos do modelo eleitoral oficial (Fase 2)

-- 1. Adicionar colunas necessárias
alter table candidates
  add column if not exists ballot_name text,
  add column if not exists election_year int not null default 2026,
  add column if not exists state text not null default 'RS',
  add column if not exists registration_status text not null default 'pre_candidate',
  add column if not exists registration_status_updated_at timestamptz,
  add column if not exists federation text,
  add column if not exists coalition text,
  add column if not exists official_profile_url text,
  add column if not exists candidate_type text not null default 'pre_candidate',
  add column if not exists first_seen_at timestamptz not null default now(),
  add column if not exists last_seen_at timestamptz not null default now(),
  add column if not exists official_source_document_id uuid references raw_documents(id),
  add column if not exists review_status text not null default 'pending',
  add column if not exists data_origin text not null default 'manual';

-- 2. Constraint: registration_status válidos
alter table candidates
  add constraint chk_candidates_registration_status
  check (registration_status in (
    'pre_candidate',
    'registration_requested',
    'registered',
    'approved',
    'denied',
    'appeal_pending',
    'withdrawn',
    'replaced',
    'cancelled'
  ));

-- 3. Constraint: candidate_type válidos
alter table candidates
  add constraint chk_candidates_type
  check (candidate_type in (
    'pre_candidate',
    'candidate',
    'vice_candidate',
    'substitute'
  ));

-- 4. Constraint: review_status válidos
alter table candidates
  add constraint chk_candidates_review_status
  check (review_status in (
    'pending',
    'under_review',
    'approved',
    'rejected',
    'needs_correction'
  ));

-- 5. Constraint: data_origin válidos
alter table candidates
  add constraint chk_candidates_data_origin
  check (data_origin in (
    'manual',
    'tse_import',
    'press_source',
    'mixed'
  ));

-- 6. Índices para queries comuns
create index if not exists idx_candidates_election_year on candidates(election_year);
create index if not exists idx_candidates_registration_status on candidates(registration_status);
create index if not exists idx_candidates_candidate_type on candidates(candidate_type);
create index if not exists idx_candidates_review_status on candidates(review_status);
create index if not exists idx_candidates_position on candidates(position);
create index if not exists idx_candidates_tse_candidate_id on candidates(tse_candidate_id);

-- 7. Normalizar position dos registros existentes (antes da constraint)
update candidates
set position = lower(regexp_replace(position, '\s+', '_', 'g'))
where position ~ '\s|[A-Z]';

-- 8. Constraint: position canônico (após normalização)
alter table candidates
  add constraint chk_candidates_position
  check (position in (
    'presidente',
    'governador',
    'vice_governador',
    'senador',
    'deputado_federal',
    'deputado_estadual',
    'outro'
  ));

-- 9. Trigger para atualizar last_seen_at automaticamente
create or replace function update_last_seen_at()
returns trigger language plpgsql as $$
begin
  new.last_seen_at = now();
  return new;
end $$;

drop trigger if exists trigger_update_last_seen_at on candidates;
create trigger trigger_update_last_seen_at
  before update on candidates
  for each row
  execute function update_last_seen_at();