# QA — Reconhecimento oficial bounded Senado/ALRS/Câmara (2026-08-20 21:35 UTC)

## Objetivo
Repetir o tick de reconhecimento somente leitura das fontes oficiais vivas,
comparar o `dataset2026`, executar os gates locais e manter qualquer item sem
evidência em fail-closed.

## Evidência verificada
- **Senado:** 6/6 GETs oficiais HTTP 200, 6/6 prefixos PDF válidos, 3/6 coincidências de bytes e 0/6 coincidências SHA-256 contra o manifesto de 2026-08-19. A deriva permanece; o manifesto não foi alterado.
- **ALRS:** rota oficial `https://transparencia.al.rs.gov.br/parlamentares/votos-plenario` HTTP 200, 77.442 bytes, SHA-256 `sha256:6a386d7d8b9ae17f8f5107b0cb6c90d71795a8568f08ed7c5972746a4ac0bab1`, 0 atributos `data-item`, sem `Enio Carlos Terra` e sem `Terra`. Os quatro residuais continuam sem ID oficial exato e fonte auditável.
- **Câmara:** API oficial na janela `2026-10-01`–`2026-12-31` HTTP 200, 148 bytes, JSON válido, 0 votações; nenhum evento foi inferido.
- **Dataset vivo:** snapshot com 1.003 IDs; 7 arquivos CSV TSE comparados, 0 IDs ausentes. Nenhum refresh ou sincronização foi aplicado.
- **Auditoria de fontes:** modo read-only exit 0; gaps reais: votos ALRS 4, Câmara 2 e Senado 455 sem fonte, além de versões/eventos sem fonte. O modo `--strict` retornou exit 2 por esses gaps.

## Gates locais
Executados com Node 24.19.0:
- `npm run test`: exit 0.
- `npx tsc --noEmit`: exit 0.
- `node scripts/validate-impact-schema.mjs`: exit 0.
- `npm run data:check`: exit 0, 1.003 candidaturas/988 fotos oficiais.
- `npm run build`: exit 0; sitemap com 1.003 candidatos + 2 estáticas; `release.json` local gerado.
- `git diff --check`: exit 0.
- `npm run smoke:local`: exit 0; 1.002 cards, mínimo 1.002, 0 falhas HTTP, 0 erros de console online e service worker pronto.

## Estado, bloqueios e segurança
- `remote_apply=false`: nenhuma escrita Supabase, snapshot, claim, manifesto, source reference, voto, identidade, FK, Cloudflare ou matriz ocorreu.
- Senado bloqueado exclusivamente pela deriva de bytes/SHA-256.
- ALRS bloqueado pela ausência de entidades/`data-item` e de ID oficial exato para os quatro residuais.
- Câmara sem lote elegível na janela consultada.
- Não foram lidos nem expostos segredos.

## Artefatos read-only
- `.orchestrator/runtime/continuous-tick-20260820T213537Z/senado.json`
- `.orchestrator/runtime/continuous-tick-20260820T213537Z/alrs.html`
- `.orchestrator/runtime/continuous-tick-20260820T213537Z/alrs.json`
- `.orchestrator/runtime/continuous-tick-20260820T213537Z/camara-q4.json`
- `.orchestrator/runtime/continuous-tick-20260820T213537Z/dataset-diff.json`

## Próximo passo
Repetir a reconciliação bounded no próximo tick. Manter ALRS/Senado fail-closed
e não aplicar fatos sem R0/schema/FK/fonte, dry-run e prova de idempotência.
