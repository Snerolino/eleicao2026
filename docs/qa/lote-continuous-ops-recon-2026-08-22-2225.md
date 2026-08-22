# Lote continuous-ops — recon oficial e gates locais — 2026-08-22 22:25 UTC

## Objetivo
Executar um tick bounded do control plane: manter recon oficial ativa, conferir o dataset vivo, validar gates locais e deixar publicação pronta sem promover fatos sem fonte/identidade exatas.

## Entregue e verificado
- Lock `.orchestrator/runtime/locks/continuous-progress.lock` adquirido e liberado com `flock -n`.
- ALRS FED-17 residual executado em modo padrão dry-run; falhou fechado antes de produzir plano por causa real `JWT issued at future`. Os 4 residuais de Enio Carlos Terra permanecem sem ID oficial e fonte exata; nenhum voto/data/source reference foi alterado.
- Câmara consultada somente leitura pela API oficial `https://dadosabertos.camara.leg.br/api/v2`, em 15 janelas/páginas de intervalos trimestrais 2025–2026 (`max_pages=2`): todas `status=ok`, `blocked=null`; IDs retornados são apenas descoberta transitória, sem reconciliação ou escrita.
- Senado permanece fail-closed: `/tmp/senado-nominal-envelope-latest.json` ausente; nenhum PDF/legislator_id foi promovido.
- Dataset vivo conferido: `../dataset2026` contém o CSV oficial `consulta_cand_2026_RS.csv` (553.194 bytes); snapshot público permanece com SHA `a7db54b20bd1aa0d49003e278d48d1443617f00b772d004d711cd762d0c982cf`.

## Gates locais
Executados com Node 24.19.0 e todos RC 0:
- `npm run test -- --passWithNoTests`
- `npx tsc --noEmit`
- `node scripts/validate-impact-schema.mjs`
- `npm run data:check`: 1.003 candidaturas, 988 fotos oficiais, 1 fonte TSE
- `npm run build`: sitemap com 1.003 candidatos + 2 estáticas; `release.json` local `69e74e9-20260822T222512297Z`
- `git diff --check`
- `npm run smoke:local`: 1.002 cards, mínimo esperado 1.002, 0 falhas HTTP, 0 erros de console online, service worker pronto; detalhe canônico `/candidatos/priscila_voigt_severiano_210002533355`.

## Estado e bloqueios
- Worktree limpa antes da documentação; HEAD local `69e74e9`, `main` 16 commits à frente de `origin/main`.
- `npm run orch:doctor -- --smoke` RC 1: shell usa Node 22.22.2 apesar do requisito Node 24; smoke Codex MCP sem evidência por token expirado/`401 invalid_refresh_token`; OpenCode ausente. Os gates do projeto foram executados explicitamente com Node 24.19.0.
- Push/deploy não executado neste tick: publicação continua bloqueada pelo histórico de HTTP 403 no `git push` (`Permission to Snerolino/eleicao2026.git denied to Snerolino`). Nenhum Supabase/Cloudflare foi alterado.
- Auditoria oficial continua fail-closed nos gaps já conhecidos: 4 votos ALRS, 2 Câmara e 455 Senado sem fonte verificável; não inventar URL, hash, UUID, voto ou identidade.

## Próximo passo
Retentar `git push origin main`; somente se aceito, validar workflow backup Cloudflare `334951434`, `headSha` e produção (`https://rs.votopraquem.org` e `/release.json`). Manter aplicação factual remota condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.
