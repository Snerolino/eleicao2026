# QA — continuous-ops recon — 2026-08-23 22:28 UTC

## Objetivo

Revalidar o dataset público, cobertura de fontes legislativas, fila ALRS residual,
manifesto Câmara, claims publicadas e produção, sem escrita factual/editorial.

## Entregue e verificado

- Dataset oficial `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv` versus snapshot: `1003/1003` IDs; diferença nos dois sentidos `0/0`.
- CSV oficial: `553194` bytes; SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.
- `npm run data:check`: RC `0`; `1003` candidaturas, `988` fotos oficiais, `1` fonte TSE.
- Auditoria regular de fontes: RC `0`. Auditoria `--strict`: RC `2`, fail-closed; gaps preservados: versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`.
- `npm run impact:alrs:residual:repair`: RC `0`, dry-run; `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- Auditoria de fontes Câmara: RC `0`; `7/7` URLs HTTP 200 e manifesto preservado.
- `node scripts/verify-cli-output.mjs --live`: RC `0`; `1000` claims publicadas auditadas, `0` sem fonte.
- Produção: raiz HTTP `200`, `/release.json` HTTP `200`, `/admin` HTTP `200`.
- GitHub Actions: backup `334951434` run `32668450924` e primário `32668442174`, ambos `success`, `headSha=a82510b7d22199e1c22fbd1e05c57ef57567aad8`.

## Estado e bloqueios

- Nenhuma identidade, FK, voto, source reference, claim, assessment, matriz,
  disposição editorial, Supabase ou Cloudflare foi alterada.
- Os quatro votos ALRS sem evidência vinculada continuam bloqueados; não houve
  conversão de ausência em voto nem publicação sem fonte.
- `npm run orch:doctor`: RC `1` por shell Node `22.22.2` enquanto o projeto exige
  Node 24 e por OpenCode ausente. A recon read-only não foi bloqueada.
- Transporte Git: após o commit documental `3cecb00`, `git push origin main` foi retentado três vezes e bloqueado por HTTP `403` (`Permission to Snerolino/eleicao2026.git denied to Snerolino`); HEAD local está `3` commits à frente de `origin/main` e não houve workflow novo neste tick.

## Próximo passo

Retentar bounded `main -> main`; se aceito, validar backup, `headSha` e produção.
Manter recuperação oficial read-only dos quatro ALRS residuais e não aplicar voto,
assessment, matriz ou disposição sem R0, schema/FK, fonte exata, dry-run e idempotência.
