# Lote continuous-ops — recon oficial e gates locais — 2026-08-22 09:38 UTC

## Objetivo
Executar um tick bounded do control plane: recon oficial read-only, verificar o snapshot vivo do `dataset2026`, rodar os gates locais e preparar a publicação documental sem promover fatos sem fonte/identidade exata.

## Recon oficial (verificado)
- Câmara: `scripts/discover-camara-vote-ids.mjs --start 2025-01-01 --end 2026-12-31 --max-pages 1` respondeu `rc=0`, 8 páginas, 8 `ok`, `blocked=null`, 700 `vote_ids` transitórios. Nenhuma reconciliação ou aplicação foi executada.
- ALRS FED-17: `scripts/repair-alrs-fed17-residual.mjs` em dry-run respondeu `mode=dry-run`, `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`. Os quatro residuais de Enio Carlos Terra continuam sem ID oficial e fonte exata; não houve escrita remota.
- Senado: `/tmp/senado-nominal-envelope-latest.json` está ausente; envelope nominal permanece fail-closed. Nenhum `legislator_id`, FK, voto ou fonte foi inferido.
- Auditoria estrita de cobertura: `node scripts/audit-legislative-source-coverage.mjs --strict` retornou `rc=2` por gaps reais de fonte, sem promoção factual. `npm run impact:sources:audit` retornou `rc=0` para o auditor de repositório.

## Estado dos dados
- CSV oficial `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv`: 1.003 linhas/IDs, SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.
- Snapshot `data/public-candidates.json`: 1.003 registros/IDs, SHA-256 `a7db54b20bd1aa0d49003e278d48d1443617f00b772d004d711cd762d0c982cf`.
- `npm run data:check`: verde, 1.003 candidaturas, 988 fotos oficiais e 1 fonte TSE.
- Não houve alteração no snapshot nem em dados remotos.

## Gates locais (Node 24.19.0)
- `npm run test`: `rc=0`, 98 arquivos, 400 testes passados.
- `npx tsc --noEmit`: `rc=0`.
- `node scripts/validate-impact-schema.mjs`: `rc=0`.
- `npm run data:check`: `rc=0`.
- `npm run build`: `rc=0`; sitemap com 1.003 candidatos + 2 estáticas (1.005 URLs); `release.json` local `d0880f2-20260822T093703194Z`.
- `npm run smoke:local`: `rc=0`; 1.002 cards, 0 falhas HTTP, 0 erros de console online, service worker pronto.
- `git diff --check`: `rc=0`; worktree limpa após a documentação deste lote.

## Bloqueios reais
- Publicação GitHub ainda depende de permissão efetiva para `main -> main`; o HEAD local está 70 commits à frente de `origin/main` após falhas anteriores HTTP 403. Não afirmar deploy/live novo antes de push aceito.
- Doctor do orquestrador permanece com FAIL por shell Node 22.22.2, embora os gates do projeto tenham sido executados com Node 24.19.0; rota MCP Codex continua sem evidência válida e OpenCode não está instalado.
- ALRS/Senado permanecem bloqueados por evidência oficial/identidade, em fail-closed.

## Próximo passo
Tentar publicar somente a documentação após o commit; se o push aceitar, acompanhar o workflow backup Cloudflare `334951434` (ID `334951434`), conferir `headSha` e validar `https://rs.votopraquem.org` e `/release.json`. Manter a recon oficial read-only e não aplicar fatos remotos sem R0, schema/FK, fonte oficial, dry-run e idempotência.
