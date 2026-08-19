# QA — writer idempotente de fontes históricas Câmara

- **Data:** 2026-08-19
- **Objetivo:** preparar o writer de `source_references` do envelope histórico Câmara em modo dry-run por padrão, com `--apply` explícito, validação fail-closed de manifesto/hash/UUID e sem tocar votos.

## Entregue e verificado

- `scripts/apply-camara-q1-sources.mjs` agora aceita `--input=` e `--manifest=`, exige manifesto versionado verificável, valida URL/hash/HTTP/bytes, pagina o catálogo remoto em blocos de 1000 e relê o catálogo após eventual inserção.
- O writer rejeita hash remoto divergente, URL duplicada, UUID inválido ou referência ausente; só retorna IDs remotos já confirmados por URL + hash exatos.
- O modo padrão não lê credenciais nem acessa Supabase: `7` fontes planejadas, `7` fontes validadas localmente, `remote_apply=false`, `inserted=0`, `votes_touched=0`.
- O caminho `--apply` permanece explícito; nenhuma escrita Supabase foi executada neste lote.
- Teste de contrato criado em `scripts/__tests__/apply-camara-sources.test.mjs`: **5 testes** focados verdes.

## Evidência de fontes e dados

- Auditoria oficial: `npm run impact:camara:sources:audit` → `7` URLs, todas HTTP 200, manifesto regenerado.
- Catálogo remoto revalidado no checkpoint anterior: `132` linhas lidas, `7/7` URLs com UUID remoto exato e `7/7` hashes coincidentes; `0` ausentes e `0` divergentes.
- Envelope histórico continua com `2` proposições, `6` versões, `6` eventos, `84` votos, `18` identidades elegíveis; `8` identidades inelegíveis permanecem fail-closed.
- Snapshot público: `1003` candidaturas e `988` fotos oficiais.

## Gates locais

- `npm run test`: **77 arquivos / 364 testes**, exit 0.
- `npx tsc --noEmit`: exit 0.
- `node scripts/validate-impact-schema.mjs`: exit 0.
- `npm run data:check`: exit 0 — `1003` candidaturas / `988` fotos.
- `npm run build`: exit 0 — sitemap com `1003` candidatos + estáticas, `release.json` gerado.
- `git diff --check`: exit 0.
- Doctor smoke com Node `v24.19.0`: `OK=53`, `WARN=4`, `FAIL=0`; warnings apenas de executores opcionais/fallback Ollama.

## Publicação e produção

- Commit funcional verificado em `origin/main`: `c90a371e0c56446fbb2e1865b6c51e58db57c4ac`.
- Backup Cloudflare consultado: runs disponíveis anteriores apontam `success` para `50e484c5...`; não há run concluído ainda associado ao commit `c90a371...` neste tick.
- Produção: `https://rs.votopraquem.org` respondeu **HTTP 200**; `/release.json` ainda confirma `50e484c5...`, portanto a propagação do commit `c90a371...` ainda não foi confirmada.

## Bloqueios e riscos

- Nenhuma aplicação factual legislativa foi executada. A promoção dos 8 casos inelegíveis continua proibida.
- O próximo gate é acompanhar o workflow backup `334951434` para `headSha=c90a371e...` e só então confirmar `/release.json`; não tratar o release anterior como prova do commit novo.
- O writer histórico de proposições/votos continua separado deste writer de fontes e exige validação remota de FK/identidade antes de qualquer `--apply`.

## Próximo passo

Verificar o run backup do commit `c90a371...`, confirmar produção, e depois executar somente o dry-run do importador histórico com as 7 referências resolvidas e as 18 identidades elegíveis. Não aplicar os 8 bloqueados.
