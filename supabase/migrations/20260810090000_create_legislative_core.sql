-- Migration: Fase 1 — Núcleo legislativo (proposições versionadas e votos factuais)
-- Data: 2026-08-10
-- Fase Supabase 1 (GUIA §10), modelo §5.1–5.4
-- Princípio: dado legislativo factual separado de julgamento de impacto.
-- PG14 compatible.

-- ============================================================================
-- 5.1 legislative_propositions
-- ============================================================================
create table if not exists legislative_propositions (
  id uuid primary key default gen_random_uuid(),
  external_id text not null,
  house text not null check (house in ('camara','senado','alrs','camara_municipal')),
  proposition_type text not null check (proposition_type in ('pec','pl','plp','pld','lei','outro')),
  number integer not null check (number > 0),
  year integer not null check (year >= 1900),
  title text not null,
  summary text,
  official_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (house, external_id)
);

comment on table legislative_propositions is 'Proposições legislativas (identidade lógica, não texto votado)';

-- ============================================================================
-- 5.2 proposition_versions
-- ============================================================================
create table if not exists proposition_versions (
  id uuid primary key default gen_random_uuid(),
  proposition_id uuid not null references legislative_propositions(id) on delete cascade,
  version_key text not null,
  version_label text not null,
  text_hash text not null,
  source_reference_id uuid references source_references(id),
  effective_from timestamptz not null,
  created_at timestamptz not null default now(),
  unique (proposition_id, version_key)
);

comment on table proposition_versions is 'Versões imutáveis do texto votado (hash prova qual texto foi classificado)';

-- ============================================================================
-- 5.3 voting_events
-- ============================================================================
create table if not exists voting_events (
  id uuid primary key default gen_random_uuid(),
  proposition_version_id uuid not null references proposition_versions(id) on delete cascade,
  external_id text not null,
  house text not null check (house in ('camara','senado','alrs','camara_municipal')),
  session_id text,
  vote_round text,
  occurred_at timestamptz not null,
  source_reference_id uuid references source_references(id),
  created_at timestamptz not null default now(),
  unique (house, external_id)
);

comment on table voting_events is 'Eventos de votação ligados à versão efetivamente votada';

-- ============================================================================
-- 5.4 legislative_votes — SOMENTE FATO
-- ============================================================================
create table if not exists legislative_votes (
  id uuid primary key default gen_random_uuid(),
  voting_event_id uuid not null references voting_events(id) on delete cascade,
  legislator_id uuid,
  candidate_id uuid references candidates(id),
  value text not null check (value in ('sim','nao','abstencao','ausente','obstrucao')),
  absence_type text check (
    (value in ('sim','nao','abstencao') and absence_type is null)
    or
    (value in ('ausente','obstrucao') and absence_type in ('estrategica','obstrucao_coordenada','justificada'))
  ),
  recorded_at timestamptz not null,
  source_reference_id uuid references source_references(id),
  created_at timestamptz not null default now()
);

comment on table legislative_votes is 'Votos factuais — nunca armazenam impacto, alinhamento, grupo, score ou ideologia';

create index if not exists idx_legislative_votes_event on legislative_votes (voting_event_id);
create index if not exists idx_legislative_votes_candidate on legislative_votes (candidate_id);
