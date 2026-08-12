# Diagnóstico READ-ONLY — Rota Hermes → Codex MCP (2026-08-12)

Status: `diagnóstico apenas, sem correção`
Conclusão: `AUTH_STATUS=CODEX_MCP_AUTH_FAILURE`

## Ferramenta
- servidor MCP: `mcp-codex`
- ferramenta estrutural: `mcp__codex__codex`
- disponibilidade: registrada/enabled; chamada real retornou 401

## Chamada real (sandbox=read-only)
- tool call executada: sim (1x)
- sandbox read-only: sim
- resultado recebido: não

## Erro
- status: 401 Unauthorized
- componente: OpenAI API — `https://api.openai.com/v1/responses`
- classe: `Missing basic authentication in header`
- momento: durante a chamada ao Codex (não em MCP auxiliar)
- mensagem sanitizada: `unexpected status 401 Unauthorized: Missing <REDACTED> basic authentication in header`

## Diferenciação de autenticações
- `CODEX_CHATGPT_AUTH` = OK (`codex login status` → Logged in using ChatGPT; `codex exec` read-only → CODEX_AUTH_OK)
- `HERMES_OPENAI_CODEX_PROVIDER` = FALHA (provider Hermes não entrega credencial ao processo `codex mcp-server`)
- `CODEX_MCP_SERVER` = processo ativo, herda falha de credencial do provider
- `CLOUDFLARE_MCP_AUTH` = separado; `AuthRequired` de `mcp.cloudflare.com` é orthogonal e não causa este 401

## Decisão
MCP Codex deixado de lado temporariamente. Implementação local pelo coordenador
(provider opencode/DeepSeek ou Hermes direto) para tarefas mecânicas do plano,
sem mascarar a falha do MCP.
