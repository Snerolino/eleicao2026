# QA — revalidação de fontes nominais do Senado (2026-08-19 11:48 UTC)

## Objetivo
Revalidar, em modo read-only e com retry controlado, os seis PDFs oficiais do catálogo nominal do Senado; manter o item fail-closed enquanto houver deriva binária contra o manifesto versionado.

## Entregue e verificado
- 6/6 GETs oficiais retornaram HTTP 200.
- 6/6 respostas mantiveram o prefixo PDF válido (`%PDF-`).
- 4/6 respostas coincidiram em bytes com o manifesto; 0/6 coincidiu em SHA-256.
- Evidência transitória preservada em `.orchestrator/runtime/senado-scout/revalidation-current.json`.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: 6 planejadas, 0 ausentes, 0 inserções e 0 votos tocados.
- Nenhuma escrita em Supabase, votos, identidades, FKs ou `source_references` foi executada.

## Estado dos dados
- `npm run data:check`: 1003 candidaturas públicas e 988 fotos oficiais.
- O snapshot permanece sem deriva de candidatos conhecida no checkpoint vigente.
- Senado permanece fail-closed até fonte estável e gates R0/schema/FK/dry-run/idempotência.

## Gates locais
- Doctor executado: `OK=48 WARN=5 FAIL=1`; o FAIL é o shell cron em Node v22.22.2, enquanto o projeto exige Node 24. OpenCode ausente; rota local permanece disponível.
- O tick selecionou Node 24.19.0 instalado para os gates completos seguintes.

## Bloqueios reais
- Deriva binária persistente: 0/6 SHA-256 coincide com o manifesto. Não gerar manifesto novo automaticamente e não aplicar dados factuais.

## Próximo passo bounded
Executar os gates completos com Node 24.19.0; se verdes, publicar somente esta documentação e verificar backup Cloudflare/produção. No próximo tick, repetir os seis GETs sem gerar manifesto novo nem aplicar votos enquanto persistir a deriva.
