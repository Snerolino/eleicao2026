# QA — segundo lote revisitável de autoria Câmara — 2026-09-04

## Objetivo

Continuar a revisão causal/red-team dos projetos de autoria da Câmara que já possuem fonte oficial da proposição, texto integral e evento oficial independente.

## Lote

- Origem: `candidate-authored-source-recovery-queue-v1.json`
- Faixa da fila revisitável: posições 26–50
- Itens: **25**
- Primeiro item: `camara:emc-218-2019-2205935`
- Último item: `camara:emc-130-2019-2205731`
- Aplicação remota: `false`

## Lanes

- Causal via Antigravity: resposta obtida e normalizada para JSON; **25/25** IDs.
- Red-team via `openai-codex/gpt-5.6-luna`: resposta obtida e validada; **25/25** IDs.
- Reconciliação independente: cardinalidade e identidade exatas; sem divergência estrutural.

## Resultado reconciliado

Artefato: `data/legislative-import/camara/authored-project-review-batches/camara-authored-revisit-26-50-reconciled-v1.json`

- `pending_review`: **14**
- `withheld`: **11**
- `approved`: **0**
- `score_eligible`: **0**

Regra aplicada: somente a concordância causal + red-team em `pending_review` promove o item para revisão editorial aprofundada. Nenhum item foi publicado como aprovado, claim, voto, score ou matriz.

## Fallback global

Permanece sem fallback global configurado. O job horário continua pinado em `openai-codex/gpt-5.6-luna`, que respondeu à rodada red-team.

## Verificação

- Prompts e respostas preservados temporariamente em `/tmp`; dados versionados contêm somente derivados públicos e fontes oficiais.
- `node scripts/reconcile-candidate-authored-revisit-review.mjs ...` → OK.
- `npm run test` → **493/493**.
- `npm run data:check` → OK.
- `npm run build` → OK.
- `git diff --check` → OK.

## Próximo passo

Processar as posições 51–75 da `revisit_queue` com a mesma validação. Manter `remote_apply=false` até revisão editorial e gates de publicação próprios.
