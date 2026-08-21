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

## Estado e bloqueios reais
- Nenhuma escrita factual, identidade, FK, voto, claim, source reference, Supabase ou Cloudflare ocorreu.
- Senado bloqueado por envelope transitório ausente e deriva criptográfica já registrada.
- FED-17 bloqueado pelo JWT emitido no futuro e pelos quatro residuais sem ID oficial/fonte exata.
- Validador substantivo permanece fail-closed para 25 itens sem fonte.
- Doctor do shell continua FAIL por Node `v22.22.2`; rota Codex MCP continua bloqueada por `401 invalid_refresh_token`, OpenCode ausente e Ollama sem preflight utilizável.

## Próximo passo
Executar gates locais completos; se verdes, publicar apenas a evidência operacional e verificar produção. Manter aplicação remota bloqueada até todos os gates factuais obrigatórios.
