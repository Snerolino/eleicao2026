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
-- Migration: Fase 1 — Workflow de revisão humana e contestação
-- Data: 2026-08-10
-- Fase Supabase 1 (GUIA §10), modelo §5.8–5.9
-- Revisão própria da matriz (editorial_reviews é semanticamente ligada a claims).
-- PG14 compatible.

-- ============================================================================
-- 5.8 impact_reviews
-- ============================================================================
create table if not exists impact_reviews (
  id uuid primary key default gen_random_uuid(),
  impact_matrix_id uuid not null references impact_matrices(id) on delete cascade,
  assessment_id uuid references impact_assessments(id) on delete cascade,
  reviewer_id uuid references auth.users(id),
  reviewer_type text not null check (reviewer_type in ('curadoria_interna','painel_externo')),
  panel_id text,
  decision text not null check (decision in ('approved','rejected','needs_changes')),
  notes text,
  reviewed_at timestamptz not null default now()
);

comment on table impact_reviews is 'Revisões da matriz (interna e painel externo) — nunca publicadas cruas';

create index if not exists idx_impact_reviews_matrix on impact_reviews (impact_matrix_id, decision, reviewed_at desc);

-- ============================================================================
-- 5.9 impact_contestations — promessa de contestação pública
-- ============================================================================
create table if not exists impact_contestations (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references impact_assessments(id) on delete cascade,
  submitted_at timestamptz not null default now(),
  status text not null default 'open' check (status in ('open','under_review','resolved','rejected')),
  reason text not null check (char_length(reason) >= 20),
  source_reference_id uuid references source_references(id),
  resolution text,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table impact_contestations is 'Contestações públicas — a justificativa original nunca é apagada';

create index if not exists idx_impact_contestations_assessment on impact_contestations (assessment_id);
-- Migration: Fase 1 — RLS das tabelas de impacto + RPC de aprovação
-- Data: 2026-08-10
-- Fase Supabase 2 (GUIA §13–14)
-- Tabelas novas nascem protegidas. Público anônimo lê somente estados
-- publicáveis; nada de rascunho/pending/reviews cruas na superfície.
-- PG14 compatible.

-- ============================================================================
-- 1. Habilitar RLS em todas as tabelas novas
-- ============================================================================
alter table legislative_propositions enable row level security;
alter table proposition_versions enable row level security;
alter table voting_events enable row level security;
alter table legislative_votes enable row level security;
alter table beneficiary_groups enable row level security;
alter table beneficiary_group_aliases enable row level security;
alter table impact_matrices enable row level security;
alter table impact_assessments enable row level security;
alter table impact_assessment_sources enable row level security;
alter table impact_reviews enable row level security;
alter table impact_contestations enable row level security;

-- ============================================================================
-- 2. Público anônimo PODE ler (GUIA §13)
-- ============================================================================
-- Núcleo legislativo factual
drop policy if exists "legislative_propositions_public_read" on legislative_propositions;
create policy "legislative_propositions_public_read" on legislative_propositions
  for select using (true);

drop policy if exists "proposition_versions_public_read" on proposition_versions;
create policy "proposition_versions_public_read" on proposition_versions
  for select using (true);

drop policy if exists "voting_events_public_read" on voting_events;
create policy "voting_events_public_read" on voting_events
  for select using (true);

drop policy if exists "legislative_votes_public_read" on legislative_votes;
create policy "legislative_votes_public_read" on legislative_votes
  for select using (true);

-- Vocabulário
drop policy if exists "beneficiary_groups_public_read" on beneficiary_groups;
create policy "beneficiary_groups_public_read" on beneficiary_groups
  for select using (true);

drop policy if exists "beneficiary_group_aliases_public_read" on beneficiary_group_aliases;
create policy "beneficiary_group_aliases_public_read" on beneficiary_group_aliases
  for select using (true);

-- Matriz: somente approved e contested
drop policy if exists "impact_matrices_public_read" on impact_matrices;
create policy "impact_matrices_public_read" on impact_matrices
  for select using (review_status in ('approved','contested'));

drop policy if exists "impact_assessments_public_read" on impact_assessments;
create policy "impact_assessments_public_read" on impact_assessments
  for select using (
    exists (
      select 1 from impact_matrices m
      where m.id = impact_assessments.impact_matrix_id
        and m.review_status in ('approved','contested')
    )
  );

drop policy if exists "impact_assessment_sources_public_read" on impact_assessment_sources;
create policy "impact_assessment_sources_public_read" on impact_assessment_sources
  for select using (
    exists (
      select 1 from impact_assessments a
      join impact_matrices m on m.id = a.impact_matrix_id
      where a.id = impact_assessment_sources.assessment_id
        and m.review_status in ('approved','contested')
    )
  );

-- Contestações públicas (estado aberto visível para o fluxo de análise)
drop policy if exists "impact_contestations_public_read" on impact_contestations;
create policy "impact_contestations_public_read" on impact_contestations
  for select using (status in ('open','under_review','resolved'));

-- ============================================================================
-- 3. Público anônimo NÃO lê (rascunho, pending, reviews cruas)
-- ============================================================================
-- impact_reviews: somente revisores/autores (nada de análise crua pública)
drop policy if exists "impact_reviews_internal_read" on impact_reviews;
create policy "impact_reviews_internal_read" on impact_reviews
  for select using (
    auth.uid() is not null and public.has_editor_role(auth.uid())
  );

drop policy if exists "impact_reviews_editor_insert" on impact_reviews;
create policy "impact_reviews_editor_insert" on impact_reviews
  for insert with check (
    auth.uid() is not null and public.has_editor_role(auth.uid())
  );

-- ============================================================================
-- 4. Aprovação transacional da matriz (GUIA §14) — espelha publish_claim
-- ============================================================================
create or replace function public.impact_matrix_has_internal_approval(p_matrix_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.impact_reviews r
    where r.impact_matrix_id = p_matrix_id
      and r.decision = 'approved'
      and r.reviewer_type = 'curadoria_interna'
      and public.has_editor_role(r.reviewer_id)
  );
$$;

create or replace function public.impact_matrix_has_external_approval(p_matrix_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.impact_reviews r
    where r.impact_matrix_id = p_matrix_id
      and r.decision = 'approved'
      and r.reviewer_type = 'painel_externo'
  );
$$;

create or replace function public.impact_matrix_has_blocking_contestation(p_matrix_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.impact_assessments a
    join public.impact_contestations c on c.assessment_id = a.id
    where a.impact_matrix_id = p_matrix_id
      and c.status in ('open','under_review')
  );
$$;

create or replace function public.approve_impact_matrix(p_matrix_id uuid)
returns public.impact_matrices
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_matrix public.impact_matrices%rowtype;
  v_min_confidence numeric;
begin
  select * into v_matrix from public.impact_matrices where id = p_matrix_id;
  if not found then
    raise exception 'matriz inexistente' using errcode = 'P0001';
  end if;

  if v_matrix.review_status <> 'pending_review' then
    raise exception 'matriz não está em pending_review' using errcode = 'P0001';
  end if;

  -- 3. existe pelo menos um assessment válido OU explicitamente nenhum grupo
  if not exists (
    select 1 from public.impact_assessments a where a.impact_matrix_id = p_matrix_id
  ) and not v_matrix.generated_by_ai then
    -- matriz sem assessments só é válida se marcada explicitamente como tal;
    -- generated_by_ai=false + zero assessments = sem grupo justificado
    raise exception 'matriz sem assessments nem marcação explícita de nenhum grupo'
      using errcode = 'P0001';
  end if;

  -- 4–5. assessments válidos: fontes suficientes e confidence na faixa
  if exists (
    select 1
    from public.impact_assessments a
    where a.impact_matrix_id = p_matrix_id
      and (
        a.confidence <= 0 or a.confidence > 1
        or not exists (
          select 1 from public.impact_assessment_sources s
          where s.assessment_id = a.id
        )
      )
  ) then
    raise exception 'assessment com confidence fora da faixa ou sem fontes suficientes'
      using errcode = 'P0001';
  end if;

  -- 6. defending_vote obedece metodologia (garantido por trigger, rechecado aqui)
  if exists (
    select 1
    from public.impact_assessments a
    where a.impact_matrix_id = p_matrix_id
      and (
        (a.impact_direction in ('positive','negative') and a.defending_vote is null)
        or (a.impact_direction = 'unclear' and a.defending_vote is not null)
      )
  ) then
    raise exception 'defending_vote não obedece a metodologia' using errcode = 'P0001';
  end if;

  -- 7. revisão interna aprovada
  if not public.impact_matrix_has_internal_approval(p_matrix_id) then
    raise exception 'revisão interna aprovada obrigatória' using errcode = 'P0001';
  end if;

  -- 8. severity >= 4 → painel externo
  if v_matrix.severity >= 4
     and not public.impact_matrix_has_external_approval(p_matrix_id) then
    raise exception 'severity >= 4 exige revisão externa (painel) aprovada' using errcode = 'P0001';
  end if;

  -- 9. qualquer confidence < 0.6 → painel externo
  select min(a.confidence) into v_min_confidence
  from public.impact_assessments a
  where a.impact_matrix_id = p_matrix_id;

  if v_min_confidence is not null and v_min_confidence < 0.6
     and not public.impact_matrix_has_external_approval(p_matrix_id) then
    raise exception 'confidence < 0.6 exige revisão externa (painel) aprovada' using errcode = 'P0001';
  end if;

  -- 10. sem contestação bloqueante
  if public.impact_matrix_has_blocking_contestation(p_matrix_id) then
    raise exception 'contestação bloqueante aberta' using errcode = 'P0001';
  end if;

  update public.impact_matrices
     set review_status = 'approved',
         approved_at = now(),
         updated_at = now()
   where id = p_matrix_id
   returning * into v_matrix;

  return v_matrix;
end;
$$;

revoke all on function public.approve_impact_matrix(uuid) from public, anon;
grant execute on function public.approve_impact_matrix(uuid) to authenticated;
