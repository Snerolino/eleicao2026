# H4.2 — Aprovação transacional de claims

Data: 2026-07-31
Guia: Fase 4 — H4.2

## Objetivo

Garantir que nenhuma claim seja publicada sem fonte pública, revisão aprovada e histórico auditável.

## Implementado

Migration:

- `supabase/migrations/20260730170000_h4_2_claims_workflow.sql`

Funções transacionais:

- `public.publish_claim(p_claim_id uuid)`
- `public.correct_claim(p_claim_id uuid, p_content text, p_notes text default null)`
- `public.retract_claim(p_claim_id uuid, p_notes text default null)`

Funções auxiliares:

- `public.claim_has_approved_review(p_claim_id uuid)`
- `public.assert_editorial_actor()`

Regras principais:

- Publicação exige claim em `pending_review`.
- Publicação exige `candidate_id`.
- Publicação exige `source_document_id` apontando para `public.source_references`.
- Publicação exige review `approved` por usuário que ainda tenha papel editor/admin em `editor_roles`.
- `published_at` é preenchido pela função transacional.
- Correção cria nova claim pública com `status='corrected'` e `previous_version_id` apontando para a claim original.
- Retração altera a claim pública para `status='retracted'` e registra auditoria em `editorial_reviews`.
- Nenhuma função apaga histórico de `claims`.
- Funções não são executáveis por `public`/`anon`; apenas `authenticated` e `service_role` recebem `EXECUTE` nas funções públicas de workflow.

## Superfície pública

A política pública de `claims` agora expõe apenas:

- `published`
- `corrected`

`draft`, `pending_review` e `retracted` ficam fora da leitura pública.

Frontend ajustado:

- `src/utils/claims.ts` mantém `published` e `corrected`.
- `src/services/candidates.ts` busca `status in ('published', 'corrected')`.

Script editorial:

- `scripts/editorial-workflow.mjs` deixou de fazer `PATCH` direto em `claims` para publicar.
- Publicação/correção/retração agora usam RPCs transacionais:
  - `/rpc/publish_claim`
  - `/rpc/correct_claim`
  - `/rpc/retract_claim`

## Testes

Novos testes:

- `scripts/__tests__/h4-2-claims-workflow.test.mjs`
- `scripts/__tests__/editorial-workflow.test.mjs`
- `src/utils/__tests__/claims.test.ts`

Testes atualizados:

- `src/services/__tests__/candidates.test.ts`
- `src/utils/__tests__/election.test.ts`

Validações locais:

```bash
npm run test -- --passWithNoTests
npx tsc --noEmit
npm run build
```

Validações remotas Supabase:

- Migration aplicada: `20260730170000`.
- Funções existem no schema `public`.
- Publicação sem review falha com `claim_approved_review_required`.
- Publicação sem fonte falha com `claim_source_reference_required`.
- Fluxo com editor autorizado em transação rollback:
  - `publish_claim` → `published`
  - `correct_claim` → `corrected` com `previous_version_id`
  - `retract_claim` → `retracted`
  - auditoria em `editorial_reviews`
- RPCs chamadas com anon key retornam `401`.

## Observações

- O primeiro ciclo editorial real ainda depende de um editor humano responsável por decidir conteúdo/fonte/revisão. A infraestrutura de segurança e auditoria está pronta.
- O teste remoto funcional foi executado em transações com `rollback`; nenhum dado H4.2 de teste foi persistido.
