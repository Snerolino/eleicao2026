# QA — lote continuous ops recon — 2026-08-23 19:02Z

## Objetivo
Revalidar dataset TSE, reconciliação oficial read-only, filas editoriais remotas, fontes e publicação sem abrir escrita factual.

## Verificado
- Dataset oficial correto `consulta_cand_2026/consulta_cand_2026_RS.csv`: `553194` bytes, SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`; `1003` IDs contra `1003` no snapshot, diferença `0/0`.
- `node scripts/audit-legislative-source-coverage.mjs`: RC 0, read-only. Gaps preservados: versões ALRS/Câmara/Senado `1251/3/112`; eventos `1647/2/188`; votos `4/2/455`; recuperação ALRS mantém `4` votos sem evidência vinculada.
- `node scripts/repair-alrs-fed17-residual.mjs`: RC 0, dry-run; `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- Câmara oficial `node scripts/discover-camara-vote-ids.mjs --start 2025-01-01 --end 2026-12-31 --max-pages 1`: RC 0; `8/8` janelas trimestrais HTTP OK, `blocked=null`, inventário somente read-only.
- Supabase linked read-only: tabelas legislativas/editoriais presentes; `impact_matrices`: `14 approved`; `impact_editorial_dispositions`: `5 approved`; `claims`: `2650 published`, `33 pending_review`; claims publicadas sem nenhuma fonte: `0`; `source_references` sem `content_hash`: `0`.
- Produção: raiz HTTP 200 e `/release.json` HTTP 200; live permanece `5a8a24013263b684384b17e003f9fd0d57ce92f4`, release `5a8a240-20260823T164257627Z`, versão `0.2.950`, snapshot `1003`.
- Worktree limpa antes do registro; `HEAD` local está `8` commits à frente de `origin/main`.

## Bloqueios reais
- `env -u GH_TOKEN git push origin main`: RC 128, HTTP 403 — `Permission to Snerolino/eleicao2026.git denied to Snerolino`; nenhum workflow novo foi acionado.
- `npm run orch:doctor`: RC 1 por shell Node `22.22.2` enquanto o projeto exige Node 24; OpenCode ausente e smoke MCP não exercitado no modo rápido. Não houve alteração de infraestrutura.
- Auditoria estrita de fontes continua bloqueada por gaps oficiais reais; ALRS residual, Senado e qualquer fato sem fonte permanecem fail-closed. Nenhuma identidade, FK, voto, source reference, claim, matriz ou assessment foi escrito neste tick.

## Próximo passo
Retentar transporte Git no próximo tick; somente após `main -> main`, validar backup `334951434`, `headSha`, raiz e `/release.json`. Manter reconciliação oficial read-only e aplicação factual condicionada a R0/schema/FK/fonte/dry-run/idempotência.
