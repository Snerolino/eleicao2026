# Handoff — Fechamento definitivo da Fase 2 e próxima sessão

Data: 2026-08-12
Status: `FASE2_FECHADA_PRODUCAO_VERDE`
Sessão sugerida para retomada: `eleicao2026-pos-fase2-matrizes-reais`

## Resumo executivo

A Fase 2 da Matriz de Impacto Populacional v1 está encerrada e publicada em
produção. O projeto está em `main`, com Cloudflare Pages atualizado, GitHub
Actions verde e produção validada no domínio final.

Após o fechamento da Fase 2, também foi executado o refresh oficial de
candidaturas TSE RS 2026, elevando o snapshot público para 938 candidaturas e
registrando a cobertura real de fotos oficiais/rastreáveis.

## Estado Git / produção

- Branch ativa: `main`
- Commit de produção atual: `3064761`
- Release de produção: `3064761-20260812T160735671Z`
- Domínio final: https://rs.votopraquem.org
- Cloudflare Pages project: `portal-transparencia-rs`
- Último deploy manual validado: `62207c66`
- GitHub Actions `Deploy` do commit `3064761`: verde

## Fase 2 — fechado

Entregas fechadas:

- Contrato operacional público de import legislativo com envelope
  `propositions[]` / `votes[]`.
- Importer dry-run legislativo implementado.
- CLI `npm run impact:dryrun` implementada.
- CLI `npm run impact:sql` implementada.
- Gerador SQL determinístico/offline implementado.
- Resolução de FKs de apoio por catálogo implementada, sem heurística e sem
  fabricar UUID.
- Fixtures e testes do contrato mínimo implementados.
- Migrations da Matriz de Impacto aplicadas no Supabase remoto.
- Grants/RLS públicos corrigidos e validados por REST anon.
- Context export atualizado.
- Produção Cloudflare atualizada e validada.

## Supabase remoto

- Projeto: `eleicao2026`
- Ref público: `hhqxhxcfkoijevxyzfky`
- Migrations aplicadas:
  - `20260810090000_create_legislative_core.sql`
  - `20260810090100_create_impact_taxonomy.sql`
  - `20260810090200_create_impact_matrix.sql`
  - `20260810090300_create_impact_review_workflow.sql`
  - `20260810090400_create_impact_rls_and_approval.sql`
  - `20260812000000_grant_public_read.sql`

Verificação já realizada:

- `beneficiary_groups`: 14 grupos via anon REST.
- `impact_matrices`: `[]` por RLS, esperado enquanto não há matriz aprovada.
- `legislative_propositions`: HTTP 200 `[]`, esperado antes de carga real.
- `approve_impact_matrix`: HTTP 401 para anon, esperado.

## Dados públicos atuais

Fonte oficial TSE RS 2026 atualizada em 2026-08-12:

- Manifesto TSE: 939 registros oficiais.
- Snapshot público: 938 candidaturas.
- Exclusão humana preservada: `FRANCISCO MARQUES NETO`.
- Fotos rastreáveis: 906/938.
  - 879 matches exatos no ZIP oficial TSE 2026 por `SQ_CANDIDATO`.
  - 27 fallbacks conservadores de fonte oficial TSE 2024.
  - 31 sem match.
  - 1 caso ambíguo mantido sem foto.

Relatórios QA relevantes:

- `docs/qa/fotos-candidatos-fontes-oficiais.md`
- `docs/qa/fotos-pendentes-2026-08-12.md`
- `docs/qa/fotos-pendentes-2026-08-12.json`
- `docs/qa/fotos-pendentes-divulgacand-2026-08-12.json`

## Gates verdes finais

Gates locais/produção executados no fechamento:

- `npm run test`: verde.
- `npx tsc --noEmit`: verde.
- `node scripts/validate-impact-schema.mjs`: verde.
- `npm run data:check`: verde, 938 candidaturas / 906 fotos.
- `npm run build`: verde.
- `npm run smoke:local`: verde, 938 cards.
- `npm run smoke:preview -- --url https://rs.votopraquem.org`: verde.
- `npm run health:preview -- --url https://rs.votopraquem.org`: verde,
  `blocks_release=false`, HTTP failures 0.
- GitHub Actions `Deploy`: verde.

## Restrições permanentes

- Não inserir matrizes publicadas sem revisão humana e fontes.
- Não executar escrita remota Supabase, RLS/RPC/Auth/Storage/Edge Functions,
  Cloudflare/DNS/secrets sem autorização humana explícita no arco.
- `service_role` permanece fora do frontend, build, logs e docs.
- Modelos externos baratos só recebem snapshot sanitizado do `HEAD`.
- Um writer por worktree.

## Próxima sessão recomendada

Nome sugerido: `eleicao2026-pos-fase2-matrizes-reais`

Objetivo sugerido:

> Iniciar o arco pós-Fase 2: preparar a primeira carga real de
> proposições/votos e a curadoria dos catálogos reais de FKs para gerar matrizes
> de impacto em `pending_review`, sem publicar nada automaticamente.

Bootstrap da próxima sessão:

1. Ler `AGENTS.md`.
2. Ler `.orchestrator/STATE.md`.
3. Ler este handoff.
4. Rodar:
   - `git status --short --branch`
   - `git rev-parse --short HEAD`
   - `npm run data:check`
5. Se for mexer em matriz real, inspecionar antes:
   - `src/domain/impact/legislative-importer.ts`
   - `src/domain/impact/legislative-sql-generator.ts`
   - `src/domain/impact/legislative-support-resolver.ts`
   - `scripts/import-legislative-dry-run.mjs`
   - `fixtures/legislative-import/`
6. Próximo artefato esperado: um pacote público de proposições/votos + catálogo
   real de apoio, validado em dry-run e SQL, ainda sem `--apply`.

## Fora do escopo já encerrado

Não retomar como pendente:

- Aplicar migrations da Fase 2.
- Corrigir grants base para RLS público.
- Atualizar Cloudflare Pages para o fechamento da Fase 2.
- Atualizar candidatos oficiais TSE para o snapshot atual de 938.
- Investigar existência das 32 fotos pendentes atuais.

Esses pontos estão fechados/documentados no commit `3064761` e neste handoff.
