# QA — Autoria Câmara 1376–1400 — 2026-09-02

## Objetivo
Processar o microbatch seguinte de 25 projetos únicos de autoria da Câmara em duas lanes read-only, sem converter autoria em voto, impacto ou score.

## Entrega verificada
- Seleção determinística: 25 projetos únicos, 100 ocorrências candidato–projeto e 20 candidatos únicos; IDs preservados exatamente.
- Lane causal / Antigravity: saída extraída de JSON com banner técnico, validada independentemente: 25/25 IDs, todos `withheld`, `score_eligible=false`.
- Lane red-team: Codex CLI retornou `AUTH_ERROR` real no transporte MCP Cloudflare (`Transport channel closed`, OAuth requerido) e não entregou a lista de 25 itens; saída foi rejeitada por cardinalidade. Fallback Antigravity red-team produziu e foi validado independentemente: 25/25 IDs, todos `withheld`, risco `high`.
- Reconciliação local: 25 itens, 0 divergências de cardinalidade/IDs, 0 aprovados, 0 `pending_review`, 25 `withheld`, `score_eligible=0`.
- Arquivo: `data/legislative-import/camara/authored-project-review-batches/camara-authored-unique-review-1376-1400-reconciled.json`.

## Estado dos dados
- Checkpoint: `projects_analyzed=1400`, `approved=0`, `pending_review=0`, `withheld=1400`, próximo `1401-1425`.
- Nenhum `authored_projects`, claim, voto, score, matriz, Supabase ou Cloudflare factual foi escrito.
- Os três artefatos `impact-editorial-*` modificados anteriormente permaneceram intocados.

## Bloqueios reais
- OpenCode/free pool permanece indisponível (executável ausente).
- Codex red-team desta execução foi bloqueado por `AUTH_ERROR` no recurso MCP Cloudflare; o output final não continha os 25 registros exigidos e foi fail-closed.
- Todos os projetos continuam retidos: autoria não equivale a voto e falta a cadeia verificável fonte oficial → texto → versão/evento nominal → efeito.

## Próximo passo
Retomar `1401–1425` com heartbeat, seleção determinística e duas lanes read-only. Repetir somente executores elegíveis conforme circuit breaker; manter `withheld` quando faltar fonte/evento e não aplicar autoria pública sem decisão `approved` e todos os gates verdes.
