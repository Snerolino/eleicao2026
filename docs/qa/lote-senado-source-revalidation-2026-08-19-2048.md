# QA — revalidação de fontes nominais do Senado (2026-08-19 20:48 UTC)

## Objetivo
Revalidar, em modo somente leitura, as seis fontes oficiais do Senado e confirmar que o catálogo permanece fail-closed antes de qualquer aplicação factual.

## Entrega verificada
- Reconhecimento oficial: `6/6` respostas HTTP 200.
- Prefixo PDF válido: `6/6`.
- Coincidência de bytes com o manifesto versionado: `5/6`.
- Coincidência SHA-256 com o manifesto versionado: `0/6`.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: `planned=6`, `already_existing=0`, `missing=0`, `inserted=0`, `votes_touched=0`.
- Nenhuma escrita factual remota foi executada.

## Gates locais
Executados com Node `v24.19.0`:
- `npm run test`: 81 arquivos, 371 testes aprovados.
- `npx tsc --noEmit`: aprovado.
- `node scripts/validate-impact-schema.mjs`: aprovado.
- `npm run data:check`: 1003 candidaturas, 988 fotos oficiais.
- `npm run build`: aprovado; release local `0.2.461`, SHA `aec4e6ca533d90d797824d6ec8ef2973d5c53555`.
- `git diff --check`: aprovado; nenhuma alteração rastreada pendente após o build.

## Estado dos dados e bloqueios
- Snapshot público segue válido: 1003 candidaturas e 988 fotos.
- O Senado permanece bloqueado somente no item afetado: os seis GETs oficiais estão acessíveis e com prefixo PDF válido, mas nenhuma fonte coincide por SHA-256 com o manifesto versionado. Não gerar manifesto novo automaticamente e não aplicar votos sob deriva binária.
- A diferença de bytes melhorou para `5/6`, mas não altera o gate: SHA-256 continua `0/6`.
- O doctor do cron permanece com FAIL estrutural no shell Node 22.22.2; este tick executou os gates com Node 24.19.0. OpenCode ausente e Ollama sem resposta são WARN opcionais.

## Próximo passo
No próximo tick, repetir os seis GETs oficiais sem gerar manifesto novo; manter o writer factual parado até resolução explícita da deriva SHA-256 e continuar a verificação/publicação documental independente.
