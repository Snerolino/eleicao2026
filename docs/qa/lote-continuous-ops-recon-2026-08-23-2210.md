# QA — continuous ops recon — 2026-08-23 22:10 UTC

## Objetivo

Retomar o control plane contínuo com reconciliação read-only do dataset oficial,
auditoria de fontes legislativas, verificação da produção e gates locais, sem
promover decisões editoriais nem inserir fatos sem fonte oficial.

## Entregue e verificado

- Dataset oficial `consulta_cand_2026_RS.csv`: `1003` IDs únicos; snapshot público: `1003`; diferença em ambos os sentidos: `0`.
- CSV oficial: `553194` bytes; SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.
- `npm run data:check`: RC `0`; `1003` candidaturas, `988` fotos oficiais, `1` fonte TSE.
- `npm run impact:alrs:residual:repair`: RC `0`, dry-run; `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- Auditoria regular de fontes: RC `0`, read-only. Auditoria `--strict`: RC `2`, fail-closed, preservando gaps reais: versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`. Os quatro votos ALRS sem evidência vinculada permanecem bloqueados.
- `node scripts/verify-cli-output.mjs --live`: RC `0`; `1000` claims publicadas auditadas, `0` sem fonte.
- Produção: raiz HTTP `200`; `/release.json` HTTP `200`; live `a82510b7d22199e1c22fbd1e05c57ef57567aad8`, release `a82510b-20260823T214630879Z`, snapshot `1003`.
- GitHub: backup `334951434` run `32668450924` concluído `success` no mesmo `headSha`; primário mais recente `32668442174` também `success` no mesmo SHA remoto.
- Gates locais com Node `v24.19.0`: `401/401` testes em `98` arquivos; TypeScript RC `0`; schema de impacto RC `0`; `data:check` RC `0`; build RC `0`, `227` módulos e sitemap `1003 + 2`; `git diff --check` RC `0`.

## Estado dos dados e decisões

Nenhuma identidade, FK, voto, source reference, claim, assessment, matriz ou
disposição editorial foi alterada. Nenhuma decisão humana foi promovida. Os
quatro votos ALRS residuais seguem fail-closed por ausência de evidência oficial
reproduzível com URL, hash, bytes e match exato.

## Bloqueios reais

- Transporte Git: `git push origin main` continua bloqueado por HTTP `403`
  (`Permission to Snerolino/eleicao2026.git denied to Snerolino`) nos ticks
  anteriores; o HEAD local está um commit à frente de `origin/main`. Portanto,
  este registro não acionou workflow novo.
- `npm run orch:doctor`: RC `1` por shell com Node `22.22.2` enquanto o projeto
  exige Node 24 e por OpenCode ausente; os gates do projeto foram executados com
  Node `24.19.0`. O smoke MCP não foi exercitado no modo rápido.
- Auditoria estrita permanece RC `2` pelos gaps de fonte acima; não é falha a
  ser suprimida e não autoriza escrita factual.

## Próximo passo

Retentar bounded o transporte `main -> main`; somente se aceito, validar backup,
`headSha` e produção. Em paralelo, manter recon read-only e recuperação oficial
dos quatro votos ALRS. Não aplicar voto, assessment, matriz ou disposição sem
R0, schema/FK, fonte oficial, dry-run e idempotência comprovados.
