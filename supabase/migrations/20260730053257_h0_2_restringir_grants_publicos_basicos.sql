-- H0.2 complemento — restringir grants públicos aos objetos públicos básicos
-- Aplicar após 20260730042755_h0_2_conter_staging_e_rpcs.sql.
-- Objetivo: deixar anon/authenticated com SELECT explícito nos objetos públicos,
-- removendo grants de escrita herdados por privilégios padrão antigos.

-- Publicamente legíveis via RLS/policies, mas não mutáveis por grant direto.
revoke all on table public.candidates from public, anon, authenticated;
revoke all on table public.claims from public, anon, authenticated;
revoke all on table public.source_references from public, anon, authenticated;

grant select on table public.candidates to anon, authenticated;
grant select on table public.claims to anon, authenticated;
grant select on table public.source_references to anon, authenticated;

-- service_role mantém operação administrativa completa.
grant select, insert, update, delete on table public.candidates to service_role;
grant select, insert, update, delete on table public.claims to service_role;
grant select, insert, update, delete on table public.source_references to service_role;

-- Rollback operacional (não executar sem revisão):
--   grant all on table public.candidates to anon, authenticated;
--   grant all on table public.claims to anon, authenticated;
--   grant all on table public.source_references to anon, authenticated;
