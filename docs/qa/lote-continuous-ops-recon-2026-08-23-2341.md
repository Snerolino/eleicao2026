# QA — continuous ops recon — 2026-08-23 23:41 UTC

## Objetivo
Revalidar o próximo tick bounded do control plane: dataset TSE contra snapshot público, cobertura de fontes legislativas, residual ALRS fail-closed, descoberta read-only da Câmara, claims publicadas com fonte e produção.

## Evidência executada
- Dataset oficial `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv`: 553.194 bytes, SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.
- Dataset versus `data/public-candidates.json`: `1003/1003` IDs, somente no dataset `0`, somente no snapshot `0`.
- `npm run data:check`: RC 0; 1003 candidaturas, 988 fotos oficiais, 1 fonte TSE.
- `npm run impact:sources:audit`: RC 0 regular; 1397 proposições, 1431 versões, 1902 eventos, 5007 votos. Gaps preservados: versões ALRS/Câmara/Senado `1251/3/112`; eventos `1647/2/188`; votos `4/2/455`.
- `node scripts/audit-legislative-source-coverage.mjs --strict`: RC 2, fail-closed pelos gaps reais acima.
- `npm run impact:alrs:residual:repair`: RC 0 dry-run; `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- `npm run impact:camara:discover -- --start 2025-01-01 --end 2025-03-31 --max-pages 100`: RC 0; 6 páginas oficiais `status=ok`, IDs somente inventariados, sem aplicação.
- `node scripts/verify-cli-output.mjs --live`: RC 0; 1000 claims publicadas auditadas, 0 sem fonte.
- Produção: `/`, `/release.json` e `/admin` HTTP 200. `/release.json`: release `51e05e6-20260823T233152903Z`, versão `0.2.978`.
- Git: worktree limpa; `HEAD=51e05e6df2821c832ac940bf7ad0a964ccc90dea`, alinhado com `origin/main` (`0/0`).

## Estado dos dados
Nenhum candidato, snapshot, identidade, FK, voto, source reference, claim, assessment, matriz ou disposição editorial foi alterado. Nenhuma escrita Supabase/Cloudflare ocorreu.

## Bloqueios reais
- Auditoria strict continua bloqueada por ausência de fontes legislativas, incluindo os quatro votos ALRS residuais (`alrs_pl134_2023`, `alrs_pl165_2025`, `alrs_pl361_2025`, `alrs_pl77_2025`), 455 votos Senado sem fonte e gaps Câmara/ALRS. Não inventar fonte, identidade ou voto.
- `npm run orch:doctor`: RC 1 por shell Node 22.22.2 enquanto o projeto exige Node 24; OpenCode ausente e Codex MCP smoke não exercitado são degradações operacionais, não bloquearam esta recon read-only.
- Um `git push origin main` foi tentado neste tick e retornou HTTP 403 (`Permission to Snerolino/eleicao2026.git denied to Snerolino`), embora a referência local estivesse alinhada; nenhum workflow novo foi acionado.

## Próximo passo
Retentar transporte Git no próximo tick; manter ALRS/Senado/Câmara em fail-closed e continuar reconciliação read-only oficial. Só considerar aplicação factual após identidade, schema/FK, fonte com URL/hash/bytes, dry-run e idempotência verdes.
