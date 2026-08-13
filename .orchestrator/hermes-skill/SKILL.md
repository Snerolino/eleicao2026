---
name: eleicao2026-orchestrator
description: Orquestra o projeto eleicao2026 com Hermes, Codex MCP, Antigravity, OpenCode e fallback local preservando contexto, custo e gates.
version: 1.0.0
platforms: [linux]
metadata:
  hermes:
    tags: [orchestration, coding, codex, opencode, antigravity, supabase, cloudflare]
    category: software-development
    requires_toolsets: [terminal]
---

# Eleicao2026 Orchestrator

## Quando usar

Carregue esta skill para qualquer continuação de implementação, diagnóstico,
review ou retomada do repositório `Snerolino/eleicao2026`.

Não use para substituir `AGENTS.md`: esta skill define **como orquestrar**;
`AGENTS.md` define **as regras do projeto**.

## Bootstrap obrigatório

1. Confirme a raiz Git e leia `AGENTS.md`.
2. Leia `.orchestrator/STATE.md` e `.orchestrator/routing.yaml`.
3. Revalide `git status --short --branch` e `git rev-parse HEAD`.
4. Rode `npm run orch:doctor` se não houver doctor atual nesta sessão.
5. Revalide serviços remotos somente quando necessários à tarefa.
6. Não implemente nada antes de classificar a tarefa e a autoridade necessária.

## Classes de tarefa

### cheap_analysis

Preferir:

1. `npm run orch:opencode -- '<task packet>'`;
2. `npm run orch:free -- '<task packet>'`;
3. `npm run orch:google -- '<task packet>'`;
4. `npm run orch:codex -- '<task packet>'`;
5. `npm run orch:local -- '<task packet>'`, se disponível.

OpenCode e Google operam sobre snapshot rastreado do `HEAD`. Nunca afirmar que
viram mudanças não commitadas.

`orch:free` é o pool gratuito sequencial (`deepseek → nemotron → laguna → ling →
mimo`) e também opera em snapshot sanitizado/read-only, com MCP desligado e
somente `agent plan`.

### large_context

Preferir:

1. Google Antigravity;
2. OpenCode free;
3. Codex read-only;
4. local.

### code_change

Use Codex MCP. Comece em `gpt-5.6-luna` salvo se o task packet justificar nível
maior. Use `workspace-write` somente dentro da worktree autorizada.

### difficult_debug

Use Codex MCP. Luna pode fazer a primeira inspeção; escale para Terra quando a
tarefa for multi-arquivo, os testes continuarem falhando ou houver incerteza
material.

### critical_change

Use Codex MCP Terra/Sol conforme evidência e mantenha gate humano antes de
qualquer mutação remota ou alteração de segurança.

## Escalonamento Codex

- Luna -> Terra: resultado incompleto, multi-arquivo, testes ainda falhando ou incerteza material.
- Terra -> Sol: arquitetura de alto impacto, regressão difícil ou raciocínio de segurança crítico.
- Mudou de modelo: abra thread nova e envie handoff compacto. Não despeje o transcript anterior.

## Task packet

Antes de delegar, reduza o contexto para:

- `task_id`;
- objetivo em uma frase;
- modo/autoridade;
- paths necessários;
- evidência já confirmada;
- constraints;
- critério de aceite.

Use `.orchestrator/templates/TASK_PACKET.md` como referência.

## Handoff

Quando mudar de executor, ocorrer timeout/quota ou houver checkpoint, registre
somente:

- status;
- summary;
- findings;
- evidence;
- files_changed;
- tests;
- risks;
- recommended_action;
- human_review_required.

Use o schema `.orchestrator/schemas/executor-result.schema.json`.

## Circuit breaker

Classifique falhas como:

- RATE_LIMITED;
- QUOTA_EXHAUSTED;
- TIMEOUT;
- AUTH_ERROR;
- DOWN.

Após duas falhas consecutivas no mesmo executor, pare de repetir o mesmo prompt
e use o próximo executor elegível.

Fallback de capacidade **não** transfere autoridade. Se o writer Codex perder
quota, um executor barato pode investigar e preparar handoff, mas não continuar
a escrita automaticamente.

## Segurança de contexto

OpenCode/DeepSeek e Antigravity recebem somente snapshots `git archive HEAD`.
Nunca enviar a modelos gratuitos/terceiros:

- `.env*`;
- tokens ou keys;
- Supabase service role/connection strings;
- documentos brutos;
- PII;
- dados externos não sanitizados.

Se uma revisão depende de diff não commitado, use Codex na worktree viva.

## Um writer por worktree

Nunca permita dois agentes mutáveis na mesma worktree. Para implementações
independentes, use worktrees e task IDs separados.

## Gates humanos permanentes

Pare antes de:

- migration Supabase remota;
- alteração de RLS/RPC/Auth/Storage/Edge Function remota;
- secrets/credenciais;
- deploy Cloudflare;
- DNS/domínio;
- commit/push/PR/merge quando a autorização do arco não cobrir explicitamente a ação.

GitHub Actions continua sendo o caminho normal de deploy após merge autorizado
em `main`.

## Checkpoint atual esperado

No checkpoint pós-2026-08-12:

- A Fase 2 da Matriz de Impacto está fechada em produção.
- Migrations `20260810090000` a `20260810090400` e
  `20260812000000_grant_public_read.sql` foram aplicadas no Supabase remoto.
- Produção Cloudflare validada no release `3064761-20260812T160735671Z`.
- Snapshot público atual: 938 candidaturas públicas; 906 fotos rastreáveis;
  manifesto TSE com 939 registros oficiais.
- Próximo arco recomendado: `eleicao2026-pos-fase2-matrizes-reais`, preparando
  a primeira carga real de proposições/votos e catálogo real de FKs em
  dry-run/SQL, sem publicar nada automaticamente.

Sempre confirme esses fatos em `.orchestrator/STATE.md` antes de agir, pois
`STATE.md` é checkpoint, não oráculo eterno.

## Verificação

Antes de retomar implementação:

```bash
npm run orch:doctor -- --smoke
npm test
npx tsc --noEmit
npm run build
node scripts/validate-impact-schema.mjs
```

Se o doctor tiver `FAIL`, corrija a infraestrutura primeiro. `WARN` de executor
opcional pode ser aceitável desde que exista rota de fallback segura.
