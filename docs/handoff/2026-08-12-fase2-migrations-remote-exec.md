# Handoff — Aplicação remota das migrations Fase 1 (gate vermelho)

Data: 2026-08-12
Status: `PRONTO_PARA_EXECUCAO_REMOTA` — bundle validado localmente; aplicação remota pendente de infra

## O que foi validado localmente (sem remoto)
- 5 migrations em ordem de dependência correta:
  1. `20260810090000_create_legislative_core.sql`
  2. `20260810090100_create_impact_taxonomy.sql`
  3. `20260810090200_create_impact_matrix.sql`
  4. `20260810090300_create_impact_review_workflow.sql`
  5. `20260810090400_create_impact_rls_and_approval.sql`
- `public.has_editor_role(uuid)` existe (migration `20260730150000_h4_1_editor_roles_rls.sql`) — usada pela RLS final.
- `source_references` existe (migration `20260728000000`) — FK de `impact_assessment_sources` / `impact_contestations`.
- Todas declaradas `PG14 compatible`.
- Bundle concatenado: `supabase/bundles/fase1-impacto-20260810090000-20260810090400.sql` (508 linhas).

## O que NÃO pôde ser feito nesta sessão (bloqueio de infra, não de lógica)
- Supabase CLI não instalado no ambiente (`which supabase` → ausente).
- Projeto não vinculado (`.supabase/config.toml` ou link remoto ausente).
- Sem `SUPABASE_ACCESS_TOKEN` / `DB_URL` / project-ref no shell do Hermes.
- `supabase login` é OAuth interativo — não pode ser executado pelo agente sem token do usuário.
- Sem DB Postgres local para `psql --check` sintático.

## Pré-requisitos para aplicação remota (ações do usuário/tese)
1. Instalar Supabase CLI: `npm i -g supabase` (ou pacote do sistema).
2. `supabase login` (precisa do teu token/PAT — não solicitado pelo agente).
3. `supabase link --project-ref <PROJECT_REF>` na raiz do repo.
4. Confirmar `SUPABASE_DB_URL` / `SUPABASE_URL` no ambiente Hermes se quiser execução via agente.

## Comando de aplicação (após pré-requisitos)
```bash
supabase db push \
  --include-all \
  --dry-run   # primeiro, para revisar o diff contra o remoto
# se o diff estiver correto:
supabase db push --include-all
```
Ou, via Dashboard SQL do projeto, colar o conteúdo de:
`supabase/bundles/fase1-impacto-20260810090000-20260810090400.sql`
em uma transação única.

## Pós-aplicação (verificação)
- `supabase migration list` deve mostrar as 5 migrations como applied.
- `psql "$SUPABASE_DB_URL" -c "select count(*) from beneficiary_groups;"` → 14.
- `psql "$SUPABASE_DB_URL" -c "select to_regclass('public.approve_impact_matrix');"` → não nulo.
- RLS: anon consegue `select` em `legislative_votes` mas NÃO em `impact_reviews`.

## Invariantes
- Nenhuma migration destas altera `candidates`, `claims` ou `raw_documents`.
- `legislative_votes` continua sem coluna de impact/alinhamento/score.
- RPC `approve_impact_matrix` revogada de anon/public; só `authenticated` + editor.
- Nenhum dado de exemplo (seed) de votos ou matrizes é inserido por estas migrations.

## Autorização
Usuário autorizou a aplicação remota ("autorizado, continue") em 2026-08-12.
O caminho técnico (CLI+login+link) ficou pendente de infra fornecida pelo usuário.
Agente NÃO criou/rotacionou secrets, NÃO fez login OAuth, NÃO alterou RLS remota por conta própria.
