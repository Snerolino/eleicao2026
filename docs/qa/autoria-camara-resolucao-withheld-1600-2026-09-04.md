# QA — autoria Câmara: resolução da paralisação withheld 1–1600 — 2026-09-04

## Objetivo

Parar de tratar os 1.600 projetos únicos já analisados como um bloco opaco de `withheld` e separar, com evidência oficial da própria Câmara, o que já pode voltar para revisão causal do que permanece bloqueado por natureza procedural ou por falta de evento vinculante.

## Artefatos gerados

- `data/legislative-import/camara/candidate-authored-source-recovery-queue-v1.json`
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-revisit-ready-batch-v1.json`
- `scripts/recover-candidate-authored-sources.mjs`
- `scripts/build-candidate-authored-revisit-batch.mjs`
- `scripts/lib/candidate-authored-top-review.mjs`

## Resultado verificado no universo 1–1600

Base analisada: os 1.600 projetos únicos já passados pela esteira de autoria, reproduzindo a mesma ordenação por cobertura de candidatos usada no top-review.

Contagem real:

- `selected_projects`: **1600**
- `revisit_ready`: **765**
- `procedural_only`: **834**
- `missing_event_source`: **1**
- `missing_full_text_source`: **0**
- `with_full_text_url`: **1585**
- `with_event_url`: **1588**

## Interpretação

Isso resolve a paralisação técnica do bloco `withheld` em três grupos verificáveis:

1. **765 revisitáveis agora**
   - possuem `full_text_url` oficial e `event_url` oficial da Câmara;
   - podem voltar para revisão causal/red-team por item sem depender do índice cego.

2. **834 procedurais_only**
   - continuam sem promoção editorial, mas agora estão identificados como bloqueio substantivo de natureza procedural, não como fila cega.

3. **1 item com falta de evento oficial vinculante**
   - continua bloqueado por fonte/evento.

## Próximo lote revisitável

Lote pronto gerado em:

- `data/legislative-import/camara/authored-project-review-batches/camara-authored-revisit-ready-batch-v1.json`

Contém os **25 primeiros projetos** já revisitáveis com fonte oficial suficiente para nova rodada causal, começando por:

- `camara:pec-27-2023-2363434`
- `camara:pec-20-2024-2435133`
- `camara:pec-16-2026-2644800`

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
- `hermes -p eleicao2026 fallback list` → **sem fallback providers configurados**

## Limite que continua real

Esta correção **não aprova nem publica** automaticamente os 1.600 itens. Ela remove a paralisação cega e entrega uma fila factual/source-first com 765 revisitáveis e 834 procedurais já separados. A aprovação editorial continua dependente da análise causal/red-team por item e dos gates de fonte/evento.
