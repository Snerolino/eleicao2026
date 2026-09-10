# QA — autoria Câmara 2501–2525 — 2026-09-10

## Objetivo
Processar o próximo lote determinístico de autoria Câmara, revalidar fontes oficiais e manter retenção fail-closed. Autoria não foi convertida em voto, impacto, score ou fato público.

## Evidência oficial
- Seleção: 25 projetos únicos (offset=2500, limit=25), 50 ocorrências candidato–projeto e 20 candidatos únicos.
- Proposições Dados Abertos Câmara: 25/25 HTTP 200, identidade dados.id exata em 25/25.
- Tramitações oficiais: 25/25 HTTP 200; bytes totais das respostas oficiais=79596; SHA-256 preservado por endpoint.
- Texto integral: 25/25 URLs oficiais catalogadas, mas conteúdo não lido/validado.

## Editorial fail-closed
- Causal: 25/25 IDs exatos, 25 withheld, 0 pending_review, 0 approved, 0 score_eligible.
- Red-team: 25/25 IDs exatos, 25 withheld, 0 pending_review, 0 approved, 0 score_eligible.
- Reconciliação: 25/25 IDs exatos, 25 withheld; content_read=false, remote_apply=false.
- Bloqueio real: texto integral não validado, evento independente catalogado somente em 19/25 e ainda não validado como vinculante e voto nominal individual ausente. Nenhum dado editorial foi promovido.

## Artefatos e hashes
- data/legislative-import/camara/authored-project-review-batches/camara-authored-2501-2525-source-manifest.json: b8cd094ac8331e5fa4cb6856de6849fe3cc5c2f93781f315682f565874f4581e
- data/legislative-import/camara/authored-project-review-batches/camara-authored-2501-2525-causal.json: 00ccfe171723d74ef3d701457fcda25bf0f7d49fb5e8157210f571283d3ac6d8
- data/legislative-import/camara/authored-project-review-batches/camara-authored-2501-2525-redteam.json: 3f80675a9b9dbc0e5e2899393b2a98ce68c79797d7238ddccd17ccf3143dbca5
- data/legislative-import/camara/authored-project-review-batches/camara-authored-2501-2525-reconciled.json: 1406e611b54f562988cc3ab8d36d9fd29b2ca0a2611bdf20df76e8bf744cecf2

## Gates e estado
- Checkpoint: projects_analyzed=2525, last_batch=2501-2525, next_batch=2526-2550, withheld=2525, blocked_items=103.
- Nenhuma migration, RLS, Auth, Storage, Edge Function, Supabase ou Cloudflare foi alterada/escrita.
- O doctor detectou bloqueio local do shell padrão em Node 22; os gates devem usar Node 24.19.0.

## Próximo passo
Prosseguir para autoria Câmara 2526–2550 com as mesmas duas lanes e fontes oficiais; não promover sem texto/evento/voto completos.
