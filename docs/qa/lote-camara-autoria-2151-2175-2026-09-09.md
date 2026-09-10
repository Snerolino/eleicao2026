# QA — autoria Câmara 2151–2175 — 2026-09-09

## Objetivo
Processar o próximo intervalo determinístico de autoria Câmara com fonte oficial, duas verificações editoriais independentes e retenção fail-closed.

## Seleção e fontes
- Seleção determinística: 25 projetos únicos (offset=2150, limit=25), 50 ocorrências candidato–projeto e 13 candidatos únicos.
- Fonte oficial: 25/25 endpoints Dados Abertos Câmara HTTP 200; identidade dados.id exata em todos os itens.
- Bytes/SHA: 37.988 bytes totais, preservados no manifesto data/legislative-import/camara/authored-project-review-batches/camara-authored-2151-2175-source-manifest.json.
- Recuperação read-only: 23 itens com metadados completos para reavaliação; 2 com evento oficial independente faltante. Nenhum HTML/texto bruto foi versionado.

## Lanes e reconciliação
- Lane causal: 25/25 IDs exatos, todos withheld; content_read=false.
- Lane red-team: 25/25 IDs exatos, todos withheld; content_read=false.
- Reconciliação: 25 withheld, 0 pending_review, 0 approved, 0 score_eligible; conjuntos de IDs coincidem exatamente.
- remote_apply=false; nenhum voto, matéria, versão, claim, matriz, score, projeto público, Supabase ou Cloudflare foi escrito.

## Bloqueio real
Os endpoints oficiais comprovam identidade e metadados, mas o lote não demonstra simultaneamente texto integral validado, versão/evento independente vinculante e voto nominal individual. Autoria/ementa não provam posição, efeito causal ou score. Os dois itens sem evento independente permanecem bloqueados explicitamente. Nenhum dado foi inventado ou promovido.

## Checkpoint
- projects_analyzed=2175, withheld=2175, approved=0, pending_review=0, blocked_items=89.
- Último lote: 2151-2175; próximo calculado atomicamente: 2176–2200.
- Lock exclusivo usado: .orchestrator/runtime/locks/continuous-progress.lock.

## Gates locais
- Node v22.22.2 (o doctor do projeto pode exigir Node 24; os gates executados neste tick passaram).
- npm run test -- --passWithNoTests: RC 0, 499/499 testes em 120 arquivos.
- npx tsc --noEmit: RC 0.
- node scripts/validate-impact-schema.mjs: RC 0.
- npm run data:check: RC 0, 1003 candidaturas e 988 fotos.
- npm run build: RC 0, 245 módulos; sitemap 1003 + 2 URLs estáticas; release gerado.
- npm run smoke:local: RC 0, 1002 cards, 0 falhas HTTP e 0 erros online; service worker pronto.
- git diff --check: RC 0.
- A alteração preexistente em scripts/orchestrator/doctor.sh permanece fora do escopo; churn de timestamps/artefatos não relacionados foi restaurado.

## Próximo passo
Publicar/verificar apenas este checkpoint documental se todos os gates locais estiverem verdes; então iniciar 2176–2200, mantendo fonte oficial, IDs exatos, duas lanes e retenção fail-closed.
