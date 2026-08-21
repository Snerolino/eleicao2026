# QA — lote continuous-ops recon — 2026-08-21 11:11 UTC

## Objetivo
Executar tick bounded com recon oficial read-only nas três frentes prioritárias e manter a lane local fail-closed, sem aplicar fatos sem R0, schema/FK, fonte exata, dry-run e idempotência.

## Entregue e verificado
- Lock `flock -n .orchestrator/runtime/locks/continuous-progress.lock` adquirido e liberado sem loop/sleep.
- Ambiente do projeto revalidado com Node `v24.19.0` via nvm para os comandos do tick.
- ALRS: `impact:alrs:r4:sources` confirmou 7/7 URLs oficiais HTTP 200 e válidas, 0 falhas; alteração rastreável limitada a `generated_at` do manifesto.
- FED-17 residual: dry-run `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`; nenhum voto ou identidade inferido.
- Senado: adaptação falhou fechado por ausência real de `/tmp/senado-nominal-envelope-latest.json`; nenhuma inferência de `legislator_id`, candidato ou fonte foi feita.
- Câmara: API oficial `dadosabertos.camara.leg.br/api/v2` respondeu em 8 janelas de até três meses; retorno read-only com IDs oficiais, sem reconciliação, FK ou aplicação.
- Pacote ALRS substantivo regenerado: 7 pedidos / 6 versões, 5 versões excluídas por fonte substantiva existente; validador fail-closed rejeitou 25 itens sem fonte substantiva.
- Auditoria read-only: gaps ALRS `1251/1647/4`, Câmara `3/2/2`, Senado `112/188/455` (versões/eventos/votos sem fonte).

## Gates locais — Node 24.19.0
- `npm run test`: aprovado, 97 arquivos / 398 testes.
- `npx tsc --noEmit`: aprovado.
- `node scripts/validate-impact-schema.mjs`: aprovado.
- `npm run data:check`: aprovado, 1003 candidaturas / 988 fotos.
- `npm run build`: aprovado; sitemap 1003 candidatos + 2 estáticas e `release.json` gerado.
- `git diff --check`: aprovado.
- `npm run smoke:local`: aprovado; 1002 cards, 0 falhas HTTP, 0 erros online de console, service worker pronto.

## Estado e publicação
- Nenhuma escrita factual, identidade, FK, voto, claim, source reference ou Supabase ocorreu.
- Commit documental `d353d3009ce6894903f3079db6a8c0e2cdd368ec` enviado para `origin/main`.
- Workflow backup Cloudflare `334951434`, run `32476264004`: `completed/success`, `headSha` idêntico.
- Produção `https://rs.votopraquem.org`: root HTTP `200`; `/release.json` HTTP `200`, `sha=d353d3009ce6894903f3079db6a8c0e2cdd368ec`, `release_id=d353d30-20260821T111430060Z`, `row_count=1003`.
- Smoke local e remoto aprovados: 1002 cards, 0 falhas HTTP, 0 erros online de console, service worker pronto.
- Bloqueios reais mantidos: Senado sem envelope transitório e com deriva criptográfica; FED-17 com JWT emitido no futuro e quatro residuais sem ID/fonte exata; validador substantivo fail-closed para 25 itens; doctor shell FAIL por Node `v22.22.2`; Codex MCP `401 invalid_refresh_token`, OpenCode ausente e Ollama sem preflight.

## Próximo passo
Manter recon bounded e lane local independente; aplicação remota continua proibida até R0, schema/FK, fonte oficial exata, dry-run e idempotência.
