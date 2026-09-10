# QA — autoria Câmara 2501–2525 — 2026-09-10

## Objetivo
Processar o lote seguinte do checkpoint com seleção determinística, revalidação oficial da Câmara e duas lanes editoriais independentes, mantendo retenção fail-closed.

## Fontes oficiais
- Seleção: `offset=2500`, `limit=25`; 25 projetos, 50 ocorrências candidato–projeto e 20 candidatos.
- Proposição: 25/25 HTTP 200, identidade `dados.id` exata em 25/25. Tramitações: 23/25 HTTP 200; 2 itens com URL de status oficial.
- Bytes: 75.665; SHA-256 individual no manifesto. Texto integral catalogado 25/25, não validado.
- Manifesto: `data/legislative-import/camara/authored-project-review-batches/camara-authored-2501-2525-source-manifest.json`.

## Editorial
- Causal: 25/25 IDs, 25 withheld, `content_read=false`. Red-team: 25/25 IDs, 25 withheld, `content_read=false`.
- Reconciliação: 25 withheld, 0 pending_review, 0 approved, 0 score_eligible; `remote_apply=false`.
- Bloqueio: autoria/ementa/metadados não provam texto integral, evento vinculante, voto nominal, mecanismo causal ou score. Nenhuma escrita remota.

## Checkpoint
- `projects_analyzed=2525`, `withheld=2525`, `approved=0`, `pending_review=0`, `blocked_items=106`; próximo `2526–2550`.
- Arquivo: `data/legislative-import/camara/authored-analysis-progress-v1.json`.

## Gates locais
- `npm run test`: RC 0 — 499/499 testes em 120 arquivos.
- `npx tsc --noEmit`: RC 0.
- `node scripts/validate-impact-schema.mjs`: RC 0.
- `npm run data:check`: RC 0 — 1003 candidaturas, 988 fotos oficiais, 1 fonte TSE.
- `npm run build`: RC 0 — 245 módulos, sitemap 1005 URLs.
- `git diff --check`: RC 0.

## Segurança
Lock `flock` exclusivo; nenhum JSON bruto versionado; sem migration/RLS/Auth/Storage/Edge Function, Supabase ou Cloudflare.

## Próximo passo
Processar `2526–2550` mantendo o gate fail-closed.
