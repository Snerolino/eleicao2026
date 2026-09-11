# QA — autoria Câmara 2676–2700 — 2026-09-11

## Objetivo
Processar boundedamente os projetos 2676–2700 de autoria da Câmara, revalidar fontes oficiais e manter as lanes causal/red-team fail-closed. Autoria não foi convertida em fato causal, voto, claim, score ou matriz.

## Lock, baseline e seleção
- Lock exclusivo `flock` adquirido em `.orchestrator/runtime/locks/continuous-progress.lock`; único writer confirmado.
- Baseline Git: `main` no SHA `f232143cd6290d7bc928f131e24a5f235184fce6`; worktree limpa antes da geração.
- Seleção determinística: `offset=2675`, `limit=25`; 25 projetos únicos, 50 ocorrências candidato–projeto e 20 candidatos únicos.
- Nenhum documento cru foi versionado; conteúdo integral não foi lido/analisado (`content_read=false`).

## Fontes oficiais verificadas
- Câmara API: 50/50 endpoints HTTPS oficiais HTTP 200 (proposição e tramitação), 77.769 bytes totais e SHA-256 individual preservado no manifesto.
- Identidade oficial `dados.id`: 25/25 exata, comparada ao ID final do endpoint canônico.
- Texto integral: 25/25 URLs oficiais `www.camara.leg.br`, HTTP 2xx, 4.174.150 bytes totais e SHA-256 individual preservado.
- Tramitação permaneceu independente do texto integral; nenhum evento foi promovido a evento nominal vinculante.
- Manifesto: `data/legislative-import/camara/authored-project-review-batches/camara-authored-2676-2700-source-manifest.json`.

## Lanes causal/red-team
- Causal: 25/25 IDs exatos; 25 `withheld`, 0 `pending_review`, 0 `approved`, 0 `score_eligible`; `content_read=false`, `remote_apply=false`.
- Red-team: 25/25 IDs exatos; 25 `withheld`, 0 `pending_review`, 0 `approved`, 0 `score_eligible`; `content_read=false`, `remote_apply=false`.
- Reconciliação: 25/25 IDs exatos; 25 `withheld`, 0 `pending_review`, 0 `approved`, 0 `score_eligible`; `content_read=false`, `remote_apply=false`.
- Bloqueio real: sem validação editorial do texto integral, versão/evento vinculante e voto nominal individual. Autoria/ementa/tramitação não provam posição, efeito causal ou score.

## Artefatos e SHA-256
- `camara-authored-2676-2700-source-manifest.json`: `d17d21a46990aa77e7e93d24a8e219a081b3609e9c2a0b720dd1bf0af60e4c96`
- `camara-authored-2676-2700-causal.json`: `8ebb7e19bead640f805f378a09d3a7786a20ab51d76a9bf0d63a10fcc8d5dbd1`
- `camara-authored-2676-2700-redteam.json`: `57bccf6013ebb974b78625db8d7b6a7a8d52b38f7fc84b15ea35d7080502bb11`
- `camara-authored-2676-2700-reconciled.json`: `e1b3e4d0dc635cde0d1b0fdfa7df710e29189a92b228a1290b520e876b1c0542`

## Checkpoint e segurança
- `projects_analyzed=2700`, `last_batch=2676-2700`, `next_batch=2701-2725`, `withheld=2700`, `pending_review=0`, `approved=0`, `blocked_items=112`.
- Bloqueio registrado: `authored-2676-2700-source-event-gap`.
- Nenhuma autoria factual pública, claim, voto, assessment, score ou matriz foi criada; `remote_apply=false`.
- Nenhuma migration, RLS, Auth, Storage ou Edge Function foi alterada; nenhuma escrita Supabase factual/editorial ocorreu.

## Gates locais
Executados após a geração e restauração de churn não relacionado:
- Node `v24.19.0`.
- `npm run test -- --passWithNoTests`: 499/499 testes em 120 arquivos.
- `npx tsc --noEmit`: passou.
- `node scripts/validate-impact-schema.mjs`: passou.
- `npm run data:check`: passou, 1003 candidaturas e 988 fotos oficiais.
- `npm run build`: passou, 245 módulos, sitemap 1003 candidatos + 2 estáticas.
- `git diff --check`: passou.
- Revalidação externa do manifesto: 75/75 URLs oficiais HTTP 2xx; nenhuma falha.

## Próximo passo
Após os gates verdes, commit/push, CI/backup Cloudflare e validação de produção pelo SHA exato. Encerrar este lote antes de iniciar `2701–2725`.
