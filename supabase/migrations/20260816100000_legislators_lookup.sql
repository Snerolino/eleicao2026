-- Migration: Fase 1b — Lookup de legisladores não-candidatos (senadores em exercício sem candidatura 2026)
-- Permite registrar votos nominais no Senado sem FK para candidates.
create table if not exists legislators (
  id uuid primary key default gen_random_uuid(),
  external_id text not null,  -- id no sistema origem do legisl. (ex: codParlamentar Senado)
  house text not null check (house in ('senado','camara','alrs','camara_municipal')),
  full_name text not null,
  party text,
  term_start date,
  term_end date,
  source_reference_id uuid references source_references(id),
  created_at timestamptz not null default now(),
  unique (house, external_id)
);
comment on table legislators is 'Legisladores sem passagem por candidates (ex.: senadores em exercício sem candidatura 2026).';
create index if not exists idx_legislators_house_ext on legislators (house, external_id);

-- index para votos por legislator (quando candidate_id é null)
create index if not exists idx_legislative_votes_legislator on legislative_votes (legislator_id);
