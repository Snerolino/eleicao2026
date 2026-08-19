# QA — revalidação de fontes nominais do Senado (2026-08-19 10:22 UTC)

## Objetivo
Revalidar, em modo read-only, os seis PDFs oficiais do catálogo nominal do Senado e confirmar que nenhum voto ou fonte remota seja aplicado enquanto houver deriva binária contra o manifesto versionado.

## Entregue e verificado
- 6/6 GETs oficiais retornaram HTTP 200.
- 6/6 respostas mantiveram o prefixo PDF válido (`%PDF-`).
- 4/6 respostas coincidiram em bytes com o manifesto; 0/6 coincidiram em SHA-256.
- Evidência transitória: `.orchestrator/runtime/senado-scout/revalidation-current.json`.
- `npm run impact:senado:sources:apply` permaneceu dry-run: 6 planejadas, 0 ausentes, 0 inserções e 0 votos tocados.
- Nenhuma escrita em Supabase, votos, identidades, FKs ou source references foi executada.

## Estado dos dados
- `npm run data:check`: 1003 candidaturas públicas e 988 fotos oficiais.
- CSV oficial local versus snapshot: reconciliação anterior registrada no STATE, 1003/1003 IDs.
- Senado permanece fail-closed até fonte estável e gates R0/schema/FK/dry-run/idempotência.

## Gates locais
- `npm run test`: verde, 79 arquivos / 368 testes.
- `npx tsc --noEmit`: verde.
- `node scripts/validate-impact-schema.mjs`: verde.
- `npm run data:check`: verde.
- `npm run build`: verde; sitemap com 1003 candidatos + 2 estáticas e `release.json` gerado.
- `git diff --check`: verde.

## Bloqueios reais
- Deriva binária persistente: 0/6 SHA-256 coincide com o manifesto. Não gerar manifesto novo automaticamente e não aplicar dados factuais.
- `npm run orch:doctor`: FAIL conhecido porque o shell cron usa Node v22.22.2, mas o projeto exige Node 24; os gates foram executados explicitamente com Node v24.19.0. OpenCode também está ausente, sem bloquear a rota local.

## Próximo passo bounded
Repetir GETs oficiais com retry controlado no próximo tick e manter o item Senado fail-closed; continuar lanes locais/publicação documental independentes sem inventar hash, URL, identidade ou voto.
