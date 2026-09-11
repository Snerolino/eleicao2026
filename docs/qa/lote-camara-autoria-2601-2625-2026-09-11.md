# QA — autoria Câmara 2601–2625 — 2026-09-11

## Objetivo
Processar boundedamente o lote determinístico de autoria Câmara 2601–2625, revalidar fontes oficiais com bytes/SHA e IDs exatos, e manter as lanes causal/red-team fail-closed. Autoria não foi convertida em fato causal, voto, claim, score ou matriz.

## Lock, baseline e seleção
- Lock exclusivo `flock` adquirido em `.orchestrator/runtime/locks/continuous-progress.lock`; único writer confirmado.
- Baseline Git: `main` no SHA `35cc3fc499c628db507d0fa51698aa386feaddae`; worktree limpa antes da mutação.
- Seleção determinística do manifesto factual: `offset=2600`, `limit=25`; 25 projetos únicos, 25 ocorrências candidato–projeto e 5 candidatos únicos.
- Sem leitura de documentos crus versionados; apenas metadados e respostas oficiais temporárias foram processados.

## Fontes oficiais verificadas
- Câmara API: 50/50 endpoints HTTPS oficiais HTTP 200 (proposição e tramitação), 84.011 bytes totais, SHA-256 individual preservado no manifesto.
- Identidade oficial `dados.id`: 25/25 exata.
- Texto integral: 25/25 URLs oficiais `www.camara.leg.br`, HTTP válido, 8.873.383 bytes totais e SHA-256 individual preservado no manifesto.
- Tramitação foi mantida como endpoint independente (`event_url != full_text_url`); nenhum evento foi promovido a evento nominal vinculante.
- Manifesto: `data/legislative-import/camara/authored-project-review-batches/camara-authored-2601-2625-source-manifest.json` — SHA-256 `3eac50d81fb3b855cf50cef3811610cb4843d3ee60d73c891acb6f05c78979a5`.

## Lanes causal/red-team
- Causal: 25/25 IDs exatos, `withheld=25`, `pending_review=0`, `approved=0`, `score_eligible=0`; `content_read=false`, `remote_apply=false`.
- Red-team: 25/25 IDs exatos, `withheld=25`, `pending_review=0`, `approved=0`, `score_eligible=0`; `content_read=false`, `remote_apply=false`.
- Reconciliação: 25/25 IDs exatos, `withheld=25`, `pending_review=0`, `approved=0`, `score_eligible=0`; `content_read=false`, `remote_apply=false`.
- Bloqueio real: faltam texto integral validado editorialmente, versão/evento vinculante e voto nominal individual. Autoria/ementa/tramitação não provam posição, efeito causal ou score.

## Artefatos e SHA-256
- `camara-authored-2601-2625-source-manifest.json`: `3eac50d81fb3b855cf50cef3811610cb4843d3ee60d73c891acb6f05c78979a5`
- `camara-authored-2601-2625-causal.json`: `3c7fbdb4dcaa450614ad80168e19432f59338ad8fa2496a22648f6ccc217da67`
- `camara-authored-2601-2625-redteam.json`: `c8c996a791aa32fa24ce1168516fe06f1b21860cd525e7f6b2e3d59657a4ac7c`
- `camara-authored-2601-2625-reconciled.json`: `bfe498ecb810c05a25aed9ff0202e0a6d6f5b4619c8f55ba4f92ac06ead651ef`

## Checkpoint e segurança
- `projects_analyzed=2625`, `last_batch=2601-2625`, `next_batch=2626-2650`, `withheld=2625`, `pending_review=0`, `approved=0`.
- Bloqueio registrado: `authored-2601-2625-source-event-gap`.
- `remote_apply=false`; nenhuma autoria factual pública, claim, voto, assessment, score ou matriz foi criada.
- Nenhuma migration, RLS, Auth, Storage ou Edge Function foi alterada; nenhuma escrita Supabase factual/editorial ocorreu.

## Próximo passo
Fechar os gates locais e a publicação deste checkpoint. Não iniciar 2626–2650 nesta execução.
