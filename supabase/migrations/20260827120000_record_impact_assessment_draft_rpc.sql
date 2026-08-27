-- Registra matriz/assessment factual já decidido, mantendo revisão da matriz separada.
create or replace function public.record_impact_assessment_draft(
  p_proposition_version_id uuid,
  p_methodology_version text,
  p_severity integer,
  p_structural_type text,
  p_group_slug text,
  p_impact_direction text,
  p_defending_vote text,
  p_confidence numeric,
  p_rationale text,
  p_source_content_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_matrix_id uuid;
  v_assessment_id uuid;
  v_source_id uuid;
begin
  if auth.uid() is null or not public.has_editor_role(auth.uid()) then raise exception 'editor_role_required'; end if;
  if p_methodology_version !~ '^[0-9]+\.[0-9]+\.[0-9]+$' or p_severity not between 1 and 5 or p_structural_type not in ('structural','budgetary','symbolic') or p_group_slug is null or p_impact_direction not in ('positive','negative','mixed','unclear') or (p_impact_direction in ('positive','negative') and p_defending_vote not in ('sim','nao')) or (p_impact_direction in ('mixed','unclear') and p_defending_vote is not null) or p_confidence <= 0 or p_confidence > 1 or char_length(trim(coalesce(p_rationale,''))) < 20 then raise exception 'invalid_assessment_contract'; end if;
  select sr.id into v_source_id from source_references sr where sr.content_hash = p_source_content_hash;
  if v_source_id is null then raise exception 'source_reference_not_found'; end if;
  if not exists (select 1 from proposition_versions where id=p_proposition_version_id) then raise exception 'proposition_version_not_found'; end if;
  select id into v_matrix_id from impact_matrices where proposition_version_id=p_proposition_version_id and methodology_version=p_methodology_version;
  if v_matrix_id is null then
    insert into impact_matrices (proposition_version_id,schema_version,methodology_version,severity,structural_type,review_status,generated_by_ai)
    values (p_proposition_version_id,'1.0.0',p_methodology_version,p_severity,p_structural_type,'pending_review',false)
    returning id into v_matrix_id;
  end if;
  select id into v_assessment_id from impact_assessments where impact_matrix_id=v_matrix_id and group_slug=p_group_slug;
  if v_assessment_id is null then
    insert into impact_assessments (impact_matrix_id,group_slug,impact_direction,defending_vote,rationale,confidence)
    values (v_matrix_id,p_group_slug,p_impact_direction,p_defending_vote,trim(p_rationale),p_confidence)
    returning id into v_assessment_id;
  end if;
  insert into impact_assessment_sources (assessment_id,source_reference_id)
  values (v_assessment_id,v_source_id)
  on conflict do nothing;
  return jsonb_build_object('matrix_id',v_matrix_id,'assessment_id',v_assessment_id,'review_status','pending_review','remote_apply',true);
end;
$$;
revoke all on function public.record_impact_assessment_draft(uuid,text,integer,text,text,text,text,numeric,text,text) from public;
grant execute on function public.record_impact_assessment_draft(uuid,text,integer,text,text,text,text,numeric,text,text) to authenticated;
