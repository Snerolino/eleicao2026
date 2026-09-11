# QA — autoria Câmara 2726–2750 — 2026-09-11

## Objetivo
Processar boundedamente 25 projetos únicos de autoria da Câmara, revalidar fontes oficiais com HTTP, bytes e SHA-256 e manter causal/red-team fail-closed. Nenhuma autoria foi convertida em fato causal, voto, claim, score ou matriz.

## Lock, baseline e seleção
- Lock exclusivo `flock` adquirido em `.orchestrator/runtime/locks/continuous-progress.lock`; único writer confirmado; baseline em `main`.
- Seleção determinística: `offset=2725`, `limit=25`; 25 projetos únicos, 50 ocorrências candidato–projeto e 15 candidatos únicos.
- Nenhum documento cru foi versionado; conteúdo integral não foi lido/analisado (`content_read=false`).

## Fontes oficiais verificadas
- Câmara API: 25/25 endpoints oficiais HTTPS HTTP 200; bytes e SHA-256 preservados individualmente.
- Identidade oficial `dados.id`: 25/25 exata, conferida contra o ID final de cada endpoint canônico.
- Texto integral: 25/25 URLs oficiais HTTP 200; bytes e SHA-256 preservados individualmente; conteúdo não lido.
- Tramitação: 25/25 endpoints oficiais HTTP 200; catalogada independentemente, sem promoção a evento nominal vinculante.
- Totais de bytes: 36177 bytes API, 4360003 bytes texto, 46751 bytes tramitação.
- Manifesto: `data/legislative-import/camara/authored-project-review-batches/camara-authored-2726-2750-source-manifest.json`.

## Lanes causal/red-team
- Causal: 25/25 IDs exatos; 0 `pending_review`, 0 `approved`, 25 `withheld`, 0 `score_eligible`; `content_read=false`, `remote_apply=false`.
- Red-team: 25/25 IDs exatos; 0 `pending_review`, 0 `approved`, 25 `withheld`, 0 `score_eligible`; `content_read=false`, `remote_apply=false`.
- Reconciliação: 25/25 IDs exatos; 0 `pending_review`, 0 `approved`, 25 `withheld`, 0 `score_eligible`; `content_read=false`, `remote_apply=false`.
- Bloqueio real: sem validação editorial do texto integral, versão/evento vinculante e voto nominal individual. Autoria/ementa/tramitação não provam posição, efeito causal ou score.

## Artefatos e SHA-256
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2726-2750-source-manifest.json`: `0e37fc9bb798c41745b7874c815eb2db9f487c35744a185b8a535abfb436c39f`
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2726-2750-causal.json`: `0e8ce06cd3bb828965bf30534e02007b009127c554f1d72a0ece0f5dee686477`
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2726-2750-redteam.json`: `f1d67eeac16ef55fe6b0883fb29fcd0846ae331c22a8dbbf0a75af2446d4c8fc`
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2726-2750-reconciled.json`: `580157e017bf624d85c7ef1346b827b257f922658afa596c893f83b0213ceb74`

## Checkpoint e segurança
- `projects_analyzed=2750`, `last_batch=2726-2750`, `next_batch=2751-2775`, `withheld=2750`, `pending_review=0`, `approved=0`, `blocked_items` incrementado por `authored-2726-2750-source-event-gap`.
- Nenhuma autoria factual pública, claim, voto, assessment, score ou matriz foi criada; `remote_apply=false`.
- Nenhuma migration, RLS, Auth, Storage ou Edge Function foi alterada; nenhuma escrita Supabase factual/editorial ocorreu.

## Gates locais
- Node `v24.19.0`: `npm run test -- --passWithNoTests` passou, `499/499` testes em `120` arquivos.
- `npx tsc --noEmit`: passou.
- `node scripts/validate-impact-schema.mjs`: passou.
- `npm run data:check`: passou, `1003` candidaturas e `988` fotos oficiais.
- `npm run build`: passou, `245` módulos; sitemap `1003` candidatos + `2` estáticas.
- `git diff --check`: passou; churn timestamp-only de `impact-editorial-*` restaurado.

## Fechamento de publicação
- Commit `290067fc9c1f394cb4e97f11cee1f7004c0b36dd` publicado; `git ls-remote` confirmou alinhamento.
- Backup Cloudflare `334951434`, run `34551460231`: `completed/success`, `headSha` exato.
- Produção raiz HTTP 200; `/release.json` HTTP 200 confirmou SHA exato `290067fc9c1f394cb4e97f11cee1f7004c0b36dd`, versão `0.2.1335`.
- Nenhuma migration, RLS, Auth, Storage, Edge Function, escrita factual Supabase ou matriz/score foi alterada/escrita.

## Próximo passo
Próximo chunk calculado: autoria Câmara `2751–2775`; manter retenção fail-closed e iniciar somente após este fechamento documental.
