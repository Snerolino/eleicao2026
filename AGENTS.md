# Instruções para agentes — Portal Transparência Eleitoral RS

## Contexto

- Projeto real de transparência eleitoral do RS, não demo.
- Stack: Vite + React + TypeScript + Tailwind v4 + Supabase + Cloudflare Pages.
- Fonte oficial atual: mirror local `../dataset2026/`, incorporado ao app por snapshot público versionado em `data/public-candidates.json`.
- Produção pode ficar atrás de branch/PR; sempre diferencie Git local, preview, Supabase remoto e produção.
- Estado operacional curto: `.orchestrator/STATE.md`.
- Política de roteamento: `.orchestrator/routing.yaml`.

## Fonte de verdade

Use nesta ordem:

1. código e Git atuais;
2. este `AGENTS.md` e contratos/schemas versionados;
3. `README.md` e documentação aplicável;
4. `docs/context-export/` para o contrato curado de dados;
5. `.orchestrator/STATE.md` como checkpoint operacional, sempre revalidando fatos voláteis;
6. task packet/handoff atual;
7. histórico de conversas apenas como apoio.

Nunca escolha uma afirmação antiga de chat contra código, schema, migration ou Git atual.

## Orquestração Hermes v1

Hermes é o **control plane**. Ele mantém contexto global, memória, fila de tarefas,
roteamento, circuit breaker, gates humanos e handoffs. Executores não precisam
receber o histórico completo.

Executores disponíveis:

- **OpenCode + DeepSeek gratuito**: triagem barata, inventário, revisão simples e segunda opinião. Caminho orquestrado é `read-only`, sem MCP e roda sobre snapshot Git sanitizado.
- **Google Antigravity CLI**: rota da assinatura Google AI Pro para leitura ampla, mapeamento, síntese e contexto grande. Roda em `-p`, dentro de snapshot Git sanitizado, com leitura explicitamente permitida e `write_file` negado no snapshot.
- **Gemini CLI legacy**: somente compatibilidade quando houver API key/conta enterprise explicitamente configurada. Não é rota da assinatura Google AI Pro individual.
- **Codex MCP stdio**: executor técnico preferido para implementação, debugging, testes e revisão final. Começar em Luna e escalar para Terra/Sol somente quando houver evidência.
- **Codex exec**: fallback read-only se o MCP estiver indisponível.
- **Ollama local**: fallback opcional somente se o doctor confirmar disponibilidade.

Regras:

1. Classificar a tarefa antes de escolher executor.
2. Enviar task packet curto, paths e evidência, nunca a conversa inteira.
3. Reutilizar sessão somente para continuação real da mesma tarefa.
4. Ao trocar executor/modelo, gerar handoff compacto e abrir sessão nova.
5. Após 2 falhas consecutivas do mesmo executor, abrir circuit breaker e escolher o próximo elegível.
6. Apenas um executor por vez pode escrever em uma mesma worktree.
7. Se o writer perder quota/timeout, parar a mutação; um fallback gratuito pode analisar e preparar handoff, mas não assumir automaticamente a escrita.
8. O runtime global do Hermes permanece o padrão. Não ativar Codex App-Server como runtime global sem decisão específica, pois Hermes deve preservar suas próprias ferramentas de memória/delegação.
9. OpenCode/Antigravity trabalham sobre `git archive HEAD`. Se a tarefa depende de alterações ainda não commitadas, não fingir que esses executores as enxergam: usar Codex na worktree viva ou criar checkpoint autorizado.

## Regras de dados e segurança

- Nunca commitar `.env*`, tokens, service role, Cloudflare/GitHub tokens, connection strings ou segredos.
- `service_role` nunca entra em `VITE_*`, build, frontend ou logs.
- Modelos gratuitos/por assinatura de terceiros recebem apenas conteúdo público/sanitizado do repositório. Nunca enviar `.env*`, raw documents, PII, tokens, secrets ou service role.
- OpenCode e Antigravity orquestrados recebem um snapshot composto exclusivamente por arquivos rastreados do `HEAD`.
- Dados públicos do frontend devem vir de Supabase anon/publishable ou `data/public-candidates.json`.
- `../dataset2026` só deve ser lido por comandos explícitos de ingestão/refresh, nunca silenciosamente no build.
- Campos raw/PII/documentos crus não podem ir para snapshot público.
- Claims novas entram como `pending_review`; UI pública usa somente `published`.
- `docs/context-export/` é o contrato curado exposto ao raspador por MCP. Quando migrations alterarem schema, FKs, status, grants ou RLS relevantes, atualizar `docs/context-export/SCHEMA.md` e `CHANGELOG.md` no mesmo trabalho.
- Nunca colocar credenciais, `.env`, payloads brutos ou PII em `docs/context-export/`.
- OpenCode gratuito não recebe Supabase MCP nem outros MCPs no caminho orquestrado.

## Operações remotas

Sem autorização humana explícita, nenhum agente pode:

- aplicar migration no Supabase remoto;
- alterar RLS, RPC, Auth, Storage ou Edge Functions remotas;
- criar/rotacionar secrets;
- fazer deploy Cloudflare;
- alterar DNS/domínio;
- fazer commit, push, abrir/mergear PR ou atualizar `main` quando isso fizer parte de uma mutação funcional não previamente autorizada.

O deploy normal permanece GitHub Actions após merge autorizado em `main`. Não copiar `CLOUDFLARE_API_TOKEN` do GitHub para Hermes só para conveniência.

## Fluxo de implementação

1. Ler `.orchestrator/STATE.md` e revalidar `git status`, branch, HEAD e serviços relevantes.
2. Ler o trecho aplicável do `../Guia_Mestre_Correcao_Finalizacao_PWA_Eleicoes2026_FINAL.md` quando o arquivo estiver disponível.
3. Inspecionar símbolos/arquivos existentes antes de editar.
4. Usar TDD quando houver mudança de comportamento.
5. Escolher executor pela `.orchestrator/routing.yaml`.
6. Manter blocos pequenos e focados no gate atual.
7. Validar alterações com ferramentas locais, não apenas com a opinião do modelo que escreveu.
8. Registrar evidência curta, riscos e próximo passo em handoff/STATE quando houver checkpoint real.
9. Não fazer merge em `main` nem deploy de produção sem autorização explícita.

## Comandos de verificação

- `npm run orch:doctor`
- `npm run data:check`
- `npm run env:check`
- `npm run test -- --passWithNoTests`
- `npx tsc --noEmit`
- `npm run build`
- `npm run smoke:local`
- Para preview implantado: `npm run smoke:preview -- --url <preview-url>`
- Matriz de impacto: `node scripts/validate-impact-schema.mjs`

## Gates relevantes

- A contagem pública atual deve ser validada por `npm run data:check`; no checkpoint de 2026-08-12 são 938 candidaturas públicas e 906 fotos oficiais rastreáveis, não usar números históricos como 69/212/464/792 como gate atual.
- `tse_candidate_id` único e não nulo; `slug` único, estável e não vazio; rotas `/candidatos/:slug`; URLs antigas por UUID preservadas durante transição; sitemap usa a mesma coleção de slugs.
- Matriz de Impacto: Fases 0–1 estão localmente validadas no checkpoint; migrations `20260810090000` a `20260810090400` não devem ser presumidas no Supabase remoto até confirmação/aplicação autorizada.

## Convenções

- Commits em português com Conventional Commits.
- Relatórios de QA em `docs/qa/`.
- Migrations em `supabase/migrations/`, aplicadas com Supabase CLI quando autorizado.
- `opencode.jsonc` é configuração local versionada para agentes; não adicionar segredos nele.
- `.orchestrator/runtime/` é transitório e não versionado.
