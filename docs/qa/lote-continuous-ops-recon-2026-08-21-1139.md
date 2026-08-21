# QA — lote continuous-ops recon — 2026-08-21 11:39 UTC

## Objetivo
Executar tick bounded com lock não bloqueante, recon oficial read-only nas lanes ALRS/Senado/Câmara e gates locais, sem aplicar fatos sem R0, schema/FK, fonte exata, dry-run e idempotência.

## Entregue e verificado
- Lock bounded adquirido/liberado sem loop ou sleep.
- Ambiente dos comandos do tick validado com Node `v24.19.0` via nvm.
- ALRS: `npm run impact:alrs:r4:sources` aprovado; 7/7 URLs oficiais HTTP 200, `ok=7`, `failed=0`. Manifesto mudou somente em `generated_at`.
- ALRS FED-17 residual: dry-run aprovado; `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- Senado: adaptação falhou fechado pela ausência real de `/tmp/senado-nominal-envelope-latest.json`; nenhuma inferência de legislator, candidato, fonte ou voto.
- Câmara: descoberta read-only aprovada na API oficial `dadosabertos.camara.leg.br/api/v2`, com 8 janelas trimestrais de até três meses e IDs oficiais; nenhuma reconciliação, FK ou aplicação.
- Auditoria estrita de fontes permaneceu bloqueada com gaps reais: versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`; exit `2` por gaps.

## Gates locais — Node 24.19.0
- `npm run test`: exit 0.
- `npx tsc --noEmit`: exit 0.
- `node scripts/validate-impact-schema.mjs`: exit 0.
- `npm run data:check`: exit 0.
- `npm run build`: exit 0.
- `git diff --check`: exit 0.
- `npm run smoke:local`: exit 0; 1002 cards, expectedMinCount 1002, 0 falhas HTTP, 0 erros online de console, service worker pronto.

## Estado, bloqueios e publicação
- Nenhuma escrita factual, identidade, FK, voto, claim, source reference, Supabase ou Cloudflare ocorreu.
- Alteração local rastreável: timestamp do manifesto ALRS e este QA.
- Publicação verificada: commit `7f0dfd9b660b3aaf3da62c46087b2c5c95c3e125` em `origin/main`; workflow backup `334951434`, run `32478241299`, `completed/success`, `headSha` idêntico.
- Produção `https://rs.votopraquem.org`: root HTTP 200; `/release.json` HTTP 200 com SHA idêntico, `release_id=7f0dfd9-20260821T114026464Z`, `row_count=1003`.
- Smoke remoto aprovado: 1002 cards, 0 falhas HTTP, 0 erros online de console e service worker pronto.
- Bloqueios: quatro residuais ALRS sem ID/fonte exata; Senado sem envelope transitório e com deriva criptográfica pré-existente; gaps substantivos de fontes; doctor shell continua FAIL por Node 22.22.2, embora os gates tenham sido executados explicitamente em Node 24.19.0; Codex MCP continua `401 invalid_refresh_token` e OpenCode ausente.
- Próximo passo: manter recon bounded e lane local independente; aplicação remota continua proibida até R0, schema/FK, fonte oficial exata, dry-run e idempotência.
