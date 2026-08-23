# QA — lote continuous ops recon oficial — 2026-08-23 12:32 UTC

## Objetivo
Executar tick bounded do control plane: manter as lanes de reconhecimento oficial, implementação local e publicação verificadas, sem aplicar fatos sem identidade, fonte exata, schema/FK, dry-run e idempotência.

## Entregue e verificado
- Lock `flock -n .orchestrator/runtime/locks/continuous-progress.lock` adquirido e liberado; sem loop ou sleep.
- Dataset vivo versus snapshot por `SQ_CANDIDATO`: `1003/1003`, diferença `0`; CSV oficial `553194` bytes, SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.
- Câmara oficial read-only: 8 janelas trimestrais de `2025-01-01` a `2026-12-31`, `8/8` respostas `ok`; foram apenas inventariados IDs transitórios, sem reconciliação ou aplicação.
- ALRS FED-17 residual executado em dry-run, mas bloqueado fechado por causa real `JWT issued at future`; nenhum voto ou fonte foi alterado. Os quatro casos Enio Carlos Terra continuam sem ID oficial e fonte exata.
- Auditoria de fontes read-only RC 0: gaps atuais em versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`.

## Gates locais
- `npm run test`: RC 0 — `401` testes, `98` arquivos.
- `npx tsc --noEmit`: RC 0.
- `node scripts/validate-impact-schema.mjs`: RC 0.
- `npm run data:check`: RC 0 — `1003` candidaturas, `988` fotos oficiais, `1` fonte TSE.
- `npm run build`: RC 0 — `224` módulos; sitemap `1003` candidatos + estáticas; `release.json` local gerado.
- `git diff --check`: RC 0.

## Estado dos dados
Nenhum candidato, identidade, voto, FK, source reference, claim, Supabase remoto ou Cloudflare foi alterado. Senado permanece fail-closed por ausência de envelope nominal com SHA verificável; IDs da Câmara não foram vinculados a candidatos.

## Publicação
Após os gates, foram feitas 2 tentativas de `env -u GH_TOKEN git push origin main`; ambas falharam com RC 128 e HTTP 403: `Permission to Snerolino/eleicao2026.git denied to Snerolino`. HEAD local `ba5ca58ac3522789d247de8614a1cc0e4b93ebf2` está 10 commits à frente de `origin/main` `23fa294e9811c3aa69a41fdf44e168beb6f6e86e`. Nenhum workflow novo foi acionado. Verificação pós-tentativa: raiz de produção respondeu HTTP 200; `/release.json` falhou por timeout de resolução DNS (`HTTP 000`), portanto não há SHA/release live novo verificável.

## Bloqueios
- Transporte Git HTTPS/permissão efetiva continua bloqueando `main -> main`.
- Shell usa Node `22.22.2`; gates do projeto passaram, mas o doctor permanece degradado pelo requisito Node 24, OpenCode ausente e rota MCP Codex previamente indisponível.
- ALRS residual está bloqueado por `JWT issued at future`; Senado segue sem envelope nominal verificável; gaps de fontes legislativas permanecem reais.

## Próximo passo
Retentar o transporte Git em novo tick. Se `main -> main` aceitar, validar o workflow backup Cloudflare `334951434`, `headSha` e HTTP 200 de `https://rs.votopraquem.org`/`release.json`. Manter aplicação factual remota condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.
