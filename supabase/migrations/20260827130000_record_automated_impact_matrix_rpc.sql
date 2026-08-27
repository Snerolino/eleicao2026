-- Autoaprovação determinística de matrizes de baixo risco, com revisor explicitamente automatizado.
alter table public.impact_reviews drop constraint if exists impact_reviews_reviewer_type_check;
alter table public.impact_reviews add constraint impact_reviews_reviewer_type_check check (reviewer_type in ('curadoria_interna','painel_externo','revisao_automatizada'));
create or replace function public.record_automated_impact_matrix(
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
  if p_severity >= 4 or p_confidence < 0.60 then raise exception 'external_review_required'; end if;
  if p_group_slug not in ('povos_indigenas','comunidades_quilombolas','populacao_negra_periferica','mulheres','lgbtqia','pessoas_com_deficiencia','populacao_rua','populacao_carceraria','criancas_adolescentes_vulnerabilidade','pessoas_idosas_dependentes','trabalhadores_informais','agricultura_familiar_sem_terra','povos_de_terreiro','imigrantes_refugiados') then raise exception 'invalid_canonical_group'; end if;
  if p_impact_direction not in ('positive','negative','mixed','unclear') then raise exception 'invalid_impact_direction'; end if;
  if p_impact_direction in ('positive','negative') and p_defending_vote not in ('sim','nao') then raise exception 'defending_vote_required'; end if;
  if p_impact_direction in ('mixed','unclear') and p_defending_vote is not null then raise exception 'defending_vote_must_be_null'; end if;
  if char_length(trim(coalesce(p_rationale,''))) < 20 then raise exception 'rationale_required'; end if;
  select id into v_source_id from source_references where content_hash=p_source_content_hash;
  if v_source_id is null then raise exception 'source_reference_not_found'; end if;
  if not exists (select 1 from proposition_versions where id=p_proposition_version_id) then raise exception 'proposition_version_not_found'; end if;
  select id into v_matrix_id from impact_matrices where proposition_version_id=p_proposition_version_id and methodology_version=p_methodology_version;
  if v_matrix_id is null then
    insert into impact_matrices (proposition_version_id,schema_version,methodology_version,severity,structural_type,review_status,generated_by_ai)
    values (p_proposition_version_id,'1.0.0',p_methodology_version,p_severity,p_structural_type,'pending_review',true) returning id into v_matrix_id;
  end if;
  select id into v_assessment_id from impact_assessments where impact_matrix_id=v_matrix_id and group_slug=p_group_slug;
  if v_assessment_id is null then
    insert into impact_assessments (impact_matrix_id,group_slug,impact_direction,defending_vote,rationale,confidence)
    values (v_matrix_id,p_group_slug,p_impact_direction,p_defending_vote,trim(p_rationale),p_confidence) returning id into v_assessment_id;
  end if;
  insert into impact_assessment_sources (assessment_id,source_reference_id) values (v_assessment_id,v_source_id) on conflict do nothing;
  insert into impact_reviews (impact_matrix_id,assessment_id,reviewer_id,reviewer_type,decision,notes)
  values (v_matrix_id,v_assessment_id,auth.uid(),'revisao_automatizada','needs_changes','Classificação automatizada registrada; revisão humana obrigatória antes de qualquer aprovação/publicação.')
  on conflict do nothing;
  return jsonb_build_object('matrix_id',v_matrix_id,'assessment_id',v_assessment_id,'review_status','pending_review','reviewer_type','revisao_automatizada','remote_apply',true);
end;
$$;
revoke all on function public.record_automated_impact_matrix(uuid,text,integer,text,text,text,text,numeric,text,text) from public;
grant execute on function public.record_automated_impact_matrix(uuid,text,integer,text,text,text,text,numeric,text,text) to authenticated;
