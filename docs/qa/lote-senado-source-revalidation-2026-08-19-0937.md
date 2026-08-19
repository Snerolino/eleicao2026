# QA — revalidação de fontes nominais do Senado — 2026-08-19 09:37 UTC

## Objetivo
Revalidar, em modo read-only e com retry controlado, os seis endpoints oficiais do Senado usados no catálogo nominal de 2025–2026, sem gerar novo manifesto nem aplicar fatos remotos enquanto houver deriva binária.

## Entregue e verificado
- 6/6 GETs oficiais concluídos com HTTP 200.
- 6/6 respostas têm prefixo PDF válido (`255044462d312e35`).
- 2/6 respostas coincidiram em bytes com o manifesto versionado.
- 0/6 coincidiram em SHA-256 com o manifesto versionado.
- Evidência completa preservada em `.orchestrator/runtime/senado-scout/revalidation-current.json`.
- Dry-run `npm run impact:senado:sources:apply`: 6 planejadas, 0 ausentes, 0 inserções e 0 votos tocados.

## Estado dos dados
- Snapshot público: 1003 candidaturas e 988 fotos oficiais (`npm run data:check`).
- Reconciliação factual remota não executada; nenhum voto, identidade, FK, proposição, matriz, claim ou `source_reference` foi alterado.
- Produção: raiz HTTP 200 e `/release.json` HTTP 200; SHA live `9982351b92b13f8b9725f83b32e1ff878e0705d6`, versão `0.2.416`, snapshot 1003.
- Backup Cloudflare `334951434`, run `32236697661`, concluído `success` com `headSha` idêntico ao live.

## Gates locais
- Node 24.19.0: 79 arquivos / 368 testes aprovados.
- `npx tsc --noEmit`: aprovado.
- `node scripts/validate-impact-schema.mjs`: aprovado.
- `npm run data:check`: aprovado.
- `npm run build`: aprovado; sitemap com 1003 candidatos + estáticas = 1005 URLs.
- `git diff --check`: aprovado.
- Doctor: `OK=51 WARN=5 FAIL=1`; FAIL restrito ao shell cron em Node 22.22.2. Opencode ausente é WARN; não bloqueou as lanes locais/read-only.

## Bloqueios reais
O catálogo oficial do Senado é binariamente volátil: apesar de HTTP 200 e assinatura PDF válida, os bytes/hashes atuais divergem do manifesto versionado. Portanto o fluxo permanece fail-closed; não é seguro gerar manifesto novo ou aplicar votos com evidência instável.

## Release verification

- Commit `82ab4d97d659612dfe4bac6d1256d7845df3ef36` publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32238623203`, concluído `success` com `headSha` idêntico.
- Produção raiz e `/release.json`: HTTP 200; release confirma SHA completo idêntico, versão `0.2.417` e snapshot 1003.

## Próximo passo bounded
Repetir a revalidação sequencial dos seis endpoints com retry controlado e preservar as assinaturas. Só avançar para novo manifesto/parser/writer após estabilidade do catálogo, R0 de identidade, schema/FK, dry-run factual e prova de idempotência.
