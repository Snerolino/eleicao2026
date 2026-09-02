# QA — Autoria Câmara 1351–1375 — 2026-09-02

## Objetivo
Processar o próximo microbatch de 25 projetos únicos de autoria da Câmara em duas lanes read-only, sem converter autoria em voto, impacto ou score.

## Preparação e seleção
- Lock exclusivo adquirido com `flock` durante seleção, checkpoint e reconciliação.
- Seleção read-only: 25 projetos únicos, 100 ocorrências candidato–projeto e 17 candidatos únicos, em `/tmp/camara-authored-unique-review-1351-1375.json`.
- IDs foram preservados exatamente na validação independente; nenhuma alteração no manifesto factual, snapshot público ou remoto.

## Lanes e verificação independente
- Lane causal / Antigravity: processo `exit=0`; saída bruta continha banner npm, portanto foi extraído e validado como JSON separado. Resultado: 25/25 IDs exatos, 25 `withheld`, 25 `score_eligible=false`; URLs ausentes apontam para `dadosabertos.camara.leg.br`.
- Lane red-team / free pool: bloqueada com `exit=69`; causa efetiva: `opencode não disponível; free pool indisponível`.
- Fallback red-team / Codex MCP Luna: respondeu com 25/25 IDs exatos, todos `withhold`, risco `high`, e ausência de evidência normativa/evento. A resposta compacta foi validada por cardinalidade e conjunto de IDs antes da reconciliação local.
- Reconciliação: 25 itens, 0 divergências, 0 aprovados, 0 `pending_review`, 25 `withheld`, `score_eligible=0` em `camara-authored-unique-review-1351-1375-reconciled.json`. Nenhum dado foi publicado.

## Estado dos dados
Checkpoint atualizado: `projects_analyzed=1375`, `approved=0`, `pending_review=0`, `withheld=1375`, lote `1351-1375=blocked`, próximo `1376-1400`.
Nenhum `authored_projects`, claim, voto, score, matriz, Supabase ou Cloudflare foi escrito.

## Bloqueios reais
- Free pool indisponível por ausência do executável OpenCode (`exit=69`).
- Todos os itens permanecem retidos porque não há cadeia completa e verificável de texto normativo oficial + versão/evento de votação nominal; autoria não equivale a voto.
- O trabalho não altera os três artefatos `impact-editorial-*` já modificados fora deste escopo.

## Próximo passo
Retomar `1376–1400` com seleção determinística, duas análises independentes e o mesmo gate estrito de IDs, fontes e eventos. Manter itens sem cadeia completa como `withheld`; não iniciar aplicação de `authored_projects` sem decisão `approved`, source gate verde, análise causal completa e red-team reconciliado.
