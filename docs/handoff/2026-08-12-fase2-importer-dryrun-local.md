# Handoff — Fase 2: importer dry-run legislative (local, validado)

Data: 2026-08-12
Status: `done_local_only` (Tasks 1–7 do plano concluídas; sem SQL/migration aplicada)
Branch: `feat/matriz-impacto-populacional-v1` @ `12b3887`

## Resumo de gates
- Tasks 1–5 validadas localmente (912 testes, build ok).
- Codex MCP declarado fora de uso nesta sessão (ver
  `docs/handoff/2026-08-12-codex-mcp-diagnostico-readonly.md`):
  rota Hermes→Codex MCP retorna 401 em `api.openai.com/v1/responses`;
  `CODEX_CHATGPT_AUTH` segue OK, mas `HERMES_OPENAI_CODEX_PROVIDER` falha.
  Implementação local pelo coordenador a partir daqui.
- Nenhuma migration, deploy, commit, push ou alteração remota foi executada.

## Summary

Primeiro chunk da Fase 2 concluído e validado localmente: contrato operacional,
validação/normalização pura e planner dry-run para `propositions[]` e `votes[]`,
mapeando a cadeia `legislative_propositions → proposition_versions →
voting_events → legislative_votes` com referências lógicas (`logical_ref`) e
sem UUIDs, rede ou escrita.

## Findings

- O contrato histórico (`docs/contrato-json-votoemquem.md`) não definia os campos
  de `propositions[]` necessários ao planejamento das quatro tabelas; o envelope
  operacional `1.0.0` fecha essa lacuna de forma aditiva (documentado no mesmo arquivo).
- Votos permanecem somente fato: `DERIVED_VOTE_FIELDS` rejeita
  impact/alignment/score/ideology/recommendation/group/defending_vote dentro de `votes[]`.
- Duplicidades idênticas deduplicam pela chave idempotente; duplicidades com
  conteúdo divergente são rejeitadas.
- `impact_matrix` dentro de uma versão é validado pelo `validateImpactContract` existente.
- Vínculo `legislator_id`/`candidate_id` permanece aberto: `legislator_id` vira
  `logical_ref('legislators', deputy_id)` e `candidate_id: null` no dry-run.

## Evidence

- Testes do importer: 10/10 verdes.
- Suíte completa: 181 arquivos / 898 testes verdes.
- `npx tsc --noEmit` limpo; `node scripts/validate-impact-schema.mjs` OK;
  `npm run data:check` OK (792 candidaturas); `npm run build` OK;
  `git diff --check` OK.
- Nenhuma migration criada/aplicada; nenhum acesso Supabase; nenhum commit/push.

## Files changed (não commitados)

- `src/domain/impact/legislative-importer.ts` (novo, puro)
- `scripts/__tests__/legislative-importer.test.mjs` (novo, 10 testes; inclui diretiva `@vitest-environment node`)
- `scripts/import-legislative-dry-run.mjs` (novo, Task 4 — CLI dry-run)
- `scripts/__tests__/legislative-importer-cli.test.mjs` (novo, Task 4 — 7 testes CLI)
- `package.json` (novo script `impact:dryrun`)
- `fixtures/legislative-import/boa-minima.json` (novo)
- `docs/contrato-json-votoemquem.md` (seção "Envelope operacional do importer local v1")
- `docs/persistencia-score-impacto-v1.md` (novo, Task 5 — desenho de persistência)
- `scripts/__tests__/impact-score-persistence.test.mjs` (novo, Task 5 — 7 testes de contrato)
- `src/domain/impact/legislative-sql-generator.ts` (novo, Task 6 — gerador SQL puro, 6 testes)
- `scripts/__tests__/legislative-sql-generator.test.mjs` (novo, Task 6)
- `scripts/import-legislative-dry-run.mjs` (estendido, Task 7 — `--emit-sql`, 9 testes CLI)
- `scripts/__tests__/legislative-importer-cli.test.mjs` (estendido, Task 7)
- `package.json` (scripts `impact:dryrun`, `impact:sql`)

## Task 4 (CLI) — executada nesta rodada

- `npm run impact:dryrun -- fixtures/legislative-import/boa-minima.json` → plano
  legível (modo DRY-RUN, contagens por tabela, operações), exit 0.
- `--apply` e flags desconhecidas → erro explícito e exit 1 (sem caminho de escrita).
- Determinismo e ausência de UUIDs cobertos por teste.
- Executor: Codex MCP falhou 3× consecutivas (timeout + 2× 401 — auth não chega ao
  processo Hermes que spawna o mcp-server); circuit breaker aberto e Task 4
  implementada localmente pelo coordenador (tarefa mecânica sobre módulo já validado).

## Correção aplicada nesta retomada

- Interrupção anterior (timeout/401 do MCP Codex) deixou os arquivos escritos sem
  validação. O único defeito funcional encontrado: o teste rodava no ambiente
  `jsdom` padrão e quebrava em `node:fs`/`node:path`; adicionada a diretiva
  `// @vitest-environment node` (padrão dos demais testes de script).
- `tsconfig.tsbuildinfo` (cache de build rastreado) foi restaurado ao HEAD para
  manter o diff do chunk limpo.
- Nenhum processo Codex/writer ficou ativo; worktree sem escritores concorrentes.

## Tests

```bash
npx vitest run scripts/__tests__/legislative-importer-cli.test.mjs  # 7 passed
npx vitest run scripts/__tests__/legislative-importer.test.mjs      # 10 passed
npm test                                                             # 905 passed
npx tsc --noEmit                                                     # ok
node scripts/validate-impact-schema.mjs                              # ok
npm run data:check                                                   # ok
npm run build                                                        # ok
git diff --check                                                     # ok
```

## Risks / próximos passos

1. Task 5 concluída como **desenho** (`docs/persistencia-score-impacto-v1.md`):
   tabela conceitual `impact_score_snapshots`, RLS e RPC `recompute_impact_scores`
   propostos; nenhum SQL criado/aplicado — gate humano antes de virar migration.
2. Codex MCP segue fora do ar nesta sessão por auth (401); para usá-lo de novo o
   usuário precisa configurar a chave no ambiente do Hermes (não basta exportar
   no shell). Enquanto isso, coordenador executa tarefas mecânicas localmente.
3. Migrations `20260810090000`–`20260810090400` seguem não aplicadas no remoto
   (gate humano).
4. Próximo passo recomendado: revisão humana do diff local (Tasks 1–5), depois
   commit autorizado e/ou decisão sobre migration de persistência do score.

## Human review required

- Sim, antes de: commit/push/PR, qualquer persistência Supabase, migration remota,
  RLS/RPC, deploy ou merge em `main`.
