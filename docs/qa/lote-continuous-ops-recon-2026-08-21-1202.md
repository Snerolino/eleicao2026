# QA — lote continuous-ops recon — 2026-08-21 12:02 UTC

## Objetivo
Executar tick bounded com lock não bloqueante, recon oficial read-only nas lanes ALRS/Câmara/Senado e gates locais, sem aplicar fatos sem R0, schema/FK, fonte exata, dry-run e idempotência.

## Entregue e verificado
- Lock bounded adquirido/liberado com `flock -n`, sem loop ou sleep.
- Ambiente dos comandos validado com Node `v24.19.0` via PATH explícito.
- ALRS: `npm run impact:alrs:r4:sources` aprovado; 7/7 URLs oficiais HTTP 200, `ok=7`, `failed=0`. Manifesto mudou somente em `generated_at`.
- ALRS FED-17: dry-run consultado; bloqueado por `JWT issued at future`, sem votos/correções aplicados.
- Câmara: descoberta read-only na API oficial `dadosabertos.camara.leg.br/api/v2`, 8 janelas trimestrais de até três meses, todas `status=ok`, com IDs oficiais; nenhuma reconciliação, FK ou aplicação.
- Senado: fail-closed; `/tmp/senado-nominal-envelope-latest.json` não existe. Nenhuma inferência de legislator, candidato, fonte ou voto.

## Gates locais — Node 24.19.0
- `npm run test`: exit 0; 97 arquivos, 398 testes aprovados.
- `npx tsc --noEmit`: exit 0.
- `node scripts/validate-impact-schema.mjs`: exit 0.
- `npm run data:check`: exit 0; 1003 candidaturas, 988 fotos oficiais.
- `npm run build`: exit 0; sitemap com 1003 candidatos + estáticas e `release.json` gerado.
- `git diff --check`: exit 0.
- `npm run smoke:local`: exit 0; 1002 cards, 0 falhas HTTP, 0 erros online de console, service worker pronto.

## Auditoria de fontes
`npm run impact:sources:audit -- --strict` saiu com exit 2 por gaps reais, sem supressão:
- versões: ALRS 1251, Câmara 3, Senado 112 sem fonte;
- eventos: ALRS 1647, Câmara 2, Senado 188 sem fonte;
- votos: ALRS 4, Câmara 2, Senado 455 sem fonte.

## Estado, bloqueios e publicação
- Nenhuma escrita factual, identidade, FK, voto, claim, source reference, Supabase ou Cloudflare ocorreu.
- Alteração local rastreável: timestamp do manifesto ALRS e este QA.
- Publicação verificada: commit `d0ca238ab3f7b5a665f2c70fcc74dfa1c1ac6272` em `origin/main`; workflow backup `334951434`, run `32480019891`, `completed/success`, `headSha` idêntico.
- Produção `https://rs.votopraquem.org`: root HTTP 200; `/release.json` HTTP 200 com SHA idêntico, `release_id=d0ca238-20260821T120324603Z`, snapshot `row_count=1003`.
- Bloqueios: quatro votos residuais ALRS sem ID/fonte exata; FED-17 com JWT futuro; Senado sem envelope transitório e com deriva criptográfica pré-existente; gaps substantivos de fontes; doctor shell continua FAIL por Node 22.22.2, embora os gates tenham sido executados em Node 24.19.0; Codex MCP `401 invalid_refresh_token` e OpenCode ausente.
- Próximo passo: manter recon bounded e lane local independente; aplicação remota continua proibida até R0, schema/FK, fonte oficial exata, dry-run e idempotência.
