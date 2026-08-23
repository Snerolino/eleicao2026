# QA — lote continuous ops recon — 2026-08-23 12:53Z

## Objetivo
Executar um tick bounded do control plane: recon oficial read-only, conferir o dataset vivo, validar gates locais e publicar/documentar somente evidência verificável.

## Entregue e verificado
- Lock `flock -n .orchestrator/runtime/locks/continuous-progress.lock` adquirido e liberado no tick.
- Dataset vivo versus snapshot por `SQ_CANDIDATO`: `1003/1003`, sem ausentes/extras; CSV oficial `553194` bytes, SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.
- Câmara oficial read-only: `8/8` janelas trimestrais de `2025-01-01` a `2026-12-31` responderam `status=ok`; `vote_ids` foram apenas inventariados, sem reconciliação ou aplicação.
- Auditoria de fontes read-only: versões ALRS/Câmara/Senado `31/34/0` com fonte; eventos `31/34/0`; votos `3996/550/0`. Gaps permanecem `1251/3/112`, `1647/2/188`, `4/2/455`.
- Gates locais: `npm run test` RC 0 — `98` arquivos, `401` testes; `npx tsc --noEmit` RC 0; `node scripts/validate-impact-schema.mjs` RC 0; `npm run data:check` RC 0 — `1003` candidaturas, `988` fotos, `1` fonte TSE; `npm run build` RC 0 — `224` módulos, sitemap `1003 + 2`, release local `d028235-20260823T125326524Z`; `git diff --check` RC 0.
- Worktree limpa e `HEAD == origin/main == d0282353171c22ffc5ecde87048f558dd634a7c1`; não houve mudança de código nem necessidade de deploy novo neste tick.

## Bloqueios reais
- ALRS FED-17 residual: `npm run impact:alrs:residual:repair` falhou fechado com `fetch failed`; os 4 casos Enio Carlos Terra continuam sem ID oficial/fonte exata. Nenhum voto, identidade, FK ou source reference foi inventado/aplicado.
- Senado continua fail-closed sem envelope nominal verificável com SHA.
- `npm run orch:doctor` RC 1: shell Node `22.22.2` enquanto o projeto exige Node 24; OpenCode ausente. Os gates do projeto foram executados e passaram.

## Estado remoto
Nenhuma escrita factual Supabase/Cloudflare ocorreu. Como `HEAD` já está publicado em `origin/main` e não houve alteração neste tick, não foi criado novo commit/deploy. Produção não foi alterada neste tick; validação live permanece no último release verificável do estado remoto.

## Próximo passo
Manter a lane de recon oficial ativa: retentar ALRS apenas quando a fonte oficial responder; continuar Câmara read-only e Senado fail-closed. Qualquer aplicação remota exige R0, schema/FK, fonte oficial exata, dry-run e idempotência comprovada.
