# QA — autoria Câmara 2751–2775 — 2026-09-11

## Objetivo
Processar 25 projetos únicos de autoria da Câmara, preservar evidência oficial e manter causal/red-team fail-closed. Nenhuma autoria foi convertida em fato causal, voto, claim, score ou matriz.

## Seleção e fontes
- Lock exclusivo `flock`; seleção determinística `offset=2750`, `limit=25`; 25 projetos, 47 ocorrências e 18 candidatos.
- Câmara API: 25/25 HTTP 200; identidade `dados.id` exata 25/25.
- Texto integral oficial: 25/25 HTTP 200. Tramitação independente: 25/25 HTTP 200. Bytes/SHA-256 individuais catalogados; totais: API 38.692 bytes, texto integral 3.664.679 bytes, tramitação 34.262 bytes; `content_read=false`.
- Manifesto: `data/legislative-import/camara/authored-project-review-batches/camara-authored-2751-2775-source-manifest.json`.

## Revisão e bloqueio
- Causal 25/25 e red-team 25/25 IDs exatos; reconciliação `25 withheld`, `0 pending_review`, `0 approved`, `0 score_eligible`.
- Bloqueio real: texto integral não validado editorialmente, sem versão/evento vinculante e voto nominal individual; autoria/ementa/tramitação não prova posição, causalidade ou score.
- Nenhum dado factual/editorial foi aplicado remotamente; `remote_apply=false`.

## Artefatos e SHA-256
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2751-2775-source-manifest.json`: `6a4e91e32abc8b5c80325bd5b509e86ff0c7eee40356e41402454bcda48f74a8`
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2751-2775-causal.json`: `df94b72a855248e26d1f38030e26ebc560da39fa9f014f7790f8209fdb9a7add`
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2751-2775-redteam.json`: `0ce2d51d291edfd898f7e887e98fc958e0467b7f6457fe18338acba42913a204`
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2751-2775-reconciled.json`: `a96a896118816b8173db4894e8a7b42a43dea955f995c14fe6c5c2b1b92215d3`

## Checkpoint
- `projects_analyzed=2775`, `last_batch=2751-2775`, `next_batch=2776-2800`, `withheld=2775`, `pending_review=0`, `approved=0`, `blocked_items` incrementado por `authored-2751-2775-source-event-gap`.

## Gates locais
- Node `v24.19.0`: `npm run test -- --passWithNoTests` passou, `499/499` testes em `120` arquivos.
- `npx tsc --noEmit`, schema e `git diff --check`: passaram.
- `npm run data:check`: passou, `1003` candidaturas e `988` fotos oficiais.
- `npm run build`: passou, `245` módulos; sitemap `1003` candidatos + `2` estáticas.
- Churn timestamp-only de `impact-editorial-*` restaurado antes do commit.

## Fechamento de publicação
- Commit `fec6c09306ca2c06491def36acc1e7331fb47e5b` publicado; `git ls-remote` alinhado.
- Backup Cloudflare `334951434`, run `34552082367`: `completed/success`, `headSha` exato.
- Produção raiz HTTP 200; `/release.json` HTTP 200 confirmou SHA exato `fec6c09306ca2c06491def36acc1e7331fb47e5b`, versão `0.2.0`.
- Nenhuma migration, RLS, Auth, Storage, Edge Function, escrita factual Supabase ou matriz/score foi alterada/escrita.

## Próximo passo
Próximo chunk calculado: autoria Câmara `2776–2800`; manter retenção fail-closed.
