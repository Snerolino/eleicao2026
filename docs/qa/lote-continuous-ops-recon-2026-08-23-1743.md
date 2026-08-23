# QA — lote continuous ops recon — 2026-08-23 17:43Z

## Objetivo
Retomar o control plane contínuo com reconciliação oficial read-only, validar os gates locais e retentar a publicação documental pendente, sem aplicar fatos legislativos sem fonte, identidade e idempotência comprovadas.

## Entregue e verificado
- Dataset oficial `consulta_cand_2026_RS.csv`: `1003` linhas, `553194` bytes, SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`; snapshot público permanece em `1003` IDs únicos.
- `npm run data:check`: RC 0 — `1003` candidaturas, `988` fotos oficiais, `1` fonte TSE.
- Câmara oficial read-only: `8/8` janelas trimestrais 2025–2026 com `status=ok`, `blocked=null`; IDs somente inventariados, sem reconciliação ou escrita.
- ALRS FED-17 residual: dry-run RC 0, `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- Auditoria de fontes read-only: RC 0, preservando gaps reais — versões ALRS/Câmara/Senado `1251/3/112`; eventos `1647/2/188`; votos `4/2/455`. Os quatro votos ALRS sem evidência vinculada permanecem na fila.
- Gates locais com Node `24.19.0`: `401/401` testes em `98` arquivos, TypeScript RC 0, schema RC 0, build RC 0 (`226` módulos; sitemap `1003 + 2 = 1005` URLs), `git diff --check` RC 0.
- Produção independentemente verificada: raiz HTTP 200 e `/release.json` HTTP 200; live permanece `5a8a24013263b684384b17e003f9fd0d57ce92f4`, release `5a8a240-20260823T164257627Z`, snapshot `1003`.

## Bloqueios reais
- `env -u GH_TOKEN git push origin main` falhou RC 128 por HTTP 403: `Permission to Snerolino/eleicao2026.git denied to Snerolino`. Nenhum workflow novo foi acionado; o registro deste lote ainda é local.
- `npm run orch:doctor` permanece RC 1 pelo shell Node `22.22.2` enquanto o projeto exige Node 24, OpenCode ausente e smoke MCP Codex não exercitado no modo rápido. Os gates do projeto foram executados explicitamente com Node 24.19.0.
- Auditoria estrita de fontes continua fail-closed por gaps históricos reais; não houve inferência, fuzzy matching ou aplicação de votos.

## Estado dos dados
Nenhum candidato, identidade, voto, FK, `source_reference`, claim, matriz, assessment, Supabase ou Cloudflare foi alterado neste lote.

## Próximo passo
Retentar transporte Git no próximo tick. Se `main -> main` for aceito, validar workflow backup `334951434`, `headSha`, raiz e `/release.json`. Manter Câmara em inventário, ALRS residual e Senado fail-closed; aplicação factual continua condicionada a R0 de identidade, schema/FK, fonte oficial, dry-run e idempotência.
