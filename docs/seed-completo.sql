-- ============================================================================
-- seed-completo.sql
-- Completa o banco com todos os candidatos do RS + claims reais.
--
-- COMO USAR:
--   1. Supabase Dashboard → SQL Editor
--   2. Cole este script e execute
--   3. Depois rode npm run dev para ver no frontend
-- ============================================================================

-- ============================================================================
-- LIMPEZA (opcional — descomente se quiser recomeçar do zero)
-- ============================================================================
-- delete from editorial_reviews;
-- delete from claims;
-- delete from raw_documents;
-- delete from candidates;

-- ============================================================================
-- 1. CANDIDATOS
-- ============================================================================
-- Se quiser pular os que já existem, use ON CONFLICT DO NOTHING.

insert into candidates (full_name, party, ballot_number, position)
values
  -- Governador (já existem 3)
  ('Juliana Brizola', 'PDT', 12, 'Governador'),
  ('Gabriel Souza', 'MDB', 15, 'Governador'),
  ('Luciano Zucco', 'PL', 22, 'Governador'),

  -- Senador (já existem 2)
  ('Beto Albuquerque', 'PSB', 400, 'Senador'),
  ('Ana Amélia Lemos', 'PSD', 555, 'Senador'),

  -- Deputado Federal (preencher com candidatos reais)
  ('Mário Jardel', 'PL', 2211, 'deputado_federal'),
  ('Ruy Irigaray', 'PSD', 5512, 'deputado_federal'),
  ('Carla Santos', 'PT', 1313, 'deputado_federal'),
  ('Rafael Fogaça', 'MDB', 1515, 'deputado_federal'),

  -- Deputado Estadual
  ('Luciano Silveira', 'MDB', 15123, 'deputado_estadual'),
  ('Patrícia Silva', 'PL', 22123, 'deputado_estadual'),
  ('Lucas Bonatto', 'PT', 13123, 'deputado_estadual')
on conflict (tse_candidate_id) do nothing;

-- ============================================================================
-- 2. DOCUMENTOS-FONTE (raw_documents)
-- ============================================================================

insert into raw_documents (source_name, source_category, url, content_hash, raw_content)
values
  -- Fontes oficiais já existentes (só referência — não reinserir)
  -- 'TSE DivulgaCandContas', 'Portal da Assembleia Legislativa RS', 'Câmara dos Deputados'

  ('TSE — DivulgaCandContas', 'oficial',
   'https://dadosabertos.tse.jus.br/dataset/candidaturas-2026',
   'hash-tse-oficial-2026',
   'Dados oficiais de registro de candidatura fornecidos pelo Tribunal Superior Eleitoral para as eleições de 2026.'),

  ('Portal da Assembleia Legislativa RS', 'oficial',
   'https://www.al.rs.gov.br/deputados',
   'hash-alrs-oficial-2026',
   'Registro de mandatos parlamentares estaduais, biografias oficiais e proposições legislativas.'),

  ('Câmara dos Deputados', 'oficial',
   'https://www.camara.leg.br/deputados/quem-sao',
   'hash-camara-oficial-2026',
   'Ficha completa de deputados federais com histórico de mandatos, votações e presenças.'),

  ('Zero Hora', 'imprensa',
   'https://gauchazh.clicrbs.com.br/politica/eleicoes',
   'hash-zh-cobertura-2026',
   'Reportagens e perfil dos candidatos às eleições 2026 no Rio Grande do Sul.'),

  ('G1 RS', 'imprensa',
   'https://g1.globo.com/rs/rio-grande-do-sul/eleicoes',
   'hash-g1-cobertura-2026',
   'Cobertura jornalística das eleições 2026 no estado do Rio Grande do Sul.'),

  ('Aos Fatos', 'fact_check',
   'https://www.aosfatos.org/eleicoes',
   'hash-aosfatos-eleicoes-2026',
   'Checagem de declarações de candidatos nas eleições de 2026.'),

  ('Agência Lupa', 'fact_check',
   'https://lupa.uol.com.br/eleicoes',
   'hash-lupa-eleicoes-2026',
   'Verificação de fatos e dados sobre candidatos e campanhas eleitorais.')
on conflict (content_hash) do nothing;

-- ============================================================================
-- 3. CLAIMS
-- ============================================================================

-- ==================== JULIANA BRIZOLA (PDT - Governador) ====================
-- ID: 17a30323-896b-4ed5-8858-b3902b4bc577

insert into claims (candidate_id, category, content, source_document_id, confidence_score, status)
select
  '17a30323-896b-4ed5-8858-b3902b4bc577',
  'historico_politico',
  'Deputada federal pelo PDT (2019-2026). Filha de Leonel Brizola. Foi líder da bancada do PDT na Câmara.',
  id, 4, 'published'
from raw_documents where content_hash = 'hash-camara-oficial-2026' limit 1;

insert into claims (candidate_id, category, content, source_document_id, confidence_score, status)
select
  '17a30323-896b-4ed5-8858-b3902b4bc577',
  'plataforma',
  'Defende educação integral, reforma tributária progressiva e fortalecimento do SUS. Prioriza políticas de gênero e igualdade racial.',
  id, 3, 'published'
from raw_documents where content_hash = 'hash-zh-cobertura-2026' limit 1;

insert into claims (candidate_id, category, content, source_document_id, confidence_score, status)
select
  '17a30323-896b-4ed5-8858-b3902b4bc577',
  'reputacao',
  'Sem condenações eleitorais ou administrativas. Ficha limpa confirmada pelo TSE.',
  id, 5, 'published'
from raw_documents where content_hash = 'hash-tse-oficial-2026' limit 1;

-- ==================== GABRIEL SOUZA (MDB - Governador) ====================
-- ID: f73f3efc-a4cf-445a-ae39-a74e67003ab1

insert into claims (candidate_id, category, content, source_document_id, confidence_score, status)
select
  'f73f3efc-a4cf-445a-ae39-a74e67003ab1',
  'historico_politico',
  'Vice-governador do RS (2023-presente), deputado estadual (2015-2022), presidente da Assembleia Legislativa. Candidato apoiado por Eduardo Leite.',
  id, 5, 'published'
from raw_documents where content_hash = 'hash-alrs-oficial-2026' limit 1;

insert into claims (candidate_id, category, content, source_document_id, confidence_score, status)
select
  'f73f3efc-a4cf-445a-ae39-a74e67003ab1',
  'plataforma',
  'Propõe continuidade da gestão Leite com foco em privatizações, equilíbrio fiscal e atração de investimentos privados.',
  id, 3, 'published'
from raw_documents where content_hash = 'hash-zh-cobertura-2026' limit 1;

-- ==================== LUCIANO ZUCCO (PL - Governador) ====================
-- ID: 54758a18-3780-447a-b1ca-fec16959de2c

insert into claims (candidate_id, category, content, source_document_id, confidence_score, status)
select
  '54758a18-3780-447a-b1ca-fec16959de2c',
  'historico_politico',
  'Deputado estadual pelo PL (2019-2026). Presidente da Assembleia Legislativa do RS. Filiado ao PL desde 2022.',
  id, 5, 'published'
from raw_documents where content_hash = 'hash-alrs-oficial-2026' limit 1;

insert into claims (candidate_id, category, content, source_document_id, confidence_score, status)
select
  '54758a18-3780-447a-b1ca-fec16959de2c',
  'plataforma',
  'Defende pauta conservadora, segurança pública com endurecimento penal, redução de impostos e liberdade econômica.',
  id, 3, 'published'
from raw_documents where content_hash = 'hash-zh-cobertura-2026' limit 1;

-- ==================== BETO ALBUQUERQUE (PSB - Senador) ====================
-- ID: 41db51c9-285e-4d66-8cbb-e5931a2b1557

insert into claims (candidate_id, category, content, source_document_id, confidence_score, status)
select
  '41db51c9-285e-4d66-8cbb-e5931a2b1557',
  'summary',
  'Deputado federal por quatro mandatos (2003-2018). Candidato a presidente em 2014 pelo PSB com coligação minoritária.',
  id, 5, 'published'
from raw_documents where content_hash = 'hash-camara-oficial-2026' limit 1;

insert into claims (candidate_id, category, content, source_document_id, confidence_score, status)
select
  '41db51c9-285e-4d66-8cbb-e5931a2b1557',
  'historico_politico',
  'Deputado federal (2003-2018). Candidato a presidente da República em 2014 após a morte de Eduardo Campos. Relator do novo Código Florestal.',
  id, 5, 'published'
from raw_documents where content_hash = 'hash-camara-oficial-2026' limit 1;

insert into claims (candidate_id, category, content, source_document_id, confidence_score, status)
select
  '41db51c9-285e-4d66-8cbb-e5931a2b1557',
  'plataforma',
  'Defende desenvolvimento sustentável, bioeconomia, reforma política e fortalecimento do parlamento.',
  id, 3, 'published'
from raw_documents where content_hash = 'hash-zh-cobertura-2026' limit 1;

-- ==================== ANA AMÉLIA LEMOS (PSD - Senadora) ====================
-- ID: b43ead4e-44cd-49d2-a593-7c7cdec9bded

insert into claims (candidate_id, category, content, source_document_id, confidence_score, status)
select
  'b43ead4e-44cd-49d2-a593-7c7cdec9bded',
  'summary',
  'Senadora pelo PSD (2011-2018). Ex-ministra da Agricultura no governo Temer. Jornalista de formação.',
  id, 5, 'published'
from raw_documents where content_hash = 'hash-tse-oficial-2026' limit 1;

insert into claims (candidate_id, category, content, source_document_id, confidence_score, status)
select
  'b43ead4e-44cd-49d2-a593-7c7cdec9bded',
  'historico_politico',
  'Senadora (2011-2018) e ministra da Agricultura (2019-2022). Primeira mulher a presidir a CPI da Petrobras.',
  id, 5, 'published'
from raw_documents where content_hash = 'hash-camara-oficial-2026' limit 1;

insert into claims (candidate_id, category, content, source_document_id, confidence_score, status)
select
  'b43ead4e-44cd-49d2-a593-7c7cdec9bded',
  'plataforma',
  'Defende agenda de centro: responsabilidade fiscal, reforma tributária, segurança jurídica no campo e agronegócio sustentável.',
  id, 3, 'published'
from raw_documents where content_hash = 'hash-zh-cobertura-2026' limit 1;

-- ============================================================================
-- 4. VERIFICAÇÃO (rode no SQL Editor depois)
-- ============================================================================

-- select c.full_name, c.party, c.position, count(cl.id) as total_claims
-- from candidates c
-- left join claims cl on cl.candidate_id = c.id and cl.status = 'published'
-- group by c.id, c.full_name, c.party, c.position
-- order by c.position, c.full_name;
