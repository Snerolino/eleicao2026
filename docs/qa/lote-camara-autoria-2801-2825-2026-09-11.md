# QA — autoria Câmara 2801–2825 — 2026-09-11

## Objetivo
Fechar e publicar o lote bounded de 25 projetos únicos de autoria da Câmara, preservando as quatro saídas editoriais como retenção fail-closed. Nenhum item foi promovido a fato causal, voto, claim, score, matriz ou publicação factual remota.

## Controle operacional
- Seleção já gerada e consumida: 25 projetos únicos, 50 ocorrências candidato–projeto e 25 identidades exatas.
- Os quatro artefatos foram materializados em `data/legislative-import/camara/authored-project-review-batches/`.
- Nenhuma migration, RLS, Auth, Storage ou Edge Function foi tocada. Nenhuma escrita Supabase/Cloudflare factual foi executada.
- Churn não relacionado foi restaurado; somente os quatro artefatos deste lote, este QA e o checkpoint entram nesta publicação.

## Fontes oficiais
- Manifesto: 25/25 APIs de proposição HTTP 200, identidade `dados.id` exata 25/25, texto integral HTTP 200 25/25 e tramitações HTTP 200 25/25.
- Eventos independentes catalogados: 18/25; 7/25 permanecem sem binding independente. O bloqueio é preservado, sem inferência ou fallback.
- `content_read=false` e `remote_apply=false` no manifesto e nas lanes.

## Invariantes fail-closed
- Causal: 25 itens; `25 withheld`, `0 pending_review`, `0 approved`, `0 score_eligible`.
- Red-team: 25 itens; `25 withheld`, `0 pending_review`, `0 approved`, `0 score_eligible`.
- Reconciliação: 25 itens; `25 withheld`, `0 pending_review`, `0 approved`, `0 score_eligible`.
- Todos os itens têm `decision=withheld`, `score_eligible=false`, `content_read=false` e `remote_apply=false`.
- Razão: autoria/ementa/tramitação não prova posição legislativa, efeito causal ou score; faltam validação editorial do texto, versão/evento vinculante e voto nominal individual.

## Artefatos e SHA-256
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2801-2825-source-manifest.json`: `f675eb73184cb102dc68facf6a2791be64d22a06496de068add66e4d060c0cdb`
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2801-2825-causal.json`: `c93fe2aadd6d62a9d53dc9b4b59100ae27795524be248ec2ebebe00c9b9b615c`
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2801-2825-redteam.json`: `e2f32d84a284d65765202d4ffe734cfbc80af517bc0b0499928b31be21cff1d3`
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2801-2825-reconciled.json`: `03bf3565fd05d060fc51b1c14f13fb3c49f3240b52633267ba4a853e25d9c574`


## Checkpoint
- `projects_analyzed=2825`, `last_batch=2801-2825`, `next_batch=2826-2850`, `withheld=2825`, `pending_review=0`, `approved=0`.
- Checkpoint durável: `data/legislative-import/camara/authored-analysis-progress-v1.json`.

## Gates locais
- Node `v24.19.0` confirmado.
- `npm run test -- --passWithNoTests`: `499/499` testes, `120` arquivos, passou.
- `npx tsc --noEmit`: passou.
- `node scripts/validate-impact-schema.mjs`: passou; fixtures boas aceitas e ruins rejeitadas.
- `npm run data:check`: passou; `1003` candidaturas, `988` fotos oficiais.
- `npm run build`: passou; `245` módulos, sitemap `1003` candidatos + `2` estáticas; release local gerado.
- `git diff --check`: passou após restaurar churn não relacionado.
- O lote permanece somente editorial/retido; não altera snapshot público de candidatos nem score/matriz.

## Publicação
- Commit, push, CI/backup e verificação de produção serão registrados após o fechamento deste QA.
- Produção deverá confirmar HTTP 200 e `/release.json` com o SHA exato deste fechamento.
