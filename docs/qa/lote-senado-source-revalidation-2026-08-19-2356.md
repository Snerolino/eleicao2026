# QA — revalidação das fontes nominais do Senado (2026-08-19 23:56 UTC)

## Objetivo
Executar o tick bounded de reconhecimento oficial read-only, repetir os seis GETs do catálogo nominal do Senado e manter o lote factual fail-closed enquanto o manifesto divergir.

## Entregue e verificado
- Revalidação sequencial das 6 URLs oficiais do manifesto `data/legislative-import/senado/nominal-source-manifest-2026-08-19.json`.
- Evidência transitória: `.orchestrator/runtime/senado-revalidation-current.json`.
- Resultado: **6/6 HTTP 200**, **6/6 prefixos PDF válidos**, **1/6 coincidências de bytes**, **0/6 coincidências SHA-256**.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: `planned=6`, `already_existing=0`, `missing=0`, `inserted=0`, `votes_touched=0`.
- Nenhuma escrita Supabase, atualização de manifesto ou aplicação factual executada.

## Gates locais
Executados explicitamente com Node `v24.19.0`:
- `npm run test`: **81 arquivos / 371 testes aprovados**.
- `npx tsc --noEmit`: aprovado.
- `node scripts/validate-impact-schema.mjs`: aprovado.
- `npm run data:check`: aprovado — **1003 candidaturas / 988 fotos oficiais**.
- `npm run build`: aprovado; sitemap com **1003 candidatos + 2 URLs estáticas** e `release.json` gerado.
- `git diff --check`: aprovado.

## Bloqueio real
O portal oficial continua retornando bytes diferentes do manifesto em 5/6 respostas e SHA-256 diferente nas 6/6. O prefixo PDF permanece válido, mas isso não prova identidade exata do conteúdo. O lote factual permanece bloqueado por **deriva de fonte**: não gerar manifesto novo automaticamente e não aplicar votos.

O `npm run orch:doctor -- --smoke` do shell continua com FAIL restrito a Node `22.22.2` quando o projeto exige Node 24; OpenCode ausente e Ollama sem resposta são WARN opcionais. Isso não contaminou os gates, executados com Node 24.19.0.

## Publicação/verificação
- Commit documental `83cc367d5cbf60e3a94c1f8390660bf0c6805b7f` publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32315419428`: `completed/success`, `headSha` idêntico.
- Produção `https://rs.votopraquem.org/`: raiz HTTP 200 e `/release.json` HTTP 200.
- Release de produção confirmado: `83cc367-20260819T235814262Z`, versão `0.2.474`, SHA completo idêntico e snapshot `row_count=1003`.

## Próximo passo
No próximo tick, repetir os seis GETs oficiais sem alterar o manifesto; manter a reconciliação local e a publicação documental independentes do bloqueio factual. Só avançar para aplicação após R0, fonte/hash estáveis, dry-run e prova de idempotência.
