# QA — Senado nominal: fontes aplicadas e parser preparado

**Data:** 2026-08-19
**Modo:** fontes aplicadas; votos ainda dry-run/sem aplicação

## Resultado

- 6 URLs oficiais Senado revalidadas com HTTP 200 e SHA-256.
- 6 `source_references` inseridas idempotentemente.
- Segunda execução: 0 inserções.
- Parser oficial dos relatórios PDF preparado em `/tmp`:
  - 48 proposições
  - 68 eventos
  - 184 votos
  - 3 legisladores

## Identidade

- Legisladores remotos resolvidos: 6341, 1186 e 825.
- Candidatos TSE correspondentes: 0 resolvidos exatamente.
- A aplicação deverá usar `legislator_id`, não inventar `candidate_id`.

## Gate

Nenhum voto Senado foi aplicado neste chunk. O próximo writer deve adaptar as
URLs exatas das fontes ao envelope e executar dry-run bounded antes de qualquer
aplicação idempotente. Matriz, claim e RPC permanecem intocados.
