# STATE — eleicao2026

Atualizado: 2026-08-10 12:49 -03
Status: `ORCHESTRATOR_V1_REVIEW_HARDENED_RETEST_PENDING`

> Este é um checkpoint, não uma fonte eterna. Ao retomar, Hermes deve conferir
> Git, ambiente e serviços antes de confiar em SHAs, contagens ou disponibilidade.

## Git

- Repositório: `Snerolino/eleicao2026`.
- Produção permanece na `main`.
- `main` no início desta migração: `a252fb0f77f58694a1133a24f5c136985025a7ad`.
- Feature em stand-by: `feat/matriz-impacto-populacional-v1`.
- Checkpoint herdado da feature: `565116619de6c36cde99c3d159e8540f18530386`.
- Branch da arquitetura: `chore/hermes-orchestrator-v1`, criada a partir de `5651166`.
- Comparação após review: branch continua 0 commits atrás do checkpoint base e altera somente 33 arquivos de orquestração/configuração/documentação.
- O volume de commits é consequência da edição incremental via Contents API; integrar somente por squash após o gate final. Não fazer merge automático.
- Draft PR aberto: `#70`, base `feat/matriz-impacto-populacional-v1`, sem merge.

## Escopo da branch de arquitetura

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

Validação local em Node `v24.19.0` antes do hardening final da infraestrutura:

- `npm test`: 180 arquivos de teste aprovados, 888 testes aprovados;
- `npx tsc --noEmit`: sem erro reportado no ciclo;
- `npm run build`: concluído com sucesso;
- snapshot público: 792 candidaturas válidas e 792 fotos oficiais;
- distribuição por cargos: deputado_estadual=458, deputado_federal=310, governador=3, outro=12, senador=6, vice_governador=3;
- PWA gerada;
- sitemap gerado com 794 URLs;
- `node scripts/validate-impact-schema.mjs`: checkpoint OK; fixtures válidas aceitas e inválidas rejeitadas como esperado.

Depois dessa regressão, o review alterou somente scripts/docs/configuração do orquestrador, sem tocar em aplicação, dependências, migrations ou build. Portanto não há motivo para repetir os 888 testes antes de integrar; o gate pendente é específico da infraestrutura de orquestração.

O warning de chunk acima de 500 kB permanece dívida separada e fora desta PR.

## Matriz de Impacto Populacional v1

- Fase 0 concluída: contrato, metodologia, governança, schemas e fixtures.
- Fase 1 concluída: domínio, testes e 5 migrations locais.
- As migrations `20260810090000` a `20260810090400` permanecem sem autorização de aplicação no Supabase remoto.
- Fase 2 continua pendente até a integração/revisão desta arquitetura.

## Supabase remoto

- Projeto: `eleicao2026` (`hhqxhxcfkoijevxyzfky`), região `sa-east-1`.
- Estado observado em 2026-08-10: `ACTIVE_HEALTHY`.
- `public.candidates`: 793 linhas no banco remoto; superfície pública versionada: 792.
- Nenhuma Edge Function ativa observada.
- Débitos separados: advisors de `search_path`, RPCs `SECURITY DEFINER` para `authenticated`, performance/RLS. Não corrigir por carona.

## Cloudflare

- Produção: `https://rs.votopraquem.org`.
- Projeto Pages versionado no workflow: `portal-transparencia-rs`.
- Deploy normal permanece GitHub Actions após merge autorizado em `main`.
- A branch de arquitetura não altera workflow de deploy nem recebe token Cloudflare de produção.

## Hermes control plane — BASE VALIDADA

Validação real anterior ao hardening final:

- perfil `eleicao2026` ativo;
- provider `openai-codex`, modelo `gpt-5.6-luna`;
- terminal backend `local`;
- Node do gateway alinhado ao projeto: `v24.19.0`;
- skill `eleicao2026-orchestrator` instalada;
- MCP `codex` habilitado como `codex mcp-server`;
- smoke direto `HERMES_CODEX_OK`;
- chamada real Hermes → MCP Codex em read-only retornou `HERMES_CODEX_MCP_OK`.

Esses fatos não foram invalidados pelo review, mas o doctor/snapshots/wrappers mudaram e precisam de um smoke curto no novo HEAD.

## Review técnico do PR #70 — HARDENING APLICADO

O review encontrou e corrigiu problemas reais antes da integração:

1. **Portabilidade:** wrappers não usam mais `/home/lourenco` como default versionado; resolvem o home real via `getent`, mantendo `HERMES_REAL_HOME` como override.
2. **OpenCode smoke:** deixou de aceitar apenas stdout não vazio; agora exige o título real de `AGENTS.md`, igual ao gate do Antigravity.
3. **Worktree:** doctor agora detecta também arquivos untracked, não só diffs tracked.
4. **Snapshot path traversal:** `prepare-snapshot.sh` valida o identificador antes de `rm -rf` e rejeita nomes que possam escapar de `runtime/snapshots/`.
5. **Symlink escape:** snapshots sanitizados falham fechados se contiverem symlink rastreado, evitando leitura indireta fora do snapshot.
6. **Gemini legacy:** rota opcional passou a rodar também sobre `git archive HEAD`, não sobre a worktree viva.
7. **Antigravity:** `AGENTS.md`, arquitetura e runbook foram alinhados ao contrato real: `orch:configure-google`, `--add-dir`, custom reader, `--mode=plan`, sandbox, `read_file` estreito, `write_file` negado e sem `--dangerously-skip-permissions`.
8. **Codex MCP docs:** removida referência incorreta a `hermes mcp test codex`; gate documentado é preflight + chamada Hermes → MCP real.
9. **Context authority:** `.orchestrator/README.md` agora segue a mesma ordem canônica de `AGENTS.md`.
10. **Handoff contract:** `HANDOFF.json` passou a ser válido por construção em relação ao `minLength` obrigatório de `summary`.

Nenhuma dessas correções amplia autoridade de escrita ou toca serviços remotos.

## Executores

### Codex

- CLI autenticado via ChatGPT e MCP validado ponta a ponta antes do review.
- MCP é writer técnico preferido; `codex exec` permanece fallback read-only estruturado.

### Google Antigravity

- `agy` 1.1.11 autenticado.
- Headless usa snapshot sanitizado + `--add-dir` + custom reader + `--mode=plan` + sandbox.
- Política local permite leitura apenas do snapshot e nega escrita nele.
- Subagentes/background collaboration são bloqueados no caminho headless síncrono.

### OpenCode / DeepSeek Free

- Reader econômico sobre snapshot sanitizado, `agent plan`, MCP desligado.
- Novo doctor exige prova semântica de leitura do `AGENTS.md`.

### Gemini CLI legacy

- Compatibilidade API-key/enterprise somente quando explicitamente configurada.
- Agora também opera sobre snapshot sanitizado, não worktree viva.

### Ollama local

- Ollama instalado; `gpt-oss:20b` ausente no último doctor. Continua opcional e não bloqueante.

## Próximo gate — RETESTE CURTO

Depois de `git pull --ff-only` no novo HEAD:

```bash
bash -n scripts/orchestrator/*.sh
npm run orch:doctor -- --smoke
```

Critérios:

- `bash -n`: zero erro;
- doctor: `FAIL=0`;
- OpenCode/DeepSeek comprova leitura de `AGENTS.md` pelo título esperado;
- Antigravity comprova a mesma leitura;
- Codex exec fallback retorna saída estruturada;
- warning de Gemini legacy e Ollama opcional pode permanecer;
- `TERMINAL_ENV`, se ainda presente, deve ser saneado como configuração local separada.

Se esse gate passar, atualizar o checkpoint para `ORCHESTRATOR_V1_REVIEW_APPROVED_PR_READY`, revisar metadados do PR #70 e manter draft/sem merge até decisão humana de squash.

## Gates permanentes

- Apenas um writer por worktree.
- Modelos externos econômicos: somente repositório público/sanitizado, nunca secrets/PII/raw documents.
- Nenhum agente faz merge em `main`, deploy de produção, migration remota, mudança de RLS/RPC, rotação de secret ou mutação Cloudflare/Supabase sem autorização humana explícita.
- Se o executor mutável perder quota, interromper escrita e produzir handoff read-only; não continuar mutação automaticamente num modelo gratuito.
