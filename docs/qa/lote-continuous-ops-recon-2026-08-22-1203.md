# Lote continuous-ops — recon oficial e gates — 2026-08-22 12:03 UTC

## Objetivo
Executar um tick bounded do control plane: recon oficial read-only nas lanes Câmara/ALRS/Senado, verificar sincronização do dataset público e fechar os gates locais antes da publicação documental.

## Entregue e verificado
- Lock `flock -n` em `.orchestrator/runtime/locks/continuous-progress.lock`, adquirido e liberado sem loop/sleep.
- Doctor executado: `OK=49`, `WARN=6`, `FAIL=2`. Falhas reais: shell com Node `v22.22.2` enquanto o projeto exige Node 24; smoke estruturado do Codex/MCP falhou por token expirado/`401 invalid_refresh_token`. OpenCode ausente e Ollama sem preflight permanecem avisos/bloqueios de rotas opcionais.
- Câmara: consulta oficial read-only em 8 janelas trimestrais 2025–2026; 7 responderam `ok`, Q1/2025 falhou fechado com `fetch failed`. Nenhum `vote_id` foi promovido, reconciliado ou aplicado.
- ALRS FED-17 residual: dry-run `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`. Os quatro residuais de Enio Carlos Terra continuam sem ID oficial e fonte exata.
- Senado: fail-closed; `/tmp/senado-nominal-envelope-latest.json` está ausente. Nenhum voto ou fonte foi inventado.
- Auditoria de fontes read-only: `npm run impact:sources:audit` RC 0; auditoria estrita RC 2 pelos gaps reais: versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`.
- Dataset: CSV oficial e snapshot têm `1003/1003` `SQ_CANDIDATO`/`tse_candidate_id`, diferença `0/0`; CSV SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`; snapshot SHA-256 `a7db54b20bd1aa0d49003e278d48d1443617f00b772d004d711cd762d0c982cf`. `data:check`: 1.003 candidaturas, 988 fotos, 1 fonte TSE.
- Gates locais, em ordem: 401 testes/98 arquivos, TypeScript, schema de impacto, `data:check`, build, `git diff --check` e smoke local — todos RC 0. Build gerou sitemap com 1.003 candidatos + 2 estáticas e release local `823e9df-20260822T120333373Z`. Smoke: 1.002 cards visíveis, 0 falhas HTTP, 0 erros de console online, service worker pronto.

## Estado dos dados e bloqueios
Nenhuma escrita factual, Supabase, Cloudflare ou alteração de identidade/FK ocorreu. Aplicação remota permanece condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência. O push/publicação documental foi tentado duas vezes e bloqueou por DNS (`Could not resolve host: github.com`, RC 128); `main` local ficou 1 commit à frente de `origin/main`. A API do GitHub também falhou por conexão. Produção teve raiz HTTP 000 por timeout DNS e `/release.json` HTTP 200, versão `0.2.806`, sem `commitSha`/`builtAt`/`snapshotSha` verificáveis; nenhum workflow/deploy novo foi afirmado.

## Próximo passo
Retentar publicação documental somente quando a permissão efetiva permitir `main -> main`; após aceite, acompanhar workflow backup Cloudflare `334951434`, conferir `headSha` e validar produção. Manter recon Câmara/ALRS/Senado read-only/fail-closed e continuar a lane local independente.
