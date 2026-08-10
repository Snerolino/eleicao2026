# STATE — eleicao2026

Atualizado: 2026-08-10 11:54 -03
Status: `ORCHESTRATOR_V1_VALIDATED_REGRESSION_PENDING`

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
- HEAD validado antes deste checkpoint: `2015fc8a5545`.

## Aplicação

- Produção declarada verde com 792 candidaturas públicas e fotos TSE.
- Stack preservada: React + Vite + TypeScript + Tailwind + Supabase + Cloudflare Pages + PWA.
- GitHub Actions é o caminho normal de deploy após merge autorizado em `main`.
- O `package.json` exige Node `>=24 <25`.
- Shell do projeto confirmado em 2026-08-10 com Node `v24.19.0` em `/home/lourenco/.nvm/versions/node/v24.19.0/bin/node`.
- Gateway Hermes do perfil `eleicao2026` confirmado usando o mesmo Node `v24.19.0` via drop-in `70-eleicao2026-node24.conf`.

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
- Node do gateway alinhado ao projeto: `v24.19.0`;
- skill `eleicao2026-orchestrator` instalada;
- MCP `codex` aparece habilitado como `codex mcp-server`;
- `codex mcp-server` sobe e permanece disponível por stdio;
- smoke direto do Hermes respondeu `HERMES_CODEX_OK`;
- smoke Hermes → MCP Codex fez chamada real `mcp__codex__codex`, leu `AGENTS.md` em modo read-only e retornou `HERMES_CODEX_MCP_OK`;
- portanto a espinha dorsal `Hermes -> Codex MCP -> repositório` está validada ponta a ponta.

## Doctor do orquestrador — VALIDADO

Em 2026-08-10, `npm run orch:doctor -- --smoke` retornou:

- `OK=45`;
- `WARN=3`;
- `FAIL=0`.

Smokes comprovados no mesmo ciclo:

- OpenCode/DeepSeek: saída não vazia em snapshot sanitizado;
- Antigravity/Google: leitura real de `AGENTS.md`, retornando o título esperado `Instruções para agentes — Portal Transparência Eleitoral RS`;
- Codex exec fallback: saída estruturada conforme contrato.

Warnings remanescentes e classificação:

1. Gemini CLI disponível apenas como rota legacy/API-key; esperado e não bloqueante.
2. `TERMINAL_ENV` legado ainda detectado no `.env` do perfil; saneamento local recomendado antes de considerar o perfil limpo, embora `terminal: local` esteja confirmado operacionalmente.
3. Ollama presente sem `gpt-oss:20b`; fallback local opcional permanece desabilitado e não bloqueia a arquitetura principal.

## Executores e credenciais

### Codex — VALIDADO

- Codex CLI `0.147.0`.
- `codex login status`: autenticado via ChatGPT.
- `codex doctor --summary`: 17 OK, 0 WARN, 0 FAIL; websocket HTTP 101 e endpoints ativos alcançáveis.
- `gpt-5.6-luna` respondeu em `codex exec` read-only.
- Codex MCP integrado ao Hermes e validado ponta a ponta.

### Google Antigravity — VALIDADO COMO READER HEADLESS

- `agy` `1.1.11` instalado e autenticado.
- Executor roda sobre snapshot criado por `git archive HEAD`.
- Snapshot é explicitamente ligado ao workspace headless via `--add-dir`.
- Política local permite `read_file` apenas no snapshot e nega `write_file` no mesmo caminho.
- Custom agent `eleicao2026-reader` limita o papel a leitura/consulta.
- Wrapper usa `--mode=plan`, `--sandbox` e rejeita estado intermediário de subagente como sucesso.
- Smoke real leu `AGENTS.md` e devolveu o título inicial exato.
- Não foi usado `--dangerously-skip-permissions`.

### OpenCode / DeepSeek Free — VALIDADO COMO READER ECONÔMICO

- OpenCode está disponível e auth local existe.
- Rota usa snapshot sanitizado e agente `plan`.
- Smoke do doctor retornou saída não vazia.
- Modelo econômico permanece sujeito à disponibilidade atual do catálogo; Hermes deve aplicar circuit breaker se a rota gratuita deixar de existir ou ficar indisponível.

### Gemini CLI legacy

- permanece somente como compatibilidade para API key/enterprise, não é a rota normal da assinatura Google AI Pro individual nesta arquitetura.

### Ollama local

- Ollama está instalado.
- `gpt-oss:20b` ausente; fallback local opcional não está elegível ainda.

## Próximos gates antes da retomada funcional

1. Sanear `TERMINAL_ENV` legado no perfil Hermes e revalidar `terminal: local`.
2. Rodar regressão da aplicação em Node 24: `npm test`, `npx tsc --noEmit`, `npm run build`, `node scripts/validate-impact-schema.mjs`.
3. Se a regressão permanecer verde, revisar o diff final da branch de arquitetura contra `5651166` e preparar PR/squash sem merge automático.
4. Após revisão humana da arquitetura, retomar a Fase 2 da Matriz de Impacto: importador dry-run de proposições/votos e desenho da persistência de score.
5. Tratar separadamente os dois bugs encontrados pelo Codex em `src/services/candidates.ts` e `src/pages/AdminPage.tsx`.
6. Somente depois de revisão humana, decidir aplicação remota das migrations de impacto.

## Gates permanentes

- Apenas um writer por worktree.
- Modelos externos econômicos: somente repositório público/sanitizado, nunca secrets/PII/raw documents.
- Nenhum agente faz merge em `main`, deploy de produção, migration remota, mudança de RLS/RPC, rotação de secret ou mutação Cloudflare/Supabase sem autorização humana explícita.
- Se o executor mutável perder quota, interromper escrita e produzir handoff read-only; não continuar a mutação automaticamente num modelo gratuito.
