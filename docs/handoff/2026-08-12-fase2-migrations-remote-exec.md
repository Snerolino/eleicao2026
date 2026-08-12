# Handoff — Aplicação remota das migrations Fase 1 (gate vermelho) — CONCLUÍDO

Data: 2026-08-12
Status: `APLICADO_E_VERIFICADO` — migrations no remoto, grants corrigidos, prova funcional via REST anon

## Pré-requisitos atendidos (pelo usuário)
- Supabase CLI instalado (`supabase --version` → 2.113.0)
- `supabase login` realizado e projeto `eleicao2026` LINKED
  (reference id `hhqxhxcfkoijevxyzfky`, região São Paulo)
- Tokens em `.env.local` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)

## Sequência executada
1. `supabase db push --include-all --dry-run` → 5 migrations listadas (ordem OK)
2. `supabase db push --include-all` → 5 migrations aplicadas:
   - 20260810090000_create_legislative_core
   - 20260810090100_create_impact_taxonomy
   - 20260810090200_create_impact_matrix
   - 20260810090300_create_impact_review_workflow
   - 20260810090400_create_impact_rls_and_approval
3. `supabase migration list` → todas as 5 na coluna **Remote** ✔
4. Verificação REST anon revelou bug: `42501 permission denied` em todas as
   tabelas novas (RLS + policy sem GRANT base de SELECT ao role `anon`).
5. Criada + aplicada `20260812000000_grant_public_read.sql` (GRANT SELECT ao
   anon/authenticated + DEFAULT PRIVILEGES).
6. Corrigida também a migration original `20260810090400` (adicionados os
   mesmos GRANTs) para coerência de futuros ambientes.

## Prova funcional (REST anon, sem segredos)
- `GET /rest/v1/beneficiary_groups` → **14 grupos** (policy public_read OK)
- `GET /rest/v1/impact_matrices` → `[]` (RLS approved/contested, vazio correto)
- `GET /rest/v1/legislative_propositions` → HTTP 200 `[]` (acessível)
- `POST /rest/v1/rpc/approve_impact_matrix` → **HTTP 401 anon** (revogada de anon, só authenticated) ✔

## Invariantes preservados
- Nenhuma migration altera `candidates`, `claims` ou `raw_documents`.
- `legislative_votes` continua sem coluna de impact/alinhamento/score.
- `approve_impact_matrix` revogada de anon/public; só `authenticated`.
- Nenhum dado de exemplo (seed) de votos/matrizes inserido.
- `.env.local` NÃO foi lido nem commitado (bloqueio de segredo).

## Arquivos locais
- `supabase/migrations/20260812000000_grant_public_read.sql` (nova, aplicada)
- `supabase/migrations/20260810090400_...sql` (editada: +GRANTs, já aplicada)
- `supabase/bundles/fase1-impacto-20260810090000-20260810090400.sql` (bundle)

## Pendente
- Push dos commits locais para `origin` (aguarda autorização de push).
- Novo ambiente (local dev) deve rodar `supabase db push` para sincronizar
  as migrations já presentes no remoto.
