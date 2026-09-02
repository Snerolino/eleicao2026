# QA — Aceleração de executores e gates de autoria — 2026-09-02

## Correções aplicadas

- Fallback Hermes configurado fora do repositório: `openai-codex → gemini-2.0-flash`.
- Node do shell/gateway alinhado em `v24.19.0`.
- Modelo AGY obsoleto substituído por `Gemini 3.6 Flash (Low)`.
- API key hardcoded removida de `scripts/retry-agy-blocks.sh`.
- Referências documentais a arquivos de chave e `service_role` legado removidas.
- Contrato factual separado com `CandidateAuthoredProjectFact`/`authored_project_facts`.
- Guard de writer criado em `scripts/lib/assert-authored-writer-scope.mjs`.
- Pré-classificação criada em `scripts/classify-candidate-authored-projects.mjs`.
- Fila factual: `20.657` procedurais e `17.701` substantivos em `38.358` registros.

## Verificação de executores

- `orch:doctor --smoke`: `52 OK`, `6 WARN`, `0 FAIL`.
- Codex MCP: transporte e descoberta de ferramentas comprovados.
- Supabase read-only MCP: conectado.
- Raspador MCP: conectado.
- Antigravity: leitura oficial comprovada.
- Fallback Gemini configurado e sem modelo obsoleto.
- OpenCode permanece consultivo; smoke opcional não comprovou leitura.
- Ollama permanece desabilitado até responder ao preflight.

## Guardas

- `--apply` do reconciliador foi testado com worktree externa suja e bloqueou corretamente.
- Scan de hardcoded secrets: limpo para chave/API token.
- Nenhum snapshot público foi alterado nesta correção.

## Gates finais

- `npm run data:check`: aprovado.
- `npx tsc --noEmit`: aprovado.
- `npm run test -- --passWithNoTests`: aprovado.
- `npm run build`: aprovado.
- `npm run smoke:local`: aprovado.
- `git diff --check`: aprovado para os arquivos desta entrega; alterações editoriais preexistentes permanecem fora do escopo.

## Estado de publicação

- Fatos de autoria estão no manifesto/fila factual, não no snapshot público.
- Nenhum projeto editorial foi aprovado até agora; portanto não há projeto causal seguro para publicar.
- Próximo lote deve usar o fallback quando o provider primário falhar e manter análise/red-team em paralelo.
