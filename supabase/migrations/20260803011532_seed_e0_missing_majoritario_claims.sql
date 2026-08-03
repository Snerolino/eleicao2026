-- Migration: Completar claims E0 dos majoritários como pending_review
-- Data: 2026-08-03
-- Objetivo: deixar 6/6 majoritários com historico_politico + plataforma em fila editorial.
-- Nada é publicado diretamente; publicação exige revisão humana + RPC publish_claim().

with fontes as (
  insert into public.source_references (source_name, source_category, url, title, content_hash)
  values
    (
      'Câmara dos Deputados — Manuela D''Ávila',
      'oficial',
      'https://www.camara.leg.br/deputados/141492',
      'Deputada Federal Manuela D''Ávila',
      'e0-majoritarios-2026-camara-manuela-davila'
    ),
    (
      'Sul21 — Unidade Popular oficializa Priscila Voigt como candidata ao Governo do RS',
      'imprensa',
      'https://sul21.com.br/noticias/politica/2026/07/unidade-popular-oficializa-priscila-voigt-como-candidata-ao-governo-do-rs/',
      'Unidade Popular oficializa Priscila Voigt como candidata ao Governo do RS',
      'p0-majoritarios-2026-sul21-up-convencao'
    ),
    (
      'YouTube — Reconstrução do RS com Paulo Pimenta',
      'outro',
      'https://www.youtube.com/watch?v=OrhIunQncWM',
      'Reconstrução do RS com Paulo Pimenta | Candidato ao Senado',
      'e0-majoritarios-2026-youtube-pimenta-reconstrucao-rs'
    )
  on conflict (content_hash) do update
    set source_name = excluded.source_name,
        source_category = excluded.source_category,
        url = excluded.url,
        title = excluded.title
  returning id, content_hash
), fontes_resolvidas as (
  select id, content_hash from fontes
  union
  select id, content_hash
    from public.source_references
   where content_hash in (
     'e0-majoritarios-2026-camara-manuela-davila',
     'p0-majoritarios-2026-sul21-up-convencao',
     'e0-majoritarios-2026-youtube-pimenta-reconstrucao-rs'
   )
), claims_seed (tse_candidate_id, category, content, confidence_score, source_hash) as (
  values
    (
      '210002533354',
      'plataforma',
      'Como integrante da chapa da UP ao governo do RS, Naf Nascimento está vinculada à campanha que apresentou eixos como defesa dos serviços públicos, reestatização de empresas privatizadas, geração de empregos e defesa de direitos trabalhistas, segundo reportagem do Sul21 sobre a convenção partidária.',
      3,
      'p0-majoritarios-2026-sul21-up-convencao'
    ),
    (
      '210002533581',
      'historico_politico',
      'Manuela D''Ávila é ex-deputada federal pelo Rio Grande do Sul; o perfil da Câmara dos Deputados registra seu nome civil, partido à época, vínculo com o RS e atividades parlamentares disponíveis entre 2007 e 2015. Em 2026, sua candidatura ao Senado foi homologada pela Federação PSOL-Rede no Rio Grande do Sul.',
      4,
      'e0-majoritarios-2026-camara-manuela-davila'
    ),
    (
      '210002533584',
      'plataforma',
      'Em material público de campanha/entrevista identificado como "Reconstrução do RS com Paulo Pimenta", a candidatura de Paulo Pimenta ao Senado é vinculada ao tema da reconstrução do Rio Grande do Sul. A formulação deve ser revisada editorialmente antes de publicação por depender de fonte audiovisual.',
      2,
      'e0-majoritarios-2026-youtube-pimenta-reconstrucao-rs'
    ),
    (
      '210002533435',
      'plataforma',
      'Como candidato ao Senado pela UP, Luciano do MLB integra a chapa cujo partido apresentou, em convenção estadual, eixos como serviços públicos, reestatização de empresas privatizadas, geração de empregos e direitos trabalhistas, conforme reportagem do Sul21.',
      3,
      'p0-majoritarios-2026-sul21-up-convencao'
    ),
    (
      '210002533434',
      'plataforma',
      'Como candidata ao Senado pela UP, Tânia Peres integra a chapa cujo partido apresentou, em convenção estadual, eixos como serviços públicos, reestatização de empresas privatizadas, geração de empregos e direitos trabalhistas, conforme reportagem do Sul21.',
      3,
      'p0-majoritarios-2026-sul21-up-convencao'
    )
)
insert into public.claims (candidate_id, category, content, confidence_score, source_document_id, status)
select c.id,
       cs.category,
       cs.content,
       cs.confidence_score,
       fr.id,
       'pending_review'
  from claims_seed cs
  join public.candidates c on c.tse_candidate_id = cs.tse_candidate_id
  join fontes_resolvidas fr on fr.content_hash = cs.source_hash
 where not exists (
   select 1
     from public.claims existing
    where existing.candidate_id = c.id
      and existing.category = cs.category
      and existing.status in ('pending_review', 'published', 'corrected')
 );
