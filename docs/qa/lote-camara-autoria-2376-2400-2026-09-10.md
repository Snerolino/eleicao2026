# QA — autoria Câmara 2376–2400 — 2026-09-10

## Objetivo
Reprocessar o lote correto do checkpoint após a reversão do avanço prematuro, com seleção determinística, revalidação independente da Câmara, duas lanes e retenção fail-closed.

## Seleção e fontes oficiais
- Seleção determinística: 25 projetos únicos, `offset=2375`, `limit=25`, 50 ocorrências candidato–projeto e 21 candidatos únicos.
- Revalidação executada sob lock: 25/25 endpoints oficiais da API Dados Abertos Câmara HTTP 200; identidade exata `dados.id` contra o ID literal da URL em 25/25.
- Manifesto: `data/legislative-import/camara/authored-project-review-batches/camara-authored-2376-2400-source-manifest.json`. Bytes totais das respostas da proposição + tramitações: 212.064; SHA-256 individual preservado.
- URLs de texto integral: 23/25 oficiais; eventos oficiais independentes distintos do texto integral: 18/25. Essas URLs foram somente catalogadas; não houve leitura/validação de conteúdo integral.
- Nenhum JSON bruto foi versionado.

## Lanes e reconciliação
- Lane causal: 25/25 IDs exatos, 25 `withheld`, `content_read=false`.
- Lane red-team: 25/25 IDs exatos, 25 `withheld`, `content_read=false`.
- Reconciliação: 25 `withheld`, 0 `pending_review`, 0 `approved`, 0 `score_eligible`; conjuntos de IDs coincidentes.
- Todos os artefatos têm `remote_apply=false`; nenhuma autoria foi promovida a fato público.

## Bloqueio real
Não existe neste lote a cadeia simultânea texto integral validado → versão/evento independente vinculante → voto nominal individual. Autoria e ementa não provam posição legislativa, mecanismo causal, efeito populacional ou score. Itens sem texto/evento permanecem `withheld`; nenhum fato, claim, voto, score ou matriz foi inventado.

## Checkpoint
- `data/legislative-import/camara/authored-analysis-progress-v1.json` atualizado atomicamente sob lock.
- `projects_analyzed=2400`, `withheld=2400`, `approved=0`, `pending_review=0`, `blocked_items=98`.
- Próximo lote calculado: `2401–2425`; este lote foi fechado antes de qualquer avanço posterior.

## Segurança
Nenhuma migration, RLS, Auth, Storage ou Edge Function foi alterada. Não houve escrita factual Supabase/Cloudflare nem deploy factual.

## Gates locais — Node 24
- `node -v`: `v24.19.0`.
- `npm run test -- --passWithNoTests`: RC 0 — 499/499 testes em 120 arquivos.
- `npx tsc --noEmit`: RC 0.
- `node scripts/validate-impact-schema.mjs`: RC 0.
- `npm run data:check`: RC 0 — 1003 candidaturas, 988 fotos oficiais, 1 fonte TSE.
- `npm run build`: RC 0 — 245 módulos; sitemap 1003 candidatos + 2 estáticas (1005 URLs); release local `2004a9e-20260910T040629584Z`.
- Invariantes dos artefatos: PASS — 25 IDs exatos nas duas lanes, 25 retidos, 0 aprovados, 0 pending, 0 elegíveis, `remote_apply=false`.
- `git diff --check`: RC 0 após restauração do churn de timestamps não relacionado.
