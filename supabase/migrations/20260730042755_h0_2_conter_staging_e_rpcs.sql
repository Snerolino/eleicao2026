-- H0.2 — Contenção de staging TSE e RPCs administrativas
-- Risco: VERMELHO. Preparada localmente; aplicar no Supabase remoto somente com autorização explícita.
-- Objetivo: remover superfície pública de staging/helpers sem apagar dados e sem afetar leitura pública de candidates/source_references.

-- 1. Fechar privilégios diretos nas tabelas de staging e views internas.
revoke all on table public.tse_candidates_staging from public, anon, authenticated;
revoke all on table public.tse_candidates_complementar_staging from public, anon, authenticated;
revoke all on table public.tse_coligacoes_staging from public, anon, authenticated;
revoke all on table public.tse_vagas_staging from public, anon, authenticated;

revoke all on table public.tse_candidates_for_upsert from public, anon, authenticated;
revoke all on table public.raw_documents_metadata from public, anon, authenticated;

-- service_role mantém operação do pipeline autorizado.
grant select, insert, update, delete on table public.tse_candidates_staging to service_role;
grant select, insert, update, delete on table public.tse_candidates_complementar_staging to service_role;
grant select, insert, update, delete on table public.tse_coligacoes_staging to service_role;
grant select, insert, update, delete on table public.tse_vagas_staging to service_role;
grant select on table public.tse_candidates_for_upsert to service_role;
grant select on table public.raw_documents_metadata to service_role;

-- 2. RLS nas tabelas de staging. Sem policies públicas: anon/authenticated não têm leitura nem escrita.
alter table public.tse_candidates_staging enable row level security;
alter table public.tse_candidates_complementar_staging enable row level security;
alter table public.tse_coligacoes_staging enable row level security;
alter table public.tse_vagas_staging enable row level security;

alter table public.tse_candidates_staging force row level security;
alter table public.tse_candidates_complementar_staging force row level security;
alter table public.tse_coligacoes_staging force row level security;
alter table public.tse_vagas_staging force row level security;

-- 3. Fechar RPCs/funções administrativas.
revoke all on function public.rpc_upsert_candidates(text, boolean) from public, anon, authenticated;
revoke all on function public.upsert_candidates_from_staging(text, boolean) from public, anon, authenticated;

grant execute on function public.rpc_upsert_candidates(text, boolean) to service_role;
grant execute on function public.upsert_candidates_from_staging(text, boolean) to service_role;

-- 4. Reaplicar wrapper com search_path fixo e guarda por claim JWT.
-- Mesmo que grants sejam reabertos por engano, anon/authenticated não devem executar a mutação.
create or replace function public.rpc_upsert_candidates(
  uf_filter text default 'RS',
  dry_run boolean default true
)
returns json
language plpgsql
security definer
set search_path = public
as $func$
declare
  v_result json;
begin
  if current_setting('request.jwt.claim.role', true) != 'service_role' then
    raise exception 'Apenas service_role pode executar upsert.';
  end if;

  select json_agg(row_to_json(t)) into v_result
  from public.upsert_candidates_from_staging(uf_filter, dry_run) t;

  return coalesce(v_result, '[]'::json);
end;
$func$;

comment on function public.rpc_upsert_candidates(text, boolean) is
  'RPC administrativa para upsert TSE staging -> candidates. Executável apenas por service_role.';

-- 5. Reduzir privilégios padrão futuros no schema public.
-- Observação: isso não altera objetos existentes; os REVOKEs acima cobrem o escopo atual.
alter default privileges for role postgres in schema public revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on functions from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on sequences from anon, authenticated;

-- Não alteramos default privileges de supabase_admin aqui: o papel do deploy
-- não é owner dessa role em todos os ambientes Supabase e isso pode bloquear
-- a migration. Objetos atuais já foram tratados por REVOKE explícito acima.

-- 6. Garantir que leituras públicas legítimas continuam explícitas.
grant select on table public.candidates to anon, authenticated;
grant select on table public.source_references to anon, authenticated;
grant select on table public.claims to anon, authenticated;

-- Rollback operacional (não executar sem revisão):
--   grant all on table public.tse_candidates_staging to anon, authenticated;
--   grant all on table public.tse_candidates_complementar_staging to anon, authenticated;
--   grant all on table public.tse_coligacoes_staging to anon, authenticated;
--   grant all on table public.tse_vagas_staging to anon, authenticated;
--   grant execute on function public.rpc_upsert_candidates(text, boolean) to anon, authenticated;
-- Preferir rollback por migration reversa revisada, usando o inventário H0.1 como evidência.