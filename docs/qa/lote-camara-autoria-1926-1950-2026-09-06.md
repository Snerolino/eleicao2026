# QA — autoria Câmara 1926–1950 — 2026-09-06

## Objetivo
Processar o intervalo determinístico com fonte oficial, duas lanes independentes e retenção fail-closed.

## Entregue e verificado
- Seleção: `25` projetos únicos (`offset=1925`, `limit=25`), `75` ocorrências e `9` candidatos.
- Descoberta oficial: `25/25` URLs HTTP 200; manifesto com bytes/SHA em `data/legislative-import/camara/authored-project-review-batches/camara-authored-1926-1950-source-manifest.json`.
- Causal e red-team: `25/25` IDs exatos em cada lane; todos `withheld`.
- Reconciliação: `25 withheld`, `0 pending_review`, `0 approved`, `0 score_eligible`; `content_read=false`, `remote_apply=false`.
- Artefato: `data/legislative-import/camara/authored-project-review-batches/camara-authored-1926-1950-reconciled.json`.
- Checkpoint: `projects_analyzed=1950`, próximo `1951–1975`, `blocked_items=80`.

## Estado e bloqueio
Nenhum projeto, claim, voto, matéria, evento, matriz ou score foi publicado. Autoria/ementa não provam texto integral, versão votada, evento nominal, voto individual ou efeito causal; não houve inferência.

## Gates locais
- `npm run test -- --passWithNoTests`: RC 0 — `496/496` testes, `119` arquivos.
- `npx tsc --noEmit`: RC 0.
- `node scripts/validate-impact-schema.mjs`: RC 0.
- `npm run data:check`: RC 0 — `1003` candidaturas, `988` fotos oficiais, `1` fonte TSE.
- `npm run build`: RC 0 — `245` módulos; sitemap `1003 + 2`.
- `git diff --check`: RC 0.
- Churn somente de timestamps nos três artefatos editoriais preexistentes foi restaurado.

## Próximo passo
Iniciar `1951–1975` mantendo fonte oficial, lanes independentes e fail-closed.
