# QA — autoria Câmara 2376–2400 — 2026-09-10

## Objetivo
Processar o próximo lote determinístico de autoria Câmara com fonte oficial, duas lanes independentes e retenção fail-closed. Nenhum fato editorial foi promovido.

## Seleção e fonte
- 25 projetos únicos (`offset=2375`, `limit=25`), 50 ocorrências candidato–projeto e 21 candidatos únicos.
- Endpoints oficiais Dados Abertos Câmara: 25/25 HTTP 200; identidade exata `dados.id`: 25/25.
- Bytes das respostas de proposição + tramitação: 212.064; SHA-256 por resposta preservado no manifesto `data/legislative-import/camara/authored-project-review-batches/camara-authored-2376-2400-source-manifest.json`.
- URLs catalogadas: 23 textos integrais, 24 eventos; somente 18 são URLs distintas entre si. URL presente não foi tratada como validação do conteúdo. Nenhum JSON bruto foi versionado.

## Lanes e reconciliação
- Causal: 25/25 IDs exatos, 25 `withheld`, `content_read=false`.
- Red-team: 25/25 IDs exatos, 25 `withheld`, `content_read=false`.
- Reconciliação: 25 `withheld`, 0 `pending_review`, 0 `approved`, 0 `score_eligible`; conjuntos de IDs idênticos.
- `remote_apply=false`; nenhum projeto público, claim, voto, score, matriz ou fato remoto foi criado.

## Bloqueio real
A fonte oficial confirmou metadados e identidade, mas o lote não possui cadeia completa validada de texto integral → versão/evento independente vinculante → voto nominal individual. Autoria/ementa não prova posição, mecanismo causal, efeito populacional ou score. Os 25 itens permanecem retidos.

## Checkpoint
- `authored-analysis-progress-v1.json` atualizado atomicamente sob `flock`.
- `projects_analyzed=2400`, `withheld=2400`, `approved=0`, `pending_review=0`, `blocked_items=98`.
- Próximo lote calculado pelo script: `2401–2425`.

## Gates
- Manifestos e lanes validados programaticamente: cardinalidade 25/25, IDs exatos, 25 retidos, 0 aprovados, 0 pendentes, 0 elegíveis.
- Nenhuma migration, RLS, Auth, Storage, Edge Function, Supabase ou Cloudflare factual foi alterada.
- Gates de teste/build/publicação ficam para o fechamento deste checkpoint; não declarar lote publicado antes de executar e verificar todos.
