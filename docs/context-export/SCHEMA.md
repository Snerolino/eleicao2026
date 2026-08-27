# Contrato de schema para o coletor de candidatos

Fotografia em: 2026-08-12 (Fase 2 da Matriz de Impacto Populacional v1 fechada em produção)

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

- Campos: `id`, `candidate_id`, `category`, `content`, `external_id`,
  `content_hash`, `generated_by_ai`, `prompt_version`, `source_document_id`,
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
- `external_id` e o identificador estavel do fato no coletor.
- `content_hash` guarda o SHA-256 do conteudo canonico para idempotencia.
- `generated_by_ai` e booleano obrigatorio com default `false`.
- `prompt_version` registra a versao do contrato/prompt que gerou a claim.
- O indice unico `claims_collector_identity_version_uq` protege
  (`candidate_id`, `category`, `external_id`, `content_hash`).
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

## Tabelas de impacto (Fase 2 fechada; schema remoto aplicado)

Novas tabelas da Matriz de Impacto Populacional v1 (todas com RLS habilitado):

- `legislative_propositions` — identidade logica da proposicao (`house`, `number`, `year`, `external_id` unico por casa).
- `proposition_versions` — texto votado imutavel (`version_key`, `text_hash`, `effective_from`; unico por proposicao+versao).
- `voting_events` — evento de votacao ligado a versao votada.
- `legislative_votes` — SOMENTE fato: `value` (`sim|nao|abstencao|ausente|obstrucao`) e `absence_type` condicionado (`sim/nao/abstencao` → null; `ausente/obstrucao` → `estrategica|obstrucao_coordenada|justificada`). Nunca armazena impacto/alinhamento/grupo/score.
- RPC `import_alrs_nominal_votes(jsonb)` — escrita factual idempotente somente para `authenticated` com `editor_roles`; aceita apenas `candidate_id`, `proposition_version_id`, valor normalizado, data e URL/hash oficial. Não cria matriz, assessment ou score; `anon` não executa.
- `beneficiary_groups` — catalogo versionado (14 slugs v1). Slugs nunca renomeados; evolucao via `deprecated_at` + `replacement_slug`. `geral` nao e grupo pontuavel.
- `beneficiary_group_aliases` — variantes de grafia.
- `impact_matrices` — matriz por `proposition_version_id` + `methodology_version` (unico); `severity` 1..5; `structural_type` (`structural|budgetary|symbolic`); `review_status` (`rascunho|pending_review|approved|contested`). A disposição editorial ocorre antes da matriz: `assess`, `no_direct_population_group`, `taxonomy_gap` ou `excluded`; somente `assess` pode gerar matriz.
- `impact_assessments` — por grupo: `defending_vote` (`sim|nao`), `impact_direction` (`positive|negative|mixed|unclear`), `rationale` (>= 20 chars), `confidence` (0..1]; unico por matriz+grupo. Trigger garante: positive/negative → defending_vote obrigatorio; unclear → null.
- `impact_assessment_sources` — ligacao N:N assessment ↔ `source_references`.
- `impact_reviews` — revisao propria da matriz (`curadoria_interna|painel_externo`; `approved|rejected|needs_changes`).
- `impact_contestations` — contestacao publica (`open|under_review|resolved|rejected`); justificativa original nunca apagada.
- `impact_editorial_dispositions` — fila de triagem humana anterior à matriz, única por `proposition_version_id` + `methodology_version`; `disposition` (`assess|no_direct_population_group|taxonomy_gap|excluded`), justificativa mínima de 20 caracteres, revisor autenticado e status editorial.

RPC `approve_impact_matrix(uuid)` — aprovação transacional que exige caller com `editor_roles` e:
1. matriz em `pending_review`;
2. assessment valido com fontes e confidence na faixa;
3. defending_vote conforme metodologia;
4. revisao interna aprovada de editor (`has_editor_role`);
5. severity >= 4 OU qualquer confidence < 0.6 → revisao externa (`painel_externo`) aprovada;
6. sem contestacao bloqueante (`open|under_review`).
Aprovado → `review_status='approved'` + `approved_at=now()`.

Helpers internos: `impact_matrix_has_internal_approval`, `impact_matrix_has_external_approval`, `impact_matrix_has_blocking_contestation`, `impact_assessment_defending_ok` (trigger). Os três helpers de consulta não devem ter `EXECUTE` público; a migration local de hardening ainda aguarda aplicação remota.

RLS: publico le somente `approved|contested` de matriz/assessments/fontes; `impact_reviews` so editores; `impact_contestations` publico le `open|under_review|resolved`. Grants: leitura anon/authenticated concedida nas tabelas publicaveis; `approve_impact_matrix` somente `authenticated` (revogado de `anon`). Correção remota `20260812000000_grant_public_read.sql` aplicada após erro 42501 por policy sem GRANT base.

Importer Fase 2 fechado:

- `src/domain/impact/legislative-importer.ts` valida e normaliza envelope publico com `propositions[]`/`votes[]`.
- `scripts/import-legislative-dry-run.mjs` expõe `npm run impact:dryrun` e `npm run impact:sql`; `--apply` permanece bloqueado.
- `src/domain/impact/legislative-sql-generator.ts` gera SQL deterministico sem rede; FKs principais resolvem por subselect de chaves naturais.
- `src/domain/impact/legislative-support-resolver.ts` resolve FKs de apoio via catálogo (`legislators`/`candidates`/`source_references`) sem heurística e sem fabricar UUID.
- `fixtures/legislative-import/boa-minima.json` e `catalogo-exemplo.json` cobrem o contrato minimo.

Estado operacional em produção no fechamento:

- Migrations `20260810090000` a `20260810090400` aplicadas no Supabase remoto `eleicao2026` (`hhqxhxcfkoijevxyzfky`).
- Migration `20260812000000_grant_public_read.sql` aplicada para corrigir privilégio base sob RLS.
- Prova REST anon: `beneficiary_groups` retorna 14 grupos; `impact_matrices` retorna `[]` por RLS; `legislative_propositions` retorna HTTP 200 `[]`; `approve_impact_matrix` retorna HTTP 401 para anon.
- Produção Cloudflare validada no release `3064761-20260812T160735671Z`.

## RLS e credenciais

- `candidates`: leitura publica dos dados basicos.
- `claims`: publico ve somente estados publicos; editores veem a fila completa.
- `raw_documents`: privado.
- `source_references`: metadados publicos, sem conteudo bruto.
- `service_role` nunca entra no frontend, em arquivos exportados ou em logs.
- Uma migration do coletor deve preservar RLS e grants; nao criar caminho anonimo
  para dados pendentes.

## Pontos ainda em aberto (pós-Fase 2)

- Estrutura da fila/jobs por candidato; nao existe tabela dedicada no contrato
  resumido acima.
- Aplicar SQL de votos/proposicoes reais via service_role a partir de arquivo
  publico validado pelo dry-run; ainda nao ha carga real versionada neste repo.
- Catálogo real para resolver `legislator_id`/`candidate_id` e `source_references`
  deve ser curado antes de qualquer carga real.
- Persistir o score calculado por parlamentar (funcao pura pronta em
  `src/domain/impact/score.ts`; ainda sem tabela/RPC de persistencia).

Nao criar migration para esses pontos antes da revisao humana.
