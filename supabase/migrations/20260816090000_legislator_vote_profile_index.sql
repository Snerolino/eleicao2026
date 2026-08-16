-- Migration: Índice de perfil por votação (Fase 2 — análise de perfil)
-- Data: 2026-08-16
-- Princípio: os votos factuais (legislative_votes) são lidos UMA vez e indexados
-- em um perfil derivado, para não reavaliar o sentido (positivo/negativo) de
-- cada voto a cada renderização/comparacao. O índice é materializado e
-- recalculado sob demanda pelo script scripts/build-vote-profile.mjs.
-- PG14 compatible.

-- ============================================================================
-- Tabela de perfil de votação por parlamentar/candidato
-- ============================================================================
create table if not exists legislator_vote_profile (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates(id) on delete cascade,
  house text not null check (house in ('camara','senado','alrs','camara_municipal')),
  -- Contagem factual de votos
  total_votes integer not null default 0,
  votos_sim integer not null default 0,
  votos_nao integer not null default 0,
  votos_abstencao integer not null default 0,
  votos_ausente integer not null default 0,
  votos_obstrucao integer not null default 0,
  -- Score de perfil derivado (ler uma vez):
  --   sim = +1, nao = -1, abstencao/ausente/obstrucao = 0
  --   profile_score = (votos_sim - votos_nao) / max(total_votos, 1), em [-1, 1]
  profile_score numeric(6,4) not null default 0,
  -- Última recalculação do índice
  indexed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (candidate_id, house)
);

comment on table legislator_vote_profile is
  'Perfil de votação indexado por parlamentar — derivado uma vez de legislative_votes, reaproveitado sem reavaliar cada voto.';

create index if not exists idx_legislator_vote_profile_candidate
  on legislator_vote_profile (candidate_id);
create index if not exists idx_legislator_vote_profile_score
  on legislator_vote_profile (house, profile_score);

-- ============================================================================
-- Índice de voto por proposição (para comparação direta entre candidatos)
-- Cada linha = voto de um candidato em um evento de votação específico,
-- já pontuado. Lido uma vez; demais telas só consultam.
-- ============================================================================
create table if not exists legislator_vote_index (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates(id) on delete cascade,
  voting_event_id uuid not null references voting_events(id) on delete cascade,
  -- Sentido já avaliado uma vez: 1=positivo(sim), -1=negativo(nao), 0=neutro/ausente
  direction smallint not null check (direction in (-1, 0, 1)),
  value text not null,
  indexed_at timestamptz not null default now(),
  unique (candidate_id, voting_event_id)
);

comment on table legislator_vote_index is
  'Voto de cada candidato por evento, já indexado em direção (positivo/negativo), para comparação rápida sem reavaliação.';

create index if not exists idx_legislator_vote_index_event
  on legislator_vote_index (voting_event_id);
create index if not exists idx_legislator_vote_index_candidate
  on legislator_vote_index (candidate_id);

-- RLS: leitura pública (dados factuais de interesse público)
alter table legislator_vote_profile enable row level security;
alter table legislator_vote_index enable row level security;

drop policy if exists "legislator_vote_profile_public_read" on legislator_vote_profile;
create policy "legislator_vote_profile_public_read" on legislator_vote_profile
  for select using (true);

drop policy if exists "legislator_vote_index_public_read" on legislator_vote_index;
create policy "legislator_vote_index_public_read" on legislator_vote_index
  for select using (true);
