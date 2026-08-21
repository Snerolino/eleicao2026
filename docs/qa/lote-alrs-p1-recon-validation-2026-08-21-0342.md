# QA — reconciliação P1 ALRS e gate de fonte substantiva

**Data:** 2026-08-21 03:42 UTC
**Lane:** official_reconnaissance + local_implementation

## Objetivo

Refazer bounded GET das fontes oficiais ALRS para o pacote P1, reconciliar a
identidade oficial das proposições e manter o fluxo fail-closed quando faltar
fonte substantiva para qualquer avaliação de impacto.

## Entregue e verificado

- `npm run impact:alrs:r4:p1:evidence`: **7/7 HTTP 200**, **526 `data-item`**;
  manifesto/evidência preservados em `p1-official-event-evidence.json`.
- `npm run impact:alrs:r4:p1:match`: **20 itens**, **19 matched**, **1 múltiplo**,
  **0 sem correspondência**.
- `npm run impact:alrs:r4:p1:classify`: **18 mérito confirmado**, **1 procedural/
  amendment**, **1 bloqueado por múltiplos candidatos**.
- `npm run impact:alrs:r4:confirmed-merit`: pacote com **23 versões/139 votos**,
  **5 P0/18 P1**; todos permanecem `pending_review`, `human_review_required=true`
  e `remote_apply=false`.
- O novo validador local `scripts/validate-alrs-substantive-sources.mjs` foi
  exercitado e falhou fechado como esperado: **25 itens**, **0 fontes substantivas**;
  nenhum dado foi promovido.

## Gates locais

- `npm run test`: **96 arquivos / 397 testes — verde**.
- `npx tsc --noEmit`: **verde**.
- `node scripts/validate-impact-schema.mjs`: **verde**.
- `npm run data:check`: **verde — 1003 candidaturas / 988 fotos oficiais**.
- `npm run build`: **verde**; sitemap 1003 candidatos + estáticas, `release.json` gerado.
- `npm run smoke:local`: **verde — 1002 cards, 0 falhas HTTP, 0 erros de console online**;
  service worker pronto.
- `git diff --check`: **verde**.

## Estado dos dados e bloqueios

Nenhuma escrita em snapshot público, identidade, FK, voto, matriz, claim,
`source_references`, Supabase ou Cloudflare ocorreu. O pacote factual continua
bloqueado para aplicação remota porque as fontes ALRS de plenário não substituem
fonte substantiva da matéria/avaliação: o validador encontrou 25/25 itens sem
`official_sources` fora de `/votos-plenario/`. O item com múltiplos candidatos
oficiais também exige revisão humana. Os quatro residuais Enio Carlos Terra
continuam sem ID oficial e fonte exata; Senado segue bloqueado por deriva de
SHA; Câmara não apresentou lote oficial novo.

## Próximo passo

Manter a recon bounded fail-closed dos residuais e das fontes federais, enquanto a
lane local prepara recuperação de fonte substantiva oficial. Não aplicar nada
remotamente sem R0/schema/FK/fonte exata/dry-run/idempotência.
