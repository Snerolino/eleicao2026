# QA — lote continuous ops recon oficial — 2026-08-23 12:11 UTC

## Objetivo
Executar tick bounded do control plane: manter recon oficial read-only ativo, verificar dataset/snapshot, validar gates locais e tentar avançar a publicação sem aplicar fatos sem fonte.

## Entregue e verificado
- Lock `flock -n .orchestrator/runtime/locks/continuous-progress.lock` adquirido e liberado sem loop/sleep.
- Dataset vivo versus snapshot por `SQ_CANDIDATO`: `1003/1003`, diferença `0`; CSV oficial `553194` bytes, SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.
- Reconhecimento oficial Câmara read-only: 8 janelas trimestrais de `2025-01-01` a `2026-12-31`, `8/8` respostas `ok`, sem reconciliação ou aplicação.
- ALRS FED-17 residual dry-run RC 0: `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`. Os quatro casos Enio Carlos Terra continuam sem ID oficial e fonte exata.
- Auditoria de fontes read-only RC 0: gaps reais permanecem em versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`.

## Gates locais
- `npm run test`: RC 0 — `401` testes, `98` arquivos.
- `npx tsc --noEmit`: RC 0.
- `node scripts/validate-impact-schema.mjs`: RC 0.
- `npm run data:check`: RC 0 — `1003` candidaturas, `988` fotos oficiais, `1` fonte TSE.
- `npm run build`: RC 0 — `224` módulos; sitemap `1003` candidatos + estáticas; `release.json` local gerado.
- `git diff --check`: RC 0.
- `npm run smoke:local`: primeira execução falhou por timeout transitório aguardando `main h1`; segunda execução RC 0 — `1002` cards, `0` falhas HTTP, `0` erros online, service worker pronto.

## Estado dos dados
Nenhum candidato, identidade, voto, FK, source reference, claim, Supabase remoto ou Cloudflare foi alterado. Senado permanece fail-closed por ausência de envelope nominal com SHA verificável; IDs transitórios da Câmara não foram vinculados a candidatos.

## Publicação
HEAD local `6143abcd1da774e30335b30d8b8100d047e73830`; `main` está 7 commits à frente de `origin/main`. O push permanece pendente para o próximo chunk; nenhum workflow novo ou deploy foi acionado neste tick.

## Bloqueios
- Transporte Git HTTPS/permissão efetiva continua bloqueando `main -> main` (histórico recente: HTTP 403).
- `orch:doctor` permanece degradado por Node 22.22.2 no shell padrão, OpenCode ausente e rota MCP Codex previamente indisponível; gates foram executados explicitamente com Node 24.19.0.
- ALRS residual, Senado e gaps de fontes legislativas permanecem bloqueados por evidência oficial exata ausente.

## Próximo passo
Retentar `git push origin main`; se aceitar, validar o workflow backup Cloudflare `334951434`, `headSha` e HTTP 200 de `https://rs.votopraquem.org`/`release.json`. Manter aplicação factual remota condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.
