# QA — autoria Câmara 1876–1900 — 2026-09-06

## Objetivo
Processar o próximo intervalo determinístico da fila de autoria da Câmara com descoberta oficial, duas lanes editoriais independentes, cardinalidade/IDs exatos e retenção fail-closed.

## Entregue e verificado
- Seleção determinística: `25` projetos únicos (`offset=1875`, `limit=25`), `75` ocorrências candidato–projeto e `21` candidatos únicos.
- Universo: `25/25` itens são `REQ`; `24` estão `tramitando` e `1` arquivado.
- Descoberta oficial: `25/25` URLs da API `dadosabertos.camara.leg.br` responderam HTTP 200; bytes e SHA-256 foram registrados em `data/legislative-import/camara/authored-project-review-batches/camara-authored-1876-1900-source-manifest.json`.
- Lane causal: `25/25` IDs exatos, todos `withheld` por ausência de versão/evento nominal vinculante.
- Lane red-team: `25/25` IDs exatos, todos `withheld`; confirmou a retenção fail-closed.
- Reconciliação: `25 withheld`, `0 pending_review`, `0 approved`, `0 score_eligible`; `remote_apply=false`.
- Artefato: `data/legislative-import/camara/authored-project-review-batches/camara-authored-unique-review-1876-1900-reconciled.json`.
- Checkpoint atômico: `projects_analyzed=1900`, `withheld=1900`, próximo intervalo `1901–1925`; `blocked_items=78`.

## Estado dos dados
Nenhum projeto de autoria, claim, voto nominal, proposição, versão, evento, matriz ou score foi publicado. Não houve escrita remota em Supabase/Cloudflare. Autoria permanece separada de voto e impacto.

## Bloqueio real
A autoria e a ementa oficial não provam texto integral analisado, versão votada, evento nominal independente, voto individual ou efeito causal. Por isso nenhum item foi promovido a `pending_review`, `approved` ou `score_eligible`; não houve inferência por título, nome ou similaridade.

## Gates locais
- `npm run test -- --passWithNoTests`: RC 0 — `496/496` testes, `119` arquivos.
- `npx tsc --noEmit`: RC 0.
- `node scripts/validate-impact-schema.mjs`: RC 0.
- `npm run data:check`: RC 0 — `1003` candidaturas, `988` fotos oficiais, `1` fonte TSE.
- `npm run build`: RC 0 — `245` módulos; sitemap `1003 + 2`; release `4a662db-20260906T101231608Z`.
- `git diff --check`: RC 0.

## Próximo passo
Iniciar o intervalo `1901–1925` com a mesma seleção, manifesto oficial, validação causal/red-team e retenção fail-closed; em paralelo manter recuperação read-only de versões/eventos/votos ALRS, Câmara e Senado. Não gerar matriz/score sem assessment completo, fonte e evento vinculante.
