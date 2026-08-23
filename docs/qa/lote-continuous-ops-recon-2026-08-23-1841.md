# QA — lote continuous ops recon — 2026-08-23 18:41Z

## Objetivo
Revalidar reconciliação oficial read-only, fila ALRS residual, saúde do snapshot e transporte/publicação sem abrir escrita factual.

## Verificado
- `npm run data:check`: RC 0; `1003` candidaturas, `988` fotos oficiais, `1` fonte TSE.
- `npm run impact:sources:audit`: RC 0, read-only. Gaps reais preservados: versões ALRS/Câmara/Senado `1251/3/112`; eventos `1647/2/188`; votos `4/2/455`. Fila ALRS residual: `4` votos sem evidência vinculada.
- ALRS FED-17 (`node scripts/repair-alrs-fed17-residual.mjs`): RC 0, dry-run; `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- Câmara oficial (`node scripts/discover-camara-vote-ids.mjs --start 2025-01-01 --end 2026-12-31 --max-pages 1`): RC 0; `8/8` janelas trimestrais HTTP OK, `700` IDs inventariados, `blocked=null`; sem reconciliação ou escrita.
- Produção: raiz HTTP 200 e `/release.json` HTTP 200; live permanece `5a8a24013263b684384b17e003f9fd0d57ce92f4`, release `5a8a240-20260823T164257627Z`, versão `0.2.950`, snapshot `1003`.
- Últimos runs conhecidos: Deploy primário `32652443864` success e backup `32652456631` success no SHA remoto `5a8a240`; não houve run novo neste tick.

## Bloqueios reais
- `env -u GH_TOKEN git push origin main`: 3 tentativas, todas RC 128/HTTP 403 — `Permission to Snerolino/eleicao2026.git denied to Snerolino`. Local segue `7` commits à frente de `origin/main`; nenhum workflow novo foi acionado.
- `npm run orch:doctor`: RC 1 por shell Node `22.22.2` (projeto exige Node 24), OpenCode ausente e smoke MCP não exercitado no rápido. Os gates do projeto permanecem condicionados ao runtime Node 24.19.0.
- Auditoria estrita de fontes permanece bloqueada por gaps oficiais reais; não foram criados votos, identidades, FKs, source references, claims, matrizes ou assessments.

## Próximo passo
Retentar transporte Git no próximo tick. Se `main -> main` for aceito, validar backup `334951434`, `headSha`, raiz e `/release.json`. Manter ALRS residual, Senado e gaps de fontes em fail-closed/read-only até evidência oficial completa, R0/schema/FK, dry-run e idempotência.
