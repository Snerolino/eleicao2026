# QA — autoria Câmara 2126–2150 — 2026-09-10

## Objetivo
Processar boundedamente o intervalo determinístico de autoria Câmara com fonte oficial, duas lanes independentes e retenção fail-closed.

## Seleção e fontes
- Seleção determinística: **25 projetos únicos** (`offset=2125`, `limit=25`), **50 ocorrências candidato–projeto** e **18 candidatos únicos**.
- Fonte oficial: **25/25** endpoints `https://dadosabertos.camara.leg.br/api/v2/proposicoes/{id}` responderam HTTP 200 na revalidação independente.
- Identidade: **25/25** valores `dados.id` conferidos exatamente contra o ID oficial literal.
- Bytes/SHA: **39.038 bytes** totais; todos os 25 bytes e SHA-256 do manifesto foram revalidados por GET independente, sem divergências.
- Manifesto: `data/legislative-import/camara/authored-project-review-batches/camara-authored-2126-2150-source-manifest.json`.

## Lanes e reconciliação
- Lane causal: **25/25** IDs exatos; todos `withheld`; `content_read=false`.
- Lane red-team independente: **25/25** IDs exatos; todos `withheld`; `content_read=false`.
- Reconciliação: **25 withheld**, **0 pending_review**, **0 approved**, **0 score_eligible**; conjuntos de IDs das duas lanes e do reconciliado coincidem exatamente.
- `remote_apply=false` em manifesto, lanes e reconciliado.
- Artefatos: `camara-authored-2126-2150-{source-manifest,causal,redteam,reconciled}.json`.

## Bloqueio real
Os endpoints oficiais comprovam identidade e metadados da proposição, mas não demonstram texto integral validado, versão/evento independente e voto nominal individual. Autoria/ementa não provam posição, efeito causal ou score. Nenhum fato, claim, voto, matéria, matriz ou projeto público foi promovido.

## Checkpoint
- `projects_analyzed=2150`, `withheld=2150`, `approved=0`, `pending_review=0`, `blocked_items=88`.
- `last_batch=2126-2150`; próximo lote calculado atomicamente: `2151-2175`.
- Lock exclusivo: `.orchestrator/runtime/locks/continuous-progress.lock`, mantido pelo supervisor desta sessão; um único writer.

## Gates Node 24
- `node -v`: `v24.19.0`.
- `npm run test -- --passWithNoTests`: **RC 0 — 499/499 testes, 120 arquivos**.
- `npx tsc --noEmit`: **RC 0**.
- `node scripts/validate-impact-schema.mjs`: **RC 0**.
- `npm run data:check`: **RC 0 — 1003 candidaturas, 988 fotos, 1 fonte TSE**.
- `npm run build`: **RC 0 — 245 módulos; sitemap 1003 + 2 URLs estáticas**.
- `git diff --check`: **RC 0**.
- O build regenerou apenas artefatos de saída ignorados/timestamps preexistentes; churn não relacionado foi restaurado antes do fechamento.

## Operação e segurança
Nenhuma migration, RLS, Auth, Storage, Edge Function, Supabase factual ou Cloudflare foi alterada. Nenhuma escrita remota foi executada. Nenhum score, matriz, claim ou voto foi criado.

## Próximo passo
Publicar/verificar somente este checkpoint documental; depois iniciar `2151–2175`, mantendo fonte oficial, identidade exata, duas lanes, `remote_apply=false` e retenção fail-closed até existir a cadeia independente completa.
