# QA — autoria Câmara: resolução da paralisação withheld 1–1600 — 2026-09-04

## Objetivo

Parar de tratar os 1.600 projetos únicos já analisados como um bloco opaco de `withheld` e separar, com evidência oficial da própria Câmara, o que já pode voltar para revisão causal do que permanece bloqueado por natureza procedural ou por falta de evento vinculante.

## Artefatos gerados

- `data/legislative-import/camara/candidate-authored-source-recovery-queue-v1.json`
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-revisit-ready-batch-v1.json`
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-revisit-ready-batch-reconciled-v1.json`
- `scripts/recover-candidate-authored-sources.mjs`
- `scripts/build-candidate-authored-revisit-batch.mjs`
- `scripts/reconcile-candidate-authored-revisit-review.mjs`
- `scripts/lib/candidate-authored-top-review.mjs`

## Resultado verificado no universo 1–1600

Base analisada: os 1.600 projetos únicos já passados pela esteira de autoria, reproduzindo a mesma ordenação por cobertura de candidatos usada no top-review.

Contagem real após exigir `event_url` independente do `full_text_url`:

- `selected_projects`: **1600**
- `revisit_ready`: **551**
- `procedural_only`: **834**
- `missing_event_source`: **212**
- `missing_full_text_source`: **3**
- `with_full_text_url`: **1588**
- `with_event_url`: **1593**

## Interpretação

Isso resolve a paralisação técnica do bloco `withheld` em três grupos verificáveis:

1. **551 revisitáveis agora**
   - possuem `full_text_url` oficial e `event_url` oficial da Câmara independente do texto integral;
   - podem voltar para revisão causal/red-team por item sem depender do índice cego.

2. **834 procedurais_only**
   - continuam sem promoção editorial, mas agora estão identificados como bloqueio substantivo de natureza procedural, não como fila cega.

3. **212 itens com falta de evento oficial vinculante independente** + **3 sem texto integral oficial**
   - continuam bloqueados por fonte/evento.

## Primeiro lote revisitável já reavaliado

Lotes gerados:

- `data/legislative-import/camara/authored-project-review-batches/camara-authored-revisit-ready-batch-v1.json`
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-revisit-ready-batch-reconciled-v1.json`

A primeira rodada causal + red-team sobre os 25 primeiros revisitáveis ficou em:

- `pending_review`: **17**
- `withheld`: **8**
- `approved`: **0**
- `score_eligible`: **0**

Primeiros itens do lote:

- `camara:pec-27-2023-2363434`
- `camara:pec-48-2024-2478427`
- `camara:emc-23-2019-2204310`

IDs promovidos a `pending_review` nessa primeira rodada:

- `camara:pec-27-2023-2363434`
- `camara:pec-48-2024-2478427`
- `camara:pec-44-2023-2388029`
- `camara:pec-31-2025-2544926`
- `camara:pec-35-2025-2563273`
- `camara:pec-40-2025-2578996`
- `camara:pec-50-2023-2391567`
- `camara:emc-1-0-2624861`
- `camara:emc-10-0-2566578`
- `camara:pec-11-2025-2487390`
- `camara:pec-23-2024-2436619`
- `camara:pec-31-2024-2455515`
- `camara:pec-49-2025-2596372`
- `camara:pec-50-2025-2598301`
- `camara:pl-1565-2024-2431027`
- `camara:emc-168-2019-2222219`
- `camara:emc-217-2019-2205934`

## Fallback global

O fallback global do perfil foi mantido **vazio** por segurança operacional:

- `openai-api/gpt-5.4` estava sem créditos;
- `gemini-2.0-flash` estava removido;
- deixar fallback inválido só reintroduzia falhas falsas.

O primário funcional permanece `openai-codex / gpt-5.6-luna`, e o job horário está pinado nele.

## Verificação executada

- `npm run test -- --run scripts/__tests__/candidate-authored-top-review.test.mjs` → **2/2 OK**
- `node scripts/recover-candidate-authored-sources.mjs --limit=1600 --concurrency=12` → **OK**
- `node scripts/build-candidate-authored-revisit-batch.mjs --limit=25` → **OK**
- `bash scripts/orchestrator/run-antigravity.sh "$(cat /tmp/camara-authored-revisit-causal-prompt.txt)"` → **OK**
- `hermes -p eleicao2026 -z "$(cat /tmp/camara-authored-revisit-redteam-prompt.txt)" --provider openai-codex -m gpt-5.6-luna --reasoning none` → **OK**
- `node scripts/reconcile-candidate-authored-revisit-review.mjs ...` → **OK**
- `hermes -p eleicao2026 fallback list` → **sem fallback providers configurados**

## Limite que continua real

Esta correção **não aprova nem publica** automaticamente os 1.600 itens. Ela remove a paralisação cega, entrega uma fila factual/source-first com **551 revisitáveis**, **834 procedurais** e **215 bloqueios remanescentes de fonte/evento**, e já converteu **17 itens do primeiro lote** em `pending_review` local. A aprovação editorial pública continua dependente dos gates seguintes.
