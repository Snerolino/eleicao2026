# QA — revalidação de fontes nominais do Senado (2026-08-19T14:14Z)

## Objetivo
Repetir os seis GETs oficiais do catálogo nominal do Senado em modo read-only,
sem gerar manifesto novo e sem aplicar votos enquanto persistir a deriva binária.

## Entregue e verificado
- Lock bounded adquirido com `flock -n` e liberado ao finalizar.
- Seis GETs oficiais sequenciais com retry controlado: **6/6 HTTP 200**.
- Prefixo PDF (`%PDF-`): **6/6**.
- Coincidência de bytes contra o manifesto versionado: **2/6**.
- Coincidência SHA-256 contra o manifesto versionado: **0/6**.
- Evidência transitória atualizada em `.orchestrator/runtime/senado-scout/revalidation-current.json`.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: **6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados**.
- Nenhuma escrita factual remota foi executada.

## Estado dos dados
- Snapshot público: `npm run data:check` verde, **1003 candidaturas e 988 fotos oficiais**.
- Reconciliação anterior do catálogo de candidaturas permanece 1003/1003 IDs; este tick não alterou snapshot.
- Senado permanece fail-closed por deriva SHA-256; manifesto não foi substituído.

## Gates locais (Node 24.19.0)
- `npm run test`: **81 arquivos, 371 testes, 0 falhas**.
- `npx tsc --noEmit`: **0**.
- `node scripts/validate-impact-schema.mjs`: **0**.
- `npm run data:check`: **0**.
- `npm run build`: **0**, sitemap com 1003 candidatos + 2 estáticas e `release.json` gerado.
- `npm run smoke:local`: **0**; 1002 cards visíveis, `httpFailures=0`, `onlineConsoleErrors=0`, service worker pronto.
- `git diff --check`: **0**.
- `npm run orch:doctor`: **FAIL=1** no shell cron por Node v22.22.2 (projeto exige Node 24); OpenCode ausente e Ollama sem resposta permanecem WARN opcionais. Os gates deste tick foram executados explicitamente com Node v24.19.0.

## Bloqueio real
As respostas oficiais continuam instáveis em relação ao manifesto: 0/6 SHA-256
coincidem, apesar de 6/6 HTTP 200 e prefixo PDF válido. Sem igualdade SHA não é
seguro substituir o manifesto, cadastrar novas `source_references` ou inserir
votos. Não inventar hash, URL, identidade ou voto.

## Publicação/verificação
- Este tick produziu apenas documentação QA; não havia mudança funcional para publicar antes do registro.
- Nenhuma migration, escrita Supabase, alteração de RLS/RPC/Auth/Storage, deploy direto Cloudflare ou alteração de dados factuais foi executada.

## Próximo chunk bounded
Repetir os seis GETs oficiais no próximo tick, preservando o fail-closed. Não gerar
manifesto novo nem aplicar votos enquanto persistir a deriva SHA-256. Manter os
gates locais em Node 24; corrigir o shell cron para Node 24 apenas em chunk separado,
sem mascarar o FAIL do doctor.
