-- Migration: Fase 1 — Matriz de impacto (matriz, assessments, fontes)
-- Data: 2026-08-10
-- Fase Supabase 1 (GUIA §10), modelo §5.5–5.7
-- A matriz pertence à VERSÃO votada da proposição, nunca ao id lógico (§2.4).
-- PG14 compatible.

-- ============================================================================
-- 5.5 impact_matrices
-- ============================================================================
create table if not exists impact_matrices (
  id uuid primary key default gen_random_uuid(),
  proposition_version_id uuid not null references proposition_versions(id) on delete cascade,
  schema_version text not null check (schema_version ~ '^[0-9]+\.[0-9]+\.[0-9]+$'),
  methodology_version text not null check (methodology_version ~ '^[0-9]+\.[0-9]+\.[0-9]+$'),
  severity smallint not null check (severity between 1 and 5),
  structural_type text not null check (structural_type in ('structural','budgetary','symbolic')),
  review_status text not null default 'rascunho'
    check (review_status in ('rascunho','pending_review','approved','contested')),
  generated_by_ai boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_at timestamptz,
  unique (proposition_version_id, methodology_version)
);

comment on table impact_matrices is 'Matriz de impacto de uma versão votada — não sobrescrever matriz de metodologia anterior';

-- ============================================================================
-- 5.6 impact_assessments
-- ============================================================================
create table if not exists impact_assessments (
  id uuid primary key default gen_random_uuid(),
  impact_matrix_id uuid not null references impact_matrices(id) on delete cascade,
  group_slug text not null references beneficiary_groups(slug),
  defending_vote text check (defending_vote in ('sim','nao')),
  impact_direction text not null check (impact_direction in ('positive','negative','mixed','unclear')),
  rationale text not null check (char_length(rationale) >= 20),
  confidence numeric not null check (confidence > 0 and confidence <= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (impact_matrix_id, group_slug)
);

comment on table impact_assessments is 'Avaliação metodológica por grupo populacional (não é fato primário)';

-- Condicionais defending_vote por direção (GUIA §2.3):
-- positive/negative → defending_vote obrigatório (sim|nao)
-- unclear → defending_vote null e não participa de score
-- mixed → defending_vote sim|nao|null (saldo explicado no rationale)
create or replace function public.impact_assessment_defending_ok()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.impact_direction in ('positive','negative') and new.defending_vote is null then
    raise exception 'defending_vote_required_for_direction' using errcode = '23514';
  end if;
  if new.impact_direction = 'unclear' and new.defending_vote is not null then
    raise exception 'defending_vote_must_be_null_for_unclear' using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_impact_assessment_defending on impact_assessments;
create trigger trg_impact_assessment_defending
  before insert or update on impact_assessments
  for each row execute function public.impact_assessment_defending_ok();

-- ============================================================================
-- 5.7 impact_assessment_sources
-- ============================================================================
create table if not exists impact_assessment_sources (
  assessment_id uuid not null references impact_assessments(id) on delete cascade,
  source_reference_id uuid not null references source_references(id) on delete cascade,
  primary key (assessment_id, source_reference_id)
);

comment on table impact_assessment_sources is 'Fontes publicáveis que sustentam cada avaliação (deduplicadas via source_references)';

create index if not exists idx_impact_matrices_version on impact_matrices (proposition_version_id);
create index if not exists idx_impact_assessments_matrix on impact_assessments (impact_matrix_id);
