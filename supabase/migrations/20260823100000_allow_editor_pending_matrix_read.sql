-- Migration: allow authenticated editors to review pending impact matrices
-- Date: 2026-08-23
-- Remote apply: authorized for the admin review flow

alter table public.impact_matrices enable row level security;
alter table public.impact_assessments enable row level security;
alter table public.impact_assessment_sources enable row level security;

drop policy if exists "impact_matrices_editor_read" on public.impact_matrices;
create policy "impact_matrices_editor_read" on public.impact_matrices
  for select to authenticated
  using (public.has_editor_role(auth.uid()));

drop policy if exists "impact_assessments_editor_read" on public.impact_assessments;
create policy "impact_assessments_editor_read" on public.impact_assessments
  for select to authenticated
  using (
    exists (
      select 1 from public.impact_matrices m
      where m.id = impact_assessments.impact_matrix_id
        and public.has_editor_role(auth.uid())
    )
  );

drop policy if exists "impact_assessment_sources_editor_read" on public.impact_assessment_sources;
create policy "impact_assessment_sources_editor_read" on public.impact_assessment_sources
  for select to authenticated
  using (
    exists (
      select 1
      from public.impact_assessments a
      join public.impact_matrices m on m.id = a.impact_matrix_id
      where a.id = impact_assessment_sources.assessment_id
        and public.has_editor_role(auth.uid())
    )
  );

grant select on table public.impact_matrices, public.impact_assessments, public.impact_assessment_sources to authenticated;
