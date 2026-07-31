# H4.1 — Autenticação e papéis de editor

Data: 2026-07-31
Guia: Fase 4 — H4.1

## Objetivo

Criar a menor superfície administrativa possível antes de permitir escrita editorial no MVP.

## Implementado

Migration:

- `supabase/migrations/20260730150000_h4_1_editor_roles_rls.sql`

Mudanças principais:

- Autorização centralizada em `public.editor_roles`.
- Funções auxiliares:
  - `public.has_editor_role(uid uuid default auth.uid())`
  - `public.has_admin_role(uid uuid default auth.uid())`
- Nenhuma autorização usa `raw_user_meta_data` ou `user_metadata`.
- Policies explícitas `TO authenticated` para mutações editoriais.
- `UPDATE` editorial usa `USING` e `WITH CHECK`.
- Escrita direta de `anon` bloqueada em:
  - `claims`
  - `source_references`
  - `raw_documents`
  - `editorial_reviews`
  - `editor_roles`
- Leitura pública mínima preservada:
  - `candidates`: pública
  - `claims`: apenas `published`
  - `source_references`: pública
- `raw_documents.raw_content` segue privado; apenas editor/admin autenticado ou service_role.
- Editor não gerencia `editor_roles`; apenas admin.

## Testes locais

- Teste RED/GREEN:
  - `scripts/__tests__/h4-1-editor-rls.test.mjs`
- Correção de estabilidade de teste isolado:
  - `scripts/__tests__/h3-2-upsert-migration.test.mjs` agora usa `// @vitest-environment node`, igual aos demais testes que leem arquivos.

Validações executadas antes da aplicação remota:

```bash
npm run test -- scripts/__tests__/h4-1-editor-rls.test.mjs scripts/__tests__/h3-2-upsert-migration.test.mjs
npm run test -- --passWithNoTests
npx tsc --noEmit
npm run build
```

Também foi feita validação funcional da migration em Postgres 14 descartável com casos anon/autenticado sem papel/editor/admin/service_role.

## Critérios H4.1 cobertos

- Usuário autenticado sem papel não acessa dados editoriais privados.
- Editor não eleva o próprio papel.
- Anon lê apenas candidates, claims publicadas e source_references públicas.
- Matriz de papéis coberta por testes locais e validações remotas.
- Service role preservado para pipelines administrativos.

## Observação de design

A leitura de `claims` para editor foi ampliada para todas as claims. Isso é necessário porque PostgreSQL exige que a linha resultante de um `UPDATE` continue visível pelas policies aplicáveis; caso contrário, editor não conseguiria corrigir/retratar claims publicadas.
