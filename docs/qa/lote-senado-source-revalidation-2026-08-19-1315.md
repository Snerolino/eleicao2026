# QA — revalidação de fontes nominais do Senado (2026-08-19T13:15Z)

## Objetivo
Repetir os seis GETs oficiais do catálogo nominal do Senado em modo read-only, sem gerar manifesto novo e sem aplicar votos enquanto persistir a deriva binária.

## Entregue e verificado
- Lock bounded adquirido com `flock -n` e liberado ao finalizar.
- GETs oficiais sequenciais com retry controlado: 6/6 HTTP 200.
- Prefixo PDF (`%PDF-`): 6/6.
- Coincidência de bytes contra o manifesto versionado: 5/6.
- Coincidência SHA-256 contra o manifesto versionado: 0/6.
- Evidência preservada em `.orchestrator/runtime/senado-scout/revalidation-current.json`.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados.
- Nenhuma escrita factual remota foi executada.

## Estado dos dados
- Senado permanece fail-closed por deriva SHA-256; não foi gerado manifesto novo.
- O catálogo continua sujeito aos gates R0, schema/FK, fonte estável, dry-run e idempotência antes de qualquer aplicação factual.

## Gates e infraestrutura
- `npm run orch:doctor -- --smoke`: `OK=51 WARN=5 FAIL=1`.
- O FAIL é real e restrito ao shell cron usando Node `v22.22.2`; o projeto exige Node 24. OpenCode ausente permanece WARN opcional.
- Este tick não alterou código, snapshot, Supabase, Cloudflare ou Git remoto.

## Bloqueio real
A resposta oficial permanece binariamente instável em relação ao manifesto: 0/6 SHA-256 coincidem, apesar de 6/6 HTTP 200 e prefixo PDF válido. Sem igualdade SHA não é seguro substituir o manifesto nem inserir fontes/votos.

## Publicação/verificação
- Commit documental `d181d2d101ee32b792a62b29e2b5ad8fa5518a96` publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32259303211`: `completed/success`, `headSha` idêntico.
- Produção raiz: HTTP 200.
- Produção `/release.json`: HTTP 200; `sha` confirma `d181d2d101ee32b792a62b29e2b5ad8fa5518a96`, versão `0.2.439`, snapshot `row_count=1003`.

## Próximo passo bounded
No próximo tick, repetir os seis GETs sem gerar manifesto novo nem aplicar votos enquanto persistir a deriva SHA-256. Se os gates locais estiverem disponíveis com Node 24, executar a matriz completa; caso contrário registrar o bloqueio de runtime sem mascará-lo.
