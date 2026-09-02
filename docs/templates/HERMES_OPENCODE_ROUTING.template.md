# Hermes + OpenCode — template legado de roteamento

Status: **SUPERADO em 2026-08-10 pela arquitetura Hermes Multi-CLI v1**.

Este arquivo é mantido como registro histórico da política usada antes da
integração Codex MCP + Google Antigravity + snapshots sanitizados. Não deve ser
usado como instrução operacional atual.

## Fonte atual

Use, nesta ordem:

1. `AGENTS.md`;
2. `.orchestrator/routing.yaml`;
3. `.orchestrator/STATE.md`;
4. `docs/architecture/hermes-orchestrator-v1.md`;
5. `docs/runbooks/hermes-orchestrator-setup.md`.

## O que mudou

- Hermes é o control plane persistente.
- OpenCode deixou de ser braço mutável default e virou executor consultivo barato.
- OpenCode/DeepSeek free trabalha em snapshot `git archive HEAD`, sem MCP e sem worktree viva.
- Google AI Pro individual usa Antigravity CLI como executor consultivo de contexto amplo.
- Gemini CLI fica somente como compatibilidade para API key/enterprise.
- Codex MCP stdio é o executor técnico preferido para implementação/debug/testes.
- Codex escala Luna → Terra → Sol somente por evidência.
- Fallback de capacidade não transfere autoridade de escrita.
- Ollama + Codex OSS não fazem parte da rota operacional.
- O velho princípio “modelo pago primeiro” foi removido. O novo princípio é
  **executor mais barato adequado à classe da tarefa**.

## Compatibilidade

Comandos e observações históricas deste template foram absorvidos pelos arquivos
atuais. Não copie os antigos exemplos de `openai/gpt-5.5` ou Gemini pelo OpenCode
para automação nova sem revalidar catálogo, autenticação e custo.
