# QA — autoria Câmara 1951–1975 — 2026-09-10

## Objetivo
Processar o próximo intervalo determinístico de autoria Câmara com fonte oficial, duas lanes independentes e retenção fail-closed.

## Entregue e verificado
- Seleção determinística: `25` projetos únicos (`offset=1950`, `limit=25`), `75` ocorrências candidato–projeto e `26` candidatos únicos.
- Fonte oficial: `25/25` endpoints de proposição da API Dados Abertos Câmara HTTP 200; bytes e SHA-256 preservados em `data/legislative-import/camara/authored-project-review-batches/camara-authored-1951-1975-source-manifest.json`.
- Lane causal: `25/25` IDs exatos; todos `withheld`.
- Lane red-team: `25/25` IDs exatos; todos `withheld`.
- Reconciliação: `25 withheld`, `0 pending_review`, `0 approved`, `0 score_eligible`; `content_read=false`, `remote_apply=false`.
- Artefato reconciliado: `data/legislative-import/camara/authored-project-review-batches/camara-authored-1951-1975-reconciled.json`.
- Checkpoint atômico: `projects_analyzed=1975`, `withheld=1975`, `blocked_items=81`, próximo lote `1976–2000`.

## Estado e bloqueio
A API oficial da proposição foi verificada, mas o pacote não contém texto integral validado, evento/votação independente e voto nominal individual. Autoria e ementa não provam versão votada, posição ou efeito causal. O lote foi retido sem inferência; nenhum projeto, claim, voto, matéria, evento, matriz ou score foi publicado.

## Segurança e operações
- Lock exclusivo `flock` em `.orchestrator/runtime/locks/continuous-progress.lock` adquirido antes da seleção, coleta, reconciliação e checkpoint.
- Um único writer local; nenhum agente writer concorrente.
- Nenhuma escrita Supabase, migration, RLS/Auth/Storage/Edge Function ou Cloudflare factual.
- `remote_apply=false` em todos os artefatos.

## Gates locais
- `npm run test -- --passWithNoTests`: RC 0 — `499/499` testes, `120` arquivos.
- `npx tsc --noEmit`: RC 0.
- `node scripts/validate-impact-schema.mjs`: RC 0 — fixtures boa/ruim e votos legislativos aceitos/rejeitados conforme esperado.
- `npm run data:check`: RC 0 — `1003` candidaturas, `988` fotos oficiais, `1` fonte TSE.
- `npm run build`: RC 0 — `245` módulos; sitemap `1003 + 2` URLs estáticas.
- `git diff --check`: RC 0.
- Churn somente de timestamps produzido pelo build em três artefatos editoriais preexistentes foi restaurado antes do checkpoint final.

## Próximo lane read-only
Preparar a seleção determinística `1976–2000` e revalidar fontes oficiais Câmara em diretório temporário, sem promover itens e sem escrita remota; manter separado da fila editorial e do ciclo de votos factuais.
