# QA — Reconhecimento oficial bounded Senado/ALRS/Câmara (2026-08-20 17:36 UTC)

## Objetivo

Executar o próximo tick das lanes oficiais em modo somente leitura, preservando
os gates fail-closed e sem promover votos, identidades, FKs, referências ou
alterações remotas.

## Evidência verificada

- **Câmara:** API oficial `https://dadosabertos.camara.leg.br/api/v2/votacoes`,
  janela `2026-10-01`–`2026-12-31`, HTTP 200, JSON válido, zero registros em
  `dados` e nenhum bloqueio. Nenhum evento foi inferido.
- **ALRS:** portal oficial
  `https://transparencia.al.rs.gov.br/parlamentares/votos-plenario`, HTTP 200,
  77.442 bytes, SHA-256 registrado no artefato, zero `data-item`, sem `Enio
  Carlos Terra` e sem o token `Terra`. Os quatro residuais continuam sem ID
  oficial exato e fonte auditável.
- **Senado:** 6/6 GETs oficiais HTTP 200, 6/6 prefixos PDF válidos, 3/6
  coincidências de bytes e 0/6 coincidências SHA-256 contra
  `data/legislative-import/senado/nominal-source-manifest-2026-08-19.json`.
  A deriva persiste; nenhum manifesto foi atualizado e o lote permanece
  fail-closed.
- **Dataset vivo:** snapshot público com 1.003 IDs. Os CSVs relevantes
  encontrados foram subconjuntos do snapshot: `bem_candidato_2026_RS.csv`
  49/49, `consulta_cand_2026/consulta_cand_2026_RS.csv` 1.003/1.003,
  `consulta_cand_2026_RS.csv` 213/213, `lista_candidatos_2026.csv` 322/322 e
  `rede_social_candidato_2026_RS.csv` 69/69. Nenhum refresh ou sincronização
  foi aplicado.
- **Auditoria de fontes:** `npm run impact:sources:audit` exit 0. Gaps
  observados: ALRS 4 votos, Câmara 2 votos e Senado 455 votos sem fonte.

## Estado e bloqueios

- `remote_apply=false`: nenhuma escrita Supabase, snapshot, claim, manifesto,
  source reference, voto, identidade, FK, Cloudflare ou matriz ocorreu.
- Senado bloqueado exclusivamente pela deriva persistente de bytes/SHA-256.
- ALRS bloqueado pela ausência de entidades/`data-item` e de ID oficial exato
  na rota pública consultada; HTTP 200 não foi tratado como prova de ausência.
- Câmara sem lote elegível na janela futura consultada; resposta vazia não foi
  convertida em dado.

## Artefatos read-only

- `.orchestrator/runtime/continuous-tick-2026-08-20T1736Z/camara-q4.json`
- `.orchestrator/runtime/continuous-tick-2026-08-20T1736Z/alrs.json`
- `.orchestrator/runtime/continuous-tick-2026-08-20T1736Z/senado.json`
- `.orchestrator/runtime/continuous-tick-2026-08-20T1736Z/dataset-diff.json`

## Gates locais

- Node usado nos gates: `v24.19.0`.
- `npm run test`: exit 0, 82 arquivos/372 testes.
- `npx tsc --noEmit`: exit 0.
- `node scripts/validate-impact-schema.mjs`: exit 0.
- `npm run data:check`: exit 0, 1.003 candidaturas/988 fotos oficiais.
- `npm run build`: exit 0, sitemap com 1.003 candidatos + 2 URLs estáticas;
  `release.json` gerado para o HEAD.
- `git diff --check`: exit 0.
- `npm run smoke:local`: exit 0, 1.002 cards, mínimo 1.002, 0 falhas HTTP,
  0 erros de console online e service worker pronto.

## Próximo passo

Manter Senado e ALRS fail-closed e repetir reconhecimento oficial bounded. Não
aplicar fatos sem R0/schema/FK/fonte/dry-run/idempotência; continuar a lane
local/documental independente.
