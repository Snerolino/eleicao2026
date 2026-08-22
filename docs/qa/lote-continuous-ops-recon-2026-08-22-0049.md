# QA — lote continuous ops recon — 2026-08-22 00:49 UTC

## Objetivo
Executar um tick bounded do control plane: recon oficial read-only nas lanes ALRS/Senado/Câmara, diff do dataset vivo, gates locais e verificação de bloqueios de publicação.

## Entregue e verificado
- Lock `.orchestrator/runtime/locks/continuous-progress.lock` adquirido e liberado de forma não bloqueante pelo tick.
- Recon oficial read-only registrada em `.orchestrator/runtime/continuous-tick-20260822T0047Z/`.
- Senado: 6/6 HTTP 200, 6/6 prefixos válidos, 3/6 bytes coincidentes, 0/6 SHA coincidentes; fail-closed, sem PDF/legislator_id/FK/voto promovido.
- ALRS: HTTP 200, 77.442 bytes, SHA `sha256:6a386d7d8b9ae17f8f5107b0cb6c90d71795a8568f08ed7c5972746a4ac0bab1`, 0 `data-item`, sem Enio Carlos Terra/Terra exato; quatro residuais permanecem bloqueados.
- Câmara: API oficial Q4/2026 HTTP 200, JSON válido, 0 registros novos; sem reconciliação/aplicação.
- Dataset: 1.003 IDs no snapshot, 10 CSVs examinados, 0 ausentes; nenhum refresh factual.
- Gates locais: 400 testes/98 arquivos; TypeScript; schema; `data:check` 1.003 candidaturas/988 fotos/1 fonte TSE; build; sitemap 1.003 candidatos + 2 estáticas; `git diff --check`.
- Smoke local: 1.002 cards, 0 falhas HTTP, 0 erros de console online, service worker pronto.

## Estado dos dados
Nenhuma escrita factual, snapshot, claim, source reference, FK, voto, matriz, Supabase ou Cloudflare ocorreu. Auditoria estrita continua com gaps: versões ALRS/Câmara/Senado 1251/3/112; eventos 1647/2/188; votos 4/2/455. A auditoria saiu exit 2 por gaps reais e foi mantida fail-closed.

## Bloqueios reais
- Commit documental `a712c2b` criado após os gates. `git push origin main` e `env -u GH_TOKEN git push origin main` falharam com HTTP 403 (`Permission denied`); nenhum workflow/deploy foi acionado. HEAD local está 36 commits à frente de `origin/main`. Produção atual permaneceu HTTP 200, `/release.json` HTTP 200, SHA live `e925327276b82481a348d4db3e2339d075dfe9a3`, release `e925327-20260821T145742462Z`.
- `orch:doctor` saiu `OK=48 WARN=5 FAIL=1`: shell Node 22.22.2 embora o projeto exija Node 24; OpenCode ausente; Ollama sem preflight; rota MCP não exercitada no modo rápido.
- Senado permanece com deriva de SHA (0/6) apesar de prefixos válidos.
- ALRS não expôs `data-item` nem identidade/fonte exata dos quatro residuais Enio Carlos Terra.

## Próximo passo
Repetir recon oficial bounded e manter a lane local independente. Resolver o bloqueio efetivo de push antes de iniciar publicação; remote factual apply segue condicionado a R0, schema/FK, fonte oficial, dry-run e idempotência.
