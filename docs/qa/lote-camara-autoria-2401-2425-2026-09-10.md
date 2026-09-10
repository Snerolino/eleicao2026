# QA — autoria Câmara 2401–2425 — 2026-09-10

## Objetivo
Processar o próximo lote determinístico de autoria da Câmara, revalidar fontes oficiais, executar as duas lanes editoriais e manter retenção fail-closed quando a evidência não autorizar publicação factual, voto, matriz ou score.

## Seleção e fontes oficiais
- Seleção: 25 projetos únicos (`offset=2400`, `limit=25`), 50 ocorrências candidato–projeto e 22 candidatos únicos.
- Revalidação oficial: 25/25 endpoints da API Dados Abertos Câmara HTTP 200 e identidade exata.
- Manifesto: `data/legislative-import/camara/authored-project-review-batches/camara-authored-2401-2425-source-manifest.json`.
- Bytes das respostas de proposição + tramitações: 77.782; SHA-256 preservado por endpoint.
- Texto integral oficial catalogado: 25/25; evento oficial independente do texto integral: 20/25.
- Classificação factual desta seleção: 25/25 `procedural_only` segundo o triage versionado. A disponibilidade de URL/ementa não converte autoria em voto ou efeito causal.
- Nenhum JSON bruto foi versionado.

## Lanes e reconciliação
- Causal: 25/25 IDs exatos, 25 `withheld`, `content_read=false`.
- Red-team: 25/25 IDs exatos, 25 `withheld`, `content_read=false`.
- Reconciliação: 25 `withheld`, 0 `pending_review`, 0 `approved`, 0 `score_eligible`; conjuntos de IDs coincidentes.
- Artefatos com `remote_apply=false`; nenhuma autoria, claim, voto, matriz ou score foi promovido.

## Bloqueio real
Os 25 itens foram classificados como procedurais. Sem uma matéria substantiva, versão/evento vinculante e voto nominal individual, autoria/ementa não prova posição legislativa, mecanismo causal, efeito populacional ou score. O lote permanece `withheld`; nenhuma fonte, identidade, voto, grupo ou score foi fabricado.

## Checkpoint
- `data/legislative-import/camara/authored-analysis-progress-v1.json` atualizado atomicamente sob lock.
- `projects_analyzed=2425`, `withheld=2425`, `approved=0`, `pending_review=0`, `blocked_items=99`.
- Rollover corrigido automaticamente: próximo lote `2426–2450`.

## Gates locais
- Node: `v24.19.0`.
- `npm run test -- --passWithNoTests`: RC 0 — 499/499 testes em 120 arquivos.
- `npx tsc --noEmit`: RC 0.
- `node scripts/validate-impact-schema.mjs`: RC 0.
- `npm run data:check`: RC 0 — 1.003 candidaturas, 988 fotos oficiais, 1 fonte TSE.
- `npm run build`: RC 0 — 245 módulos; sitemap 1.003 candidatos + 2 estáticas (1.005 URLs); release local `b78d1fd-20260910T041232155Z`.
- `npm run smoke:local`: RC 0 — 1.002 cards, 0 falhas HTTP, 0 erros online, service worker pronto.
- `git diff --check`: RC 0.

## Segurança e publicação
- Nenhuma migration, RLS, Auth, Storage ou Edge Function foi alterada.
- Nenhuma escrita factual Supabase foi executada.
- O commit/push e a verificação de backup Cloudflare/produção serão registrados no fechamento deste lote.

## Próximo passo
Iniciar `2426–2450` somente após fechar a publicação deste checkpoint, mantendo seleção oficial, duas lanes independentes e retenção fail-closed.
