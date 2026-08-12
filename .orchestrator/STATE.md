# STATE — eleicao2026

Atualizado: 2026-08-11 21:40 -03
Status: `ORCHESTRATOR_V1_FINAL_REVIEW_PENDING`

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

## Hermes / executores — GATE LOCAL FINAL VERDE

Reteste final do runtime concluído no workstation real com Node `v24.19.0`, após atualizar a branch até `5dccef8` e com a alteração do `doctor.sh` que foi imediatamente commitada como `0ed71d8` já presente na worktree:

```text
ORCH_EXECUTOR_TIMEOUT=60 npm run orch:doctor -- --smoke
OK=50 WARN=4 FAIL=0
```

O diff local testado de `doctor.sh` foi commitado sem alteração adicional em `0ed71d8df7716e1255cdfd94c9c46fa45e8c89d5` (`fix(orchestrator): tornar smoke MCP deterministico`). Portanto, os bytes de runtime exercitados no smoke correspondem ao runtime do commit final.

Comprovado nesse reteste:

- Node do shell `v24.19.0`;
- Hermes profile `eleicao2026` existe no real home;
- skill `eleicao2026-orchestrator` instalada e byte-a-byte sincronizada com o Git;
- Codex MCP registrado no perfil e `codex mcp-server` disponível por stdio;
- gateway Hermes resolve efetivamente o mesmo Node 24 pelo ambiente real do processo systemd;
- snapshot rejeita path traversal/symlinks, remove `.env*`/dados brutos e aplica barreira fail-closed para material secreto plausível;
- policy Antigravity restrita ao snapshot;
- Hermes → Codex MCP comprovado por probe nonce efêmero: `tool_search`/`tool_describe`, chamada `mcp__codex__codex`, `sandbox == "read-only"`, resultado associado à mesma `tool_call_id` e nonce retornado pelo Codex;
- o nonce não aparece no prompt, eliminando o falso verde por memória/contexto do Hermes;
- OpenCode/DeepSeek leu semanticamente `AGENTS.md`;
- Antigravity/Google leu semanticamente `AGENTS.md`;
- Codex exec fallback retornou saída estruturada;
- `TERMINAL_ENV` legado ausente.

Warnings não bloqueantes desse reteste:

1. Gemini CLI é rota legacy/API-key; Google AI Pro usa `agy`.
2. worktree aparecia suja porque o patch determinístico do `doctor.sh` estava sendo validado antes do commit `0ed71d8`; o patch foi commitado sem mudança adicional.
3. Supabase CLI não estava instalada localmente fora de `npx`; o doctor deliberadamente não baixa pacote remoto durante diagnóstico.
4. Ollama não respondeu ao preflight no prazo; fallback local opcional permaneceu desabilitado.

## Hardening consolidado do PR #70

- HOME hardcoded removido; resolução usa real home com override explícito.
- Snapshots removem fisicamente `.env*`, `data/tse-archive`, `supabase/.temp` e utilitários legados conhecidos com credencial rastreada.
- Snapshot aplica varredura fail-closed para formatos plausíveis de credenciais, incluindo headers `Authorization: Bearer`, shell/env e chaves estruturadas JSON/YAML, sem imprimir o segredo detectado.
- Snapshots rejeitam path traversal e symlinks rastreados.
- Wrappers seguram `flock` do snapshot por toda a execução para impedir corrida/recriação concorrente.
- OpenCode/DeepSeek Free fica consultivo/read-only sobre snapshot; build não tem ferramentas na worktree viva.
- Antigravity usa snapshot sanitizado, `--add-dir`, custom reader, plan/sandbox e rejeita qualquer `read_file(...)` externo ao snapshot.
- Prompt enviado ao Google não inclui caminho absoluto/identidade local.
- Wrappers de executores e timeouts internos críticos usam `TERM` seguido de hard kill após grace period; processos suspensos não podem mais deixar o smoke preso indefinidamente.
- Skill Hermes ausente ou stale vira FAIL e instalador usa `HERMES_REAL_HOME` resolvido.
- Runbook instala a skill versionada logo após criar/configurar o perfil e antes de usar o doctor como gate.
- Perfil Hermes ausente vira FAIL.
- Checks `profile show`, `config check` e `mcp list` usam `HOME="$REAL_HOME"` de forma consistente.
- Codex MCP ausente ou `codex mcp-server` incapaz de iniciar vira FAIL, pois é a rota writer obrigatória.
- `doctor --smoke` exercita a rota **Hermes → MCP Codex** com nonce efêmero desconhecido do Hermes e valida no `state.db` uma `tool_call` do servidor `codex`, `sandbox == "read-only"`, resultado ligado à mesma `tool_call_id` e nonce retornado; não confia em texto/marker produzido pelo modelo nem em conteúdo já conhecido como `AGENTS.md`.
- O parser reconhece o envelope real do Hermes (`tool_call` externo com ferramenta MCP interna) e associa o resultado pelo `tool_call_id`, sem exigir que o `tool_name` externo repita o nome MCP já validado.
- `doctor` não instala CLIs durante diagnóstico: Supabase/Wrangler só são executados se já estiverem instalados globalmente ou em `node_modules/.bin`.
- Arquivos temporários do doctor usam diretório exclusivo criado com `mktemp` e removido no `trap`, evitando paths previsíveis em `/tmp`.
- `agy` e `opencode` ausentes continuam WARN por serem executores consultivos opcionais.
- Gateway valida o binário Node efetivamente resolvido pelo processo systemd, não apenas presença de diretório no PATH.
- Doctor exige prova semântica dos readers e verifica tracked + untracked da worktree.

## CI / review

- CI remoto do commit runtime final `0ed71d8df7716e1255cdfd94c9c46fa45e8c89d5` ficou verde em data check, preflight, TypeScript, testes, build e browser smoke; job de deploy de produção ficou `skipped`.
- Threads anteriores foram resolvidos após as correções correspondentes, exceto os achados de snapshot/STATE ainda aguardando confirmação do re-review final.
- O review de `c2c35df` encontrou três P2 válidos: exercitar a rota MCP configurada; não baixar CLIs com `npx --yes` durante diagnóstico; usar temporários seguros.
- O review de `f16c726` apontou corretamente que texto/marker do modelo não era evidência suficiente; o gate foi trocado por inspeção estruturada da sessão persistida pelo Hermes.
- O review de `a2355de` apontou corretamente que a prova estruturada ainda não verificava o sandbox da chamada; o parser passou a exigir `sandbox == "read-only"`.
- O review de `0c44cb3` apontou dois P2: aceitar resultado do envelope wrapped pela mesma `tool_call_id` e executar checks de perfil com o real home; ambos foram corrigidos.
- Reviews posteriores fecharam a classe de hangs com hard-kill, consistência de `REAL_HOME`, fallback em snapshot sem `.git`, timeout de Ollama e sanitização de snapshots contra credenciais rastreadas.
- O review de `4891fd2` apontou corretamente duas lacunas finais: formas estruturadas/lowercase de credencial no scanner e ausência de reteste do runtime atual. O scanner foi corrigido em `5dccef8`; o runtime foi retestado com nonce determinístico e terminou `OK=50 WARN=4 FAIL=0`, sendo commitado como `0ed71d8` sem mudança adicional.

## Gate atual

O runtime do orquestrador está validado localmente e no CI. Esta atualização de `STATE.md` é somente documental e não altera scripts/runtime.

Gate restante:

1. CI do head documental final verde.
2. Re-review final do Codex sem novo achado material.
3. Confirmar novamente escopo de 33 arquivos e ausência de caminhos proibidos.
4. Sob a autorização humana já concedida para este arco, fazer **squash-merge do #70 na feature**, nunca em `main`.

Não repetir o smoke local nem a regressão de 888 testes sem nova mudança de runtime.

## Próximo passo após squash

1. Atualizar a worktree local da `feat/matriz-impacto-populacional-v1`.
2. Tratar separadamente o stash local do arco #72, comparando antes de restaurar qualquer arquivo.
3. Iniciar Hermes por `.orchestrator/BOOTSTRAP_PROMPT.md`.
4. Retomar Fase 2 da Matriz: importer dry-run de propositions/votes + desenho de persistência do score.
5. Manter migrations remotas bloqueadas até autorização humana explícita própria.

## Gates permanentes

- Um writer por worktree.
- Modelos externos econômicos: somente snapshot sanitizado, nunca secrets/PII/raw docs.
- Sem merge em `main`, deploy de produção, migration remota, alteração RLS/RPC/Auth/Storage ou secrets sem autorização humana explícita própria.
