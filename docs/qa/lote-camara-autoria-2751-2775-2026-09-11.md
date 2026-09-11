# QA — autoria Câmara 2751–2775 — 2026-09-11

## Objetivo
Processar 25 projetos únicos de autoria da Câmara, preservar evidência oficial e manter causal/red-team fail-closed. Nenhuma autoria foi convertida em fato causal, voto, claim, score ou matriz.

## Seleção e fontes
- Lock exclusivo `flock`; seleção determinística `offset=2750`, `limit=25`; 25 projetos, 50 ocorrências e 19 candidatos.
- Câmara API: 25/25 HTTP 200; identidade `dados.id` exata 25/25.
- Texto integral oficial: 25/25 HTTP 200. Tramitação independente: 25/25 HTTP 200. Bytes/SHA-256 individuais catalogados; `content_read=false`.
- Manifesto: `data/legislative-import/camara/authored-project-review-batches/camara-authored-2751-2775-source-manifest.json`.

## Revisão e bloqueio
- Causal 25/25 e red-team 25/25 IDs exatos; reconciliação `25 withheld`, `0 pending_review`, `0 approved`, `0 score_eligible`.
- Bloqueio real: texto integral não validado editorialmente, sem versão/evento vinculante e voto nominal individual; autoria/ementa/tramitação não prova posição, causalidade ou score.
- Nenhum dado factual/editorial foi aplicado remotamente; `remote_apply=false`.

## Artefatos e SHA-256
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2751-2775-source-manifest.json`: `c3518e49199977b5280590e8b3cd958c195463553263350c4cf640b1163a958e`
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2751-2775-causal.json`: `558b299efd140ecdda19d588ecb63cef564ec338ee62b8e6ccb5e7eb5d7855bd`
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2751-2775-redteam.json`: `b3df1c2157f91c3d2d8317b4b802274178f85563bff00f8d4b17b9cc16b404b5`
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2751-2775-reconciled.json`: `40862c00491248b869f42896d69121d6e2e24ba0f52bfea5589839c4ca5ee121`

## Checkpoint
- `projects_analyzed=2775`, `last_batch=2751-2775`, `next_batch=2776-2800`, `withheld=2775`, `pending_review=0`, `approved=0`, `blocked_items` incrementado por `authored-2751-2775-source-event-gap`.

## Gates locais
- Node `v24.19.0`: `npm run test -- --passWithNoTests` passou, `499/499` testes em `120` arquivos.
- `npx tsc --noEmit`, schema e `git diff --check`: passaram.
- `npm run data:check`: passou, `1003` candidaturas e `988` fotos oficiais.
- `npm run build`: passou, `245` módulos; sitemap `1003` candidatos + `2` estáticas.
- Churn timestamp-only de `impact-editorial-*` restaurado antes do commit.

## Fechamento de publicação
- Será registrado após o commit/push e a verificação do backup Cloudflare e da produção.
