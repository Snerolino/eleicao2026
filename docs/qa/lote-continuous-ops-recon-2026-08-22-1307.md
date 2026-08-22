# QA — lote continuous ops recon — 2026-08-22 13:07 UTC

## Objetivo
Executar um tick bounded do control plane: revalidar dataset2026 versus snapshot público, gates locais, cobertura de fontes e estado de publicação sem promover fatos sem evidência.

## Entregue e verificado
- Dataset oficial `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv` versus `data/public-candidates.json`: 1.003/1.003 registros por `SQ_CANDIDATO`/`tse_candidate_id`, `only_csv=0`, `only_snapshot=0`.
- SHA-256 CSV: `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.
- SHA-256 snapshot: `a7db54b20bd1aa0d49003e278d48d1443617f00b772d004d711cd762d0c982cf`.
- Testes: 401/401 em 98 arquivos.
- TypeScript: `npx tsc --noEmit` RC 0.
- Schema de impacto/votos: RC 0.
- `data:check`: 1.003 candidaturas, 988 fotos oficiais, 1 fonte TSE, RC 0.
- Build: RC 0; sitemap com 1.003 candidatos + 2 páginas estáticas; `release.json` local `67c135c-20260822T130649550Z`.
- Smoke local: RC 0; 1.002 cards, 0 falhas HTTP, 0 erros de console online, service worker pronto.
- `git diff --check`: RC 0; worktree limpa antes da documentação deste tick.
- Auditoria de fontes regular: RC 0, read-only.
- Auditoria estrita: RC 2 por gaps reais, sem supressão: versões sem fonte ALRS/Câmara/Senado `1251/3/112`; eventos `1647/2/188`; votos `4/2/455`.

## Estado dos dados e lanes
- Reconhecimento oficial permanece read-only/fail-closed.
- ALRS residual Enio Carlos Terra: sem ID oficial e fonte exata verificável; nenhum voto promovido.
- Senado: envelope nominal verificável ausente; SHA/`legislator_id` não comprovados; nenhum dado promovido.
- Câmara: sem aplicação factual neste tick; identidades e fontes continuam condicionadas à reconciliação exata.
- Nenhuma escrita Supabase, migration, RLS, claims, votos, identidade ou matriz foi executada.

## Bloqueios reais
- `git push origin main` falhou HTTP 403: `Permission to Snerolino/eleicao2026.git denied to Snerolino`; HEAD local permanece 5 commits à frente de `origin/main`, portanto nenhum workflow/deploy novo foi acionado.
- Doctor mantém bloqueios de infraestrutura: shell Node 22.22.2 enquanto o projeto exige Node 24; smoke MCP Codex sem evidência por `401 invalid_refresh_token`; OpenCode ausente. Os gates do projeto passaram com a rota local.
- Produção foi revalidada com raiz HTTP 200 e `/release.json` HTTP 200, mas o payload live continua sem `commitSha`, `snapshotSha` e `builtAt`; não há correspondência verificável com HEAD local.

## Próximo passo automático
Retentar `main -> main` quando a permissão efetiva do GitHub permitir; somente após aceite acompanhar workflow backup Cloudflare `334951434`, conferir `headSha` e validar produção. Manter ALRS/Senado fail-closed e remoto factual condicionado a R0, schema/FK, fonte oficial, dry-run e idempotência.
