# STATE — eleicao2026

Atualizado: 2026-08-10 21:15 -03
Status: `ORCHESTRATOR_V1_FINAL_REVIEW_HARDENED_RETEST_PENDING`

> Checkpoint operacional. Ao retomar, revalide Git, ambiente e somente os serviços necessários.

## Git

- Repositório: `Snerolino/eleicao2026`.
- Produção permanece na `main`.
- Feature funcional: `feat/matriz-impacto-populacional-v1`.
- Base atual da feature após #71/#72: `da2f00cf0d55c351e3d19093941088e9da894b19`.
- Branch da arquitetura: `chore/hermes-orchestrator-v1`.
- PR `#70`: ready for review, ainda sem merge; integrar somente por **squash** após gate final.
- PR `#71`: merged por squash; restaurou `20260804081607_claims_collector_idempotency.sql` sem executar SQL remoto.
- PR `#72`: merged por squash; sincronizou contrato/tipos de `claims`, inclusive retornos RPC.
- Antes do hardening final, o diff do #70 continuava restrito a 33 arquivos de orquestração/config/docs, sem `src/`, migrations, workflow de deploy ou lockfile.

## Aplicação / dados

- Regressão consolidada anterior: 180 arquivos / 888 testes verdes, TypeScript verde, build verde.
- Snapshot público: 792 candidaturas + 792 fotos; sitemap 794 URLs; PWA gerada.
- Impact schema checkpoint verde.
- Fases 0–1 da Matriz de Impacto concluídas localmente.
- `20260810090000` a `20260810090400` continuam **não aplicadas** no Supabase remoto.
- Último `supabase db push --dry-run` listou somente essas cinco como pendentes.
- Nenhum `db push` real ou `migration repair` executado neste arco.

## Hermes / executores

Último reteste local anterior ao review final:

```text
bash -n scripts/orchestrator/*.sh  -> sem erro
npm run orch:doctor -- --smoke    -> OK=48 WARN=2 FAIL=0
```

Validados anteriormente:

- Hermes profile `eleicao2026`, Node shell/gateway 24.19.0, Codex MCP ponta a ponta;
- OpenCode/DeepSeek e Antigravity com smoke semântico de `AGENTS.md`;
- Codex exec fallback estruturado;
- `TERMINAL_ENV` legado removido.

Warnings esperados anteriores: Gemini legacy e Ollama sem `gpt-oss:20b`.

## Review final do Codex em `747f530`

O review final encontrou sete gaps legítimos e bloqueou o merge:

1. `.env.example` ainda entrava fisicamente no `git archive` dos leitores.
2. snapshots de nome fixo podiam ser recriados enquanto um reader ainda os usava.
3. `agy`/`opencode` opcionais eram tratados como FAIL no doctor durante setup gradual.
4. agente `build` do OpenCode herdava DeepSeek Free na worktree viva.
5. doctor aceitava skill Hermes instalada porém desatualizada.
6. Antigravity aceitava `permissions.allow: read_file(*)` amplo.
7. validação do gateway checava presença do diretório Node no PATH, não o binário efetivamente resolvido.

## Hardening aplicado após o review final

- `prepare-snapshot.sh` remove fisicamente todos os `.env*`, `data/tse-archive` e `supabase/.temp` antes de devolver o snapshot; continua rejeitando path traversal e symlinks.
- Wrappers OpenCode, Antigravity, Gemini legacy e fallback local seguram o mesmo `flock` do snapshot por toda a execução; outra preparação com o mesmo nome não pode apagar o workspace em uso.
- `configure-antigravity-readonly.sh` e `run-antigravity.sh` rejeitam permissões `read_file(...)` com wildcard amplo.
- `opencode.jsonc`: `build` fica sem ferramentas (`permission.* = deny`); OpenCode deixa de ser writer na worktree viva. Codex MCP permanece writer técnico.
- `doctor.sh`: `agy` e `opencode` ausentes viram WARN; smoke é pulado quando executor opcional não existe.
- `doctor.sh`: snapshot só passa se não houver nenhum `.env*` nem dados brutos proibidos.
- `doctor.sh`: skill instalada é comparada byte a byte com a versão Git; cópia stale vira FAIL com instrução de reinstalação.
- `doctor.sh`: policy Antigravity broad vira FAIL.
- `sync-gateway-node.sh` coloca o Node 24 do projeto no início do PATH e valida o Node efetivo usando o ambiente real do processo systemd em `/proc/<pid>/environ`.
- `doctor.sh` faz a mesma validação efetiva do Node do gateway.

## Gate atual

O código do hardening final foi versionado, mas **ainda precisa do reteste local curto no workstation real**, pois envolve Hermes, systemd, Antigravity e OpenCode locais:

```bash
bash -n scripts/orchestrator/*.sh
npm run orch:install-skill
npm run orch:sync-gateway-node
npm run orch:doctor -- --smoke
```

Critério para liberar novo Codex re-review e squash do #70:

- `bash -n` sem saída/erro;
- skill sincronizada;
- gateway resolve efetivamente Node 24;
- snapshot reporta remoção de `.env*`/dados brutos;
- policy Antigravity estreita;
- smokes dos executores disponíveis passam;
- `FAIL=0`.

Não repetir os 888 testes localmente só por este hardening; o workflow do PR cobre a regressão da aplicação novamente.

## Próximo passo após gate verde

1. CI do head atual verde.
2. Reteste local acima com `FAIL=0`.
3. Solicitar novo `@codex review` no head atual.
4. Resolver threads anteriores quando confirmadas corrigidas.
5. Sob a autorização humana já concedida para este arco, fazer **squash-merge do #70 na feature**, nunca em `main`.
6. Atualizar worktree local da feature e iniciar Hermes por `.orchestrator/BOOTSTRAP_PROMPT.md`.
7. Retomar Fase 2 da Matriz, mantendo migrations remotas bloqueadas.

## Gates permanentes

- Um writer por worktree.
- Modelos externos econômicos: somente snapshot sanitizado, nunca secrets/PII/raw docs.
- Sem merge em `main`, deploy de produção, migration remota, alteração RLS/RPC/Auth/Storage ou secrets sem autorização humana explícita própria.
