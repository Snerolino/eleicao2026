# STATE — eleicao2026

Atualizado: 2026-08-10 13:58 -03
Status: `ORCHESTRATOR_V1_REVIEW_APPROVED_WAITING_PR71`

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
- PR `#70`: arquitetura Hermes Multi-CLI, base `feat/matriz-impacto-populacional-v1`, ainda draft e sem merge.
- PR `#71`: restauração isolada da migration `20260804081607_claims_collector_idempotency.sql`, base `feat/matriz-impacto-populacional-v1`, ready for review e sem merge.

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

Depois dessa regressão, o review alterou somente scripts/docs/configuração do orquestrador, sem tocar em aplicação, dependências, migrations ou build. Portanto não há motivo para repetir os 888 testes antes de integrar.

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
- `supabase migration list` revelou uma migration remota real ausente no Git: `20260804081607 claims_collector_idempotency`.
- O histórico remoto preserva o SQL original e o schema atual confirma os campos `external_id`, `content_hash`, `generated_by_ai`, `prompt_version` e o índice `claims_collector_identity_version_uq`.
- Portanto **não** usar `migration repair --status reverted`; histórico e schema concordam que a migration foi aplicada.
- PR `#71` restaura somente o arquivo perdido, sem executar SQL remoto.
- Validação da worktree do PR #71: `20260804081607` aparece alinhada Local/Remote e `npx supabase db push --dry-run` lista somente `20260810090000` a `20260810090400` como pendentes.
- Nenhum `db push` real ou `migration repair` foi executado.
- Débitos separados: advisors de `search_path`, RPCs `SECURITY DEFINER` para `authenticated`, performance/RLS. Não corrigir por carona.

## Cloudflare

- Produção: `https://rs.votopraquem.org`.
- Projeto Pages versionado no workflow: `portal-transparencia-rs`.
- Deploy normal permanece GitHub Actions após merge autorizado em `main`.
- A branch de arquitetura não altera workflow de deploy nem recebe token Cloudflare de produção.
- Wrangler local validado em `4.114.0`; nenhum deploy local foi executado.

## Hermes control plane — VALIDADO

Validação real atual:

- perfil `eleicao2026` ativo;
- provider `openai-codex`, modelo `gpt-5.6-luna`;
- terminal backend `local`;
- Node do gateway alinhado ao projeto: `v24.19.0`;
- skill `eleicao2026-orchestrator` instalada;
- MCP `codex` habilitado como `codex mcp-server`;
- smoke direto `HERMES_CODEX_OK`;
- chamada real Hermes → MCP Codex em read-only retornou `HERMES_CODEX_MCP_OK`;
- `TERMINAL_ENV` legado não está mais presente no perfil.

## Review técnico do PR #70 — HARDENING VALIDADO

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

Reteste do head endurecido em 2026-08-10:

```text
bash -n scripts/orchestrator/*.sh  -> sem erro
npm run orch:doctor -- --smoke    -> OK=48 WARN=2 FAIL=0
```

Smokes semânticos aprovados:

- OpenCode/DeepSeek comprovou leitura de `AGENTS.md` pelo título esperado;
- Antigravity/Google comprovou a mesma leitura;
- Codex exec fallback retornou saída estruturada;
- snapshot rejeitou path traversal e symlinks;
- worktree estava limpa tracked + untracked;
- gateway Hermes confirmou Node `v24.19.0`.

Warnings remanescentes são não bloqueantes:

1. Gemini CLI disponível apenas como rota legacy/API-key; Google AI Pro usa `agy`.
2. Ollama instalado sem `gpt-oss:20b`; fallback local opcional desabilitado.

## Executores

### Codex

- CLI autenticado via ChatGPT e MCP validado ponta a ponta.
- MCP é writer técnico preferido; `codex exec` permanece fallback read-only estruturado.

### Google Antigravity

- `agy` 1.1.11 autenticado.
- Headless usa snapshot sanitizado + `--add-dir` + custom reader + `--mode=plan` + sandbox.
- Política local permite leitura apenas do snapshot e nega escrita nele.
- Subagentes/background collaboration são bloqueados no caminho headless síncrono.

### OpenCode / DeepSeek Free

- Reader econômico sobre snapshot sanitizado, `agent plan`, MCP desligado.
- Doctor exige e comprovou prova semântica de leitura do `AGENTS.md`.

### Gemini CLI legacy

- Compatibilidade API-key/enterprise somente quando explicitamente configurada.
- Opera sobre snapshot sanitizado, não worktree viva.

### Ollama local

- Ollama instalado; `gpt-oss:20b` ausente. Continua opcional e não bloqueante.

## Próximo gate

Ordem recomendada:

1. Revisar/integrar o PR `#71` na `feat/matriz-impacto-populacional-v1` por decisão humana separada. É uma restauração de histórico Git, sem SQL remoto.
2. Depois de `#71`, atualizar a base/relação do PR `#70` e confirmar que o diff continua somente de orquestração.
3. Marcar `#70` ready for review e integrar por **squash**, somente após gate humano específico.
4. Retomar a Fase 2 da Matriz de Impacto.
5. Manter `20260810090000` a `20260810090400` como migrations remotas bloqueadas até autorização explícita própria.

## Gates permanentes

- Apenas um writer por worktree.
- Modelos externos econômicos: somente repositório público/sanitizado, nunca secrets/PII/raw documents.
- Nenhum agente faz merge em `main`, deploy de produção, migration remota, mudança de RLS/RPC, rotação de secret ou mutação Cloudflare/Supabase sem autorização humana explícita.
- Se o executor mutável perder quota, interromper escrita e produzir handoff read-only; não continuar mutação automaticamente num modelo gratuito.
