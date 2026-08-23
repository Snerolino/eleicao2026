# QA — continuous ops recon — 2026-08-23 20:55 UTC

## Objetivo
Retomar a operação contínua com reconciliação read-only do dataset oficial, cobertura de fontes legislativas, residual ALRS e verificação de publicação.

## Entregue e verificado
- Dataset oficial `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv` comparado com `data/public-candidates.json`: `1003/1003` IDs, `0` somente no dataset e `0` somente no snapshot.
- CSV oficial: `553194` bytes; SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.
- `npm run data:check`: RC 0; `1003` candidaturas, `988` fotos oficiais, `1` fonte TSE.
- `npm run impact:sources:audit`: RC 0, somente leitura. Cobertura sem fonte: versões ALRS/Câmara/Senado `1251/3/112`; eventos `1647/2/188`; votos `4/2/455`.
- Auditoria estrita: RC 2, fail-closed pelos gaps reais acima; fila ALRS residual com exatamente `4` votos (`alrs_pl134_2023`, `alrs_pl165_2025`, `alrs_pl361_2025`, `alrs_pl77_2025`).
- `npm run impact:alrs:residual:repair`: RC 0 em dry-run; `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- Produção: raiz HTTP 200 e `/release.json` HTTP 200.
- GitHub Actions read-only: último backup `334951434` success no SHA live `0a1a202b503f094d18feca19dc04704c7ca46d3c`; duplicata posterior skipped.

## Estado dos dados e segurança
Nenhuma escrita em Supabase, claims, assessments, matrizes, source references, votos, identidade, snapshot ou Cloudflare foi feita. Nenhum voto sem fonte foi promovido e nenhum UUID/FK foi inferido.

## Bloqueios reais
- `git push origin main` falhou RC 128/HTTP 403: `Permission to Snerolino/eleicao2026.git denied to Snerolino`; o HEAD local permanece à frente de `origin/main`, sem workflow novo para este tick.
- `npm run orch:doctor` permanece RC 1 porque o shell cron usa Node `v22.22.2` enquanto o projeto exige Node 24; também reporta OpenCode ausente e smoke MCP não exercitado. Os gates de projeto foram executados com Node 24 onde aplicável.
- Auditoria estrita continua bloqueada por ausência de evidência oficial vinculada; fail-closed mantido.

## Próximo passo
Retentar o transporte Git em próximo tick. Se aceito, validar backup `334951434`, `headSha`, `/release.json` e smoke remoto. Em paralelo, continuar recuperação read-only dos quatro votos ALRS sem aplicar dados até URL oficial, bytes, SHA, identidade exata, dry-run e idempotência verdes.
