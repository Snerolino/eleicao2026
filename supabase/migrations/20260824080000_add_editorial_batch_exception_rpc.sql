-- Add authenticated exception recording for externally reviewed batch corrections
-- Date: 2026-08-24

create or replace function public.record_impact_editorial_exception(
  p_proposition_version_id uuid,
  p_review_key text,
  p_title text,
  p_disposition text,
  p_notes text
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
  if char_length(trim(coalesce(p_notes,''))) < 20 then
    raise exception 'exception notes must have at least 20 characters' using errcode = '22023';
  end if;
  insert into public.impact_editorial_dispositions
    (proposition_version_id, review_key, title, disposition, rationale, reviewer_id, status)
  values
    (p_proposition_version_id, p_review_key, p_title, p_disposition, trim(p_notes), auth.uid(), 'needs_changes')
  on conflict (proposition_version_id, methodology_version) do update set
    review_key=excluded.review_key, title=excluded.title, disposition=excluded.disposition,
    rationale=excluded.rationale, reviewer_id=auth.uid(), status='needs_changes', updated_at=now()
  returning * into v_row;
  return v_row;
end;
$$;

revoke all on function public.record_impact_editorial_exception(uuid,text,text,text,text) from public, anon;
grant execute on function public.record_impact_editorial_exception(uuid,text,text,text,text) to authenticated;
