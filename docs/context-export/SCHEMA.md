# Contrato de schema para o coletor de candidatos

Fotografia em: 2026-08-04

Fontes: migrations versionadas em `supabase/migrations` e tipos gerados em
`src/types/supabase.ts`. Este resumo nao contem credenciais nem dados de producao.

## `candidates`

- PK: `id uuid`.
- Identificador TSE: `tse_candidate_id text unique`; corresponde a
  `SQ_CANDIDATO`.
- Campos obrigatorios centrais: `full_name`, `party`, `position` e
  `election_year`.
- `position` usa: `presidente`, `governador`, `vice_governador`, `senador`,
  `deputado_federal`, `deputado_estadual` ou `outro`.
- `registration_status` usa: `pre_candidate`, `registration_requested`,
  `registered`, `approved`, `denied`, `appeal_pending`, `withdrawn`, `replaced`
  ou `cancelled`.
- `review_status` da candidatura usa: `pending`, `under_review`, `approved`,
  `rejected` ou `needs_correction`. Ele nao e o status editorial de uma claim.
- A RPC de importacao TSE e restrita a `service_role` e faz upsert por
  `tse_candidate_id`.

## `raw_documents`

- Guarda conteudo bruto privado e reprocessavel.
- Campos: `id`, `source_name`, `source_category`, `url`, `content_hash`,
  `raw_content`, `fetched_at`.
- `content_hash` e unico.
- `source_category` e fechado: `oficial`, `imprensa`, `fact_check` ou `outro`.
- TSE, DataJud/CNJ e outros orgaos publicos devem usar `oficial`; a natureza mais
  especifica da fonte deve ficar em metadado do payload/claim, nao em um novo
  valor desta constraint sem migration.
- RLS: sem leitura anonima do bruto. Editor autenticado pode ler/inserir;
  `service_role` conserva operacao administrativa.

## `source_references`

- E a contraparte publica de metadados de fonte, sem `raw_content`.
- Campos: `id`, `source_name`, `source_category`, `url`, `title`, `published_at`,
  `fetched_at`, `content_hash`.
- `content_hash` e unico e `source_category` usa os mesmos quatro valores.
- Leitura publica habilitada; escrita administrativa/editorial continua
  controlada por grants e RLS.
- Ao persistir uma fonte para claim, o pipeline deve manter o bruto privado e
  criar/associar a referencia publica apropriada. Nao exponha `raw_content`.

## `claims`

- Campos: `id`, `candidate_id`, `category`, `content`, `source_document_id`,
  `source_char_offset`, `confidence_score`, `status`, `previous_version_id`,
  `created_at`, `published_at`.
- `category` e texto livre. O valor proposto para este coletor deve ser aprovado
  na Fase 0; nao ha enum de banco impedindo `historico_candidato`.
- `status` e fechado: `draft`, `pending_review`, `published`, `corrected` ou
  `retracted`.
- O requisito `pending_human_review` deve ser mapeado para o valor implementado
  `pending_review`, salvo migration futura aprovada.
- `source_document_id` referencia `source_references.id`, apesar do nome legado.
  Ele nao referencia mais `raw_documents.id`.
- `confidence_score` e obrigatorio, inteiro de 1 a 5. Ele representa confianca
  editorial/evidencia e nunca pode virar nota, ranking ou recomendacao de
  candidato. A Fase 0 deve definir o mapeamento a partir dos niveis A/B/C.
- `previous_version_id` referencia `claims.id` e suporta cadeia de versoes.
- Claim publica exige candidato, referencia publica de fonte e `published_at`.
- Leitura anonima inclui apenas `published` e `corrected`; `retracted` nao e
  publica.
- Insercao/atualizacao direta e restrita a editor autenticado ou `service_role`.
  Publicacao deve passar por revisao aprovada e pela RPC `publish_claim`.

## Workflow editorial

- O estado de entrada atualmente aceito e `pending_review`.
- `editorial_reviews.decision`: `approved`, `rejected` ou `needs_changes`.
- `publish_claim` exige claim pendente, candidato, `source_references` valida e
  revisao humana aprovada.
- `correct_claim` cria nova versao e liga `previous_version_id`.
- `retract_claim` muda a claim publica para `retracted`.
- O coletor nao chama as RPCs de publicacao, correcao ou retracao.

## RLS e credenciais

- `candidates`: leitura publica dos dados basicos.
- `claims`: publico ve somente estados publicos; editores veem a fila completa.
- `raw_documents`: privado.
- `source_references`: metadados publicos, sem conteudo bruto.
- `service_role` nunca entra no frontend, em arquivos exportados ou em logs.
- Uma migration do coletor deve preservar RLS e grants; nao criar caminho anonimo
  para dados pendentes.

## Pontos que a Fase 0 ainda precisa decidir

- Estrutura da fila/jobs por candidato; nao existe tabela dedicada no contrato
  resumido acima.
- Categoria final das claims de historico.
- Mapeamento A/B/C para `confidence_score` 1..5 sem produzir score de candidato.
- Estrategia idempotente para versoes identicas por `sq_candidato` e
  `id_registro`, pois `claims` ainda nao tem `id_registro` dedicado.
- Representacao pesquisavel do JSON do dossie: hoje `claims.content` e `text`.
- Vinculo atomico entre cada bruto privado e sua `source_references` publica.

Nao criar migration para esses pontos antes da revisao humana da Fase 0.
