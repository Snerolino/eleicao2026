-- Migration: Evolução da Taxonomia de Impacto para v1.1 e Atribuição em Nível de Evento
-- Data: 2026-08-30
-- Suporte aos 21 grupos canônicos e aos campos de atribuibilidade do voto (score_eligible, event_defending_vote)
-- PG14 compatible.

-- ============================================================================
-- 1. Novos Grupos Populacionais Canônicos da Taxonomia v1.1
-- ============================================================================
insert into beneficiary_groups (slug, label_pt, description) values
  ('estudantes', 'Estudantes', 'Pessoas diretamente afetadas por acesso, permanência, transporte, bolsas, infraestrutura ou regras educacionais'),
  ('trabalhadores_formais', 'Trabalhadores Formais', 'Empregados e categorias profissionais com vínculo formal diretamente afetados em jornada, remuneração, proteção laboral ou qualificação'),
  ('servidores_publicos', 'Servidores Públicos', 'Servidores civis e militares, magistério público e carreiras estatais diretamente afetados em remuneração, carreira, direitos ou condições funcionais'),
  ('usuarios_sus', 'Usuários do SUS', 'Pessoas diretamente afetadas por acesso, cobertura, atendimento, medicamentos, exames ou serviços do SUS ou rede pública de saúde'),
  ('pessoas_com_ludopatia', 'Pessoas com Ludopatia', 'Pessoas com transtorno do jogo, jogo problemático ou dependência de apostas diretamente destinatárias de prevenção, tratamento ou proteção'),
  ('candidatos_concursos_publicos', 'Candidatos a Concursos Públicos', 'Pessoas inscritas, aprovadas, classificadas ou em cadastro reserva de concursos públicos com direitos ou expectativas diretamente alterados'),
  ('pescadores_artesanais_comunidades_pesqueiras', 'Pescadores Artesanais e Comunidades Pesqueiras', 'Pescadores artesanais e comunidades cuja subsistência e atividade econômica dependem diretamente da pesca artesanal')
on conflict (slug) do nothing;

-- ============================================================================
-- 2. Aliases Históricos / Variantes para Mapeamento Seguro
-- ============================================================================
insert into beneficiary_group_aliases (alias, group_slug) values
  ('educacao_estudantes', 'estudantes'),
  ('saude_usuarios_sus', 'usuarios_sus'),
  ('agricultores_familiares', 'agricultura_familiar_sem_terra'),
  ('pescadores_artesanais', 'pescadores_artesanais_comunidades_pesqueiras'),
  ('profissionais_enfermagem', 'trabalhadores_formais')
on conflict (alias) do nothing;

-- ============================================================================
-- 3. Extensão das Tabelas de Impacto para Atribuição em Nível de Evento
-- ============================================================================
alter table impact_assessments
  add column if not exists textual_defending_vote text check (textual_defending_vote is null or textual_defending_vote in ('sim', 'nao')),
  add column if not exists event_defending_vote text check (event_defending_vote is null or event_defending_vote in ('sim', 'nao')),
  add column if not exists score_eligible boolean not null default true,
  add column if not exists vote_attribution_status text not null default 'isolated'
    check (vote_attribution_status in ('isolated', 'compound_separable', 'compound_non_separable', 'procedural', 'event_binding_missing')),
  add column if not exists score_withholding_reason text;

comment on column impact_assessments.textual_defending_vote is 'Sentido do voto que defende a posição do grupo segundo o texto normativo puro';
comment on column impact_assessments.event_defending_vote is 'Sentido do voto no evento concreto; null se a votação for composta não separável ou procedimental';
comment on column impact_assessments.score_eligible is 'Indica se a avaliação é elegível a pontuação no perfil do parlamentar (false para votos compostos não separáveis, procedimentais ou gaps)';
comment on column impact_assessments.vote_attribution_status is 'Classificação de atribuibilidade do evento de votação';
comment on column impact_assessments.score_withholding_reason is 'Justificativa para retenção de score quando score_eligible for false';

-- ============================================================================
-- 4. Atualização da Validação de Defending Vote
-- ============================================================================
create or replace function public.impact_assessment_defending_ok()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  -- Se a avaliação não for elegível a score ou for composta não separável, defending_vote pode ser nulo
  if new.score_eligible = false or new.vote_attribution_status = 'compound_non_separable' or new.event_defending_vote is null then
    return new;
  end if;

  if new.impact_direction in ('positive','negative') and new.defending_vote is null then
    raise exception 'defending_vote_required_for_direction' using errcode = '23514';
  end if;
  if new.impact_direction = 'unclear' and new.defending_vote is not null then
    raise exception 'defending_vote_must_be_null_for_unclear' using errcode = '23514';
  end if;
  return new;
end;
$$;
