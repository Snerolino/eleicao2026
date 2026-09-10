# QA — autoria Câmara 1976–2000 — 2026-09-10

## Objetivo
Processar o próximo intervalo determinístico de autoria Câmara com fonte oficial, duas lanes independentes e retenção fail-closed.

## Entregue e verificado
- Seleção determinística: `25` projetos únicos (`offset=1975`, `limit=25`), `75` ocorrências candidato–projeto e `24` candidatos únicos.
- Fonte oficial: `25/25` endpoints de proposição da API Dados Abertos Câmara HTTP 200; `35.315` bytes e SHA-256 preservados em `data/legislative-import/camara/authored-project-review-batches/camara-authored-1976-2000-source-manifest.json`.
- Lane causal: `25/25` IDs exatos; todos `withheld`.
- Lane red-team: `25/25` IDs exatos; todos `withheld`.
- Reconciliação: `25 withheld`, `0 pending_review`, `0 approved`, `0 score_eligible`; `content_read=false`, `remote_apply=false`.
- Artefato reconciliado: `data/legislative-import/camara/authored-project-review-batches/camara-authored-1976-2000-reconciled.json`.
- Checkpoint atômico: `projects_analyzed=2000`, `withheld=2000`, `blocked_items=82`, próximo lote `2001–2025`.

## Estado e bloqueio
A API oficial da proposição foi verificada, mas o pacote não contém texto integral validado, evento/votação independente e voto nominal individual. Autoria e ementa não provam versão votada, posição ou efeito causal. O lote foi retido sem inferência; nenhum projeto, claim, voto, matéria, evento, matriz ou score foi publicado.

## Segurança e operações
- Lock exclusivo `flock` em `.orchestrator/runtime/locks/continuous-progress.lock` adquirido antes da seleção, coleta, reconciliação e checkpoint.
- Um único writer local; nenhum agente writer concorrente.
- Nenhuma escrita Supabase, migration, RLS/Auth/Storage/Edge Function ou Cloudflare factual.
- `remote_apply=false` em todos os artefatos.

## Próximo lane read-only
Preparar a seleção determinística `2001–2025` e revalidar fontes oficiais Câmara em diretório temporário, sem promover itens e sem escrita remota; manter separado da fila editorial e do ciclo de votos factuais.

## Publicação verificada
- Commit `1fe35345c7822895269bc7b140fd36cfb94df5f3` publicado em `origin/main`.
- Backup Cloudflare workflow `334951434`, run `34423031428`, `completed/success`, `headSha` exato.
- Produção `https://rs.votopraquem.org` HTTP 200; `/release.json` confirmou SHA exato, release `1fe3534-20260910T005139215Z`, snapshot `1003`.
