# QA — autoria Câmara 2826–2850 — 2026-09-11

## Objetivo
Processar boundedamente 25 projetos únicos de autoria da Câmara, com fontes oficiais revalidadas e retenção causal/red-team fail-closed. Nenhum item foi promovido a fato, voto, claim, score, matriz ou escrita remota.

## Controle operacional
- Lock exclusivo `flock` adquirido; único writer confirmado.
- Seleção determinística: 25 projetos únicos, 50 ocorrências candidato–projeto e 16 candidatos únicos (`offset=2825`, `limit=25`).
- Foram materializados somente os quatro artefatos do lote, este QA e o checkpoint.
- `remote_apply=false` em manifesto e lanes; `content_read=false`; nenhuma migration, RLS, Auth, Storage ou Edge Function foi tocada.

## Fontes oficiais revalidadas
- APIs de proposição Câmara: 25/25 HTTP 200; identidade `dados.id` exata 25/25.
- Texto integral oficial: 25/25 HTTP 200.
- Tramitação oficial independente: 25/25 HTTP 200.
- Eventos independentes distintos: 13/25; 12/25 sem binding específico, mantidos bloqueados sem fallback.
- Bytes e SHA-256 foram recalculados em nova requisição para API, texto integral e tramitação e gravados no manifesto.

## Invariantes fail-closed
- Causal: 25 itens; 25 withheld, 0 pending_review, 0 approved, 0 score_eligible.
- Red-team: 25 itens; 25 withheld, 0 pending_review, 0 approved, 0 score_eligible.
- Reconciliação: 25 itens; 25 withheld, 0 pending_review, 0 approved, 0 score_eligible.
- Todos os itens têm `decision=withheld`, `score_eligible=false`, `content_read=false` e `remote_apply=false`.
- Motivo: autoria/ementa/tramitação não prova posição legislativa, efeito causal ou score; faltam validação editorial do texto, versão/evento vinculante e voto nominal individual.

## Artefatos e SHA-256
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2826-2850-source-manifest.json`: `d27698857c263aa52a3a4310b2f7bdcc19c47456e1b597f590f8da8d5203d134`
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2826-2850-causal.json`: `35001877babcb34a632bfe049708501ca4d2e53cd8b1fc0acad5a804a212d708`
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2826-2850-redteam.json`: `84e028ab08f732d40cc12e4c39b0aa3534fc0a56ef5931007b3d0ca0d6dc5aae`
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2826-2850-reconciled.json`: `c83b86c6650739e79f5eb11987a73758339683ed1c96f35a897160e92f9b3d58`

## Checkpoint
- `projects_analyzed=2850`, `last_batch=2826-2850`, `next_batch=2851-2875`, `withheld=2850`, `pending_review=0`, `approved=0`.
- Checkpoint durável: `data/legislative-import/camara/authored-analysis-progress-v1.json`.

## Gates locais
- Node `v24.19.0` usado explicitamente.
- Pendentes nesta etapa: test, TypeScript, schema de impacto, data:check, build e `git diff --check`.

## Bloqueio editorial preservado
O lote não autoriza autoria factual pública, voto individual, assessment causal, score, matriz ou aplicação Supabase. O próximo gate independente é `2851–2875`, após fechar esta publicação.
