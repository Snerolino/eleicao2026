-- Migration: Fase 1 — Vocabulário controlado de grupos beneficiários
-- Data: 2026-08-10
-- Fase Supabase 1 (GUIA §10), modelo §3
-- Catálogo versionado, não enum PostgreSQL (§6). Slugs nunca renomeados;
-- evolução via deprecated_at + replacement_slug + aliases.
-- PG14 compatible.

-- ============================================================================
-- 3. beneficiary_groups
-- ============================================================================
create table if not exists beneficiary_groups (
  slug text primary key,
  label_pt text not null,
  description text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  deprecated_at timestamptz,
  replacement_slug text references beneficiary_groups(slug),
  constraint chk_replacement_not_self check (replacement_slug is null or replacement_slug <> slug)
);

comment on table beneficiary_groups is 'Catálogo versionado de grupos populacionais pontuáveis';

-- Slugs iniciais v1 (GUIA §3) — 14 grupos; `geral` NÃO é grupo pontuável.
insert into beneficiary_groups (slug, label_pt, description) values
  ('povos_indigenas', 'Povos Indígenas', 'Povos indígenas e comunidades tradicionais originárias'),
  ('comunidades_quilombolas', 'Comunidades Quilombolas', 'Comunidades remanescentes de quilombos'),
  ('populacao_negra_periferica', 'População Negra e Periférica', 'População negra e periférica urbana'),
  ('mulheres', 'Mulheres', 'Mulheres em geral'),
  ('lgbtqia', 'Pessoas LGBTQIA+', 'Pessoas lésbicas, gays, bissexuais, trans, queer, intersexo e demais'),
  ('pessoas_com_deficiencia', 'Pessoas com Deficiência', 'Pessoas com deficiência física, sensorial, intelectual ou psicossocial'),
  ('populacao_rua', 'População em Situação de Rua', 'Pessoas em situação de rua'),
  ('populacao_carceraria', 'População Carcerária', 'Pessoas privadas de liberdade e seus familiares'),
  ('criancas_adolescentes_vulnerabilidade', 'Crianças e Adolescentes em Vulnerabilidade', 'Crianças e adolescentes em situação de vulnerabilidade'),
  ('pessoas_idosas_dependentes', 'Pessoas Idosas Dependentes', 'Pessoas idosas em situação de dependência'),
  ('trabalhadores_informais', 'Trabalhadores Informais', 'Trabalhadores sem vínculo formal'),
  ('agricultura_familiar_sem_terra', 'Agricultura Familiar e Sem Terra', 'Agricultura familiar e população sem terra'),
  ('povos_de_terreiro', 'Povos de Terreiro', 'Povos e comunidades de terreiro'),
  ('imigrantes_refugiados', 'Imigrantes e Refugiados', 'Imigrantes e refugiados')
on conflict (slug) do nothing;

-- ============================================================================
-- 3. beneficiary_group_aliases (opcional)
-- ============================================================================
create table if not exists beneficiary_group_aliases (
  alias text primary key,
  group_slug text not null references beneficiary_groups(slug) on delete cascade
);

comment on table beneficiary_group_aliases is 'Aliases históricos/variantes de grafia dos grupos';
