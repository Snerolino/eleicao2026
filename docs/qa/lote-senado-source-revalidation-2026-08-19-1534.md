# QA — revalidação de fontes nominais do Senado (2026-08-19T15:34Z)

## Objetivo
Repetir os seis GETs oficiais do catálogo nominal do Senado em modo read-only,
preservando o fail-closed, sem gerar manifesto novo e sem aplicar votos enquanto
persistir a deriva binária.

## Entregue e verificado
- Lock bounded adquirido com `flock -n` e liberado ao finalizar.
- Seis GETs oficiais sequenciais: **6/6 HTTP 200**.
- Prefixo PDF (`%PDF-`): **6/6**.
- Coincidência de bytes contra o manifesto versionado: **4/6**.
- Coincidência SHA-256 contra o manifesto versionado: **0/6**.
- Evidência transitória atualizada em `.orchestrator/runtime/senado-scout/revalidation-current.json`.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: **6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados**.
- Nenhuma escrita factual remota foi executada.

## Estado dos dados
- Snapshot público: `npm run data:check` verde, **1003 candidaturas e 988 fotos oficiais**.
- Este tick não alterou snapshot ou manifesto versionado; Supabase não foi alterado.
- Senado permanece fail-closed por deriva SHA-256.

## Gates locais (Node 24.19.0)
- `npm run test`: **81 arquivos, 371 testes, 0 falhas**.
- `npx tsc --noEmit`: **0**.
- `node scripts/validate-impact-schema.mjs`: **0**.
- `npm run data:check`: **0**.
- `npm run build`: **0**, sitemap com 1003 candidatos + 2 estáticas e `release.json` gerado.
- `git diff --check`: **0**.
- Doctor do shell cron: **FAIL=1** por Node v22.22.2 (projeto exige Node 24); OpenCode ausente e Ollama sem resposta permanecem WARN opcionais.

## Bloqueio real
As respostas oficiais continuam divergentes do manifesto em SHA: **0/6**
coincidem, apesar de 6/6 HTTP 200 e prefixo PDF válido. Sem igualdade SHA não
é seguro substituir o manifesto, cadastrar `source_references` ou inserir
votos. Não inventar hash, URL, identidade ou voto.

## Publicação/verificação
- Este tick preparou documentação local; commit/push e verificação de produção
  serão executados após o gate documental.
- Nenhuma migration, escrita Supabase, alteração de RLS/RPC/Auth/Storage,
  deploy direto Cloudflare ou alteração factual foi executada.

## Próximo chunk bounded
Repetir os seis GETs oficiais no próximo tick, sem gerar manifesto novo nem
aplicar votos enquanto persistir a deriva SHA-256. Manter gates locais em Node
24 e tratar a correção do shell cron como chunk separado.
