# STATE — eleicao2026

Atualizado: 2026-08-10 20:56 -03
Status: `ORCHESTRATOR_V1_READY_FOR_REVIEW`

> Este é um checkpoint operacional, não uma fonte eterna. Ao retomar, Hermes deve
> revalidar Git, ambiente e somente os serviços remotos necessários antes de agir.

## Git

- Repositório: `Snerolino/eleicao2026`.
- Produção permanece na `main`.
- Feature funcional: `feat/matriz-impacto-populacional-v1`.
- Base atual da feature após os follow-ups de banco: `da2f00cf0d55c351e3d19093941088e9da894b19`.
- Branch da arquitetura: `chore/hermes-orchestrator-v1`, criada originalmente a partir de `565116619de6c36cde99c3d159e8540f18530386`.
- Comparação atual feature → arquitetura: 84 commits à frente, 2 atrás, merge-base `5651166`.
- O diff do PR `#70` continua com exatamente 33 arquivos de orquestração/configuração/documentação.
- O volume de commits é consequência da edição incremental via Contents API; integrar somente por **squash** após review.
- PR `#71` foi integrado por squash na feature e restaurou `20260804081607_claims_collector_idempotency.sql` sem executar SQL remoto.
- PR `#72` foi integrado por squash na feature e sincronizou `docs/context-export/` + `src/types/supabase.ts`, incluindo retornos das RPCs de claims.
- PR `#70` permanece sem merge e deve seguir para review antes de qualquer integração.

## Escopo do PR #70

Arquivos alterados apenas em:

- `.orchestrator/`;
- `.agents/`;
- `.gemini/` e `.geminiignore`;
- `scripts/orchestrator/`;
- `AGENTS.md`;
- `opencode.jsonc`;
- `.gitignore`;
- documentação em `docs/`;
- scripts `orch:*` em `package.json`.

Não há no diff do PR `#70`:

- `src/`;
- migrations Supabase;
- `.github/workflows/deploy.yml`;
- `package-lock.json`;
- alteração de dependencies/devDependencies.

O `package.json` mantém Node `>=24 <25`, npm `>=10` e as mesmas dependências; a branch apenas adiciona scripts de orquestração.

## Aplicação — REGRESSÃO VERDE

Validação consolidada em Node `v24.19.0`:

- `npm test`: 180 arquivos / 888 testes aprovados;
- `npx tsc --noEmit`: verde;
- `npm run build`: verde;
- snapshot público: 792 candidaturas válidas e 792 fotos oficiais;
- sitemap: 794 URLs;
- PWA gerada;
- `node scripts/validate-impact-schema.mjs`: checkpoint OK.

Depois dessa regressão, o hardening do PR #70 alterou apenas scripts/docs/configuração do orquestrador. Os follow-ups #71/#72 foram validados separadamente e já estão na **base**, não no diff da arquitetura.

O warning de chunk acima de 500 kB permanece dívida separada e fora deste PR.

## Matriz de Impacto Populacional v1

- Fase 0 concluída: contrato, metodologia, governança, schemas e fixtures.
- Fase 1 concluída: domínio, testes e cinco migrations locais.
- As migrations `20260810090000` a `20260810090400` continuam **não aplicadas** no Supabase remoto.
- Último `npx supabase db push --dry-run` listou somente essas cinco como pendentes.
- Fase 2 continua pendente até a integração da arquitetura.

## Supabase remoto

- Projeto: `eleicao2026` (`hhqxhxcfkoijevxyzfky`), região `sa-east-1`.
- Estado observado em 2026-08-10: `ACTIVE_HEALTHY`.
- `supabase migration list` confirmou `20260804081607` alinhada Local/Remote após o PR #71.
- Histórico remoto e schema concordam com `claims_collector_idempotency`; não usar `migration repair --status reverted`.
- PR #72 alinhou contrato exportado e tipos TypeScript com a migration restaurada, incluindo `correct_claim`, `publish_claim` e `retract_claim`.
- Nenhum `db push` real ou `migration repair` foi executado neste arco.
- Débitos de advisors/search_path/RLS/RPC permanecem trabalho separado.

## Cloudflare

- Produção: `https://rs.votopraquem.org`.
- Projeto Pages: `portal-transparencia-rs`.
- Deploy normal permanece GitHub Actions após merge autorizado em `main`.
- O PR #70 não altera workflow de deploy nem recebe token Cloudflare de produção.
- Previews de branch podem existir; não confundir preview com produção.

## Hermes control plane — VALIDADO

- perfil `eleicao2026` ativo;
- provider `openai-codex`, modelo `gpt-5.6-luna`;
- terminal backend `local`;
- Node shell/gateway: `v24.19.0`;
- skill `eleicao2026-orchestrator` instalada;
- MCP `codex` habilitado como `codex mcp-server`;
- Hermes → Codex MCP validado em read-only;
- `TERMINAL_ENV` legado removido.

Reteste do head endurecido antes deste update documental:

```text
bash -n scripts/orchestrator/*.sh  -> sem erro
npm run orch:doctor -- --smoke    -> OK=48 WARN=2 FAIL=0
```

Warnings remanescentes e não bloqueantes:

1. Gemini CLI disponível apenas como rota legacy/API-key; Google AI Pro usa `agy`.
2. Ollama instalado sem `gpt-oss:20b`; fallback local opcional desabilitado.

## Hardening validado no PR #70

1. HOME hardcoded removido dos wrappers; resolução dinâmica com override explícito.
2. Smoke OpenCode exige prova semântica de leitura de `AGENTS.md`.
3. Doctor verifica worktree tracked + untracked.
4. `prepare-snapshot.sh` rejeita path traversal antes de `rm -rf`.
5. Snapshots falham fechados com symlink rastreado.
6. Gemini legacy também usa snapshot sanitizado.
7. Antigravity usa snapshot + `--add-dir` + custom reader + `--mode=plan` + sandbox, leitura estreita e escrita negada.
8. Referência inexistente a `hermes mcp test codex` removida.
9. Ordem de autoridade do context bus alinhada ao `AGENTS.md`.
10. `HANDOFF.json` válido pelo próprio schema.

## Executores

- **OpenCode / DeepSeek Free:** reader econômico, snapshot sanitizado, plan, MCP desligado.
- **Google Antigravity:** reader de contexto amplo, snapshot sanitizado e política read-only estreita.
- **Codex MCP:** writer técnico preferido quando autorizado; Luna → Terra → Sol por evidência.
- **Codex exec:** fallback read-only estruturado.
- **Gemini legacy:** compatibilidade opcional API-key/enterprise, também em snapshot.
- **Ollama local:** opcional; `gpt-oss:20b` ausente no último doctor.

## Próximo gate

1. Marcar o PR `#70` ready for review.
2. Solicitar review do Codex no head atual e tratar qualquer achado material.
3. Se review + CI estiverem verdes, pedir/usar gate humano específico antes do **squash-merge do #70 na feature**.
4. Após integração da arquitetura, atualizar a worktree local da feature e iniciar Hermes pelo `BOOTSTRAP_PROMPT.md`.
5. Retomar a Fase 2 da Matriz de Impacto.
6. Manter `20260810090000` a `20260810090400` bloqueadas para aplicação remota até autorização explícita própria.

## Gates permanentes

- Apenas um writer por worktree.
- Modelos externos econômicos recebem somente repositório público/sanitizado, nunca secrets/PII/raw documents.
- Nenhum agente faz merge em `main`, deploy de produção, migration remota, mudança de RLS/RPC/Auth/Storage, rotação de secret ou mutação Cloudflare/Supabase sem autorização humana explícita.
- Se o executor mutável perder quota, interromper escrita e produzir handoff read-only; fallback gratuito não herda autoridade de escrita.
