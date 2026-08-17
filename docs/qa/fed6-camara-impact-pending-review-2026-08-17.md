# QA — FED-6: pacote de impacto `pending_review`

**Data:** 2026-08-17
**Status:** pacote preparado e versionado; não aprovado nem publicado

## O que foi preparado

Foi criado um pacote de revisão para o evento nominal do PLP 230/2025:

- matriz: `plp-230-2025-sbt-1-pending-review.json`
- manifesto: `camara-plp-230-2025-review-packet.json`
- status: `pending_review`
- candidatos ligados factual e separadamente: **4**
- votos factuais ligados: **4**

A avaliação é deliberadamente conservadora:

- grupo: `pessoas_com_deficiencia`
- direção: `unclear`
- `defending_vote`: `null`
- confiança: `0.55`
- revisão registrada: nenhuma — aguardando curadoria humana

O assessment usa apenas URLs oficiais da Câmara.

## Salvaguardas

- matriz não aprovada;
- matriz não carregada automaticamente pela UI pública;
- `public_approval=false`;
- `remote_apply=false`;
- nenhum RPC de aprovação executado;
- nenhum candidato recebeu score de impacto;
- os 4 votos continuam fatos nominais, não alinhamentos;
- Marcel continua apenas fixture `identity_pending`;
- nenhuma publicação automática a partir do lote factual.

A matriz aprovada existente do mesmo PLP não foi duplicada nem alterada. Este
artefato é um pacote de revisão separado para o fluxo federal.

## Validação

- `validateImpactContract`: passou.
- `defending_vote=null` para `unclear`: passou.
- sources oficiais: passou.
- testes FED-6: **3** passando.
- testes de contrato de impacto: **14** passando.

## Próximo gate

Revisão humana da matriz: confirmar texto efetivamente votado, grupo afetado,
direção, justificativa, fontes e `defending_vote`. Somente depois de aprovação
editorial separada a matriz pode ser considerada para publicação.
