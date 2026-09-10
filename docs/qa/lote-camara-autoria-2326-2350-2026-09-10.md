# QA — autoria Câmara 2326–2350 — 2026-09-10

## Objetivo
Reprocessar boundedamente o lote correto do checkpoint após o revert preliminar, com seleção determinística, revalidação oficial Câmara e duas lanes independentes. O lote permanece fail-closed e não promove fatos editoriais.

## Seleção e fontes
- Seleção determinística: 25 projetos únicos, offset=2325, limit=25, ordenação por cobertura exata de candidatos e ID do projeto.
- Ocorrências candidato–projeto: 50; candidatos únicos: 18.
- Fonte oficial Dados Abertos Câmara: 25/25 endpoints HTTPS HTTP 200.
- Identidade exata: 25/25 (dados.id igual ao ID oficial da URL).
- Bytes revalidados: 46.538; SHA-256 individual preservado no manifesto data/legislative-import/camara/authored-project-review-batches/camara-authored-2326-2350-source-manifest.json.
- Nenhum JSON bruto de resposta foi versionado.

## Lanes e reconciliação
- Lane causal: 25/25 IDs exatos, 25 withheld, content_read=false.
- Lane red-team: 25/25 IDs exatos, 25 withheld, content_read=false.
- Reconciliação: 25 withheld, 0 pending_review, 0 approved, 0 score_eligible; conjuntos de IDs coincidem.
- remote_apply=false nos artefatos; nenhum fato, claim, voto, score, matriz ou projeto público foi criado.

## Bloqueio real
Os endpoints oficiais comprovam somente identidade e metadados. Não há texto integral validado, evento/versão independente vinculante nem voto nominal individual. Autoria/ementa não prova posição, efeito causal ou score; os 25 itens ficam retidos.

## Checkpoint
- projects_analyzed=2350, withheld=2350, approved=0, pending_review=0, blocked_items=96.
- Lote encerrado: 2326-2350 (withheld). Próximo lote calculado atomicamente: 2351-2375.
- Checkpoint: data/legislative-import/camara/authored-analysis-progress-v1.json.

## Gates locais — Node 24
- node -v: v24.19.0.
- npm run test -- --passWithNoTests: RC 0 — 499/499 testes em 120 arquivos.
- npx tsc --noEmit: RC 0.
- node scripts/validate-impact-schema.mjs: RC 0.
- npm run data:check: RC 0 — 1003 candidaturas, 988 fotos oficiais, 1 fonte TSE.
- npm run build: RC 0 — 245 módulos; sitemap 1003 candidatos + 2 estáticas; release local gerado.
- git diff --check: RC 0 após restauração do churn não relacionado.

## Segurança e escopo
Lock exclusivo adquirido com flock em .orchestrator/runtime/locks/continuous-progress.lock; um único writer local. Nenhuma migration, RLS, Auth, Storage ou Edge Function foi alterada. Nenhuma escrita factual Supabase/Cloudflare foi executada.

## Próximo passo
Fechar este lote com commit/push e verificar CI, workflow backup e SHA exato em produção. Não iniciar 2351-2375 antes do fechamento.
