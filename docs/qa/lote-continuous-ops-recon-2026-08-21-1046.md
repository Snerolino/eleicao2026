# QA — lote continuous-ops recon — 2026-08-21 10:46 UTC

## Objetivo
Executar um tick bounded do control plane com recon oficial read-only, auditoria do dataset vivo, lane local independente e gates completos, sem aplicar fatos sem R0/schema/FK/fonte/dry-run/idempotência.

## Entregue e verificado
- Lock `flock -n .orchestrator/runtime/locks/continuous-progress.lock` adquirido e liberado sem loop/sleep.
- Recon ALRS: `npm run impact:alrs:r4:sources`; 7/7 URLs oficiais HTTP 200, 7/7 válidas, 0 falhas. O manifesto mudou somente `generated_at`; URLs, bytes e SHA permaneceram iguais.
- FED-17: dry-run não avançou por `JWT issued at future`; 0 votos, 0 correções e 0 aplicações. Os 4 residuais de Enio Carlos Terra seguem bloqueados.
- Senado: adaptação fail-closed por ausência real de `/tmp/senado-nominal-envelope-latest.json`; nenhuma inferência de `legislator_id`, candidato ou PDF.
- Câmara: API oficial read-only em quatro janelas trimestrais de 2026 respondeu HTTP válido; retornou IDs oficiais, sem evento, identidade, FK ou voto reconciliado/aplicado.
- Pacote ALRS substantivo: 9 pedidos / 8 versões regenerados. Validador fail-closed: 25 itens sem fonte substantiva; nenhuma aplicação factual.
- Auditoria de fontes read-only: gaps ALRS `1251/1647/4`, Câmara `3/2/2`, Senado `112/188/455` (versões/eventos/votos sem fonte).
- Dataset vivo: `consulta_cand_2026_RS.csv` completo com 1003 IDs; snapshot com 1003 IDs; diferença 0 nos dois sentidos. CSVs lidos com fallback CP1252; nenhum refresh aplicado.

## Gates locais — Node 24.19.0
- `npm run test`: aprovado, 97 arquivos / 398 testes.
- `npx tsc --noEmit`: aprovado.
- `node scripts/validate-impact-schema.mjs`: aprovado.
- `npm run data:check`: aprovado, 1003 candidaturas / 988 fotos.
- `npm run build`: aprovado; sitemap 1003 candidatos + 2 estáticas; `release.json` gerado.
- `git diff --check`: aprovado.
- `npm run smoke:local`: aprovado; 1002 cards, 0 falhas HTTP, 0 erros online de console, service worker pronto.

## Estado dos dados e publicação
- Nenhuma escrita factual, identidade, FK, voto, matriz, claim, source reference, Supabase ou Cloudflare ocorreu.
- Alterações locais: timestamp do manifesto ALRS e este relatório/STATE.
- Os gates verdes autorizam o ciclo de publicação do relatório operacional; não autorizam aplicação remota de fatos.

## Bloqueios reais
- Doctor shell permanece com FAIL porque usa Node `v22.22.2`; gates foram executados com Node `v24.19.0`.
- Smoke rápido Codex MCP permanece bloqueado por `401 invalid_refresh_token`; OpenCode ausente e Ollama sem preflight utilizável.
- FED-17 bloqueado por JWT emitido no futuro, além dos 4 residuais sem ID oficial/fonte exata.
- Senado bloqueado por envelope transitório ausente e deriva criptográfica previamente registrada.
- Gaps substantivos oficiais permanecem e o validador rejeita 25/25 itens sem fonte.

## Publicação e verificação
- Commit `cc7e1783756f0f47032a2aa5f1b0608b560868a2` enviado para `origin/main`.
- Workflow backup Cloudflare `334951434`, run `32474231702`: `completed/success`, `headSha` idêntico ao commit.
- Produção `https://rs.votopraquem.org`: HTTP `200`.
- `/release.json`: HTTP `200`, `sha=cc7e1783756f0f47032a2aa5f1b0608b560868a2`, `release_id=cc7e178-20260821T104801124Z`, snapshot `row_count=1003`.
- Smoke remoto aprovado: 1002 cards, 0 falhas HTTP, 0 erros online de console, service worker pronto.

## Próximo passo
Manter recon bounded e lane local independente; aplicação remota continua proibida até R0, schema/FK, fonte oficial exata, dry-run e idempotência.
