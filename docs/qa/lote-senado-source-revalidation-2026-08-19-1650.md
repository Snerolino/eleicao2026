# QA — revalidação de fontes nominais do Senado (2026-08-19T16:50Z)

## Objetivo
Reexecutar, em tick bounded e read-only, os seis GETs oficiais do catálogo nominal do Senado, preservando o fail-closed enquanto houver deriva binária.

## Entregue e verificado
- Lock `.orchestrator/runtime/locks/continuous-progress.lock` adquirido com `flock -n` e liberado ao finalizar.
- Reconhecimento oficial sequencial: **6/6 HTTP 200** e **6/6 prefixos `%PDF-` válidos**.
- Comparação contra o manifesto versionado: **2/6 coincidências de bytes** e **0/6 coincidências SHA-256**.
- Evidência transitória atualizada em `.orchestrator/runtime/senado-scout/revalidation-current.json`.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: **6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados**.
- Nenhuma escrita factual remota foi executada.

## Estado dos dados
- `npm run data:check`: **1003 candidaturas e 988 fotos oficiais**.
- O tick não alterou snapshot nem manifesto versionado; Supabase não foi alterado.
- Senado permanece fail-closed por deriva SHA-256: respostas atuais continuam divergindo do hash registrado, mesmo quando o tamanho coincide.

## Gates locais
- `npm run test -- --passWithNoTests`: **81 arquivos, 371 testes, 0 falhas**.
- `npx tsc --noEmit`: **0**.
- `node scripts/validate-impact-schema.mjs`: **0**.
- `npm run data:check`: **0**.
- `npm run build`: **0**; sitemap com 1003 candidatos + 2 estáticas e `release.json` gerado.
- `git diff --check`: **0**.

## Bloqueios e próximo passo
- Bloqueio real: deriva SHA-256 persistente nos seis documentos oficiais; não é seguro substituir o manifesto, cadastrar `source_references` ou inserir votos. Não inventar hash, URL, identidade ou voto.
- Próximo chunk bounded: repetir os seis GETs oficiais sem gerar manifesto novo nem aplicar votos enquanto persistir a deriva; manter os gates locais e tratar separadamente o FAIL do shell cron em Node 22 quando houver executor disponível.
