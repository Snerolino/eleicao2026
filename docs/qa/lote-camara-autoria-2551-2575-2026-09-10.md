# QA — autoria Câmara 2551-2575 — 2026-09-10

## Objetivo
Processar o próximo lote determinístico de autoria Câmara, revalidar metadados oficiais e manter retenção editorial fail-closed. Autoria não foi convertida em voto, impacto, score, claim, matriz ou fato público.

## Evidência oficial
- Seleção: 25 projetos únicos (`offset=2550`, `limit=25`), 50 ocorrências candidato–projeto e 20 candidatos únicos.
- Proposições Dados Abertos Câmara: 25/25 HTTP 200; identidade `dados.id` exata em 25/25.
- Tramitações oficiais: 25/25 HTTP 200; 96.108 bytes totais das respostas oficiais; SHA-256 preservado por endpoint no manifesto.
- Texto integral oficial catalogado: 25/25 URLs; conteúdo não lido/validado.
- Endpoint de tramitação independente catalogado: 25/25; nenhum evento foi validado como versão/evento vinculante.

## Execução editorial fail-closed
- Causal: 25/25 IDs exatos, 25 withheld, 0 pending_review, 0 approved, 0 score_eligible.
- Red-team: 25/25 IDs exatos, 25 withheld, 0 pending_review, 0 approved, 0 score_eligible.
- Reconciliação: 25/25 IDs exatos, 25 withheld; `content_read=false`, `remote_apply=false`.
- Bloqueio real: faltam texto integral validado, versão/evento vinculante e voto nominal individual. Autoria/ementa não prova posição, efeito causal ou score. Nenhum dado editorial foi promovido.

## Artefatos e hashes
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2551-2575-source-manifest.json`: `af6a547f040e7abd9b39b8440cfcf3b31b881c5ff9d4a16ea1dd35e4423c9b32`
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2551-2575-causal.json`: `9a71f1023524c4d8669b2481a3d064038c164d5e229da4b561fffb03a424ba99`
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2551-2575-redteam.json`: `68de8aefbc25fa6d84dc9e045bc735def25cccbeb938a3981681d64c74966d70`
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2551-2575-reconciled.json`: `01c09647843910f6dd6d5f81a1e4482aaf917075f2c8b6b18dfc1597e0c11ac9`

## Checkpoint
- `projects_analyzed=2575`, `last_batch=2551-2575`, `next_batch=2576-2600`, `withheld=2575`, `blocked_items=107`.
- Nenhuma migration, RLS, Auth, Storage, Edge Function, Supabase ou Cloudflare foi alterada/escrita.

## Próximo passo
Fechar gates locais Node 24; se verdes, publicar os artefatos/documentação pelo caminho backup Cloudflare e verificar produção pelo SHA exato. Depois continuar com 2576–2600, sem promover dados factuais/editoriais.
