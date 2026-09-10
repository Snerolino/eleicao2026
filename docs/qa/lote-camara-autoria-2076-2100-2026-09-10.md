# QA — autoria Câmara 2076–2100 — 2026-09-10

## Objetivo
Processar o intervalo determinístico de autoria Câmara com fonte oficial, duas lanes independentes e retenção fail-closed.

## Entregue e verificado
- Seleção determinística: `25` projetos únicos (`offset=2075`, `limit=25`) e `11` candidatos únicos.
- Fonte oficial: `25/25` endpoints Dados Abertos Câmara HTTP 200; identidade numérica exata `25/25`; `32.886` bytes e SHA-256 preservados em `data/legislative-import/camara/authored-project-review-batches/camara-authored-2076-2100-source-manifest.json`.
- Lane causal: `25/25` IDs exatos; todos `withheld`; `content_read=false`.
- Lane red-team independente: `25/25` IDs exatos; todos `withheld`.
- Reconciliação fail-closed: `25 withheld`, `0 pending_review`, `0 approved`, `0 score_eligible`.
- Artefato reconciliado: `data/legislative-import/camara/authored-project-review-batches/camara-authored-2076-2100-reconciled.json`.
- `remote_apply=false`; nenhuma escrita factual Supabase/Cloudflare.

## Bloqueio real
Os endpoints oficiais comprovam identidade e metadados da proposição, mas o lote não contém texto integral validado, versão/evento independente e voto nominal individual. Autoria/ementa não provam posição, efeito causal ou score. Nenhum dado foi inventado ou promovido.

## Checkpoint
- `projects_analyzed=2100`, `withheld=2100`, `approved=0`, `pending_review=0`, `blocked_items=86`.
- Próximo lote calculado: `2101–2125`.
- Lock exclusivo `flock` adquirido; um único writer local.

## Próximo passo
Iniciar `2101–2125` em nova lane read-only, mantendo fonte oficial, IDs exatos, duas lanes e retenção fail-closed; continuar separando autoria factual de voto, impacto, score e claims.
