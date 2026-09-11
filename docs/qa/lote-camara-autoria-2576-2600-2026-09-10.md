# QA — autoria Câmara 2576–2600 — 2026-09-10

## Objetivo
Processar boundedamente o próximo lote determinístico de autoria Câmara, revalidar fontes oficiais e manter causal/red-team fail-closed. Autoria não foi convertida em voto, impacto, score, claim, matriz ou fato público.

## Lock, seleção e fonte oficial
- Lock exclusivo `flock` adquirido em `.orchestrator/runtime/locks/continuous-progress.lock`; único writer confirmado; baseline Git limpo em `main` (`1bbbb7c`).
- Seleção determinística: 25 projetos únicos (`offset=2575`, `limit=25`), 50 ocorrências candidato–projeto e 19 candidatos únicos.
- Endpoints oficiais de proposição e tramitação: 50/50 HTTP 200; 79.147 bytes totais; 50/50 hashes SHA-256 revalidados em segunda leitura.
- Identidade `dados.id` exata: 25/25.
- Texto integral oficial catalogado e validado por HTTP: 25/25 URLs `www.camara.leg.br`; tramitação independente: 25/25 (`event_url != full_text_url`). O conteúdo não foi interpretado (`content_read=false`).

## Lanes editoriais fail-closed
- Causal: 25/25 IDs exatos, 25 `withheld`, 0 `pending_review`, 0 `approved`, 0 `score_eligible`.
- Red-team: 25/25 IDs exatos, 25 `withheld`, 0 `pending_review`, 0 `approved`, 0 `score_eligible`.
- Reconciliação: 25/25 IDs exatos, 25 `withheld`, `content_read=false`, `remote_apply=false`.
- Bloqueio real: texto integral, versão/evento vinculante e voto nominal individual não foram validados; autoria/ementa/tramitação não prova posição, efeito causal ou score. Nenhum fato, claim, voto, matéria, matriz, score, projeto público ou escrita remota foi promovido.

## Artefatos e SHA-256
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2576-2600-source-manifest.json`: `50ba52e649484209cde67603935ca8a20176b434ed04aa59a6f69fff9bfc762f`
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2576-2600-causal.json`: `4b6b48b1e2333934d33dbab6f712e46c58a27d8918e4d75c0a27e441205f8ec1`
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2576-2600-redteam.json`: `b001af7f56f24a0e488f106f583e1ab68f4c7ea62e713dad1494bedca6dd5daf`
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2576-2600-reconciled.json`: `a7dc6b467f1e3b61ca82c2c310f898242116c0564ac6d9fbe3dfb334182cf09a`

## Checkpoint
- `projects_analyzed=2600`, `last_batch=2576-2600`, `next_batch=2601-2625`, `withheld=2600`, `approved=0`, `pending_review=0`.
- `blocked_items` do checkpoint: 108, incluindo `authored-2576-2600-source-event-gap`.
- Nenhuma migration, RLS, Auth, Storage, Edge Function, Supabase factual ou Cloudflare foi alterada/escrita.

## Gates e publicação
- Node `v24.19.0`: `npm run test` **499/499** em 120 arquivos; `npx tsc --noEmit` **0**; schema **OK**; `npm run data:check` **1003 candidaturas / 988 fotos**; `npm run build` **245 módulos / sitemap 1003+2**; `git diff --check` **0**.
- Churn não relacionado gerado pelo build foi restaurado; somente os artefatos do lote, checkpoint e QA permaneceram no commit.
- Commit de artefatos `882a3caf1c2bdc5d6b7dbc4a2788a57a0f4df6bc` e fechamento documental final `ab59fb16afd93eebecb46ba20526c24d635d77b9` publicados em `origin/main`.
- Backup Cloudflare `334951434`, run final `34546073097`: `completed/success`, `headSha` exato `ab59fb16afd93eebecb46ba20526c24d635d77b9`.
- Produção `https://rs.votopraquem.org`: raiz HTTP 200; `/release.json` HTTP 200 confirmou SHA final exato `ab59fb16afd93eebecb46ba20526c24d635d77b9`, `row_count=1003`.
- O workflow primário `Deploy` run `34545876952` permaneceu `in_progress` na primeira verificação; o backup foi o caminho efetivo confiável. Nenhuma escrita factual Supabase foi executada.
