# QA — autoria Câmara 2276–2300 — 2026-09-10

## Objetivo
Processar boundedamente o próximo lote de autoria Câmara com seleção determinística, fonte oficial revalidada, lanes causal/red-team independentes e retenção fail-closed.

## Seleção e fonte oficial
- Seleção: 25 projetos únicos, `offset=2275`, `limit=25`, ordenação por ID de projeto único ascendente.
- Ocorrências candidato–projeto: 74; candidatos únicos: 21.
- Fonte Dados Abertos Câmara: 25/25 URLs HTTPS oficiais HTTP 200.
- Identidade: 25/25 `dados.id` exatamente iguais ao ID numérico da URL.
- Bytes revalidados: 34.108; SHA-256 individual preservado no manifesto `data/legislative-import/camara/authored-project-review-batches/camara-authored-2276-2300-source-manifest.json`.
- Nenhum JSON bruto de resposta foi versionado.

## Lanes e reconciliação
- Lane causal: 25/25 IDs exatos; todos `withheld`; `content_read=false`.
- Lane red-team: 25/25 IDs exatos; todos `withheld`; `content_read=false`.
- Reconciliação: 25 `withheld`, 0 `pending_review`, 0 `approved`, 0 `score_eligible`.
- `remote_apply=false` em manifesto, lanes e reconciliado; os conjuntos de IDs coincidem exatamente.

## Bloqueio real
A fonte oficial revalidada comprova identidade e metadados da proposição, mas não demonstra texto integral validado, versão/evento independente vinculante e voto nominal individual. Autoria/ementa não provam posição legislativa, efeito causal ou score. Nenhum fato, claim, voto, matéria, matriz, score ou projeto público foi promovido. Nenhuma escrita factual Supabase/Cloudflare ocorreu.

## Checkpoint
- `projects_analyzed=2300`, `withheld=2300`, `approved=0`, `pending_review=0`, `blocked_items=94`.
- Lote fechado: `2276-2300` (`withheld`).
- Próximo lote calculado atomicamente: `2301-2325`.
- Checkpoint: `data/legislative-import/camara/authored-analysis-progress-v1.json`.

## Gates locais — Node 24
- `node -v`: `v24.19.0`.
- `npm run test -- --passWithNoTests`: RC 0 — 499/499 testes em 120 arquivos.
- `npx tsc --noEmit`: RC 0.
- `node scripts/validate-impact-schema.mjs`: RC 0.
- `npm run data:check`: RC 0 — 1003 candidaturas, 988 fotos oficiais, 1 fonte TSE.
- `npm run build`: RC 0 — 245 módulos; sitemap 1003 candidatos + 2 URLs estáticas; release local gerado.
- `git diff --check`: RC 0.

## Segurança e escopo
Lock exclusivo adquirido com `flock` em `.orchestrator/runtime/locks/continuous-progress.lock`; um único writer local. Nenhuma migration, RLS, Auth, Storage ou Edge Function foi alterada. Nenhuma escrita Supabase/Cloudflare factual foi executada. Nenhum score, matriz, claim ou voto foi criado.

## Publicação
Este lote contém apenas artefatos versionados de fila, manifestos de fonte e checkpoint documental. O commit/push e a verificação de CI/backup/produção serão registrados após sua execução, sem iniciar o lote seguinte antes do fechamento.
