# QA — Reconhecimento oficial bounded Senado/ALRS/Câmara (2026-08-20 16:17 UTC)

## Objetivo

Revalidar as lanes oficiais prioritárias em modo somente leitura, sem promover
votos, identidades, FKs, referências ou alterações remotas.

## Evidência verificada

- **Senado:** 6/6 GETs oficiais HTTP 200, 6/6 prefixos PDF válidos, 3/6
  coincidências de bytes e 0/6 coincidências SHA-256 contra o manifesto
  `data/legislative-import/senado/nominal-source-manifest-2026-08-19.json`.
  A deriva persiste; nenhum manifesto foi alterado e o lote permanece
  fail-closed.
- **ALRS:** portal oficial HTTP 200, 77.442 bytes, SHA-256
  `sha256:6a386d7d8b9ae17f8f5107b0cb6c90d71795a8568f08ed7c5972746a4ac0bab1`,
  zero `data-item`, sem `Enio Carlos Terra` e sem token `Terra`. Os quatro
  residuais continuam sem ID oficial e fonte exata.
- **Câmara:** API oficial na janela `2026-10-01`–`2026-12-31`, HTTP 200, uma
  página válida, zero `vote_id` e nenhum bloqueio. Nenhum evento foi inferido.

## Estado e bloqueios

- `remote_apply=false`: nenhuma escrita Supabase, snapshot, claim, manifesto,
  source reference, voto, identidade, FK, Cloudflare ou matriz ocorreu.
- Senado bloqueado exclusivamente pela deriva persistente de SHA-256.
- ALRS bloqueado pela ausência de entidades/`data-item` e de ID oficial exato
  na rota pública consultada; HTTP 200 não foi tratado como prova de ausência.
- Câmara sem lote elegível na janela futura consultada; resposta vazia não foi
  convertida em dado.

## Artefatos

- `.orchestrator/runtime/continuous-tick-2026-08-20-1616/senado.json`
- `.orchestrator/runtime/continuous-tick-2026-08-20-1616/alrs.json`
- `.orchestrator/runtime/continuous-tick-2026-08-20-1616/camara-q4.json`

## Gates locais e publicação

- `npm run orch:doctor`: exit 1; único FAIL: shell Node 22.22.2 enquanto o
  projeto exige Node 24. WARNs opcionais: OpenCode ausente, Ollama sem preflight,
  gateway Node divergente e Codex MCP não exercitado no modo rápido.
- `npm run test`: exit 0, 82 arquivos/372 testes aprovados.
- `npx tsc --noEmit`: exit 0.
- `node scripts/validate-impact-schema.mjs`: exit 0.
- `npm run data:check`: exit 0, 1003 candidaturas/988 fotos oficiais.
- `npm run build`: exit 0, sitemap com 1003 candidatos + 2 URLs estáticas e
  `release.json` gerado para o HEAD.
- `git diff --check`: exit 0.

## Próximo passo

Repetir a reconciliação bounded sem promover deriva: manter Senado e ALRS
fail-closed e consultar nova janela Câmara elegível quando houver eventos.
Continuar gates locais/documentais independentes.
