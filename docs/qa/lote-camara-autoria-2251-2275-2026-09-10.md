# QA — autoria Câmara 2251–2275 — 2026-09-10

## Objetivo
Processar boundedamente o lote seguinte de autoria Câmara, com seleção determinística, revalidação da fonte oficial, lanes causal/red-team independentes e retenção fail-closed.

## Seleção e fonte oficial
- Seleção: 25 projetos únicos, `offset=2250`, `limit=25`, ordenação por ID de projeto único ascendente.
- Ocorrências candidato–projeto: 58; candidatos únicos: 18.
- Fonte Dados Abertos Câmara: 25/25 URLs oficiais HTTP 200.
- Identidade: `dados.id` exatamente igual ao ID numérico da URL em 25/25.
- Total revalidado: 33.043 bytes; SHA-256 individual preservado no manifesto `data/legislative-import/camara/authored-project-review-batches/camara-authored-2251-2275-source-manifest.json`.
- Nenhum JSON bruto de resposta foi versionado.

## Lanes e reconciliação
- Lane causal: 25/25 IDs exatos; todos `withheld`; `content_read=false`.
- Lane red-team: 25/25 IDs exatos; todos `withheld`; `content_read=false`.
- Reconciliação: 25 `withheld`, 0 `pending_review`, 0 `approved`, 0 `score_eligible`.
- `remote_apply=false` em todos os artefatos.

## Bloqueio real
A fonte revalidada comprova identidade e metadados da proposição, mas não demonstra texto integral validado, versão/evento independente vinculante e voto nominal individual. Autoria/ementa não provam posição legislativa, efeito causal ou score. Nenhum fato, claim, voto, matéria, matriz, score, projeto público ou escrita Supabase/Cloudflare factual foi promovido.

## Checkpoint
- `projects_analyzed=2275`, `withheld=2275`, `approved=0`, `pending_review=0`, `blocked_items=93`.
- Lote fechado: `2251-2275` (`withheld`).
- Próximo lote calculado automaticamente: `2276-2300`.
- Checkpoint: `data/legislative-import/camara/authored-analysis-progress-v1.json`.

## Segurança
Nenhuma migration, RLS, Auth, Storage, Edge Function, score, matriz, claim, voto nominal ou escrita remota foi executada. O lock exclusivo foi obtido via `flock` em `.orchestrator/runtime/locks/continuous-progress.lock`.

## Próximo passo
Fechar gates locais, publicar/verificar este checkpoint e iniciar `2276–2300`, mantendo retenção fail-closed. A cadeia autoria → texto integral → versão/evento nominal → efeito continua ausente; não aplicar fatos editoriais/remotos.

## Publicação verificada
- Commit `2abef3f00a9a84a299909409b9179d03d1b64aa4` publicado em `origin/main`; alterações preexistentes não relacionadas permaneceram fora do commit.
- Backup Cloudflare workflow `334951434`, run `34431477000`, `completed/success`, `headSha` exato.
- Produção: raiz HTTP 200; `/release.json` HTTP 200 confirmou SHA exato, release `0.2.1269` e snapshot `row_count=1003`.

## Correção de publicação final
- A atualização documental deste QA foi publicada no commit final `64a85c3bb5ec834c98980d8bfddb3f4fb8332de9`; o commit de artefatos `2abef3f` permanece seu predecessor.
- Backup workflow `334951434`, run `34431600352`, `completed/success`, `headSha` exato `64a85c3bb5ec834c98980d8bfddb3f4fb8332de9`; o run duplicado `34431599820` foi `skipped`.
- Produção raiz HTTP 200 e `/release.json` HTTP 200 confirmaram SHA exato, release `0.2.1270` e snapshot `row_count=1003`.
