# Lote continuous ops — recon read-only — 2026-08-23 21:14 UTC

## Objetivo
Revalidar o dataset oficial, a cobertura de fontes legislativas, a fila ALRS residual e as rotas oficiais Câmara sem promover dados sem fonte.

## Entregue e verificado
- Dataset TSE oficial `consulta_cand_2026_RS.csv` versus `data/public-candidates.json`: `1003/1003` IDs, diferença `0/0`; CSV `553194` bytes, SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.
- `npm run data:check`: RC 0; `1003` candidaturas, `988` fotos oficiais, `1` fonte TSE.
- `npm run impact:alrs:residual:repair`: RC 0 em dry-run; `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- Auditoria Câmara read-only: `8/8` janelas trimestrais oficiais 2025–2026 com `status=ok`, `blocked=null`; somente IDs oficiais inventariados.
- Auditoria do manifesto Câmara: `7` URLs, todas HTTP 200.
- `node scripts/verify-cli-output.mjs --live`: `1000` claims publicadas auditadas, `0` sem fonte.
- Produção: raiz HTTP 200 e `/release.json` HTTP 200.

## Estado dos dados
Auditoria estrita permanece fail-closed (RC 2) pelos gaps reais: versões sem fonte ALRS/Câmara/Senado `1251/3/112`; eventos `1647/2/188`; votos `4/2/455`. Os quatro votos ALRS residuais (`alrs_pl134_2023`, `alrs_pl165_2025`, `alrs_pl361_2025`, `alrs_pl77_2025`) continuam sem evidência vinculada.

## Bloqueios
- `git push origin main`: RC 128, GitHub HTTP 403 — `Permission to Snerolino/eleicao2026.git denied to Snerolino`; nenhum workflow novo foi acionado.
- `npm run orch:doctor`: RC 1 porque o shell usa Node `v22.22.2` e o projeto exige Node 24; OpenCode ausente e smoke MCP não exercitado permanecem warnings/limitações operacionais.
- Nenhuma escrita remota factual/editorial foi executada. Nenhum voto, identidade, FK, source reference, claim, matriz ou assessment foi inventado ou promovido.

## Próximo passo
Retentar o transporte Git; se aceito, validar o workflow backup `334951434`, `headSha`, `/release.json` e smoke remoto. Em paralelo, manter a recuperação oficial dos quatro votos ALRS em fail-closed até reproduzir URL, HTTP, bytes, SHA e match exato.
