-- Migration: editorial disposition queue for source-ready micro-batches
-- Date: 2026-08-23
-- Remote apply: authorized for /admin editorial flow

create table if not exists public.impact_editorial_dispositions (
  id uuid primary key default gen_random_uuid(),
  proposition_version_id uuid not null references public.proposition_versions(id) on delete cascade,
  methodology_version text not null default '1.0.0' check (methodology_version ~ '^[0-9]+\.[0-9]+\.[0-9]+$'),
  review_key text not null,
  title text not null,
  disposition text not null check (disposition in ('assess','no_direct_population_group','taxonomy_gap','excluded')),
  rationale text not null check (char_length(rationale) >= 20),
  reviewer_id uuid not null references auth.users(id),
  status text not null default 'approved' check (status in ('approved','needs_changes','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (proposition_version_id, methodology_version)
);

alter table public.impact_editorial_dispositions enable row level security;
drop policy if exists "impact_editorial_dispositions_editor_read" on public.impact_editorial_dispositions;
create policy "impact_editorial_dispositions_editor_read" on public.impact_editorial_dispositions
  for select to authenticated using (public.has_editor_role(auth.uid()));
revoke all on public.impact_editorial_dispositions from anon;
grant select on public.impact_editorial_dispositions to authenticated;

create or replace function public.record_impact_editorial_disposition(
  p_proposition_version_id uuid,
  p_review_key text,
  p_title text,
  p_disposition text,
  p_rationale text
)
returns public.impact_editorial_dispositions
language plpgsql
security definer
set search_path = public, auth
as $$
declare v_row public.impact_editorial_dispositions%rowtype;
begin
  if auth.uid() is null or not public.has_editor_role(auth.uid()) then
    raise exception 'editor role required' using errcode = '42501';
  end if;
  if char_length(trim(coalesce(p_rationale,''))) < 20 then
    raise exception 'rationale must have at least 20 characters' using errcode = '22023';
  end if;
  insert into public.impact_editorial_dispositions
    (proposition_version_id, review_key, title, disposition, rationale, reviewer_id, status)
  values
    (p_proposition_version_id, p_review_key, p_title, p_disposition, trim(p_rationale), auth.uid(), 'approved')
  on conflict (proposition_version_id, methodology_version) do update set
    review_key=excluded.review_key, title=excluded.title, disposition=excluded.disposition,
    rationale=excluded.rationale, reviewer_id=auth.uid(), status='approved', updated_at=now()
  returning * into v_row;
  return v_row;
end;
$$;

revoke all on function public.record_impact_editorial_disposition(uuid,text,text,text,text) from public, anon;
grant execute on function public.record_impact_editorial_disposition(uuid,text,text,text,text) to authenticated;
