# QA — Reconhecimento oficial bounded Senado/ALRS/Câmara (2026-08-20 18:59 UTC)

## Objetivo

Executar o tick oficial em modo somente leitura, revalidar as fontes vivas e
manter o fluxo fail-closed sem promover votos, identidades, FKs ou referências.

## Evidência verificada

- **Senado:** 6/6 GETs oficiais HTTP 200 e 6/6 prefixos PDF válidos. 3/6
  coincidiram em bytes e 0/6 em SHA-256 contra o manifesto de 2026-08-19. A
  deriva persiste; nenhum manifesto foi alterado.
- **ALRS:** rota oficial `https://transparencia.al.rs.gov.br/parlamentares/votos-plenario`
  respondeu HTTP 200, 77.442 bytes, 0 ocorrências de `data-item`, sem `Enio
  Carlos Terra` e sem token `Terra`. Os quatro residuais continuam sem ID
  oficial exato e fonte auditável; HTTP 200 não foi tratado como ausência.
- **Câmara:** API oficial na janela `2026-10-01`–`2026-12-31` respondeu HTTP 200,
  JSON válido e 0 `vote_id`; nenhum evento foi inferido.
- **Dataset vivo:** snapshot tem 1.003 IDs. Sete CSVs TSE com `SQ_CANDIDATO`
  foram comparados: 49, 1.003, 213, 69, 322, 0 e 69 IDs; 0 ausentes no
  snapshot. Nenhum refresh/sincronização foi aplicado.
- **Auditoria de fontes:** `npm run impact:sources:audit` exit 0. Gaps atuais:
  ALRS 4 votos, Câmara 2 votos e Senado 455 votos sem fonte.

## Estado e bloqueios

- `remote_apply=false`: nenhuma escrita Supabase, snapshot, claim, manifesto,
  source reference, voto, identidade, FK, Cloudflare ou matriz ocorreu.
- Senado bloqueado exclusivamente pela deriva persistente de bytes/SHA-256.
- ALRS bloqueado pela ausência de entidades/`data-item` e de ID oficial exato.
- Câmara sem lote elegível na janela futura consultada.
- Doctor do cron continua com FAIL de infraestrutura porque o shell usa Node
  22.22.2 enquanto o projeto exige Node 24; recon executada com Node 24.19.0.
  OpenCode ausente e Ollama sem preflight são WARNs opcionais.

## Artefatos read-only

- `.orchestrator/runtime/continuous-tick-20260820T1836Z/senado.json`
- `.orchestrator/runtime/continuous-tick-20260820T1836Z/alrs.html`
- `.orchestrator/runtime/continuous-tick-20260820T1836Z/alrs.sha256`
- `.orchestrator/runtime/continuous-tick-20260820T1836Z/camara-q4.json`
- `.orchestrator/runtime/continuous-tick-20260820T1836Z/dataset-diff.json`

## Gates locais e publicação

- Node dos gates: `v24.19.0`.
- `npm run test`: exit 0, 82 arquivos/372 testes.
- `npx tsc --noEmit`: exit 0.
- `node scripts/validate-impact-schema.mjs`: exit 0.
- `npm run data:check`: exit 0, 1.003 candidaturas/988 fotos oficiais.
- `npm run build`: exit 0, sitemap com 1.003 candidatos + 2 URLs estáticas;
  `release.json` gerado para `5a560732a6adafa0c8c85ca0d8387ae540bfebd9`.
- `git diff --check`: exit 0.
- `npm run smoke:local`: exit 0, 1.002 cards, mínimo 1.002, 0 falhas HTTP,
  0 erros de console online e service worker pronto.
- `npm run impact:sources:audit`: exit 0.

## Próximo passo

Repetir a reconciliação bounded sem promover deriva; manter ALRS/Senado
fail-closed e consultar a próxima janela oficial da Câmara. Não aplicar fatos
sem R0/schema/FK/fonte, dry-run e prova de idempotência.
