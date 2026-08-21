# Lote continuous ops — recon oficial e gates locais — 2026-08-21 21:30 UTC

## Objetivo
Executar um tick bounded do control plane, mantendo recon oficial read-only nas três trilhas prioritárias e validando o estado local antes de qualquer publicação.

## Entregue e verificado
- Lock `.orchestrator/runtime/locks/continuous-progress.lock` adquirido/liberado com `flock -n`; nenhum loop ou lock persistente.
- Dataset oficial `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv` comparado ao snapshot: `1003` IDs contra `1003`, diferença `0/0`.
- Câmara: API oficial `https://dadosabertos.camara.leg.br/api/v2/votacoes`, 8 janelas trimestrais 2025–2026, `8/8` páginas iniciais válidas, `700` IDs read-only, `blocked=null`. Nenhuma identidade, FK ou voto foi reconciliado/aplicado.
- Auditoria de fontes read-only: versões ALRS/Câmara/Senado `31/34/0` com fonte (`1251/3/112` sem); eventos `31/34/0` (`1647/2/188` sem); votos `3996/550/0` (`4/2/455` sem). O auditor reportou os gaps reais; não houve promoção.
- Gates sob Node `v24.19.0`: `npm run test` — `400 passed / 98 files`; `npx tsc --noEmit` — OK; `node scripts/validate-impact-schema.mjs` — OK; `npm run data:check` — `1003` candidaturas / `988` fotos; `npm run build` — OK, sitemap `1003 + 2 = 1005` URLs e `release.json` local; `git diff --check` — OK.
- Smoke local: `1002` cards, mínimo esperado `1002`, `0` falhas HTTP, `0` erros de console online, service worker pronto, rota canônica e modo offline verificados.
- Produção: `https://rs.votopraquem.org` HTTP `200`; `/release.json` HTTP `200`, ainda aponta para release live `e925327`/snapshot `1003`, não para o HEAD local.

## Bloqueios (causa real)
- ALRS FED-17 residual: `npm run impact:alrs:residual:repair` falhou fechado com `JWT issued at future`; os 4 residuais de Enio Carlos Terra continuam sem ID oficial e fonte exata. Nenhuma escrita ocorreu.
- Senado: `npm run impact:senado:envelope:adapt` falhou fechado por `ENOENT` em `/tmp/senado-nominal-envelope-latest.json`; nenhum PDF, `legislator_id`, FK ou voto foi promovido.
- Doctor: exit `1` por shell Node `22.22.2` (o tick usou explicitamente Node `24.19.0`); smoke de rota Codex MCP falhou por token expirado `401 invalid_refresh_token`; OpenCode ausente e Ollama sem preflight. Não houve tentativa de contornar autenticação.
- Publicação: commit(s) documental(is) local(is) criado(s) após os gates; `git push origin main` falhou duas vezes com HTTP 403 (`Permission denied`). Nenhum workflow/deploy novo foi acionado; o live permanece no release anterior.

## Estado de dados e segurança
Nenhuma escrita em Supabase/Cloudflare, nenhuma migration, RLS/RPC/Auth/Storage, identidade, FK, voto, claim ou source reference. Nenhum segredo foi lido ou exposto. Recon e auditoria permaneceram read-only e fail-closed.

## Próximo passo
Continuar recon oficial bounded (ALRS residual, Senado fail-closed, Câmara independente) e manter a lane local/publication-verification pronta. Publicar este checkpoint somente quando houver credencial Git efetiva e, antes de qualquer aplicação remota, preservar R0, schema/FK, fonte oficial, dry-run e idempotência.
