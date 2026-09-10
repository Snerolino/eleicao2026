# QA — autoria Câmara 2201–2225 — 2026-09-09

## Objetivo
Processar o próximo lote determinístico de autoria Câmara sob lock exclusivo, com revalidação oficial de identidade/fonte, lanes causal e red-team independentes e retenção fail-closed.

## Seleção e fonte oficial
- 25 projetos únicos, offset=2200, limit=25, ordenação por projeto único.
- Fonte Dados Abertos Câmara: 25/25 HTTP 200.
- Identidade oficial: 25/25 `dados.id` exatamente igual ao ID da URL.
- Manifesto: `data/legislative-import/camara/authored-project-review-batches/camara-authored-2201-2225-source-manifest.json`.
- Total revalidado: 36.263 bytes; SHA-256 individual preservado; nenhum bruto versionado.

## Lanes e decisão
- Causal: 25/25 IDs exatos, todos `withheld`.
- Red-team: 25/25 IDs exatos, todos `withheld`.
- Reconciliação: 25 `withheld`, 0 `pending_review`, 0 `approved`, 0 `score_eligible`.
- `content_read=false` e `remote_apply=false`; nenhum dado foi promovido por inferência.

## Bloqueio real
A API oficial comprova identidade e metadados, mas o lote não demonstra simultaneamente texto integral validado, versão/evento independente vinculante e voto nominal individual. Autoria/ementa não provam posição, efeito causal ou score. Nenhum fato, claim, voto, matéria, matriz, score ou projeto público foi inventado ou publicado.

## Checkpoint
- `projects_analyzed=2225`, `withheld=2225`, `approved=0`, `pending_review=0`, `blocked_items=91`.
- Lote fechado: 2201–2225; próximo calculado atomicamente: 2226–2250.

## Gates e segurança
- Node usado nos scripts do lote: v24.19.0.
- Nenhuma migration, RLS, Auth, Storage, Edge Function, Supabase factual ou Cloudflare factual foi alterada.
- QA e artefatos locais ainda dependem dos gates completos antes da publicação.

## Próximo passo
Executar os gates locais completos; se verdes, publicar este checkpoint e iniciar 2226–2250 sem aplicar fatos editoriais/remotos.
