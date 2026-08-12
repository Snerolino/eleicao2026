-- Migration: Fase 1 — Grants de leitura pública (correção de 20260810090400)
-- Data: 2026-08-12
-- A migration de RLS habilitou row level security e policies, mas não concedeu
-- o privilégio base de SELECT ao role `anon`. Sem o GRANT, a policy
-- `using (true)` nunca é avaliada — o Postgres barra antes com 42501.
-- PG14 compatible. Idempotente.

-- Leitura pública (anon + authenticated) para tabelas de superfície factual
-- e vocabulário. RLS nas tabelas de matriz já restringe o que é visível
-- (approved/contested), então o GRANT de SELECT é seguro.
grant select on table
  legislative_propositions,
  proposition_versions,
  voting_events,
  legislative_votes,
  beneficiary_groups,
  beneficiary_group_aliases,
  impact_matrices,
  impact_assessments,
  impact_assessment_sources,
  impact_contestations
to anon, authenticated;

-- Leitura para authenticated nas tabelas de revisão (RLS interna restringe a editores)
grant select on table impact_reviews to authenticated;

-- Escrita autenticada onde as policies permitem (revisões internas).
-- service_role mantém todos os privilégios por padrão do Supabase.
grant insert, update, delete on table impact_reviews to authenticated;

-- Garante que futuras tabelas criadas pelo owner herdem SELECT público.
alter default privileges in schema public
  grant select on tables to anon, authenticated;
