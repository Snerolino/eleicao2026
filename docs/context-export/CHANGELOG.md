# Changelog do contexto exportado

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
