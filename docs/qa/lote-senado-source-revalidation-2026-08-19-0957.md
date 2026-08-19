# QA — revalidação de fontes nominais do Senado (2026-08-19 09:57 UTC)

## Objetivo
Revalidar, em modo somente leitura, as seis URLs oficiais do catálogo nominal do Senado e confirmar que o dry-run permanece fail-closed enquanto os PDFs mudam entre consultas.

## Entregue e verificado
- 6/6 GETs oficiais concluídos com HTTP 200.
- 6/6 payloads preservaram o prefixo PDF `255044462d312e35`.
- 3/6 respostas coincidiram em bytes com o manifesto versionado.
- 0/6 respostas coincidiram em SHA-256 com o manifesto versionado.
- Evidência atual preservada em `.orchestrator/runtime/senado-scout/revalidation-current.json`.
- `npm run impact:senado:sources:apply`: dry-run, 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados.
- Reconciliação read-only do CSV oficial local `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv`: 1003 linhas/IDs contra 1003 no snapshot, 0 somente no dataset e 0 somente no snapshot.

## Estado dos dados
O catálogo Senado continua transitório/volátil. Nenhum voto, identidade, FK, proposição, evento, source reference, claim, matriz ou candidato foi alterado. A aplicação factual permanece bloqueada por deriva binária do catálogo e pela necessidade de manter R0/schema/FK/idempotência comprovados imediatamente antes de qualquer escrita.

## Bloqueios reais
- Deriva de conteúdo: 0/6 SHA-256 atuais coincide com o manifesto versionado, apesar de todos os endpoints responderem 200.
- `npm run orch:doctor` no shell do cron reporta `FAIL` porque o shell usa Node v22.22.2, enquanto o projeto exige Node >=24 <25. Os gates do projeto não devem ser declarados verdes nesse shell sem trocar para Node 24.
- OpenCode está ausente e Ollama não respondeu ao preflight; não bloquearam este chunk read-only, pois a reconciliação oficial foi executada localmente.

## Próximo passo
Repetir GETs oficiais com retry controlado e preservar bytes/hash. Não gerar novo manifesto nem executar `--apply` enquanto a estabilidade do catálogo e os gates de identidade/schema/FK/idempotência não forem comprovados.
