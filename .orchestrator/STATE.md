# STATE — eleicao2026

Atualizado: 2026-08-10 12:23 -03
Status: `ORCHESTRATOR_V1_REGRESSION_GREEN_PR_READY`

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
- Comparação final contra `5651166`: 65 commits à frente, 0 atrás.
- O volume de commits é consequência da edição incremental via Contents API; preparar PR com squash. Não fazer merge automático.

## Escopo final da branch de arquitetura

A comparação contra `5651166` mostra alterações apenas em:

- `.orchestrator/`;
- `.agents/`;
- `.gemini/` e `.geminiignore`;
- `scripts/orchestrator/`;
- `AGENTS.md`;
- `opencode.jsonc`;
- `.gitignore`;
- documentação em `docs/`;
- scripts `orch:*` em `package.json`.

Não há alteração em:

- `src/`;
- migrations além das já herdadas da feature;
- `.github/workflows/deploy.yml`;
- `package-lock.json`;
- dependências ou devDependencies.

O `package.json` mantém Node `>=24 <25`, npm `>=10` e as mesmas versões de dependências; a branch apenas adiciona scripts de orquestração.

## Aplicação — REGRESSÃO VERDE

Validação local em Node `v24.19.0` em 2026-08-10:

- `npm test`: 180 arquivos de teste aprovados, 888 testes aprovados;
- `npx tsc --noEmit`: sem erro reportado no ciclo;
- `npm run build`: concluído com sucesso;
- snapshot público: 792 candidaturas válidas e 792 fotos oficiais;
- distribuição por cargos: deputado_estadual=458, deputado_federal=310, governador=3, outro=12, senador=6, vice_governador=3;
- Vite transformou 215 módulos e concluiu o build;
- PWA gerou `sw.js` e `workbox-1320db52.js`;
- sitemap gerado com 794 URLs (792 candidatos + páginas estáticas);
- `release.json` gerado;
- `node scripts/validate-impact-schema.mjs`: checkpoint OK; fixtures válidas foram aceitas e fixtures inválidas foram rejeitadas como esperado.

O Vite emitiu warning de chunk acima de 500 kB (`index` ~1,043 kB antes de gzip). Esse warning não é atribuído à migração de orquestração: a branch não altera `src/`, dependências, lockfile ou configuração de build. Tratar otimização de bundle separadamente, sem carona nesta PR.

## Matriz de Impacto Populacional v1

- Fase 0 concluída: contrato, metodologia, governança, schemas e fixtures.
- Fase 1 concluída: domínio, testes e 5 migrations locais.
- As migrations `20260810090000` a `20260810090400` permanecem sem autorização de aplicação no Supabase remoto.
- A regressão atual comprovou novamente o contrato dos schemas de impacto.

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
- A branch de arquitetura não alterou o workflow de deploy.
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

- OpenCode/DeepSeek: execução sobre snapshot sanitizado retornou saída não vazia;
- Antigravity/Google: leitura real de `AGENTS.md`, retornando o título esperado `Instruções para agentes — Portal Transparência Eleitoral RS`;
- Codex exec fallback: saída estruturada conforme contrato.

Warnings remanescentes e classificação:

1. Gemini CLI disponível apenas como rota legacy/API-key; esperado e não bloqueante.
2. `TERMINAL_ENV` legado foi detectado no ciclo anterior; se ainda existir, sanear localmente antes da operação contínua. `terminal: local` já foi comprovado funcionalmente.
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
- MCP desabilitado no executor econômico.
- Modelo econômico permanece sujeito à disponibilidade atual do catálogo; Hermes deve aplicar circuit breaker se a rota gratuita deixar de existir ou ficar indisponível.

### Gemini CLI legacy

- permanece somente como compatibilidade para API key/enterprise, não é a rota normal da assinatura Google AI Pro individual nesta arquitetura.

### Ollama local

- Ollama está instalado.
- `gpt-oss:20b` ausente; fallback local opcional não está elegível ainda.

## Próximo gate

1. Puxar este checkpoint localmente.
2. Confirmar/remover `TERMINAL_ENV` legado caso ainda exista; não repetir toda a regressão por isso.
3. Revisar o diff final da branch de arquitetura e abrir PR em modo draft/ready conforme processo do projeto, configurando squash no merge. Não fazer merge automático.
4. Após revisão humana da arquitetura, retomar a Fase 2 da Matriz de Impacto: importador dry-run de proposições/votos e desenho da persistência de score.
5. Tratar separadamente os dois bugs encontrados pelo Codex em `src/services/candidates.ts` e `src/pages/AdminPage.tsx`.
6. Somente depois de revisão humana, decidir aplicação remota das migrations de impacto.

## Gates permanentes

- Apenas um writer por worktree.
- Modelos externos econômicos: somente repositório público/sanitizado, nunca secrets/PII/raw documents.
- Nenhum agente faz merge em `main`, deploy de produção, migration remota, mudança de RLS/RPC, rotação de secret ou mutação Cloudflare/Supabase sem autorização humana explícita.
- Se o executor mutável perder quota, interromper escrita e produzir handoff read-only; não continuar a mutação automaticamente num modelo gratuito.
