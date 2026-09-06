# QA — autoria Câmara 1901–1925 — 2026-09-06

## Objetivo
Processar o próximo intervalo determinístico da fila de autoria da Câmara com fonte oficial, duas lanes independentes e retenção fail-closed.

## Entregue e verificado
- Seleção determinística: `25` projetos únicos (`offset=1900`, `limit=25`), `75` ocorrências candidato–projeto e `18` candidatos únicos.
- Descoberta oficial: `25/25` URLs da API Câmara responderam HTTP 200; bytes e SHA-256 estão em `data/legislative-import/camara/authored-project-review-batches/camara-authored-1901-1925-source-manifest.json`.
- Lane causal: `25/25` IDs exatos, todos `withheld`; lane red-team: `25/25` IDs exatos, todos `withheld`.
- Reconciliação: `25 withheld`, `0 pending_review`, `0 approved`, `0 score_eligible`; `content_read=false`, `remote_apply=false`.
- Artefato: `data/legislative-import/camara/authored-project-review-batches/camara-authored-unique-review-1901-1925-reconciled.json`.
- Checkpoint atômico: `projects_analyzed=1925`, `withheld=1925`, próximo intervalo `1926–1950`, `blocked_items=79`.

## Estado dos dados
Nenhum projeto de autoria, claim, voto nominal, proposição, versão, evento, matriz ou score foi publicado. Nenhuma escrita remota em Supabase/Cloudflare ocorreu.

## Bloqueio real
A autoria e a ementa oficial não provam texto integral analisado, versão votada, evento nominal independente, voto individual ou efeito causal. Nenhum item foi promovido; não houve inferência por título, nome ou similaridade.

## Gates locais
- `npm run test -- --passWithNoTests`: RC 0 — `496/496` testes, `119` arquivos.
- `npx tsc --noEmit`: RC 0.
- `node scripts/validate-impact-schema.mjs`: RC 0.
- `npm run data:check`: RC 0 — `1003` candidaturas, `988` fotos oficiais, `1` fonte TSE.
- `npm run build`: RC 0 — `245` módulos; sitemap `1003 + 2`; release gerado localmente.
- `git diff --check`: RC 0.
- Churn somente de timestamps em três artefatos editoriais preexistentes foi restaurado; nenhum dado fora do lote foi mantido.

## Publicação verificada
- Commit `01642bec3c0ab09e3b283e7e481fcd46d3a01029` publicado em `origin/main`.
- Backup Cloudflare workflow `334951434`, run `34027610548`: `completed/success`, `headSha` exato.
- Produção: raiz HTTP 200; `/release.json` HTTP 200, SHA exato `01642bec3c0ab09e3b283e7e481fcd46d3a01029`, release `0.2.1230`, snapshot `1003`.

## Próximo passo
Iniciar `1926–1950` com a mesma seleção, manifesto oficial, validação causal/red-team e retenção fail-closed; manter em paralelo a reconciliação read-only de ALRS, Câmara e Senado.
