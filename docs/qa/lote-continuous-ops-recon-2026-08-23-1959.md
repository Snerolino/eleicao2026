# Lote continuous-ops — recon read-only — 2026-08-23 19:59 UTC

## Objetivo
Revalidar o snapshot TSE/dataset2026, a fila editorial do `/admin`, a cobertura de fontes legislativas, o residual ALRS e a publicação atual sem executar mutações remotas.

## Entregue e verificado
- Dataset oficial `consulta_cand_2026/consulta_cand_2026_RS.csv`: `553194` bytes, SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.
- Comparação por `SQ_CANDIDATO`: `1003` IDs no dataset e `1003` no snapshot; `0` ausentes e `0` extras.
- `npm run data:check`: RC 0; `1003` candidaturas, `988` fotos oficiais, `1` fonte TSE.
- `npm run impact:alrs:residual:repair`: RC 0 em dry-run; `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- Auditoria legislativa regular: RC 0. Auditoria `--strict`: RC 2, fail-closed, preservando gaps reais: versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`.
- Fila remota read-only: `2650` claims publicadas, `33` claims `pending_review` (todas `historico_politico`, não geradas por IA), `0` claims publicadas sem qualquer fonte; `14` matrizes aprovadas e `0` pendentes; `10` disposições editoriais aprovadas e `0` pendentes; `0` source references sem hash.
- Migrations locais/remotas alinhadas até `20260823110000` (`supabase migration list`, RC 0).
- Produção: raiz HTTP 200; `/release.json` HTTP 200, SHA live `0a1a202b503f094d18feca19dc04704c7ca46d3c`, versão `0.2.961`, snapshot `1003` e SHA do CSV acima.
- Backup Cloudflare `334951434`: run `32661013323` success no SHA live; duplicata `32661190014` skipped no mesmo SHA.

## Bloqueios reais
- Quatro votos ALRS (`alrs_pl134_2023`, `alrs_pl165_2025`, `alrs_pl361_2025`, `alrs_pl77_2025`) continuam sem evidência oficial vinculável; nenhum voto foi inventado ou aplicado.
- Gaps de fonte ALRS/Câmara/Senado permanecem fail-closed conforme auditoria strict.
- `npm run orch:doctor`: RC 1 por shell Node `22.22.2` enquanto o projeto exige Node 24; OpenCode ausente; smoke Codex não exercitado no modo rápido. Os checks do projeto usam a rota Node 24 quando disponível.
- O HEAD local `445f139fec6e06df8f5a99f0b70aabc8b8dad8cf` está 2 commits à frente de `origin/main`; transporte Git ainda precisa ser retentado. Não foi feita escrita remota neste tick.

## Próximo passo
Retentar `git push origin main`; se aceito, validar backup `334951434`, `headSha`, raiz e `/release.json`. Manter os quatro votos e quaisquer claims/matrizes novas em fail-closed/pending_review até fonte oficial, identidade exata, dry-run e idempotência verdes.
