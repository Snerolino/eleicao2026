# QA — lote continuous ops recon — 2026-08-21 21:51Z

## Objetivo
Executar um tick bounded do control plane: recon oficial read-only (ALRS residual, Câmara e Senado), auditoria de fontes, gates locais e verificação de produção, sem promover dado factual sem fonte/identidade exata.

## Entregue e verificado
- Lock `.orchestrator/runtime/locks/continuous-progress.lock` adquirido e liberado com `flock -n`.
- Dataset oficial `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv` comparado ao snapshot: 1.003 IDs contra 1.003; diferença 0/0.
- Câmara: API oficial `https://dadosabertos.camara.leg.br/api/v2`, 22 páginas em oito janelas trimestrais de 2025–2026, 22/22 `status=ok`, `blocked=null`, 2.100 IDs descobertos read-only. Nenhuma reconciliação ou aplicação.
- ALRS FED-17: reparo dry-run falhou fechado com `fetch failed`; 0 votos/correções promovidos. Os quatro residuais de Enio Carlos Terra continuam sem ID oficial e fonte exata.
- Senado: adaptador falhou fechado porque `/tmp/senado-nominal-envelope-latest.json` não existe (`ENOENT`); nenhum PDF, `legislator_id`, FK ou voto promovido.
- Auditoria de cobertura read-only: gaps mantidos em versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188` e votos `4/2/455`; sem promoção factual.
- Gates Node `v24.19.0`: 400 testes/98 arquivos, TypeScript, schema de impacto, `data:check` (1.003 candidaturas/988 fotos), build (sitemap 1.003 candidatos + 2 estáticas; `release.json` `ebb3853-20260821T215007854Z`) e `git diff --check` verdes.
- Primeiro smoke foi transitariamente interrompido durante carregamento (`cards=0`); repetição validada passou: 1.002 cards, 0 falhas HTTP, 0 erros de console online, service worker pronto, detalhe/canonical de Priscila Voigt Severiano.
- Produção: `https://rs.votopraquem.org` respondeu `HTTP 200`.

## Estado dos dados
Nenhum arquivo factual, identidade, FK, voto, claim, source reference, Supabase ou Cloudflare foi alterado. Snapshot e dataset permanecem alinhados em 1.003 candidaturas.

## Bloqueios reais
- Push GitHub continua bloqueado por HTTP 403 conforme checkpoints anteriores; este tick não criou commit nem acionou deploy.
- ALRS residual indisponível por falha real de fetch.
- Senado sem envelope nominal transitório; fail-closed.
- Auditoria de fontes continua com gaps reais; não inventar URLs, hashes, UUIDs ou votos.
- Doctor/orquestração externa permanece bloqueado pelos problemas já registrados (shell Node padrão 22.22.2 e credencial Codex expirada); gates foram executados explicitamente em Node 24.19.0.

## Próximo passo
Continuar recon oficial bounded e lane local independente no próximo tick; tentar publicação somente quando a credencial efetiva de push deixar de retornar 403. Aplicação remota continua condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.
