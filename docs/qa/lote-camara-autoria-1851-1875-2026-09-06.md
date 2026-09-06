# QA — autoria Câmara 1851–1875 — 2026-09-06

## Objetivo
Processar o próximo intervalo determinístico da fila de autoria da Câmara, com duas lanes editoriais independentes, cardinalidade/IDs exatos e retenção fail-closed quando não houver cadeia completa de fonte, texto, versão e evento nominal.

## Entregue e verificado
- Seleção: `25` projetos únicos (`offset=1850`, `limit=25`), `75` ocorrências candidato–projeto e `19` candidatos únicos.
- Fonte de autoria: manifesto factual oficial versionado; nenhum texto integral foi lido neste lote (`content_read=false`).
- Lane causal: `25/25` IDs exatos, todos `withheld`.
- Lane red-team: `25/25` IDs exatos, todos `withheld`.
- Reconciliação: `25 withheld`, `0 pending_review`, `0 approved`, `0 score_eligible`; `remote_apply=false`.
- Artefato: `data/legislative-import/camara/authored-project-review-batches/camara-authored-unique-review-1851-1875-reconciled.json`.
- Checkpoint atômico: `projects_analyzed=1875`, `withheld=1875`, próximo intervalo `1876–1900`; `blocked_items=77`.

## Estado dos dados
Nenhum projeto de autoria factual foi publicado neste lote. Não houve alteração de candidatos, claims, votos nominais, proposições, versões, eventos, matriz, score, Supabase ou Cloudflare. A autoria permanece separada de voto e impacto.

## Bloqueio real
O manifesto não comprova texto integral efetivamente analisado, versão votada, evento nominal vinculante e voto individual. Portanto nenhum item foi promovido a `pending_review`, `approved` ou `score_eligible`; não houve inferência por ementa, nome, evento ou similaridade.

## Gates e publicação
- `npm run test`: **496/496**, 119 arquivos, RC 0.
- `npx tsc --noEmit`: RC 0.
- `node scripts/validate-impact-schema.mjs`: RC 0.
- `npm run data:check`: RC 0 — **1003** candidaturas, **988** fotos oficiais, 1 fonte TSE.
- `npm run build`: RC 0 — **245** módulos; sitemap **1003 + 2**; `release.json` gerado.
- `npm run smoke:local`: RC 0 — **1002** cards, 0 falhas HTTP, 0 erros online, service worker pronto.
- `git diff --check`: RC 0.

`npm run orch:doctor` permanece RC 1 por Node 22.22.2 no shell (o projeto exige Node 24) e WARNs opcionais de OpenCode/gateway; não bloqueou os gates executados com Node 24. O push/deploy será tentado após commit seletivo, sem incluir alterações preexistentes nos artefatos `impact-editorial-*`.

## Próximo passo
Iniciar o intervalo `1876–1900` com a mesma seleção determinística e validação independente; manter autoria sem publicação factual até existir manifesto oficial com texto, versão/evento e identidade exatos.
