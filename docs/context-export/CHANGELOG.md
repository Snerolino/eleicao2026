# Changelog do contexto exportado

## 2026-08-30

- Evolução da Matriz de Impacto Populacional para a **Metodologia v1.1**:
  - Taxonomia populacional expandida e fechada em **21 grupos canônicos** (`estudantes`, `trabalhadores_formais`, `servidores_publicos`, `usuarios_sus`, `pessoas_com_ludopatia`, `candidatos_concursos_publicos`, `pescadores_artesanais_comunidades_pesqueiras`).
  - Atribuição em nível de evento implementada com `textual_defending_vote`, `event_defending_vote`, `score_eligible`, `vote_attribution_status` e `score_withholding_reason`.
  - Regra Fail-Closed: votações compostas não separáveis, procedimentais ou de destaques sem binding de dispositivo recebem `score_eligible: false` e não geram score distorcido (`alignment = 'nao_avaliavel'`).
  - Quarentena de 234 matérias inconsistentes isoladas em `data/impact-matrices/quarentena-regressao-gabarito-2026-08-30.json`.
  - Reconstruído o gabarito universal com 69 matérias ativas e auditadas em `data/impact-matrices/gabarito-materias-aprovadas.json`.
  - Migration versionada `20260830110000_evolve_impact_taxonomy_v1_1_and_event_attribution.sql`.
  - Manual de metodologia e guia de uso documentados em `docs/METODOLOGIA-IMPACTO-V1.1.md`.

## 2026-08-27

- Discovery ALRS ampliado para 2019–2026: `43.762` linhas nominais com identidade exata, `36.589` já presentes após importação histórica, `1` conflito isolado e `7.172` proposition_versions ainda sem resolução oficial.

- Documentado e formalizado o workflow autônomo do Hermes (`docs/workflow-autonomo-hermes-autoaprovacao-assessments.md`) com auto-aprovação ininterrupta para matérias com fonte verde e sem necessidade de painel externo, isolando granularmente matérias com `severity >= 4` ou `confidence < 0.60`.
- Formalizadas regras de `defending_vote = 'nao'` para matérias com impacto negativo sobre grupos populacionais, mantendo alinhamento derivado (+1 / -1) e taxonomia fechada de 14 grupos canônicos.

- Migration `20260827090000_import_alrs_nominal_votes_rpc.sql` aplicada no Supabase remoto: RPC factual `import_alrs_nominal_votes(jsonb)` restrita a `authenticated` com papel `editor/admin`, sem `service_role` e sem escrita em impacto/score.
- Reconciliador ALRS corrigido para comparar datas de calendário `DD/MM/YYYY` contra timestamps ISO; os 795 registros antes classificados como faltantes foram confirmados como `already_present_exact`, sem conflitos.
- Resolvida a pendência factual do `VT 599/2023`: versão oficial criada por RPC idempotente e 3 votos nominais importados; reconciliação final sem ambíguos, bloqueios, faltantes ou conflitos.
- Pipeline ALRS acelerado: discovery concorrente, reconciliação Supabase JS paginada, matching oficial multi-campo TSE, harvester de proposições/PDFs com hash e materialização de perfis em chunks paralelos; autorização derivada aplicada por RLS para editor/admin.
- Cinco matérias restantes (`PLC 207/2023`, `PLC 302/2019`, `PLC 360/2023`, `PL 428/2021`, `PL 168/2023`) foram resolvidas por título oficial e seus 160 votos nominais importados; perfil rápido recalculado com 28.839 fatos.
- Assessments editoriais já decididos para `PL 43/2019` (grupo `mulheres`) e `PL 27/2024` (grupo `lgbtqia`) foram registrados via RPC autenticada como `pending_review`, com fonte oficial vinculada e sem aprovação automática.

## 2026-08-23

- Migration `20260823110000_create_editorial_disposition_queue.sql` aplicada no Supabase remoto `eleicao2026`: tabela `impact_editorial_dispositions`, RLS de leitura para editores e RPC protegida `record_impact_editorial_disposition(uuid,text,text,text,text)`.
- `/admin` passou a exibir o pacote ALRS P2 com links das fontes oficiais, disposição humana e justificativa mínima; a fila não publica votos nem matrizes.

## 2026-08-22

- Contrato editorial ALRS refinado: `editorial_disposition` aceita `assess`,
  `no_direct_population_group`, `taxonomy_gap` e `excluded`; somente `assess`
  entra no apply plan.
- Fila de fontes substantivas P1 passou a cobrir 18/18 versões, com uma coleta
  por versão e `requested_for_groups` para preservar múltiplos grupos sem duplicar
  documentos.
- Preparada migration local `20260822120000_harden_impact_approval_and_legislators_rls.sql`:
  caller editor obrigatório na RPC de aprovação, helpers internos sem execução
  pública e RLS explícita para `legislators`. A migration ainda não foi aplicada
  remotamente.

## 2026-08-12

- Fase 2 marcada como fechada em produção no release
  `3064761-20260812T160735671Z`: `main` sincronizada, Cloudflare Pages
  atualizado, GitHub Actions verde, smoke/health de produção verdes e handoff de
  retomada criado em
  `docs/handoff/2026-08-12-fechamento-fase2-proxima-sessao.md`.
- Snapshot público TSE RS 2026 atualizado no mesmo checkpoint operacional:
  manifesto com 939 registros oficiais, 938 candidaturas públicas e 906 fotos
  rastreáveis. Relatórios de fotos pendentes versionados em `docs/qa/`.

- Fase 2 da Matriz de Impacto Populacional v1 concluída na branch
  `feat/matriz-impacto-populacional-v1`: contrato operacional
  `propositions[]`/`votes[]`, importer dry-run, CLI `impact:dryrun`, gerador
  SQL puro e resolução de FKs de apoio por catálogo.
- Migrations `20260810090000` a `20260810090400` aplicadas no Supabase remoto
  `eleicao2026` (`hhqxhxcfkoijevxyzfky`).
- Corrigido bug de RLS sem privilégio base: `20260812000000_grant_public_read.sql`
  concede `SELECT` a `anon/authenticated` nas tabelas publicáveis e ajusta
  default privileges. Verificação REST anon: `beneficiary_groups` retorna 14
  grupos, `impact_matrices` retorna `[]` por RLS, `legislative_propositions`
  retorna HTTP 200 `[]`, e `approve_impact_matrix` retorna HTTP 401 para anon.
- `src/types/supabase.ts` já contém `impact_matrices`, `legislative_propositions`,
  `beneficiary_groups` e RPC `approve_impact_matrix`.

## 2026-08-10

- Fase 0 Matriz de Impacto Populacional v1: contrato/metodologia/governança/JSON Schema definidos em branch feat/matriz-impacto-populacional-v1.
- Fase 1: testes (42) + `src/domain/impact/` (contract, alignment, score, review-gates).
- Migrations 2026081009xxxx criadas e validadas localmente: núcleo legislativo, vocabulário, matriz, revisão e RLS/RPC — schema expandido (ver SCHEMA.md).
- Nenhuma alteração remota; tudo local/na branch.
- Contrato do coletor sincronizado com `20260804081607_claims_collector_idempotency.sql`: `external_id`, `content_hash`, `generated_by_ai`, `prompt_version` e `claims_collector_identity_version_uq`.
- A restauração dessa migration no Git não reaplicou SQL no Supabase remoto.
- As migrations 2026081009xxxx continuam pendentes no remoto; o último `db push --dry-run` listou somente essas cinco.

## 2026-08-04

- Criada a superficie curada `docs/context-export`.
- Exportados os requisitos do Agente Dossies v2 e do build do coletor.
- Documentado o schema atual de `candidates`, `raw_documents`,
  `source_references`, `claims` e workflow editorial.
- Registradas incompatibilidades importantes: `pending_review` e o status real,
  `claims.source_document_id` aponta para `source_references`, e
  `confidence_score` continua obrigatorio.
- Nenhuma credencial ou dado de producao foi incluido.
