# QA — FED-18: scout read-only da próxima batch Câmara

**Data:** 2026-08-18
**Modo:** scout CLI read-only; sem escrita

## Resultado

O pool gratuito `opencode/deepseek-v4-flash-free` inspecionou o snapshot público e
identificou o pipeline existente:

- `scripts/collect-camara-votes.mjs`
- `scripts/build-camara-candidate-catalog.mjs`
- `scripts/apply-camara-fed7-factual.mjs`
- `scripts/import-legislative-dry-run.mjs`

A próxima menor batch segura continua sendo limitada aos candidatos com
`candidateByIdentifier` remoto confirmado e a eventos nominais individualizados.

## Consulta oficial executada

Foram testadas, para os quatro IDs Câmara já resolvidos, consultas read-only:

```text
/api/v2/deputados/{id}/votacoes?dataInicio=2025-01-01&dataFim=2026-12-31
```

A API retornou HTTP **405** para os quatro deputados. Uma tentativa posterior do
endpoint geral `/api/v2/votacoes` sofreu timeout de conexão. Nenhum voto ou
manifesto foi criado a partir dessas respostas.

## Critérios preservados

- `identity_pending` permanece fora de qualquer envelope seguro;
- `remote-catalog-extended.json` não é fonte de UUID remoto verificado;
- votação simbólica não gera voto individual;
- cada envelope deve manter URL/hash e passar `impact:dryrun`;
- nenhuma matriz, RPC ou escrita Supabase nesta etapa.

## Próximo fallback contínuo

Pesquisar a documentação/rota oficial alternativa de descoberta de votações ou
usar somente `vote-id` oficial já conhecido. Não repetir o endpoint 405 nem
transformar timeout em ausência de dados.
