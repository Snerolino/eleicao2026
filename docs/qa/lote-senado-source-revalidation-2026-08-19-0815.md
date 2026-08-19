# QA — revalidação das fontes nominais do Senado (2026-08-19 08:15 UTC)

## Objetivo
Reexecutar o reconhecimento read-only dos seis endpoints oficiais de relatórios nominais do Senado, comparar bytes/SHA-256 contra o manifesto versionado e confirmar que o writer permanece fail-closed.

## Entregue e verificado
- 6/6 GETs oficiais retornaram HTTP 200.
- 6/6 respostas mantiveram prefixo PDF `255044462d312e35`.
- 2/6 respostas coincidiram em bytes com o manifesto; 0/6 coincidiram em SHA-256.
- Relatório transitório preservado em `.orchestrator/runtime/senado-scout/revalidation-current.json` (não versionado).
- `npm run impact:senado:sources:apply -- --dry-run` passou: 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados.
- Reconciliação explícita do CSV oficial local `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv`: 1003/1003 IDs contra o snapshot público; 0 somente no dataset e 0 somente no snapshot.

## Estado dos dados
Nenhum candidato, identidade, FK, proposição, voto, `source_reference`, matriz, claim, RPC ou serviço remoto foi alterado. O snapshot público continua sem divergências de ID nesta checagem.

## Bloqueio real
O catálogo PDF oficial é volátil: as respostas atuais mantêm HTTP 200 e assinatura PDF, mas divergem do manifesto versionado em SHA-256 em 6/6 entradas. Não é seguro gerar manifesto novo ou aplicar votos com essa deriva sem preservar e revisar o conteúdo observado.

## Próximo passo
Manter o Senado fail-closed; revisar a deriva binária e repetir a revalidação em um tick futuro. Só avançar para parser/writer factual após fonte estável, R0/schema/FK, dry-run e prova de idempotência.
