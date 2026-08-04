# Contexto exportavel do portal

Esta pasta e a unica superficie do portal exposta ao projeto do raspador por MCP.
O conteudo e curado e nao substitui a leitura das migrations pelo mantenedor do
portal.

## Conteudo

- `SCHEMA.md`: fotografia das tabelas, constraints, FKs, RLS e convencoes que
  afetam o coletor.
- `agente-dossies-eleitorais-rs2026-v2.md`: contrato do job de sintese.
- `instrucao-build-coletor-historico-candidatos-rs2026.md`: requisitos e fases do
  coletor.
- `CHANGELOG.md`: mudancas relevantes nesta exportacao.

## Regras

- Nao colocar `.env`, chaves, tokens, connection strings, dados brutos ou PII.
- Atualizar `SCHEMA.md` e `CHANGELOG.md` quando uma migration alterar o contrato.
- O consumidor deve tratar os documentos de requisitos como intencao e
  `SCHEMA.md` como estado implementado na data indicada.
