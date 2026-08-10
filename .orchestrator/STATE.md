# STATE — eleicao2026

Atualizado: 2026-08-10 10:16 -03
Status: `ORCHESTRATOR_CORE_VERIFIED_EXECUTORS_PENDING`

> Este é um checkpoint, não uma fonte eterna. Ao retomar, Hermes deve conferir
> Git, ambiente e serviços antes de confiar em SHAs, contagens ou disponibilidade.

## Git

- Repositório: `Snerolino/eleicao2026`.
- Produção permanece na `main`.
- `main` no início desta migração: `a252fb0f77f58694a1133a24f5c136985025a7ad`.
- Feature em stand-by: `feat/matriz-impacto-populacional-v1`.
- Checkpoint herdado da feature: `565116619de6c36cde99c3d159e8540f18530386`.
- A feature estava 5 commits à frente e 0 atrás de `main` no início desta migração.
- Branch da arquitetura: `chore/hermes-orchestrator-v1`, criada a partir de `5651166`.

## Aplicação

- Produção declarada verde com 792 candidaturas públicas e fotos TSE.
- Stack preservada: React + Vite + TypeScript + Tailwind + Supabase + Cloudflare Pages + PWA.
- GitHub Actions é o caminho normal de deploy após merge autorizado em `main`.
- O `package.json` exige Node `>=24 <25`.
- Shell do projeto confirmado em 2026-08-10 com Node `v24.19.0` em `/home/lourenco/.nvm/versions/node/v24.19.0/bin/node`.
- O gateway Hermes ainda carregava no unit systemd um PATH com Node `v22.22.2`; foi versionado `npm run orch:sync-gateway-node` para criar drop-in específico do perfil, reiniciar o gateway e alinhar o PATH ao Node 24 corrente.

## Matriz de Impacto Populacional v1

- Fase 0 concluída: contrato, metodologia, governança, schemas e fixtures.
- Fase 1 concluída: domínio, testes e 5 migrations locais.
- Checkpoint validado antes do stand-by: 222 testes, TypeScript limpo, build OK e RPC de aprovação validada localmente.
- As migrations `20260810090000` a `20260810090400` NÃO estavam aplicadas no Supabase remoto no início desta migração de arquitetura.

## Supabase remoto

- Projeto: `eleicao2026` (`hhqxhxcfkoijevxyzfky`), região `sa-east-1`.
- Estado observado em 2026-08-10: `ACTIVE_HEALTHY`.
- `public.candidates`: 793 linhas no banco remoto; superfície pública versionada: 792.
- Nenhuma Edge Function ativa observada.
- Débitos separados da migração de agentes: advisors indicam funções com `search_path` mutável, RPCs `SECURITY DEFINER` executáveis por `authenticated`, além de alertas de performance/RLS. Não corrigir por carona; abrir trabalho próprio.

## Cloudflare

- Produção: `https://rs.votopraquem.org`.
- Projeto Pages versionado no workflow: `portal-transparencia-rs`.
- Deploy normal: GitHub Actions `deploy.yml`, somente push em `main`, usando secret `CLOUDFLARE_API_TOKEN` no GitHub.
- Não copiar esse token para Hermes ou para executores apenas para permitir rotina de desenvolvimento.

## Hermes control plane — VALIDADO

Validação real em 2026-08-10:

- perfil `eleicao2026` existe;
- gateway systemd do perfil está ativo e com linger habilitado;
- provider do Hermes: `openai-codex`;
- modelo do Hermes: `gpt-5.6-luna`;
- terminal backend: `local`;
- skill `eleicao2026-orchestrator` instalada;
- MCP `codex` aparece habilitado como `codex mcp-server`;
- `codex mcp-server` sobe e permanece disponível por stdio;
- smoke direto do Hermes respondeu `HERMES_CODEX_OK`;
- smoke Hermes → MCP Codex fez chamada real `mcp__codex__codex`, leu `AGENTS.md` em modo read-only e retornou `HERMES_CODEX_MCP_OK`;
- portanto a espinha dorsal `Hermes -> Codex MCP -> repositório` está validada ponta a ponta.

O doctor estrutural retornou `OK=36 WARN=3 FAIL=0` antes do ajuste Node/reader.

Warnings daquele doctor:

1. Gemini CLI existe apenas como rota legacy; esperado.
2. `TERMINAL_ENV` legado ainda foi detectado no `.env` do perfil; confirmar remoção/revalidação antes de considerar o ambiente totalmente saneado.
3. Ollama existe, mas `gpt-oss:20b` não está instalado; fallback local permanece opcional/desabilitado.

## Executores e credenciais

### Codex — VALIDADO

- Codex CLI `0.147.0`.
- `codex login status`: autenticado via ChatGPT.
- `codex doctor --summary`: 17 OK, 0 WARN, 0 FAIL; websocket HTTP 101 e endpoints ativos alcançáveis.
- `gpt-5.6-luna` respondeu em `codex exec` read-only.
- Codex MCP integrado ao Hermes e validado ponta a ponta.

### Google Antigravity — READER VERSIONADO, RETESTE PENDENTE

- `agy` está disponível no PATH e home/autenticação existe localmente.
- Primeiro smoke headless falhou com `jetski: no output produced` porque o agente default tentou a permissão `command`, que não pode pedir confirmação em modo headless.
- Não foi usado `--dangerously-skip-permissions` e nenhuma permissão global foi ampliada.
- Correção versionada: `.agents/agents/eleicao2026-reader/agent.md`, custom agent com somente `view_file` e `grep_search`, `commandExecutionPolicy: off`, sem MCP e sem ferramentas de escrita.
- `run-antigravity.sh` agora seleciona explicitamente `--agent eleicao2026-reader` sobre o snapshot Git sanitizado.
- Falta puxar a branch local e repetir `npm run orch:google`.

### OpenCode / DeepSeek Free — INSTALADO, SMOKE PENDENTE

- OpenCode está disponível e auth local existe segundo o doctor.
- `opencode/deepseek-v4-flash-free` havia respondido em testes anteriores.
- ainda falta revalidar catálogo atual e o wrapper read-only sobre snapshot.

### Gemini CLI legacy

- permanece somente como compatibilidade para API key/enterprise, não é a rota normal da assinatura Google AI Pro individual nesta arquitetura.

### Ollama local

- Ollama está instalado.
- `gpt-oss:20b` ausente no doctor; fallback local opcional não está elegível ainda.

## Próximos gates antes da retomada funcional

1. `git pull --ff-only` para receber reader Antigravity + sync do gateway Node.
2. Rodar `npm run orch:sync-gateway-node` e confirmar que o gateway usa Node 24.
3. Confirmar que `TERMINAL_ENV` legado foi removido ou não interfere no perfil.
4. Repetir Google Antigravity em snapshot (`orch:google`) usando o custom reader sem shell.
5. Validar OpenCode/DeepSeek em snapshot (`orch:opencode`).
6. Rodar `npm run orch:doctor -- --smoke`.
7. Revalidar testes, TypeScript, build e schema de impacto.
8. Só então retomar a Fase 2 da Matriz de Impacto: importador dry-run de proposições/votos e desenho da persistência de score.
9. Tratar separadamente os dois bugs encontrados pelo Codex em `src/services/candidates.ts` e `src/pages/AdminPage.tsx`.
10. Somente depois de revisão humana, decidir aplicação remota das migrations de impacto.

## Gates permanentes

- Apenas um writer por worktree.
- Modelos externos econômicos: somente repositório público/sanitizado, nunca secrets/PII/raw documents.
- Nenhum agente faz merge em `main`, deploy de produção, migration remota, mudança de RLS/RPC, rotação de secret ou mutação Cloudflare/Supabase sem autorização humana explícita.
- Se o executor mutável perder quota, interromper escrita e produzir handoff read-only; não continuar a mutação automaticamente num modelo gratuito.
