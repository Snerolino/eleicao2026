-- Fase 3: Schema para dados de votação + perfil comparativo
-- Preparação para resultados eleitorais (resultados só pós-outubro 2026)
-- e enriquecimento de perfil (bens, redes sociais, deep-research).
--
-- Ainda NÃO aplicada no Supabase remoto — aguarda aprovação humana.

-- ===========================================================================
-- 1. Tabela: candidate_profiles  (enriquecimento de perfil)
--    Fontes públicas: bem_candidato (TSE), rede_social_candidato (TSE),
--    deepseek_json / dossie (deep-research, categoria 'imprensa').
--    Cada claim é referenciado (source_document_id) para rastreabilidade.
create table if not exists candidate_profiles (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references candidates(id) on delete cascade,
  source_name text not null check (source_name in ('tse','deep_research','dossie')),
  attribute text not null,                -- ex: 'bem_total', 'instagram_url', 'political_history'
  value text not null,                    -- JSON ou texto
  confidence int check (confidence between 1 and 5),
  verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_candidate_profiles_candidate on candidate_profiles(candidate_id);
create index if not exists idx_candidate_profiles_attribute on candidate_profiles(attribute);
create index if not exists idx_candidate_profiles_source on candidate_profiles(source_name);

-- ===========================================================================
-- 2. Tabela: election_results  (RESULTADOS — só pós-eleição outubro/2026)
--    Ingestão idempotente via import-election-results.mjs.
create table if not exists election_results (
  id uuid primary key default gen_random_uuid(),
  election_id bigint not null,             -- 6259 = Eleições Gerais Estaduais 2026
  position text not null,                  -- governador/vice_governador/senador/...
  state text not null default 'RS',
  zone int,                                -- zona eleitoral
  section int,                             -- seção (0 = agregada)
  candidate_id uuid references candidates(id) on delete set null,
  tse_candidate_id text,
  votes int not null default 0,
  created_at timestamptz default now()
);

create index if not exists idx_results_election_position on election_results(election_id, position);
create index if not exists idx_results_candidate on election_results(candidate_id);
create index if not exists idx_results_tse on election_results(tse_candidate_id);

-- ===========================================================================
-- 3. Trigger: updated_at para candidate_profiles
create or replace function trigger_update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trigger_candidate_profiles_updated on candidate_profiles;
create trigger trigger_candidate_profiles_updated
  before update on candidate_profiles
  for each row execute function trigger_update_updated_at();

-- ===========================================================================
-- 4. Política RLS (mantém anon read-only; service_role administra)
alter table candidate_profiles enable row level security;
alter table election_results enable row level security;

-- Perfil enriquecido: public_read apenas campos verificados
create policy "candidate_profiles_public_read_verified" on candidate_profiles
  for select using (verified = true);

-- election_results: público só com results_status='published'
alter table election_results add column if not exists results_status text not null default 'pending'
  check (results_status in ('pending','imported','published'));
create policy "election_results_public_read" on election_results
  for select using (results_status = 'published');
create policy "election_results_service_write" on election_results
  for all using (auth.role() = 'service_role');
create policy "candidate_profiles_service_write" on candidate_profiles
  for all using (auth.role() = 'service_role');
