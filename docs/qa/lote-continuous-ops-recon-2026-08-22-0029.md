# Lote continuous ops — recon oficial e publicação — 2026-08-22 00:29 UTC

## Objetivo
Executar o tick bounded do control plane: recon oficial read-only nas lanes Câmara/ALRS/Senado, validar cobertura de fontes, rodar gates locais e tentar publicação do estado local autorizado.

## O que foi entregue e verificado
- Câmara: `npm run impact:camara:discover` respondeu `status=ok` nas 8 janelas trimestrais 2025–2026; recon read-only encontrou lote de IDs oficiais, sem reconciliação ou aplicação.
- ALRS FED-17: `npm run impact:alrs:residual:repair` permaneceu dry-run com `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`. Os quatro residuais de Enio Carlos Terra continuam sem ID oficial e fonte exata.
- Senado: fail-closed por ausência de `/tmp/senado-nominal-envelope-latest.json` (`ENOENT`); nenhum PDF, `legislator_id`, FK ou voto promovido.
- Auditoria read-only de fontes: versões ALRS `31/1282`, Câmara `34/37`, Senado `0/112`; eventos ALRS `31/1678`, Câmara `34/36`, Senado `0/188`; votos ALRS `3996/4000`, Câmara `550/552`, Senado `0/455`. Gaps permanecem sem promoção.
- Snapshot público: `data:check` verde com 1.003 candidaturas, 988 fotos oficiais e 1 fonte TSE.
- Build verde: Vite produziu sitemap com 1.003 candidatos + 2 estáticas e `release.json` local para `d783b38`.

## Gates locais
- `npm run test`: verde, 98 arquivos / 400 testes.
- `npx tsc --noEmit`: verde.
- `node scripts/validate-impact-schema.mjs`: verde.
- `npm run data:check`: verde, 1.003 candidaturas / 988 fotos.
- `npm run build`: verde.
- `git diff --check`: verde.
- `npm run smoke:local`: primeira tentativa falhou por carregamento transitório (`cards=0`); repetição verde com 1.002 cards, 0 falhas HTTP, 0 erros de console online e service worker pronto.

## Publicação e estado remoto
- Worktree limpa antes da documentação e ficou apenas com este relatório pendente.
- Produção: raiz `HTTP 200`; `/release.json` `HTTP 200`, ainda em `e925327276b82481a348d4db3e2339d075dfe9a3`.
- O branch local `main` está 33 commits à frente de `origin/main`; a tentativa anterior de push documentada no estado falhou com HTTP 403. Neste tick, a publicação fica condicionada a retry do push e validação do workflow backup Cloudflare; nenhum deploy remoto foi presumido.

## Bloqueios reais
- Push GitHub permanece bloqueado por HTTP 403 (`Permission denied`) no checkpoint anterior.
- Doctor continua com FAIL por shell Node 22.22.2, embora os gates tenham sido executados explicitamente com Node 24.19.0; há WARN de rota Codex MCP não exercitada e OpenCode ausente.
- ALRS sem evidência exata para os quatro residuais; Senado sem envelope oficial; gaps de fontes legislativas continuam.

## Próximo passo
Repetir push e, se aceito, disparar/verificar o workflow backup `334951434`; comparar `headSha` do run com o commit local e revalidar produção. Manter ALRS/Senado fail-closed e continuar recon oficial da Câmara sem aplicação factual até R0/schema/FK/fonte/dry-run/idempotência.