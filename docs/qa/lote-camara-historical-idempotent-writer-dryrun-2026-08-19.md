# QA — writer factual histórico Câmara (2026-08-19)

## Objetivo

Preparar e verificar o writer idempotente do envelope histórico Câmara, mantendo
`dry-run` como padrão e sem promover os 8 registros de identidade bloqueados.

## Entregue e verificado

- Novo comando: `npm run impact:camara:historical:write`.
- Novo writer: `scripts/apply-camara-historical-resolved.mjs`.
- Novo contrato Vitest: `scripts/__tests__/apply-camara-historical-resolved.test.mjs`.
- O contrato valida envelope BR/RS, 7 fontes oficiais, 18 candidatos elegíveis,
  8 identidades bloqueadas e as contagens históricas esperadas.
- O modo padrão não instancia cliente Supabase e planeja:
  - 2 proposições;
  - 6 versões;
  - 6 eventos;
  - 84 votos factuais.
- `--apply` permanece explícito; a escrita só reconcilia as quatro tabelas
  factuais legislativas e exige resolução exata de UUID + hash para as 7 fontes.
- Nenhuma matriz, claim, RPC, editorial ou dado de impacto é tocado.

## Evidência dos gates

Executado com Node `v24.19.0`:

- `npm run orch:doctor -- --smoke`: **FAIL=1, WARN=5**. O único FAIL é a
  comprovação da rota MCP Codex read-only; o fallback Codex exec passou. Warnings:
  OpenCode ausente, Gemini legacy, Ollama sem preflight, worktree modificada e
  configuração `.env` legada `TERMINAL_CWD`.
- `npm run test -- --passWithNoTests`: **78 arquivos / 366 testes**, exit 0.
- `npx tsc --noEmit`: exit 0.
- `node scripts/validate-impact-schema.mjs`: exit 0.
- `npm run data:check`: exit 0; **1003 candidaturas / 988 fotos**.
- `npm run build`: exit 0; sitemap **1003 candidatos + 2 URLs estáticas** e
  `release.json` gerado.
- `git diff --check`: exit 0.
- Dry-run do writer: exit 0; **2/6/6/84**, `remote_apply=false`, zero inserts,
  zero updates, `votes_touched=0`.

## Estado remoto e segurança

Nenhuma escrita Supabase, FK, UUID, source reference, voto, matriz, RPC ou
Cloudflare foi executada neste lote. O `--apply` não foi chamado: a aplicação
remota continua dependente da revalidação read-only de identidade, schema/FK e
catálogo de fontes no mesmo tick de aplicação.

## Bloqueios

- `FED-27-CODEX-MCP-READONLY-SMOKE`: doctor não comprovou a rota MCP Codex,
  embora Codex exec fallback tenha passado; não impediu os gates locais.
- As 8 identidades históricas inelegíveis permanecem fail-closed por contrato e
  não entram no envelope aplicável.

## Publicação deste checkpoint

- Commit: `b9711f2` publicado em `origin/main`.
- A tentativa de disparar manualmente o backup Cloudflare `334951434` falhou
  por `error connecting to api.github.com`.
- Os runs listados mais recentes eram anteriores, `skipped`, com `headSha`
  `683286c...`; não são evidência de deploy deste commit.
- Produção respondeu HTTP 200, mas `/release.json` ainda confirma o SHA anterior
  `683286c2336142f9c0915402e04d312cc71df0f9`, versão `0.2.374` e 1003
  candidaturas. Portanto este checkpoint ainda não está publicado em produção.

## Próximo passo

Revalidar a API GitHub e disparar/confirmar o backup Cloudflare para
`headSha=b9711f2`; depois revalidar, em modo read-only, identidade remota por
`tse_candidate_id`, schema/FK legislativo e os 7 `source_references` por
URL/hash. Somente com todos os gates exatos executar
`npm run impact:camara:historical:write -- --apply`, provar uma segunda execução
idempotente e validar produção.
