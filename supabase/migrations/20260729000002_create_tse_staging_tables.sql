-- Migration: 20260729_create_tse_staging_tables
-- Tabelas privadas de staging para ingestão TSE 2026

create table if not exists tse_candidates_staging (
  id bigserial primary key,
  sq_candidato text not null,
  dt_geracao date,
  hh_geracao time,
  ano_eleicao int not null,
  cd_tipo_eleicao int,
  nm_tipo_eleicao text,
  nr_turno int,
  cd_eleicao int,
  ds_eleicao text,
  dt_eleicao date,
  tp_abrangencia text,
  sg_uf text not null,
  sg_ue text,
  nm_ue text,
  cd_cargo int,
  ds_cargo text,
  nr_candidato int,
  nm_candidato text,
  nm_urna_candidato text,
  nm_social_candidato text,
  nr_cpf_candidato text,
  ds_email text,
  cd_situacao_candidatura int,
  ds_situacao_candidatura text,
  tp_agremiacao text,
  nr_partido int,
  sg_partido text,
  nm_partido text,
  nr_federacao int,
  nm_federacao text,
  sg_federacao text,
  ds_composicao_federacao text,
  sq_coligacao bigint,
  nm_coligacao text,
  ds_composicao_coligacao text,
  sg_uf_nascimento text,
  dt_nascimento date,
  nr_titulo_eleitoral_candidato text,
  cd_genero int,
  ds_genero text,
  cd_grau_instrucao int,
  ds_grau_instrucao text,
  cd_estado_civil int,
  ds_estado_civil text,
  cd_cor_raca int,
  ds_cor_raca text,
  cd_ocupacao int,
  ds_ocupacao text,
  cd_sit_tot_turno int,
  ds_sit_tot_turno text,
  source_file text not null,
  source_dataset_hash text,
  raw_hash text,
  imported_at timestamptz not null default now(),
  unique (sq_candidato, source_file, raw_hash)
);

create index if not exists idx_tse_candidates_staging_sq on tse_candidates_staging(sq_candidato);
create index if not exists idx_tse_candidates_staging_uf on tse_candidates_staging(sg_uf);
create index if not exists idx_tse_candidates_staging_uf_cargo on tse_candidates_staging(sg_uf, cd_cargo);

create table if not exists tse_candidates_complementar_staging (
  id bigserial primary key,
  dt_geracao date,
  hh_geracao time,
  ano_eleicao int not null,
  cd_eleicao int,
  sq_candidato text not null,
  cd_detalhe_situacao_cand int,
  ds_detalhe_situacao_cand text,
  cd_nacionalidade int,
  ds_nacionalidade text,
  cd_municipio_nascimento int,
  nm_municipio_nascimento text,
  nr_idade_data_posse int,
  st_quilombola boolean,
  cd_etnia_indigena int,
  ds_etnia_indigena text,
  vr_despesa_max_campanha numeric,
  st_reeleicao boolean,
  st_declarar_bens boolean,
  nr_protocolo_candidatura text,
  nr_processo text,
  cd_situacao_candidato_pleito int,
  ds_situacao_candidato_pleito text,
  cd_situacao_candidato_urna int,
  ds_situacao_candidato_urna text,
  st_candidato_inserido_urna boolean,
  nm_tipo_destinacao_votos text,
  cd_situacao_candidato_tot int,
  ds_situacao_candidato_tot text,
  st_prest_contas boolean,
  st_substituido boolean,
  sq_substituido text,
  sq_ordem_suplencia int,
  dt_aceite_candidatura date,
  cd_situacao_julgamento int,
  ds_situacao_julgamento text,
  cd_situacao_julgamento_pleito int,
  ds_situacao_julgamento_pleito text,
  cd_situacao_julgamento_urna int,
  ds_situacao_julgamento_urna text,
  cd_situacao_cassacao int,
  ds_situacao_cassacao text,
  cd_situacao_cassacao_midia int,
  ds_situacao_cassacao_midia text,
  cd_situacao_diploma int,
  ds_situacao_diploma text,
  cd_genero_fefc int,
  ds_genero_fefc text,
  cd_cor_raca_fefc int,
  ds_cor_raca_fefc text,
  source_file text not null,
  imported_at timestamptz not null default now(),
  unique (sq_candidato, source_file)
);

create index if not exists idx_tse_candidates_complementar_sq on tse_candidates_complementar_staging(sq_candidato);

create table if not exists tse_coligacoes_staging (
  id bigserial primary key,
  dt_geracao date,
  hh_geracao time,
  ano_eleicao int not null,
  cd_tipo_eleicao int,
  nm_tipo_eleicao text,
  nr_turno int,
  cd_eleicao int,
  ds_eleicao text,
  dt_eleicao date,
  sg_uf text not null,
  sg_ue text,
  nm_ue text,
  cd_cargo int,
  ds_cargo text,
  tp_agremiacao text,
  nr_partido int,
  sg_partido text,
  nm_partido text,
  nr_federacao int,
  nm_federacao text,
  sg_federacao text,
  ds_composicao_federacao text,
  sq_coligacao bigint,
  nm_coligacao text,
  ds_composicao_coligacao text,
  cd_situacao_legenda int,
  ds_situacao text,
  nm_tipo_destinacao_votos text,
  source_file text not null,
  imported_at timestamptz not null default now()
);

create index if not exists idx_tse_coligacoes_staging_uf_cargo on tse_coligacoes_staging(sg_uf, cd_cargo);
create unique index if not exists uq_tse_coligacoes_staging_dedup
  on tse_coligacoes_staging ((coalesce(sq_coligacao, -1)), sg_uf, (coalesce(cd_cargo, -1)), source_file);

create table if not exists tse_vagas_staging (
  id bigserial primary key,
  dt_geracao date,
  hh_geracao time,
  ano_eleicao int not null,
  cd_tipo_eleicao int,
  nm_tipo_eleicao text,
  nr_turno int,
  cd_eleicao int,
  ds_eleicao text,
  dt_eleicao date,
  tp_abrangencia text,
  sg_uf text not null,
  sg_ue text,
  nm_ue text,
  cd_cargo int,
  ds_cargo text,
  qt_vagas int,
  source_file text not null,
  imported_at timestamptz not null default now()
);

create index if not exists idx_tse_vagas_staging_uf_cargo on tse_vagas_staging(sg_uf, cd_cargo);
create unique index if not exists uq_tse_vagas_staging_dedup
  on tse_vagas_staging (sg_uf, (coalesce(sg_ue, '')), (coalesce(cd_cargo, -1)), source_file);

create or replace view tse_candidates_for_upsert as
with latest_candidates as (
  select distinct on (sq_candidato)
    sq_candidato,
    nm_candidato as full_name,
    nm_urna_candidato as ballot_name,
    sg_partido as party,
    nr_candidato as ballot_number,
    case
      when lower(coalesce(ds_cargo, '')) = 'governador' then 'governador'
      when lower(coalesce(ds_cargo, '')) = 'vice-governador' then 'vice_governador'
      when lower(coalesce(ds_cargo, '')) = 'senador' then 'senador'
      when lower(coalesce(ds_cargo, '')) = 'deputado federal' then 'deputado_federal'
      when lower(coalesce(ds_cargo, '')) in ('deputado estadual', 'deputado distrital') then 'deputado_estadual'
      when lower(coalesce(ds_cargo, '')) = 'presidente' then 'presidente'
      else lower(regexp_replace(coalesce(ds_cargo, ''), '\s+', '_', 'g'))
    end as position,
    sg_uf as state,
    nullif(ds_composicao_federacao, '#NULO') as federation,
    nullif(nm_coligacao, '#NULO') as coalition,
    sq_candidato as tse_candidate_id,
    imported_at,
    case
      when lower(coalesce(ds_situacao_candidatura, '')) like '%deferido%' then 'approved'
      when lower(coalesce(ds_situacao_candidatura, '')) like '%indeferido%' then 'denied'
      when lower(coalesce(ds_situacao_candidatura, '')) like '%renuncia%' then 'withdrawn'
      when lower(coalesce(ds_situacao_candidatura, '')) like '%renúncia%' then 'withdrawn'
      when lower(coalesce(ds_situacao_candidatura, '')) like '%substitu%' then 'replaced'
      when lower(coalesce(ds_situacao_candidatura, '')) like '%cancel%' then 'cancelled'
      when lower(coalesce(ds_situacao_candidatura, '')) like '%recurso%' then 'appeal_pending'
      when lower(coalesce(ds_situacao_candidatura, '')) like '%registr%' then 'registered'
      else 'registration_requested'
    end as registration_status
  from tse_candidates_staging
  where sq_candidato is not null
  order by sq_candidato, imported_at desc, id desc
)
select * from latest_candidates;

comment on view tse_candidates_for_upsert is 'Última versão dos candidatos importados do TSE, pronta para futura RPC de upsert.';