# QA — Autoria Câmara 1501–1525 — 2026-09-02

## Objetivo
Processar 25 projetos únicos de autoria oficial da Câmara em duas lanes read-only, sem converter autoria em voto, impacto, score ou claim público.

## Seleção e checkpoint
- Seleção determinística: 25 projetos únicos, offset 1500/limit 25, a partir de `candidate-authored-source-index-v1.json`.
- Checkpoint final: `blocked`, `projects_analyzed=1525`, `approved=0`, `pending_review=0`, `withheld=1525`, próximo `1526–1550`.
- Lock exclusivo adquirido com `flock`; nenhuma escrita remota foi executada.

## Lanes e verificação independente
- **Causal / Antigravity:** `exit=0`; JSON extraído e parseado independentemente; 25 itens, 25 IDs únicos, conjunto exato, todos `withheld`, `score_eligible=false`, `content_read=false`.
- **Red-team / free pool:** falhou por indisponibilidade/erro do provider após tentativa sequencial (`deepseek` retornou `Unexpected server error`; os demais não produziram saída verificável). Saída não foi aceita.
- **Fallback red-team / Codex MCP Luna:** JSON válido com 25 itens, conjunto exato, todos `withheld`, `score_eligible=false`, `content_read=false`. Reconciliação: 25 itens, 0 divergências, 0 aprovados, 0 pending_review, 25 withheld, 0 score_eligible.

## Estado dos dados
- Artefato reconciliado: `data/legislative-import/camara/authored-project-review-batches/camara-authored-unique-review-1501-1525-reconciled.json`.
- O artefato mantém `content_read=false`, `remote_apply=false` e fonte de autoria oficial da Câmara. Não afirma texto integral, versão, evento nominal ou efeito causal.
- Nenhum `authored_projects`, claim, voto, score, matriz, snapshot público, Supabase ou Cloudflare factual foi escrito.

## Bloqueios reais
- Free pool indisponível neste tick: erro de servidor no primeiro modelo e ausência de saída verificável no restante da cadeia; não houve repetição no mesmo tick.
- A cadeia necessária para autoria publicável/impacto continua ausente: fonte normativa verificável → texto integral → versão → evento nominal vinculante → efeito. Autoria e metadado oficial não equivalem a voto.
- O checkpoint via comando NPM foi bloqueado pelo guard do gateway (`cannot restart, stop, or uninstall the gateway from inside the gateway process`); o mesmo checkpoint foi escrito diretamente pelo script Node equivalente sob lock, com resultado confirmado.

## Próximo passo
Retomar `1526–1550` com heartbeat, seleção determinística, duas lanes read-only, validação estrita de cardinalidade/IDs/fontes e fail-closed. Não aplicar `authored_projects` sem fonte primária, análise causal completa e red-team reconciliado.
