# QA — revalidação de fontes nominais do Senado (2026-08-19T16:12Z)

## Objetivo
Reexecutar, em tick bounded e read-only, os seis GETs oficiais do catálogo nominal do Senado, preservando o fail-closed enquanto houver deriva binária.

## Entregue e verificado
- Lock `.orchestrator/runtime/locks/continuous-progress.lock` adquirido com `flock -n` e liberado ao finalizar.
- Reconhecimento oficial sequencial: **6/6 HTTP 200** e **6/6 prefixos `%PDF-` válidos**.
- Comparação contra o manifesto versionado: **3/6 coincidências de bytes** e **0/6 coincidências SHA-256**.
- Evidência transitória atualizada em `.orchestrator/runtime/senado-scout/revalidation-current.json`.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: **6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados**.
- Nenhuma escrita factual remota foi executada.

## Estado dos dados
- `npm run data:check`: **1003 candidaturas e 988 fotos oficiais**.
- O tick não alterou snapshot nem manifesto versionado; Supabase não foi alterado.
- Senado permanece fail-closed por deriva SHA-256.

## Gates locais (Node 24.19.0)
- `npm run test`: **81 arquivos, 371 testes, 0 falhas**.
- `npx tsc --noEmit`: **0**.
- `node scripts/validate-impact-schema.mjs`: **0**.
- `npm run data:check`: **0**.
- `npm run build`: **0**; sitemap com 1003 candidatos + 2 estáticas e `release.json` gerado.
- `git diff --check`: **0**.

## Doctor e bloqueios
- `npm run orch:doctor -- --smoke`: **OK=51, WARN=5, FAIL=1**.
- O único FAIL é infraestrutura do shell cron: `v22.22.2`, enquanto o projeto exige Node 24. OpenCode ausente e Ollama sem resposta permanecem WARN opcionais.
- As respostas oficiais continuam divergentes do manifesto em SHA: **0/6**. Sem igualdade SHA não é seguro substituir manifesto, cadastrar `source_references` ou inserir votos. Não inventar hash, URL, identidade ou voto.

## Próximo chunk bounded
Repetir os seis GETs oficiais no próximo tick, sem gerar manifesto novo nem aplicar votos enquanto persistir a deriva SHA-256. Manter gates locais em Node 24 e tratar a correção do shell cron como chunk separado.
