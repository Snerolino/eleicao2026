# QA — autoria Câmara 2626–2650 — 2026-09-11

## Objetivo
Processar boundedamente o lote determinístico de autoria Câmara 2626–2650, revalidar fontes oficiais com bytes/SHA e IDs exatos, e manter causal/red-team fail-closed. Autoria não foi convertida em fato causal, voto, claim, score ou matriz.

## Lock, baseline e seleção
- Lock exclusivo `flock` adquirido em `.orchestrator/runtime/locks/continuous-progress.lock`; único writer confirmado.
- Baseline Git: `main` no SHA `a3e22bc7e686dd654f7c1a91114f696303860844`; worktree limpa antes do lote, salvo os quatro artefatos deste lote.
- Seleção determinística: `offset=2625`, `limit=25`; 25 projetos únicos, 50 ocorrências candidato–projeto e 19 candidatos únicos.
- Nenhum documento cru foi versionado nem conteúdo integral foi lido para análise.

## Fontes oficiais verificadas
- Câmara API: 50/50 endpoints HTTPS oficiais HTTP 200 (proposição e tramitação), 92,038 bytes totais e SHA-256 individual preservado no manifesto.
- Identidade oficial `dados.id`: 25/25 exata.
- Texto integral: 25/25 URLs oficiais `www.camara.leg.br`, HTTP válido, 5,160,931 bytes totais e SHA-256 individual preservado.
- Tramitação permaneceu como endpoint independente (`event_url != full_text_url`); nenhum evento foi promovido a evento nominal vinculante.
- Manifesto: `data/legislative-import/camara/authored-project-review-batches/camara-authored-2626-2650-source-manifest.json`.

## Lanes causal/red-team
- Causal: 25/25 IDs exatos, `withheld=25`, `pending_review=0`, `approved=0`, `score_eligible=0`; `content_read=false`, `remote_apply=false`.
- Red-team: 25/25 IDs exatos, `withheld=25`, `pending_review=0`, `approved=0`, `score_eligible=0`; `content_read=false`, `remote_apply=false`.
- Reconciliação: 25/25 IDs exatos, `withheld=25`, `pending_review=0`, `approved=0`, `score_eligible=0`; `content_read=false`, `remote_apply=false`.
- Bloqueio real: faltam validação editorial de texto integral, versão/evento vinculante e voto nominal individual. Autoria/ementa/tramitação não provam posição, efeito causal ou score.

## Artefatos e SHA-256
- `camara-authored-2626-2650-source-manifest.json`: `f0c12e0e03fc752ffef8af2d763a760cb0da246f6f8b6dd0dc290720f793593a`
- `camara-authored-2626-2650-causal.json`: `f0810932a45cb526bdc63977b57f4922953f114f628997abda64b24b270f9caa`
- `camara-authored-2626-2650-redteam.json`: `0e4784d0f698d1d3726e476aff092c7ba8dbd4ea64dc5c13bc45e4566eee79ed`
- `camara-authored-2626-2650-reconciled.json`: `3cb3971b8ea6ec3a4c50b44e2c50aaa0c405fda746edb7ec2b8357f90ae6107f`

## Checkpoint e segurança
- `projects_analyzed=2650`, `last_batch=2626-2650`, `next_batch=2651-2675`, `withheld=2650`, `pending_review=0`, `approved=0`.
- Bloqueio registrado: `authored-2626-2650-source-event-gap`.
- `remote_apply=false`; nenhuma autoria factual pública, claim, voto, assessment, score ou matriz foi criada.
- Nenhuma migration, RLS, Auth, Storage ou Edge Function foi alterada; nenhuma escrita Supabase factual/editorial ocorreu.

## Gates locais e publicação
- Node `v24.19.0` confirmado.
- Os quatro artefatos foram validados programaticamente: 25 itens/projetos, 50 endpoints API, 25 textos, 25 IDs exatos, 25 withheld e zero approved/pending/score.
- Gates verdes: `npm run test` 499/499 em 120 arquivos; `npx tsc --noEmit` RC 0; schema RC 0; `npm run data:check` RC 0 (1003 candidaturas, 988 fotos); `npm run build` RC 0 (245 módulos, sitemap 1003+2); `git diff --check` RC 0.
- O build gerou churn não relacionado nos três artefatos `impact-editorial-*`; todos foram restaurados antes do commit.

## Publicação verificada
- Commit final de artefatos/documentação: `c5b4f701aea885ae48b1a276d40c233fa26c47dc`; `git push origin main` e `git ls-remote` confirmaram alinhamento.
- Backup Cloudflare `334951434`, run `34548978858`: `completed/success`, `headSha` exato.
- Produção raiz HTTP 200 e `/release.json` HTTP 200; release confirmou SHA exato `c5b4f701aea885ae48b1a276d40c233fa26c47dc`, versão `0.2.1324`.

## Próximo passo
Lote fechado. Não iniciar 2651–2675 neste ciclo.
