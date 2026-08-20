# QA — Reconhecimento oficial bounded Senado/ALRS/Câmara (2026-08-20 19:38 UTC)

## Objetivo

Executar novo tick somente leitura, revalidar fontes oficiais vivas, comparar o
`dataset2026` e fechar gates locais sem promover fatos sem fonte, identidade,
FK, dry-run e idempotência.

## Evidência verificada

- **Senado:** 6/6 GETs oficiais HTTP 200, 6/6 prefixos PDF válidos, 2/6
  coincidências de bytes e 0/6 coincidências SHA-256 contra o manifesto de
  2026-08-19. A deriva permanece; manifesto não foi alterado.
- **ALRS:** rota oficial `https://transparencia.al.rs.gov.br/parlamentares/votos-plenario`
  HTTP 200, 77.442 bytes, SHA-256
  `sha256:6a386d7d8b9ae17f8f5107b0cb6c90d71795a8568f08ed7c5972746a4ac0bab1`,
  0 `data-item`, sem `Enio Carlos Terra` e sem `Terra`. Os quatro residuais
  seguem sem ID oficial exato e fonte auditável.
- **Câmara:** API oficial na janela `2026-10-01`–`2026-12-31` HTTP 200, JSON
  válido, 0 votações; nenhum evento foi inferido.
- **Dataset vivo:** snapshot com 1.003 IDs; 7 CSVs de candidatos com
  `SQ_CANDIDATO` comparados, 0 IDs ausentes. Nenhum refresh/sincronização foi
  aplicado.
- **Auditoria de fontes:** `npm run impact:sources:audit` permanece com gaps
  conhecidos: ALRS 4, Câmara 2 e Senado 455 votos sem fonte.

## Estado e bloqueios

- `remote_apply=false`: nenhuma escrita Supabase, snapshot, claim, manifesto,
  source reference, voto, identidade, FK, Cloudflare ou matriz ocorreu.
- Senado bloqueado exclusivamente por deriva de bytes/SHA-256.
- ALRS bloqueado pela ausência de entidades/`data-item` e de ID oficial exato.
- Câmara sem lote elegível na janela futura consultada.
- `npm run orch:doctor` exit 1 apenas porque o shell cron usa Node 22.22.2;
  gates foram executados com Node 24.19.0. OpenCode ausente e Ollama sem
  preflight permanecem warnings opcionais.

## Artefatos read-only

- `.orchestrator/runtime/continuous-tick-20260820T1938Z/senado.json`
- `.orchestrator/runtime/continuous-tick-20260820T1938Z/alrs.html`
- `.orchestrator/runtime/continuous-tick-20260820T1938Z/alrs.json`
- `.orchestrator/runtime/continuous-tick-20260820T1938Z/camara-q4.json`
- `.orchestrator/runtime/continuous-tick-20260820T1938Z/dataset-diff.json`

## Gates locais

- Node: `v24.19.0`.
- `npm run test`: exit 0, 82 arquivos/372 testes.
- `npx tsc --noEmit`: exit 0.
- `node scripts/validate-impact-schema.mjs`: exit 0.
- `npm run data:check`: exit 0, 1.003 candidaturas/988 fotos oficiais.
- `npm run build`: exit 0, sitemap com 1.003 candidatos + 2 URLs estáticas;
  `release.json` gerado para `a71307fa7bf7a9b122cb25eaffab517b155d861a`.
- `git diff --check`: exit 0.
- `npm run smoke:local`: exit 0, 1.002 cards, mínimo 1.002, 0 falhas HTTP,
  0 erros de console online e service worker pronto.
- `npm run smoke:preview -- --url https://rs.votopraquem.org/`: exit 0, 1.002
  cards, mínimo 1.002, 0 falhas HTTP, 0 erros de console online e service
  worker pronto.

## Publicação e produção

- Commits documentais `a2f9dcd69f5470927c87ccebe079478d621be86a`,
  `7546d7d9fc08e6a98021270f039c0f16f7b1221f` e
  `c62045b61b9a5355f4eae414f87971c8ca9828b4` publicados em `origin/main`.
- O backup `334951434`, run `32410387125`, concluiu `completed/success` com
  `headSha=c62045b61b9a5355f4eae414f87971c8ca9828b4`; `/release.json?cb=c62045b`
  confirmou o mesmo SHA, snapshot `row_count=1003`.
- Smoke remoto final exit 0, 1.002 cards, 0 falhas HTTP e 0 erros de console
  online.

## Próximo passo

Publicar este checkpoint documental pelos gates autorizados, verificar o
workflow backup e produção, e repetir a reconciliação bounded. Manter
ALRS/Senado fail-closed e não aplicar fatos sem R0/schema/FK/fonte, dry-run e
prova de idempotência.
