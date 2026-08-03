-- Migration: Seed P0 editorial majoritários como pending_review
-- Data: 2026-08-02
-- Objetivo: inserir fontes públicas e rascunhos editoriais mínimos sem publicar direto.
-- Publicação continua exigindo editorial_reviews aprovado + RPC publish_claim().

with fontes as (
  insert into public.source_references (source_name, source_category, url, title, content_hash)
  values
    (
      'Sul21 — Unidade Popular oficializa Priscila Voigt como candidata ao Governo do RS',
      'imprensa',
      'https://sul21.com.br/noticias/politica/2026/07/unidade-popular-oficializa-priscila-voigt-como-candidata-ao-governo-do-rs/',
      'Unidade Popular oficializa Priscila Voigt como candidata ao Governo do RS',
      'p0-majoritarios-2026-sul21-up-convencao'
    ),
    (
      'Revista Movimento — PSOL oficializa candidaturas no RS',
      'imprensa',
      'https://movimentorevista.com.br/2026/07/psol-oficializa-candidaturas-e-mira-ampliacao-de-bancadas/',
      'PSOL oficializa candidaturas no RS e mira ampliação de bancadas',
      'p0-majoritarios-2026-movimento-psol-convencao'
    ),
    (
      'Câmara dos Deputados — Paulo Pimenta',
      'oficial',
      'https://www.camara.leg.br/deputados/74400',
      'Deputado Federal Paulo Pimenta',
      'p0-majoritarios-2026-camara-paulo-pimenta'
    ),
    (
      'GZH — Quem é Luciano do MLB',
      'imprensa',
      'https://gauchazh.clicrbs.com.br/politica/eleicoes/noticia/2024/08/quem-e-luciano-do-mlb-candidato-da-up-a-prefeito-de-porto-alegre-cm0541w8u00wr015ijgupk6n2.html',
      'Quem é Luciano do MLB, candidato da UP a prefeito de Porto Alegre',
      'p0-majoritarios-2026-gzh-luciano-2024'
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
     'p0-majoritarios-2026-sul21-up-convencao',
     'p0-majoritarios-2026-movimento-psol-convencao',
     'p0-majoritarios-2026-camara-paulo-pimenta',
     'p0-majoritarios-2026-gzh-luciano-2024'
   )
), claims_seed (tse_candidate_id, category, content, confidence_score, source_hash) as (
  values
    (
      '210002533355',
      'historico_politico',
      'Priscila Voigt é nutricionista, preside a Unidade Popular no Rio Grande do Sul e integra a direção nacional do partido. Segundo o Sul21, sua trajetória inclui atuação em movimentos populares, na Ocupação Lanceiros Negros e na Casa de Referência Mulheres Mirabal; em 2022, foi candidata a deputada federal pela UP.',
      4,
      'p0-majoritarios-2026-sul21-up-convencao'
    ),
    (
      '210002533355',
      'plataforma',
      'Na convenção estadual da UP, Priscila Voigt defendeu como eixos de campanha a valorização dos serviços públicos, a reestatização de empresas privatizadas, geração de empregos e defesa dos direitos trabalhistas, conforme reportagem do Sul21.',
      4,
      'p0-majoritarios-2026-sul21-up-convencao'
    ),
    (
      '210002533354',
      'historico_politico',
      'Naf Nascimento compõe a chapa majoritária da Unidade Popular como candidata a vice-governadora ao lado de Priscila Voigt, conforme a convenção estadual noticiada pelo Sul21 e o registro de candidatura no TSE.',
      4,
      'p0-majoritarios-2026-sul21-up-convencao'
    ),
    (
      '210002533581',
      'plataforma',
      'Na convenção da Federação PSOL-Rede, Manuela D''Ávila defendeu a ampliação da bancada federal do PSOL gaúcho e vinculou sua candidatura ao Senado a uma estratégia de fortalecimento da representação do partido no Congresso e na Assembleia Legislativa.',
      4,
      'p0-majoritarios-2026-movimento-psol-convencao'
    ),
    (
      '210002533584',
      'historico_politico',
      'Paulo Pimenta é deputado federal pelo PT do Rio Grande do Sul. Em 2026, o perfil da Câmara dos Deputados registra atuação parlamentar com propostas de autoria, votações nominais, discursos, presença em plenário e cargos de liderança/vice-liderança.',
      5,
      'p0-majoritarios-2026-camara-paulo-pimenta'
    ),
    (
      '210002533435',
      'historico_politico',
      'Luciano Schafer, conhecido como Luciano do MLB, é militante do Movimento de Luta nos Bairros, Vilas e Favelas e foi candidato a prefeito de Porto Alegre pela UP em 2024, segundo perfil publicado pela GZH; em 2026, foi oficializado pela UP como candidato ao Senado no RS.',
      4,
      'p0-majoritarios-2026-gzh-luciano-2024'
    ),
    (
      '210002533434',
      'historico_politico',
      'Tânia Peres é candidata ao Senado pela UP no Rio Grande do Sul e integra a nominata majoritária oficializada em convenção estadual da Unidade Popular, conforme reportagem do Sul21.',
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
      and existing.content = cs.content
 );
