# MOA do perfil eleicao2026 — registro histórico

Data original: 2026-08-08
Status atual: **LEGADO / SUPERADO em 2026-08-10**

Este documento registra a cadeia MOA anterior (`scripts/moa-run.mjs`) e os
experimentos que levaram à arquitetura atual. Ele **não é mais a política de
roteamento default** do projeto.

## Fonte operacional atual

1. `AGENTS.md`;
2. `.orchestrator/routing.yaml`;
3. `.orchestrator/STATE.md`;
4. `docs/architecture/hermes-orchestrator-v1.md`;
5. `docs/runbooks/hermes-orchestrator-setup.md`.

## Por que o MOA antigo foi substituído

A política anterior tentava, em ordem, modelos pagos/mais potentes e só depois
modelos gratuitos. Isso tinha três problemas para o estado atual do projeto:

- gastava recursos caros em tarefas mecânicas que podem ser delegadas;
- misturava fallback de **capacidade** com fallback de **autoridade**;
- mantinha uma segunda cadeia de fallback dentro do OpenCode, concorrendo com a
  decisão do Hermes.

A arquitetura v1 muda o princípio para:

> **executor mais barato adequado à classe da tarefa**, com Hermes como único
> control plane e um writer por worktree.

## Cadeia histórica validada em 2026-08-08

Foi validada uma cadeia que incluía:

- OpenAI via OpenCode;
- Google via API;
- Cloudflare AI Gateway;
- modelos gratuitos OpenCode Zen;
- `ollama/gpt-oss:20b` local.

O wrapper histórico permanece em:

```bash
node scripts/moa-run.mjs "tarefa"
```

Use-o somente para reprodução/diagnóstico histórico ou quando houver decisão
explícita de fazê-lo. Não o invoque como fallback automático do Hermes v1.

## Codex validado em 2026-08-10

Antes da nova arquitetura, o Codex CLI foi validado com autenticação ChatGPT,
sem `OPENAI_API_KEY`, incluindo:

- `gpt-5.6-luna`;
- `gpt-5.6-terra`;
- `gpt-5.6-sol`;
- `codex exec` read-only;
- prompt via stdin;
- `--output-schema`;
- `codex mcp-server`.

O teste estruturado encontrou dois bugs reais em `src/services/candidates.ts` e
`src/pages/AdminPage.tsx`. Esses achados continuam pendentes como trabalho
separado; a decisão de integração, porém, já foi tomada: **Codex MCP stdio é o
executor técnico preferido do Hermes**.

## Arquitetura sucessora

Resumo atual:

```text
Hermes control plane
├── OpenCode + DeepSeek free -> triagem barata, snapshot HEAD
├── Google Antigravity       -> contexto amplo, snapshot HEAD
├── Codex MCP                -> implementação/debug/testes
│   └── Luna -> Terra -> Sol por evidência
├── Codex exec               -> fallback read-only do MCP
└── Codex OSS + Ollama       -> último fallback local opcional
```

As credenciais de produção Cloudflare/Supabase não são distribuídas para essa
cadeia. Migrations remotas, RLS/RPC, deploy, secrets e merge continuam gates
humanos.

Handoff que originou a migração:
`docs/handoff/2026-08-10-analise-externa-arquitetura-codex.md`.
