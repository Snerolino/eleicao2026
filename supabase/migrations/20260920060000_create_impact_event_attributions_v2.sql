-- Methodology v2: event-scoped attribution for legislative impact scoring.
-- This migration is intentionally additive. Legacy event attribution columns on
-- impact_assessments are preserved for audit/history but are no longer the source
-- of truth for score derivation.
-- NOT applied remotely by this change.

create table if not exists public.impact_event_attributions (
  id uuid primary key default gen_random_uuid(),
  voting_event_id uuid not null references public.voting_events(id) on delete cascade,
  assessment_id uuid not null references public.impact_assessments(id) on delete cascade,
  object_voted_kind text not null
    check (object_voted_kind in (
      'base_text','substitute','amendment','highlight','veto',
      'urgency','preference','procedural','other'
    )),
  event_defending_vote text
    check (event_defending_vote is null or event_defending_vote in ('sim','nao')),
  score_eligible boolean not null default false,
  vote_attribution_status text not null default 'event_binding_missing'
    check (vote_attribution_status in (
      'isolated','compound_separable','compound_non_separable',
      'procedural','event_binding_missing'
    )),
  score_withholding_reason text,
  confidence numeric not null
    check (confidence > 0 and confidence <= 1),
  rationale text not null
    check (char_length(rationale) >= 20),
  review_status text not null default 'pending_review'
    check (review_status in ('pending_review','approved','contested','rejected')),
  methodology_version text not null default '2.0.0'
    check (methodology_version ~ '^[0-9]+\\.[0-9]+\\.[0-9]+$'),
  approved_at timestamptz,
  approved_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (voting_event_id, assessment_id, methodology_version),
  constraint impact_event_attribution_score_gate check (
    (
      score_eligible = true
      and event_defending_vote in ('sim','nao')
      and vote_attribution_status in ('isolated','compound_separable')
      and score_withholding_reason is null
    )
    or
    (
      score_eligible = false
      and event_defending_vote is null
      and score_withholding_reason is not null
      and char_length(score_withholding_reason) >= 5
    )
  )
);

comment on table public.impact_event_attributions is
  'Methodology v2: attribution of one textual impact assessment to one concrete voting event. Required for score derivation.';
comment on column public.impact_event_attributions.event_defending_vote is
  'Meaning of SIM/NAO in this concrete event; never inherited automatically from the proposition or version.';
comment on column public.impact_event_attributions.score_eligible is
  'True only when the concrete event is safely attributable to the assessed effect.';
comment on column public.impact_event_attributions.vote_attribution_status is
  'Event-level attribution status; compound_non_separable/procedural/event_binding_missing are never scoreable.';

create table if not exists public.impact_event_attribution_sources (
  attribution_id uuid not null references public.impact_event_attributions(id) on delete cascade,
  source_reference_id uuid not null references public.source_references(id) on delete cascade,
  source_kind text not null
    check (source_kind in (
      'version_text','object_voted','vote_event','final_text',
      'committee_report','amendment','substitute','official_minutes','other_official'
    )),
  note text,
  primary key (attribution_id, source_reference_id, source_kind)
);

comment on table public.impact_event_attribution_sources is
  'Official sources that support the event binding and the meaning of the vote in methodology v2.';

create table if not exists public.impact_event_attribution_reviews (
  id uuid primary key default gen_random_uuid(),
  attribution_id uuid not null references public.impact_event_attributions(id) on delete cascade,
  reviewer_id uuid references auth.users(id),
  reviewer_type text not null
    check (reviewer_type in ('curadoria_interna','painel_externo','revisao_automatizada')),
  decision text not null
    check (decision in ('approved','rejected','needs_changes')),
  notes text,
  reviewed_at timestamptz not null default now()
);

comment on table public.impact_event_attribution_reviews is
  'Independent reviews of event-level attribution. Raw reviews are not public.';

create index if not exists idx_impact_event_attribution_reviews_attribution
  on public.impact_event_attribution_reviews(attribution_id, decision, reviewed_at desc);

create index if not exists idx_impact_event_attributions_event
  on public.impact_event_attributions(voting_event_id);
create index if not exists idx_impact_event_attributions_assessment
  on public.impact_event_attributions(assessment_id);
create index if not exists idx_impact_event_attributions_review
  on public.impact_event_attributions(review_status, score_eligible);

-- A textual assessment may be reused in v2, but the legacy event-level defaults
-- must never make a newly inserted assessment look scoreable by themselves.
update public.impact_assessments
set textual_defending_vote = defending_vote
where textual_defending_vote is null
  and defending_vote is not null;

-- Legacy fields remain for history but must fail closed for new rows.
alter table public.impact_assessments
  alter column score_eligible set default false;

comment on column public.impact_assessments.event_defending_vote is
  'LEGACY v1.1. Deprecated for score derivation. Use impact_event_attributions.event_defending_vote.';
comment on column public.impact_assessments.score_eligible is
  'LEGACY v1.1. Deprecated for score derivation. Use impact_event_attributions.score_eligible.';
comment on column public.impact_assessments.vote_attribution_status is
  'LEGACY v1.1. Deprecated for score derivation. Use impact_event_attributions.vote_attribution_status.';
comment on column public.impact_assessments.score_withholding_reason is
  'LEGACY v1.1. Deprecated for score derivation. Use impact_event_attributions.score_withholding_reason.';

create or replace function public.impact_event_attribution_has_review(
  p_attribution_id uuid,
  p_reviewer_type text
)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $
  select exists (
    select 1
    from public.impact_event_attribution_reviews r
    where r.attribution_id = p_attribution_id
      and r.reviewer_type = p_reviewer_type
      and r.decision = 'approved'
      and (
        p_reviewer_type <> 'curadoria_interna'
        or (r.reviewer_id is not null and public.has_editor_role(r.reviewer_id))
      )
  );
$;

create or replace function public.approve_impact_event_attribution(p_attribution_id uuid)
returns public.impact_event_attributions
language plpgsql
security definer
set search_path = public, auth
as $
declare
  v_attr public.impact_event_attributions%rowtype;
  v_severity smallint;
begin
  if auth.uid() is null or not public.has_editor_role(auth.uid()) then
    raise exception 'editor role required' using errcode = '42501';
  end if;

  select ea.*, m.severity
    into v_attr, v_severity
  from public.impact_event_attributions ea
  join public.impact_assessments a on a.id = ea.assessment_id
  join public.impact_matrices m on m.id = a.impact_matrix_id
  where ea.id = p_attribution_id;

  if not found then
    raise exception 'impact_event_attribution not found' using errcode = 'P0001';
  end if;

  if v_attr.review_status <> 'pending_review' then
    raise exception 'attribution must be pending_review' using errcode = 'P0001';
  end if;

  if not exists (
    select 1
    from public.impact_event_attribution_sources s
    where s.attribution_id = p_attribution_id
  ) then
    raise exception 'event attribution requires at least one official source'
      using errcode = 'P0001';
  end if;

  if not public.impact_event_attribution_has_review(
    p_attribution_id,
    'curadoria_interna'
  ) then
    raise exception 'approved internal review required' using errcode = 'P0001';
  end if;

  if (
    v_attr.confidence < 0.60
    or v_attr.vote_attribution_status = 'compound_separable'
    or v_severity >= 4
  ) and not public.impact_event_attribution_has_review(
    p_attribution_id,
    'painel_externo'
  ) then
    raise exception 'external review required for this attribution'
      using errcode = 'P0001';
  end if;

  update public.impact_event_attributions
  set review_status = 'approved',
      approved_at = now(),
      approved_by = auth.uid(),
      updated_at = now()
  where id = p_attribution_id
  returning * into v_attr;

  return v_attr;
end;
$;

alter table public.impact_event_attributions enable row level security;
alter table public.impact_event_attribution_sources enable row level security;
alter table public.impact_event_attribution_reviews enable row level security;

drop policy if exists "impact_event_attributions_public_read" on public.impact_event_attributions;
create policy "impact_event_attributions_public_read"
on public.impact_event_attributions
for select
to anon, authenticated
using (
  review_status in ('approved','contested')
  and exists (
    select 1
    from public.impact_assessments a
    join public.impact_matrices m on m.id = a.impact_matrix_id
    where a.id = impact_event_attributions.assessment_id
      and m.review_status in ('approved','contested')
  )
);

drop policy if exists "impact_event_attributions_editor_read" on public.impact_event_attributions;
create policy "impact_event_attributions_editor_read"
on public.impact_event_attributions
for select
to authenticated
using ((select public.has_editor_role((select auth.uid()))));

drop policy if exists "impact_event_attributions_editor_insert" on public.impact_event_attributions;
create policy "impact_event_attributions_editor_insert"
on public.impact_event_attributions
for insert
to authenticated
with check ((select public.has_editor_role((select auth.uid()))));

drop policy if exists "impact_event_attributions_editor_update" on public.impact_event_attributions;
create policy "impact_event_attributions_editor_update"
on public.impact_event_attributions
for update
to authenticated
using ((select public.has_editor_role((select auth.uid()))))
with check ((select public.has_editor_role((select auth.uid()))));

drop policy if exists "impact_event_attributions_editor_delete" on public.impact_event_attributions;
create policy "impact_event_attributions_editor_delete"
on public.impact_event_attributions
for delete
to authenticated
using ((select public.has_editor_role((select auth.uid()))));

drop policy if exists "impact_event_attribution_reviews_internal_read" on public.impact_event_attribution_reviews;
create policy "impact_event_attribution_reviews_internal_read"
on public.impact_event_attribution_reviews
for select
to authenticated
using ((select public.has_editor_role((select auth.uid()))));

drop policy if exists "impact_event_attribution_reviews_editor_insert" on public.impact_event_attribution_reviews;
create policy "impact_event_attribution_reviews_editor_insert"
on public.impact_event_attribution_reviews
for insert
to authenticated
with check (
  (select public.has_editor_role((select auth.uid())))
  and reviewer_id = (select auth.uid())
);

drop policy if exists "impact_event_attribution_sources_public_read" on public.impact_event_attribution_sources;
create policy "impact_event_attribution_sources_public_read"
on public.impact_event_attribution_sources
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.impact_event_attributions ea
    join public.impact_assessments a on a.id = ea.assessment_id
    join public.impact_matrices m on m.id = a.impact_matrix_id
    where ea.id = impact_event_attribution_sources.attribution_id
      and ea.review_status in ('approved','contested')
      and m.review_status in ('approved','contested')
  )
);

drop policy if exists "impact_event_attribution_sources_editor_all" on public.impact_event_attribution_sources;
create policy "impact_event_attribution_sources_editor_all"
on public.impact_event_attribution_sources
for all
to authenticated
using ((select public.has_editor_role((select auth.uid()))))
with check ((select public.has_editor_role((select auth.uid()))));

grant select on table public.impact_event_attributions, public.impact_event_attribution_sources
to anon, authenticated;
grant select, insert on table public.impact_event_attribution_reviews
to authenticated;
grant insert, update, delete on table public.impact_event_attributions, public.impact_event_attribution_sources
to authenticated;

revoke all on function public.approve_impact_event_attribution(uuid) from public, anon;
grant execute on function public.approve_impact_event_attribution(uuid) to authenticated;
