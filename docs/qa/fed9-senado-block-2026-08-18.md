# QA — FED-9: bloqueio Senado

**Data:** 2026-08-18
**Status:** Senado bloqueado (403/401); Câmara concluída

## Resultado da coleta da PLP 230/2025 Câmara

- votações listadas para a proposição: `2580259-27`, `2580259-24`
- `2580259-27` (Redação Final): votação simbólica, **0 votos nominais** — não gera envelope
- `2580259-24` (Substitutivo): única votação nominal oficial
- votação `2580259-13` e `2580259-15`: **404** — não existem

## Verificação remota pós-FED-8

- evento `2580259-24`: **5 votos totais**
  - 4 do lote FED-7B
  - 1 pré-existente (Marcel van Hattem, fixture)
- candidatos distintos: **5**
- `impact_rows_created`: **0**
- RPC aprovação: **não chamado**

## Bloqueio Senado

Endpoints testados — todos 403 (401 na API de dados abertos):

- `https://www12.senado.leg.br/legislacao/servicos/dados-legislacao/v1/servicos/materias/porId`
- `https://www12.senado.leg.br/legislacao/servicos/dados-legislacao/v1/servicos/papeis/legislacao`
- `https://www12.senado.leg.br/legislacao/servicos/dados-legislacao/v1/servicos/materias/`
- `https://dadosabertos.senado.leg.br/votacoes/votacoes-lista.json`

O `dados-abertos` exige credencial (401 Unauthorized). O `dados-legislacao`
retorna 403 "Request forbidden by administrative rules", independentemente de
User-Agent / Referer / Accept.

## Próxima casa útil

- **ALRS** (`transparencia.al.rs.gov.br/parlamentares/votos-plenario`): HTML
  server-side com `data-item`, já mapeado e validado em fases anteriores;
  cobertura nominal existente no remoto.
- **Senado parlam-serviciosweb**: fonte de votos em PDF — requer conversão
  `pdftotext` e parser regex; deixado como follow-up após ALRS.

## Conclusão do arco federal Câmara

O arco federal de Câmara está completo:

- FED-0 a FED-9 (Câmara) concluídas
- 5 votos factuais no evento `2580259-24` (4 novos + Marcel)
- 0 duplicações, 0 matrizes de impacto publicadas
- próximo foco: ALRS nominais via transparência oficial
