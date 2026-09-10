# QA — autoria Câmara 2526-2550 — 2026-09-10

## Objetivo
Processar boundedamente o próximo lote determinístico de autoria Câmara, revalidar fontes oficiais e manter retenção fail-closed. Autoria não foi convertida em voto, impacto, score, claim, matriz ou fato público.

## Evidência oficial
- Seleção: 25 projetos únicos (offset=2525, limit=25), 25 ocorrências candidato–projeto e 7 candidatos únicos.
- Proposições Dados Abertos Câmara: 25/25 HTTP 200; identidade `dados.id` exata em 25/25.
- Tramitações oficiais: 25/25 HTTP 200; bytes totais das respostas oficiais=103008; SHA-256 preservado por endpoint no manifesto.
- Texto integral oficial catalogado: 25/25 URLs; conteúdo não lido/validado.
- Evento/tramitação independente catalogado: 6/25; nenhum foi validado como evento vinculante.

## Execução editorial fail-closed
- Causal: 25/25 IDs exatos, 25 withheld, 0 pending_review, 0 approved, 0 score_eligible.
- Red-team: 25/25 IDs exatos, 25 withheld, 0 pending_review, 0 approved, 0 score_eligible.
- Reconciliação: 25/25 IDs exatos, 25 withheld; `content_read=false`, `remote_apply=false`.
- Bloqueio real: faltam texto integral validado, evento/versão independente vinculante e voto nominal individual. Autoria/ementa não prova posição, efeito causal ou score. Nenhum dado editorial foi promovido.

## Artefatos e hashes
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2526-2550-source-manifest.json`: `df7610a26df834bfd9ea3ab9829ec95e4b73d54eb096b16e10234741b0a6493f`
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2526-2550-causal.json`: `821932dc4ecaf44d8f6a496a62770b529d7593d057264f224a4ae21c593f208c`
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2526-2550-redteam.json`: `7bf4e01c5f690283011cc20b55fd6dd591cbc46463a2e91e416629c1686df313`
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2526-2550-reconciled.json`: `989fb5f3832403f52a1f2482aa90b80b91f6a3557155e903b0d18b4f89802cc6`

## Checkpoint
- `projects_analyzed=2550`, `last_batch=2526-2550`, `next_batch=2551-2575`, `withheld=2550`, `blocked_items=106`.
- Nenhuma migration, RLS, Auth, Storage, Edge Function, Supabase ou Cloudflare foi alterada/escrita.

## Próximo passo
Fechar gates locais Node 24; se verdes, publicar os artefatos/documentação deste checkpoint pelo caminho backup Cloudflare e verificar produção pelo SHA exato. Depois, continuar com 2551–2575 sem promover dados factuais/editoriais.

## Gates locais Node 24

- Node `v24.19.0`.
- `npm run test`: RC 0 — 499/499 testes em 120 arquivos.
- `npx tsc --noEmit`: RC 0.
- `node scripts/validate-impact-schema.mjs`: RC 0.
- `npm run data:check`: RC 0 — 1003 candidaturas e 988 fotos oficiais.
- `npm run build`: RC 0 — 245 módulos; sitemap 1003 candidatos + 2 estáticas = 1005 URLs; release local gerado.
- `git diff --check`: RC 0.
- Churn não relacionado do build restaurado; somente artefatos do lote, QA e checkpoint permanecem.

## Publicação e verificação

- Commit de artefatos: `fc022675bfe424e16d9947615b6ae3c8b5826dae`, publicado em `origin/main`; `git ls-remote` alinhado.
- Workflow backup Cloudflare `334951434`, run `34544378411`: `completed/success`, `headSha` exato.
- Produção: raiz HTTP 200 e `/release.json` HTTP 200.
- `release.json`: SHA exato `fc022675bfe424e16d9947615b6ae3c8b5826dae`, versão `0.2.1312`, snapshot `row_count=1003`.
- Nenhuma migration, RLS, Auth, Storage, Edge Function, Supabase factual ou matriz/score foi alterado.
