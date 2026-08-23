# Lote continuous-ops — recon read-only — 2026-08-23 20:18Z

## Objetivo

Revalidar o estado do dataset oficial, filas editoriais, cobertura de fontes legislativas, migrations remotas, produção e transporte Git sem promover decisões humanas nem aplicar fatos sem fonte.

## Entregue e verificado

- `npm run data:check`: RC 0; snapshot com `1003` candidaturas, `988` fotos oficiais e `1` fonte TSE.
- Dataset oficial `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv`: presente; a reconciliação registrada no checkpoint permanece `1003/1003`, diferença `0`.
- `npm run impact:sources:audit`: RC 0, read-only. Cobertura remota: versões sem fonte `ALRS 1251`, `Câmara 3`, `Senado 112`; eventos `ALRS 1647`, `Câmara 2`, `Senado 188`; votos `ALRS 4`, `Câmara 2`, `Senado 455`.
- `node scripts/audit-legislative-source-coverage.mjs --strict`: RC 2, fail-closed pelos gaps acima. Nenhum voto foi inventado ou escrito.
- `npm run impact:alrs:residual:repair`: RC 0 dry-run; `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- Recon Supabase público read-only: `claims` `2650 published` e `0 pending_review`; `impact_matrices` `14 approved` e `0 pending_review`. Consulta anônima à fila editorial retornou HTTP 401 por RLS, esperado sem sessão autenticada; nenhuma decisão foi promovida.
- `supabase migration list`: migrations locais/remotas alinhadas até `20260823110000`.
- Produção: raiz HTTP 200; `/release.json` HTTP 200; live `0a1a202b503f094d18feca19dc04704c7ca46d3c`, versão `0.2.961`.
- `/admin`: HTTP 200.

## Gates locais

Executados com Node `v24.19.0`: `npm run test` RC 0 (`401/401` testes em `98` arquivos), `npx tsc --noEmit` RC 0, `node scripts/validate-impact-schema.mjs` RC 0, `npm run data:check` RC 0, `npm run build` RC 0 (`227` módulos; sitemap `1003 + 2` URLs; `release.json` gerado), `git diff --check` RC 0.

## Bloqueios reais

- `git push origin main`: RC 128, HTTP 403 — `Permission to Snerolino/eleicao2026.git denied to Snerolino`. HEAD local `5807767` está `3` commits à frente de `origin/main` (`0a1a202`). Nenhum workflow novo foi acionado.
- `npm run orch:doctor -- --smoke`: RC 1. Evidências: shell Node `22.22.2` enquanto o projeto exige Node 24; OpenCode ausente; smoke MCP Codex não comprovado e tokens Codex expirados/401. Antigravity e GitHub CLI foram detectados.
- Auditoria strict permanece bloqueada por falta de fonte vinculável em ALRS/Câmara/Senado; os quatro votos ALRS residuais continuam sem evidência oficial reproduzida com URL/hash/bytes/match exato.

## Estado dos dados e segurança

Nenhuma candidatura, identidade, FK, voto, `source_reference`, claim, matriz, assessment, Supabase remoto ou Cloudflare foi alterado neste tick. O caminho permanece fail-closed e claims/matrizes editoriais continuam dependentes de revisão humana.

## Próximo passo

Retentar transporte Git em bounded retry. Se `main -> main` for aceito, validar workflow backup `334951434`, `headSha`, raiz e `/release.json`. Em paralelo, continuar recuperação read-only dos quatro votos ALRS sem fonte; não aplicar voto, assessment ou matriz sem os gates R0/schema/FK/fonte/dry-run/idempotência.
