-- ============================================================================
-- Script de alimentação — Portal Transparência Eleitoral RS
-- Uso: Supabase Dashboard → SQL Editor → colar e executar
-- Instruções: substituir os textos entre {{ }} por dados reais
-- ============================================================================

-- ============================================================================
-- 1. CANDIDATOS
-- ============================================================================
-- position: 'governador' | 'senador' | 'deputado_federal' | 'deputado_estadual'
-- ballot_number: opcional, null se não souber ainda
-- photo_url / photo_source_url: null se não tiver

insert into candidates (full_name, party, ballot_number, position, photo_url, photo_source_url)
values
  ('{{Nome Completo}}', '{{PARTIDO/XX}}', {{10}}, 'governador', null, null);

insert into candidates (full_name, party, ballot_number, position)
values
  ('{{Nome Completo}}', '{{PARTIDO/XX}}', {{100}}, 'senador');

-- Para deputados, são vários — pode inserir em lote:
insert into candidates (full_name, party, ballot_number, position)
values
  ('{{Nome Candidato 1}}', '{{PARTIDO/XX}}', {{1000}}, 'deputado_federal'),
  ('{{Nome Candidato 2}}', '{{PARTIDO/YY}}', {{1001}}, 'deputado_federal');

-- ============================================================================
-- 2. DOCUMENTOS-FONTE (raw_documents)
-- ============================================================================
-- source_category: 'oficial' | 'imprensa' | 'fact_check' | 'outro'
-- content_hash: hash SHA-256 do raw_content (pode gerar online ou usar
--   extensão pgcrypto se disponível). Enquanto não tem, use um placeholder
--   único como 'hash-{{fonte}}-{{data}}'.
-- raw_content: texto COMPLETO coletado da fonte, sem resumo.

insert into raw_documents (source_name, source_category, url, content_hash, raw_content)
values (
  'TSE — DivulgaCandContas',
  'oficial',
  '{{https://divulgacandcontas.tse.jus.br/url-do-candidato}}',
  'hash-tse-{{candidato}}-20260724',
  '{{Texto completo extraído da página do TSE — dados de registro de candidatura, bens declarados, contas de campanha.}}'
);

insert into raw_documents (source_name, source_category, url, content_hash, raw_content)
values (
  '{{Nome do veículo}}',
  'imprensa',
  '{{https://url-da-materia}}',
  'hash-materia-{{assunto}}-{{data}}',
  '{{Texto integral da matéria jornalística.}}'
);

insert into raw_documents (source_name, source_category, url, content_hash, raw_content)
values (
  '{{Aos Fatos / Agência Lupa / Comprova}}',
  'fact_check',
  '{{https://url-da-checagem}}',
  'hash-checagem-{{tema}}-{{data}}',
  '{{Texto integral da checagem de fatos.}}'
);

-- ============================================================================
-- 3. CLAIMS
-- ============================================================================
-- category: 'summary' | 'historico_politico' | 'plataforma' | 'reputacao'
-- confidence_score: calculado deterministicamente —
--   5 = fonte oficial + independente
--   4 = fonte oficial isolada
--   3 = duas ou mais fontes de imprensa concordantes
--   2 = uma fonte de imprensa ou fact-check
--   1 = detectado, não confirmado
-- status: use 'published' para exibir no frontend imediatamente
-- source_document_id: UUID do raw_documents inserido acima
--
-- IMPORTANTE: primeiro rode os inserts de candidates e raw_documents,
-- descubra os UUIDs gerados com:
--   select id, full_name from candidates;
--   select id, source_name from raw_documents;
-- Depois substitua os {{uuid}} abaixo.

-- 3a. SUMMARY (resumo curto que aparece no card da home)
insert into claims (candidate_id, category, content, source_document_id, confidence_score, status)
values (
  '{{uuid-do-candidato}}',
  'summary',
  '{{Resumo de 1-2 frases sobre o candidato, baseado nas fontes consultadas.}}',
  '{{uuid-do-documento-oficial}}',
  4,  -- oficial isolada
  'published'
);

-- 3b. HISTÓRICO POLÍTICO
insert into claims (candidate_id, category, content, source_document_id, confidence_score, status)
values (
  '{{uuid-do-candidato}}',
  'historico_politico',
  '{{Exemplo: "Foi deputado estadual entre 2019 e 2023, eleito pelo PARTIDO/XX."}}',
  '{{uuid-do-documento}}',
  4,
  'published'
);

-- 3c. PLATAFORMA
insert into claims (candidate_id, category, content, source_document_id, confidence_score, status)
values (
  '{{uuid-do-candidato}}',
  'plataforma',
  '{{Exemplo: "Defende reforma tributária com alíquota única, conforme entrevista ao veículo Y."}}',
  '{{uuid-do-documento-de-imprensa}}',
  2,
  'published'
);

-- 3d. REPUTAÇÃO / ESCRUTÍNIO
-- ATENÇÃO: esta categoria é a mais sensível. Considere usar status='pending_review'
-- e só mudar para 'published' após revisão editorial.
insert into claims (candidate_id, category, content, source_document_id, confidence_score, status)
values (
  '{{uuid-do-candidato}}',
  'reputacao',
  '{{Exemplo: "Foi alvo de ação por improbidade administrativa (fonte: TSE). Processo arquivado em 2024."}}',
  '{{uuid-do-documento-oficial}}',
  5,
  'pending_review'  -- não aparece no frontend público até ser aprovado
);

-- ============================================================================
-- 4. CONSULTAS DE VERIFICAÇÃO
-- ============================================================================

-- Ver o que ficou visível no frontend:
-- select c.full_name, cl.category, cl.content, cl.confidence_score, cl.status
-- from claims cl
-- join candidates c on c.id = cl.candidate_id
-- where cl.status = 'published'
-- order by c.full_name, cl.category;

-- Ver claims pendentes de revisão:
-- select c.full_name, cl.category, cl.content, cl.confidence_score
-- from claims cl
-- join candidates c on c.id = cl.candidate_id
-- where cl.status = 'pending_review';

-- === EXEMPLO REAL COMPLETO (preenchido) ===
-- Use este bloco como template: copie, cole, troque os valores entre {{}}.

/*
-- 1. Candidato
insert into candidates (full_name, party, ballot_number, position)
values ('Maria Silva', 'PARTIDO/X', 15, 'deputado_estadual');

-- 2. Documento
insert into raw_documents (source_name, source_category, url, content_hash, raw_content)
values (
  'TSE',
  'oficial',
  'https://divulgacandcontas.tse.jus.br/candidato-123',
  'hash-exemplo-maria-silva-20260724',
  'Registro de candidatura: Maria Silva, PARTIDO/X, deputado estadual, nº 15. Declaração de bens: R$ 0.'
);

-- 3. Claim
insert into claims (candidate_id, category, content, source_document_id, confidence_score, status)
values (
  (select id from candidates where full_name = 'Maria Silva' limit 1),
  'summary',
  'Candidata a deputada estadual pelo PARTIDO/X.',
  (select id from raw_documents where content_hash = 'hash-exemplo-maria-silva-20260724' limit 1),
  4,
  'published'
);
*/
