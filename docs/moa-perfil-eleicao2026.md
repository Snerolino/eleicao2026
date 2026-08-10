# MOA do perfil eleicao2026 — cadeia de modelos com salvaguardas

Data: 2026-08-08
Status: validado ao vivo

## Objetivo

Execução contínua de tarefas **sem interrupção** por impedimento de um único
provedor. A cadeia tenta primeiro modelos **pagos/mais potentes** (OpenAI,
Google, Cloudflare Workers AI — contas já credenciadas) e, quando algum estiver
exaurido, rate-limited, blocked ou offline, cai automaticamente para os
**modelos gratuitos** validados.

**Nenhum modelo é excluído da cadeia** — até mesmo os que podem ficar exauridos
são reativados depois de um tempo, por isso permanecem.

## Cadência de fallback validada (2026-08-08)

### Pagos (credenciados) — tentado primeiro

| # | Modelo                          | Provider            | Disponível        | Teste real |
|---|---------------------------------|---------------------|-------------------|------------|
| 1 | `openai/gpt-5.5`                | OpenAI (oauth)      | ✅ credencial     | OK (latência alta) |
| 2 | `google/gemini-3.5-flash`       | Google API          | ✅ GOOGLE_API_KEY | ✅ OK |
| 3 | `cloudflare-ai-gateway/openai/gpt-4o-mini` | Cloudflare Workers AI | ✅ credencial/CF key | ✅ OK |

> GitHub Models (`github-models`) credential existe mas modelos enumerados não retornaram
> no smoke de teste — mantido no auth, não na cadeia default ativa. Reativar se preciso.
> `google/gemini-2.5-flash` — erro "no longer available to new users", fora da cadeia.

### Gratuitos / backup — sempre ativo

| # | Modelo                       | Provider     | Observação |
|---|------------------------------|--------------|------------|
| 4 | `opencode/deepseek-v4-flash-free` | OpenCode Zen | fallback sempre ativo |
| 5 | `opencode/nemotron-3-ultra-free`  | OpenCode Zen |             |
| 6 | `opencode/laguna-s-2.1-free`      | OpenCode Zen |             |
| 7 | `opencode/ling-3.0-tiny-free`     | OpenCode Zen | leve/rápido |
| 8 | `opencode/mimo-v2.5-free`         | OpenCode Zen | multimodal  |
| 9 | `ollama/gpt-oss:20b`              | local (ollama) | sempre disponível (sem rede) |

### Regra de priorização

**Pago → Grátis → Local sempre disponível.**
Assim, se OpenAI, Google e Cloudflare caírem ou ficarem exauridos, os modelos
gratuitos do Zen entram de imediato, e `ollama/gpt-oss:20b` (local) é o teto
final: zero dependência de rede/serviço externo.

## Como usar

### Wrapper automático (recomendado)

```bash
node scripts/moa-run.mjs "tarefa em PT"                      # cadeia default
node scripts/moa-run.mjs "tarefa" --agent=plan               # modo plan
node scripts/moa-run.mjs "tarefa" --agent=build --files=src/a.ts,src/b.ts
node scripts/moa-run.mjs "tarefa" --once                       # só o 1º modelo
MOA_MODELS="m1,m2" node scripts/moa-run.mjs "tarefa"         # cadeia custom
```

Comportamento:
- tenta cada modelo em ordem;
- falha fatal (rate limit/quota/billing/timeout/rede/429/401/402/403/5xx) → pula pro próximo;
- sucesso → imprime o resultado com o nome do modelo vencedor;
- todos falharem → exit 1 com diagnóstico.

### Fallback embutido no OpenCode (`opencode.jsonc`)

`opencode.jsonc` contém `fallback[]` no `agent.build` e `agent.plan` com a mesma
cadeia — o OpenCode usa internamente quando o modelo primário falha, sem wrapper.

## Failover real validado

- `opencode/grok-4.5` (sem billing, pagar) → falhou → caiu para `deepseek-v4-flash-free` → ✅ OK
- `google/gemini-2.5-flash` (modelo deprecated) → falhou → caiu para chain → ✅ OK
- `--once` com `openai/gpt-5.5` → OK (mas latência alta > 5min — o wrapper timeout de 900s cobre)
- Cadeia default rodando; free chain toda responderia

## Persistência / exaurimento

- Modelos gratuitos do OpenCode Zen: **não excluídos** — reativam após cooldown.
- GPT-5.5: latência alta em smoke simples (pode exceder 300s). Recomendado só para
  tarefas que realmente precisam de potência; triagem/volume usa free.

## Salvaguarda offline (sempre disponível)

`ollama/gpt-oss:20b` (via `ollama-launch` provider em Hermes config: `http://127.0.0.1:11434`)
é o teto final: não depende de rede, funciona se todos os provedores caírem.

## Gates do MOA

- Read-only (plan/review): qualquer modelo da cadeia.
- Mutações: **apenas** modelo selecionado por humano + revisão de diff (gate H4 do projeto).
- Supabase/Cloudflare/deploy/secrets/migrations/commit/push/PR/merge: Hermes/humano após confirmação.
- Registrar modelo usado + status em cada bloco.

## Uso na continuidade

Exemplo: quando GPT-5.5 travar no smoke de um PR, o wrapper cai pro Gemini/free e
o build segue — sem interromper o fluxo até o final.