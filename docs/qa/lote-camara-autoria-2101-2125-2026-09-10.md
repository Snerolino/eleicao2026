# QA — autoria Câmara 2101–2125 — 2026-09-10

## Objetivo
Processar boundedamente o próximo intervalo determinístico de autoria Câmara com fonte oficial, duas lanes independentes e retenção fail-closed.

## Seleção e fontes
- Seleção determinística: **25 projetos únicos** (`offset=2100`, `limit=25`), **50 ocorrências candidato–projeto** e **15 candidatos únicos**; IDs únicos ordenados deterministically pelo helper compartilhado.
- Revalidação oficial: **25/25** endpoints `https://dadosabertos.camara.leg.br/api/v2/proposicoes/{id}` responderam HTTP 200.
- Identidade: **25/25** conferências exatas de `dados.id` contra o ID numérico literal da proposição.
- Bytes revalidados: **38.548**; SHA-256 individual preservado em `data/legislative-import/camara/authored-project-review-batches/camara-authored-2101-2125-source-manifest.json`.

## Lanes e reconciliação
- Lane causal: **25/25** IDs exatos; todos `withheld`; `content_read=false`.
- Lane red-team independente: **25/25** IDs exatos; todos `withheld`; `content_read=false`.
- Reconciliação fail-closed: **25 withheld**, **0 pending_review**, **0 approved**, **0 score_eligible**.
- Artefatos:
  - `data/legislative-import/camara/authored-project-review-batches/camara-authored-2101-2125-causal.json`
  - `data/legislative-import/camara/authored-project-review-batches/camara-authored-2101-2125-redteam.json`
  - `data/legislative-import/camara/authored-project-review-batches/camara-authored-2101-2125-reconciled.json`
- `remote_apply=false`; nenhuma escrita factual Supabase/Cloudflare.

## Bloqueio real
Os endpoints oficiais comprovam identidade e metadados da proposição, mas este pacote não contém texto integral validado, versão/evento independente e voto nominal individual. Autoria/ementa não provam posição, efeito causal ou score. Nenhum fato, claim, voto, matéria, matriz ou projeto público foi inventado ou promovido.

## Checkpoint
- `projects_analyzed=2125`, `withheld=2125`, `approved=0`, `pending_review=0`, `blocked_items=87`.
- Próximo lote corrigido atomicamente pelo script: **2126–2150**.
- Lock exclusivo: `.orchestrator/runtime/locks/continuous-progress.lock`, adquirido com `flock`; um único writer local.

## Gates Node 24
- `node -v`: `v24.19.0`.
- `npm run test -- --passWithNoTests`: **RC 0 — 499/499 testes, 120 arquivos**.
- `npx tsc --noEmit`: **RC 0**.
- `node scripts/validate-impact-schema.mjs`: **RC 0** — fixtures válida/inválida e votos legislativos aceitos/rejeitados conforme esperado.
- `npm run data:check`: **RC 0** — `1003` candidaturas, `988` fotos oficiais, `1` fonte TSE.
- `npm run build`: **RC 0** — `245` módulos; sitemap `1003 + 2` URLs estáticas.
- `git diff --check`: **RC 0**.
- O build regenerou apenas timestamps de três artefatos editoriais preexistentes; o churn foi restaurado antes do fechamento.

## Operação e segurança
- Nenhuma migration, RLS, Auth, Storage ou Edge Function foi alterada.
- Nenhuma escrita Supabase/Cloudflare factual foi executada.
- Nenhum score, matriz, claim ou voto foi criado.

## Próximo passo
Fechar e publicar somente os artefatos documentais/fila deste lote; depois iniciar `2126–2150`, mantendo fonte oficial, identidade exata, duas lanes, `remote_apply=false` e retenção fail-closed até existir evidência independente da cadeia completa.
