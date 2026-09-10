# QA — autoria Câmara 2026–2050 — 2026-09-10

## Objetivo
Processar boundedamente o próximo lote determinístico de autoria Câmara, revalidar as fontes oficiais e executar lanes causal/red-team sem converter autoria em voto, impacto, score ou claim público.

## Seleção e fontes
- Seleção determinística: **25 projetos únicos** (offset=2025, limit=25), **75 ocorrências candidato–projeto** e **14 candidatos únicos**.
- Revalidação oficial: **25/25** endpoints https://dadosabertos.camara.leg.br/api/v2/proposicoes/{id} responderam HTTP 200.
- Identidade: **25/25** conferências exatas de dados.id contra o ID numérico da proposição.
- Bytes revalidados: **36.533**; SHA-256 individual preservado em data/legislative-import/camara/authored-project-review-batches/camara-authored-2026-2050-source-manifest.json.

## Lanes e reconciliação
- Lane causal: **25/25** IDs exatos; todos withheld; content_read=false.
- Lane red-team independente: **25/25** IDs exatos; todos withheld; confirmou a ausência da cadeia probatória.
- Reconciliação fail-closed: **25 withheld**, **0 pending_review**, **0 approved**, **0 score_eligible**.
- Artefato: data/legislative-import/camara/authored-project-review-batches/camara-authored-2026-2050-reconciled.json.
- remote_apply=false; nenhuma escrita factual Supabase/Cloudflare.

## Bloqueio real
Os endpoints oficiais de proposição confirmam identidade e metadados, mas este pacote não contém texto integral validado, versão/evento independente e voto nominal individual. Autoria/ementa não provam posição, efeito causal ou score. Nenhum fato, claim, voto, matéria, matriz ou projeto público foi inventado ou promovido.

## Checkpoint
- Checkpoint atômico: projects_analyzed=2050, withheld=2050, approved=0, pending_review=0, blocked_items=84.
- Próximo lote calculado: **2051–2075**.
- Lock exclusivo: .orchestrator/runtime/locks/continuous-progress.lock, adquirido com flock; um único writer.

## Gates Node 24
- node -v: v24.19.0.
- npm run test -- --passWithNoTests: RC 0 — 499/499 testes, 120 arquivos.
- npx tsc --noEmit: RC 0.
- node scripts/validate-impact-schema.mjs: RC 0.
- npm run data:check: RC 0 — 1003 candidaturas, 988 fotos oficiais, 1 fonte TSE.
- npm run build: RC 0 — 245 módulos; sitemap 1003 + 2 URLs estáticas.
- git diff --check: RC 0.
- O build alterou somente timestamps de três artefatos editoriais preexistentes; o churn foi restaurado antes do fechamento.

## Próximo passo
Após verificar este lote e publicar apenas a alteração documental/artefatos locais, iniciar o próximo lote boundedamente, mantendo fonte oficial, identidade exata, duas lanes, remote_apply=false e retenção fail-closed.
