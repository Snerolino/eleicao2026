# QA — continuous ops recon — 2026-08-23 14:49 UTC

## Objetivo
Executar um tick bounded do control plane: recon oficial read-only, validação local, publicação/verificação e registro do próximo bloqueio.

## Entregue e verificado
- Lock bounded `flock -n` adquirido e liberado; worktree iniciou limpa em `main`, HEAD local `4f1b49d`, dois commits à frente de `origin/main`.
- ALRS FED-17 residual em dry-run: `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`. Os quatro casos Enio Carlos Terra continuam fail-closed sem ID oficial e fonte exata.
- Câmara oficial read-only: API `dadosabertos.camara.leg.br`, oito janelas trimestrais de 2025-01-01 a 2026-12-31, `8/8` `status=ok`, `blocked=null`; IDs somente inventariados, sem reconciliação ou escrita.
- Auditoria de fontes read-only RC 0: versões sem fonte ALRS/Câmara/Senado `1251/3/112`; eventos `1647/2/188`; votos `4/2/455`. Strict continua bloqueado por esses gaps reais.
- Snapshot público validado: `1003` candidaturas, `988` fotos oficiais, `1` fonte TSE. Nenhuma alteração factual foi feita.

## Gates locais
- `npm run test` com Node 24.19.0: RC 0, `401` testes em `98` arquivos.
- `npx tsc --noEmit` com Node 24.19.0: RC 0.
- `node scripts/validate-impact-schema.mjs`: RC 0.
- `npm run data:check`: RC 0, `1003/988/1`.
- `npm run build`: RC 0, `225` módulos, sitemap `1003 + 2`, release local `4f1b49d-20260823T144953529Z`.
- `npm run smoke:local`: primeira tentativa transitória `cards=0`; repetição verificada RC 0 com `1002` cards, `0` falhas HTTP, `0` erros online e service worker pronto.
- `git diff --check`: RC 0.

## Publicação e produção
- `env -u GH_TOKEN git push origin main`: RC 128, HTTP 403, `Permission to Snerolino/eleicao2026.git denied to Snerolino`; nenhum workflow novo foi acionado.
- Backup remoto `334951434` permanece ativo; último run observado `32645457872`, `completed/skipped`, `headSha=692094f875844d977f8436b02c04dacaa6423068`.
- Produção independentemente verificada: raiz HTTP 200 e `/release.json` HTTP 200, ainda em `sha=692094f875844d977f8436b02c04dacaa6423068`, release `692094f-20260823T142503596Z`, versão `0.2.936`, snapshot `1003`.

## Bloqueios reais
- Transporte Git continua rejeitado por HTTP 403; os dois commits locais não chegam a `origin/main`, portanto não há deploy novo verificável.
- Doctor global RC 1: shell Node 22.22.2, OpenCode ausente e smoke MCP Codex sem evidência estruturada; gates do projeto foram executados com Node 24.19.0.
- ALRS residual e Senado permanecem fail-closed por ausência de evidência oficial completa. Nenhuma identidade, voto, FK, source reference, claim, Supabase ou Cloudflare foi alterado.

## Próximo passo
Retentar `main -> main` no próximo tick; somente após aceitação validar backup `334951434`, `headSha`, raiz e `/release.json`. Manter recon oficial independente e qualquer aplicação remota condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.
