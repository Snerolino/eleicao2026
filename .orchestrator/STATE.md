# STATE — eleicao2026

Atualizado: 2026-08-11 02:34 -03
Status: `ORCHESTRATOR_V1_MCP_E2E_RETEST_PENDING`

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
- O diff do #70 permanece restrito a 33 arquivos de orquestração/config/docs, sem `src/`, migrations, workflow de deploy ou lockfile.

## Aplicação / dados

- Regressão consolidada: 180 arquivos / 888 testes verdes, TypeScript verde, build verde.
- Snapshot público: 792 candidaturas + 792 fotos; sitemap 794 URLs; PWA gerada.
- Impact schema checkpoint verde.
- Fases 0–1 da Matriz de Impacto concluídas localmente.
- `20260810090000` a `20260810090400` continuam **não aplicadas** no Supabase remoto.
- Último `supabase db push --dry-run` listou somente essas cinco como pendentes.
- Nenhum `db push` real ou `migration repair` executado neste arco.

## Hermes / executores — BASE LOCAL VERDE

Reteste local concluído no workstation real antes da adição do smoke E2E automático, em Node `v24.19.0`:

```text
bash -n scripts/orchestrator/*.sh  -> sem erro
npm run orch:doctor -- --smoke    -> OK=48 WARN=3 FAIL=0
```

Comprovado nesse reteste:

- Node do shell `v24.19.0`;
- Hermes profile `eleicao2026` existe;
- skill `eleicao2026-orchestrator` instalada e byte-a-byte sincronizada com o Git;
- Codex MCP registrado no perfil e `codex mcp-server` disponível por stdio;
- gateway Hermes resolve efetivamente o mesmo Node 24 pelo ambiente real do processo systemd;
- snapshot rejeita path traversal/symlinks e remove `.env*`/dados brutos;
- policy Antigravity restrita ao snapshot;
- OpenCode/DeepSeek leu semanticamente `AGENTS.md`;
- Antigravity/Google leu semanticamente `AGENTS.md`;
- Codex exec fallback retornou saída estruturada;
- `TERMINAL_ENV` legado ausente.

Warnings não bloqueantes observados:

1. Gemini CLI é rota legacy/API-key; Google AI Pro usa `agy`.
2. worktree local ainda possuía resíduos tracked do arco #72, mas readers enxergam somente o HEAD sanitizado.
3. Ollama está instalado sem `gpt-oss:20b`; fallback local opcional permanece desabilitado.

## Hardening consolidado do PR #70

- HOME hardcoded removido; resolução usa real home com override explícito.
- Snapshots removem fisicamente `.env*`, `data/tse-archive` e `supabase/.temp`.
- Snapshots rejeitam path traversal e symlinks rastreados.
- Wrappers seguram `flock` do snapshot por toda a execução para impedir corrida/recriação concorrente.
- OpenCode/DeepSeek Free fica consultivo/read-only sobre snapshot; build não tem ferramentas na worktree viva.
- Antigravity usa snapshot sanitizado, `--add-dir`, custom reader, plan/sandbox e rejeita qualquer `read_file(...)` externo ao snapshot.
- Prompt enviado ao Google não inclui caminho absoluto/identidade local.
- Skill Hermes ausente ou stale vira FAIL e instalador usa `HERMES_REAL_HOME` resolvido.
- Runbook instala a skill versionada logo após criar/configurar o perfil e antes de usar o doctor como gate.
- Perfil Hermes ausente vira FAIL.
- Codex MCP ausente ou `codex mcp-server` incapaz de iniciar vira FAIL, pois é a rota writer obrigatória.
- `doctor --smoke` exercita a rota **Hermes → MCP Codex** e valida no `state.db` da sessão uma `tool_call` pertencente ao servidor `codex`, os argumentos estruturados dessa chamada com `sandbox == "read-only"`, e o resultado ligado à mesma `tool_call_id` contendo o título real de `AGENTS.md`; não confia em texto/marker produzido pelo modelo.
- `doctor` não instala CLIs durante diagnóstico: Supabase/Wrangler só são executados se já estiverem instalados globalmente ou em `node_modules/.bin`.
- Arquivos temporários do doctor usam diretório exclusivo criado com `mktemp` e removido no `trap`, evitando paths previsíveis em `/tmp`.
- `agy` e `opencode` ausentes continuam WARN por serem executores consultivos opcionais.
- Gateway valida o binário Node efetivamente resolvido pelo processo systemd, não apenas presença de diretório no PATH.
- Doctor exige prova semântica dos readers e verifica tracked + untracked da worktree.

## CI / review

- CI remoto dos heads anteriores ficou verde em data check, preflight, TypeScript, testes, build e browser smoke; job de deploy de produção ficou `skipped`.
- Threads anteriores foram resolvidos após as correções correspondentes.
- O review de `c2c35df` encontrou três P2 válidos: exercitar a rota MCP configurada; não baixar CLIs com `npx --yes` durante diagnóstico; usar temporários seguros.
- O review de `f16c726` apontou corretamente que texto/marker do modelo não era evidência suficiente; o gate foi trocado por inspeção estruturada da sessão persistida pelo Hermes.
- O review de `a2355de` apontou corretamente que a prova estruturada ainda não verificava o sandbox da chamada; o parser agora exige `sandbox == "read-only"` na tool call Codex e associa o resultado pela mesma `tool_call_id`.

## Gate atual

Como o último hardening alterou novamente a validação E2E real Hermes → Codex MCP dentro de `doctor --smoke`, há uma mudança material de runtime desde o reteste `OK=48 WARN=3 FAIL=0`.

Não repetir a regressão de 888 testes localmente. O único reteste local necessário, **depois de sincronizar a branch com o head remoto final**, é:

```bash
bash -n scripts/orchestrator/*.sh
npm run orch:doctor -- --smoke
```

Critério: `FAIL=0` e linha `OK Hermes -> Codex MCP comprovado por tool_call read-only + resultado estruturados`.

## Próximo passo após gate verde

1. Confirmar CI do head final verde.
2. Confirmar re-review do Codex sem novo achado material.
3. Sincronizar a worktree local com o head remoto e executar o reteste curto acima.
4. Sob a autorização humana já concedida para este arco, fazer **squash-merge do #70 na feature**, nunca em `main`.
5. Atualizar worktree local da feature e iniciar Hermes por `.orchestrator/BOOTSTRAP_PROMPT.md`.
6. Retomar Fase 2 da Matriz, mantendo migrations remotas bloqueadas.

## Gates permanentes

- Um writer por worktree.
- Modelos externos econômicos: somente snapshot sanitizado, nunca secrets/PII/raw docs.
- Sem merge em `main`, deploy de produção, migration remota, alteração RLS/RPC/Auth/Storage ou secrets sem autorização humana explícita própria.
