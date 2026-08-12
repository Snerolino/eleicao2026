# STATE — eleicao2026

Atualizado: 2026-08-12 01:06 -03
Status: `ORCHESTRATOR_V1_READY_FOR_SQUASH`

> Checkpoint operacional. Ao retomar, revalide Git, ambiente e somente os serviços necessários.

## Git

- Repositório: `Snerolino/eleicao2026`.
- Produção permanece na `main`.
- Feature funcional: `feat/matriz-impacto-populacional-v1`.
- Base atual da feature após #71/#72: `da2f00cf0d55c351e3d19093941088e9da894b19`.
- Branch da arquitetura: `chore/hermes-orchestrator-v1`.
- PR `#70`: pronto para squash na feature após CI desta atualização documental; nunca integrar diretamente em `main`.
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

Reteste final do runtime concluído no workstation real sobre o head `a3323212045bc1b5f786412893242f2eec12d236`, em Node `v24.19.0`, com working tree limpa e após todos os hardenings de snapshot/Codex fallback:

```text
bash -n scripts/orchestrator/*.sh
ORCH_EXECUTOR_TIMEOUT=60 npm run orch:doctor -- --smoke
OK=51 WARN=3 FAIL=0
```

Comprovado nesse reteste:

- Node do shell `v24.19.0`;
- Hermes profile `eleicao2026` existe no real home;
- skill `eleicao2026-orchestrator` instalada e byte-a-byte sincronizada com o Git;
- Codex MCP registrado no perfil e `codex mcp-server` disponível por stdio;
- gateway Hermes resolve efetivamente o mesmo Node 24 pelo ambiente real do processo systemd;
- snapshot rejeita path traversal/symlinks, remove `.env*`/dados brutos/utilitários legados com credencial e aplica barreira fail-closed para material secreto plausível;
- falha operacional do scanner de segredos também bloqueia o snapshot, em vez de ser convertida em falso negativo;
- policy Antigravity restrita ao snapshot;
- Hermes → Codex MCP comprovado por probe nonce efêmero: `tool_search`/`tool_describe`, chamada `mcp__codex__codex`, `sandbox == "read-only"`, resultado associado à mesma `tool_call_id` e nonce retornado pelo Codex;
- o nonce não aparece no prompt, eliminando falso verde por memória/contexto do Hermes;
- OpenCode/DeepSeek leu semanticamente `AGENTS.md`;
- Antigravity/Google leu semanticamente `AGENTS.md`;
- Codex exec fallback retornou saída estruturada;
- fallbacks Codex usam `CODEX_HOME` temporário isolado, sem herdar `config.toml`/MCPs do usuário; a rota remota copia somente `auth.json` necessário à autenticação;
- `TERMINAL_ENV` legado ausente.

Warnings não bloqueantes desse reteste:

1. Gemini CLI é rota legacy/API-key; Google AI Pro usa `agy`.
2. Supabase CLI não estava instalada localmente fora de `npx`; o doctor deliberadamente não baixa pacote remoto durante diagnóstico.
3. Ollama não respondeu ao preflight no prazo; fallback local opcional permaneceu desabilitado.

## Hardening consolidado do PR #70

- HOME hardcoded removido; resolução usa real home com override explícito.
- Snapshots removem fisicamente `.env*`, `data/tse-archive`, `supabase/.temp` e utilitários legados conhecidos com credencial rastreada.
- Snapshot aplica varredura fail-closed para formatos plausíveis de credenciais, incluindo headers `Authorization: Bearer`, shell/env e chaves estruturadas JSON/YAML, sem imprimir o segredo detectado.
- Erros operacionais do scanner não são tratados como “nenhum segredo encontrado”.
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
- Fallbacks Codex consultivos usam home isolado para não carregar MCPs remotos mutáveis da configuração pessoal.
- Doctor exige prova semântica dos readers e verifica tracked + untracked da worktree.

## CI / review

- CI remoto do runtime final `a3323212045bc1b5f786412893242f2eec12d236` ficou verde em data check, preflight, TypeScript, testes, build e browser smoke; job de deploy de produção ficou `skipped`.
- O review final do Codex no mesmo `a332321` não trouxe novo P1/P2 de runtime. O único P2 foi registrar o reteste atual no checkpoint, coberto por este `STATE.md`.
- O mesmo review trouxe dois P3: atualizar o runbook para descrever o nonce e alinhar a expectativa dos smokes OpenCode/Antigravity ao `HEAD` quando a worktree estiver suja. O runbook é corrigido no mesmo checkpoint documental; o segundo é ergonomia de falso negativo em worktree suja e fica como dívida separada, pois o gate final foi executado com working tree limpa.
- Reviews anteriores fecharam: rota MCP real, evidência estruturada, sandbox read-only, envelope wrapped, real home, hard-kill de timeouts, snapshot sem secrets, scanner estruturado/lowercase, fallback Ollama em snapshot e isolamento de MCPs do Codex fallback.
- A credencial Cloudflare literal encontrada em scripts legados permanece incidente separado para revogação/rotação e remoção histórica; os snapshots atuais a excluem e falham fechado para segredos plausíveis. Nenhuma rotação foi executada neste arco.

## Gate atual

O runtime do orquestrador está validado localmente e no CI no head `a3323212045b`.

Esta atualização de `STATE.md` e a correção correspondente do runbook são somente documentais e não alteram runtime. Gate restante:

1. CI do head documental final verde.
2. Confirmar novamente escopo de 33 arquivos e ausência de caminhos proibidos.
3. Resolver os threads já cobertos e registrar o P3 ergonômico como follow-up.
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
