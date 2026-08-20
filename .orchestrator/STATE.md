## Tick contínuo — Câmara votos nominais bounded, lote 01 (2026-08-20T05:51Z)

- Lock bounded adquirido/liberado com `flock -n`; worktree iniciou limpa em `206725d0cf95fc6924bbc49dec499a8c06a98104`.
- Coletor oficial read-only consultou `/votacoes/{id}/votos` para 25/300 IDs da janela 2026-07-01 a 2026-09-30.
- Resultado verificado: 25 eventos, 0 individualizados, 0 votos; manifesto e brutos no runtime transitório, sem escrita remota.
- QA: `docs/qa/lote-camara-votos-batch-01-2026-08-20.md`.
- ALRS segue bloqueado por JWT `issued at future` e ausência de ID oficial exato; Senado segue fail-closed por deriva SHA-256.
- Doctor continua FAIL por shell Node 22; tentativa de reinício do gateway com Node 24 falhou, sem declarar correção concluída.
- Próximo chunk: Câmara lote 02 read-only; depois seguir bounded até cobrir os 300 IDs, sem inferência a partir de respostas vazias.

## Publicação/verificação — tick 05:17 UTC

- Commit `475cca3f3c25b7dad1e08be17f2b6f6ce1c100a9` publicado em `origin/main`.
- Produção raiz HTTP 200; `/release.json` confirmou SHA completo idêntico, release `475cca3-20260820T051725432Z`, versão `0.2.505` e snapshot `row_count=1003`.
- Workflow backup `334951434` foi disparado; a confirmação operacional final foi o release live com SHA idêntico.

## Tick contínuo — reconciliação oficial e gates locais (2026-08-20T05:15Z)

- Lock bounded adquirido/liberado; worktree iniciou e terminou limpa em `2e87ad8588d4040a2fa23d82023cc8356964a68c`.
- Senado: dry-run exit 0, 6 planejadas, 0 ausentes, 0 inserções e 0 votos tocados; deriva SHA-256 permanece fail-closed.
- ALRS: reparador bloqueado honestamente por `JWT issued at future`; os 4 residuais de Enio seguem sem ID/fonte exata e sem alteração.
- Câmara: descoberta oficial read-only de 2026-07-01 a 2026-09-30, 3 páginas válidas, 300 vote_ids, sem bloqueios; nenhum detalhe/voto foi inferido da listagem.
- Dataset: `consulta_cand_2026_RS.csv` coincide 100% com o snapshot nos 1003 IDs; `lista_candidatos_2026.csv` tem 322 linhas sem coluna TSE utilizável e não foi tratado como equivalente.
- Auditoria ampla de fontes terminou exit 2 com gaps reais: ALRS 3996/4000, Câmara 550/552, Senado 0/455 votos com fonte.
- Gates Node 24.19.0 verdes: 82 arquivos/372 testes, TypeScript, schema, `data:check` (1003/988), build e `git diff --check`.
- QA: `docs/qa/lote-continuous-ops-recon-2026-08-20-0515.md`.
- Próximo chunk: buscar `/votacoes/{id}/votos` para os 300 IDs Câmara em lotes bounded, reconciliar apenas identidade/cargo/UF exatos e manter ALRS/Senado read-only.

## Tick contínuo — revalidação Senado 6/6 com deriva persistente (2026-08-20T04:34Z)

- Lock bounded adquirido/liberado com `flock -n`; worktree iniciou limpa em `66812b2128087e3a2c068f8c042e322316362cc2`.
- Reconhecimento oficial read-only: 6/6 HTTP 200, 6/6 prefixos PDF válidos, 3/6 coincidências de bytes e 0/6 coincidências SHA-256 contra o manifesto versionado. Evidência: `.orchestrator/runtime/senado-revalidation-current.json`.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados.
- Nenhuma escrita factual remota, atualização do manifesto, Supabase, snapshot ou claim foi executada; Senado permanece fail-closed por deriva SHA-256.
- Doctor do shell cron permanece com FAIL restrito ao Node 22.22.2; OpenCode ausente e Ollama sem resposta permanecem WARN opcionais.
- QA: `docs/qa/lote-senado-source-revalidation-2026-08-20-0434.md`.
- Publicação/verificação: commit `51cbde3cc8a8bfd5299d565a076cd5285c5820f8`; backup `334951434`, run `32332545822`, `completed/success`, `headSha` idêntico; produção raiz e `/release.json` HTTP 200; release `51cbde3-20260820T043757506Z`, snapshot `row_count=1003`.
- Próximo chunk: repetir os seis GETs oficiais sem gerar manifesto novo nem aplicar votos enquanto persistir a deriva; manter reconciliação do dataset e fila editorial independentes.

## Tick contínuo — revalidação Senado 6/6 com deriva persistente (2026-08-20T03:57Z)

- Lock bounded adquirido/liberado com `flock -n`; worktree confirmada limpa em `79a99727bad6c3221ae9a65bf0f504c113f9cf4f` antes do tick.
- Reconhecimento oficial read-only: 6/6 HTTP 200, 6/6 prefixos PDF válidos, 2/6 coincidências de bytes e 0/6 coincidências SHA-256 contra o manifesto versionado. Evidência: `.orchestrator/runtime/senado-revalidation-current.json`.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados.
- Nenhuma escrita factual remota, atualização do manifesto, Supabase, snapshot ou claim foi executada; Senado permanece fail-closed por deriva SHA-256.
- Gates locais: 81 arquivos/371 testes, TypeScript, schema, `data:check` (1003 candidaturas/988 fotos), build e `git diff --check` verdes.
- QA: `docs/qa/lote-senado-source-revalidation-2026-08-20-0357.md`.
- Próximo chunk: repetir os seis GETs oficiais sem gerar manifesto novo nem aplicar votos enquanto persistir a deriva; manter reconciliação do dataset e fila editorial independentes.

## Tick contínuo — revalidação Senado 6/6 com deriva persistente (2026-08-20T02:25Z)

- Lock bounded adquirido/liberado com `flock -n`; worktree iniciou limpa em `215528d89cd00a921c36f806c3c29dad88858e13`.
- Reconhecimento oficial read-only: 6/6 HTTP 200, 6/6 prefixos PDF válidos, 4/6 coincidências de bytes e 0/6 coincidências SHA-256 contra o manifesto versionado. Evidência: `.orchestrator/runtime/senado-revalidation-current.json`.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados.
- Auditoria do mirror: `lista_candidatos_2026.csv` tem 322 IDs e o snapshot 1003; 681 IDs aparecem somente no snapshot. CSV segmentado não é equivalente e não houve sincronização inferida.
- Nenhuma escrita factual remota, atualização do manifesto, Supabase ou alteração do snapshot foi executada; Senado permanece fail-closed por deriva SHA-256.
- QA: `docs/qa/lote-senado-source-revalidation-2026-08-20-0225.md`.
- Publicação: commit `b9cf75d35a33c6012b2b75e80f60763629bf302f`; backup `334951434`, run `32324729127`, `completed/success`, `headSha` idêntico; produção raiz e `/release.json` HTTP 200, release `b9cf75d-20260820T022842373Z`, snapshot `row_count=1003`.
- Próximo chunk: repetir os seis GETs oficiais sem gerar manifesto novo nem aplicar votos enquanto persistir a deriva; investigar fonte oficial completa do dataset e manter publicação documental independente.

## Tick contínuo — revalidação Senado 6/6 com deriva persistente (2026-08-20T01:50Z)

- Lock bounded adquirido/liberado com `flock -n`; worktree iniciou limpa em `f7a3c31710cdfe89e831d4afc8163b99ccd1c9d3`.
- Reconhecimento oficial read-only: 6/6 HTTP 200, 6/6 prefixos PDF válidos, 5/6 coincidências de bytes e 0/6 coincidências SHA-256 contra o manifesto versionado. Evidência: `.orchestrator/runtime/senado-revalidation-current.json`.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados.
- Gates com Node 24.19.0: 81 arquivos/371 testes, TypeScript, schema, `data:check` (1003 candidaturas/988 fotos), build e `git diff --check` verdes.
- Nenhuma escrita factual remota, atualização do manifesto, Supabase ou alteração do snapshot foi executada; Senado permanece fail-closed por deriva SHA-256.
- Doctor do shell cron permanece com FAIL restrito ao Node 22.22.2; OpenCode ausente e Ollama sem resposta permanecem WARN opcionais.
- QA: `docs/qa/lote-senado-source-revalidation-2026-08-20-0150.md`.
- Publicação: commit `9a7053090cc305d0b2f96b400656695c8e1d1bd3`; backup `334951434`, run `32322524502`, `completed/success`, `headSha` idêntico; produção raiz e `/release.json` HTTP 200, release `9a70530-20260820T015156137Z`, versão `0.2.484`, snapshot `row_count=1003`.
- Próximo chunk: repetir os seis GETs oficiais sem gerar manifesto novo nem aplicar votos enquanto persistir a deriva; publicação documental segue independente.

## Tick contínuo — revalidação Senado 6/6 com deriva persistente (2026-08-20T01:11Z)

- Lock bounded adquirido/liberado com `flock -n`; worktree iniciou limpa em `885a1069ece354c48eaff07781fd35749bf1a8c3`.
- Reconhecimento oficial read-only: 6/6 HTTP 200, 6/6 prefixos PDF válidos, 3/6 coincidências de bytes e 0/6 coincidências SHA-256 contra o manifesto versionado. Evidência: `.orchestrator/runtime/senado-revalidation-current.json`.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados.
- Gates com Node 24.19.0: 81 arquivos/371 testes, TypeScript, schema, `data:check` (1003 candidaturas/988 fotos), build e `git diff --check` verdes.
- Doctor do shell cron permanece com FAIL restrito ao Node 22.22.2; OpenCode ausente e Ollama sem resposta permanecem WARN opcionais.
- Nenhuma escrita factual remota, atualização do manifesto, Supabase ou alteração do snapshot foi executada; Senado permanece fail-closed por deriva SHA-256.
- QA: `docs/qa/lote-senado-source-revalidation-2026-08-20-0111.md`.
- Auditoria read-only do mirror `../dataset2026/candidatos`: arquivos segmentados; `lista_candidatos_2026.csv` atual tem 322 IDs e não é equivalente sozinho ao snapshot de 1003. Nenhuma sincronização foi inferida ou executada; reconciliação do contrato de ingestão fica pendente.
- Publicação: commit documental `fc97b5e3af6b1202dbfaa0ce232ba83dd59bdb69` publicado em `origin/main`; backup `334951434`, run `32320190679`, `completed/success`, `headSha` idêntico.
- Produção raiz HTTP 200 e `/release.json` HTTP 200; release `fc97b5e-20260820T011314753Z`, SHA completo idêntico e snapshot `row_count=1003`.
- Próximo chunk: repetir os seis GETs oficiais sem gerar manifesto novo nem aplicar votos enquanto persistir a deriva.

## Tick contínuo — revalidação Senado 6/6 com deriva persistente (2026-08-20T00:32Z)

- Lock bounded adquirido/liberado com `flock -n`; worktree iniciou limpa em `f55335498555d3440cfc1a5073ddca3ecf0c8459`.
- Reconhecimento oficial read-only: 6/6 HTTP 200, 6/6 prefixos PDF válidos, 3/6 coincidências de bytes e 0/6 coincidências SHA-256 contra o manifesto versionado. Evidência: `.orchestrator/runtime/senado-revalidation-current.json`.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados.
- Gates no shell Node 22.22.2: 81 arquivos/371 testes, TypeScript, schema, `data:check` (1003 candidaturas/988 fotos), build e `git diff --check` verdes. Doctor: 48 OK, 5 WARN, 1 FAIL restrito à versão do Node.
- Nenhuma escrita factual remota, atualização do manifesto, Supabase ou alteração do snapshot foi executada; Senado permanece fail-closed por deriva SHA-256.
- QA: `docs/qa/lote-senado-source-revalidation-2026-08-20-0032.md`.
- Publicação final: commit documental `35a933de320480adf96d00f4a28190f824a35891` em `origin/main`; backup `334951434`, run `32317878884`, `completed/success`, `headSha` idêntico. Produção raiz e `/release.json` HTTP 200; release `35a933d-20260820T003554995Z`, versão `0.2.479`, snapshot `row_count=1003`.
- Próximo chunk: repetir os seis GETs oficiais sem gerar manifesto novo nem aplicar votos enquanto persistir a deriva; manter publicação documental independente.

## Fechamento R1 ALRS — 2026-08-20

- Auditoria CLI read-only confirmou 3996/4000 votos ALRS com fonte e exatamente 4 residuais, todos Enio (`210002534312`).
- R1 concluída para todos os casos comprováveis; residual factual permanece fail-closed sem ID oficial ALRS.
- QA: `docs/qa/lote-alrs-fed17-final-gate-2026-08-20.md`.
- R2/R3/R5 continuam liberadas; R4 só avança com matrizes/fontes aprováveis.

## Tick contínuo — scout Câmara Q2/2026 (2026-08-20)

- Janela oficial 2026-04-01 a 2026-06-30: 100 eventos descobertos, 97 acessíveis, 3 HTTP 404, 4 nominais RS e 106 votos.
- Rota `/votacoes/{id}/votos` reconciliou 29 deputados: 21 `matched_exact`, 8 pendentes.
- Nenhum voto Q2 foi aplicado; 3 eventos 404 e 8 identidades permanecem fail-closed.
- Próximo chunk: resolver FKs remotas das 21 identidades e gerar envelope dry-run com fontes.
- QA: `docs/qa/lote-camara-q2-scout-2026-08-20.md`.

## Tick contínuo — aplicação Câmara Q2/2026 (2026-08-20)

- Dry-run e aplicação idempotente: 3 proposições, 4 versões, 4 eventos e 75 votos.
- 21 FKs remotas exatas; 8 identidades pendentes e 3 eventos HTTP 404 fora.
- Perfis recalculados duas vezes: 4356 índices/41 perfis; Câmara 356 votos.
- Nenhuma matriz, score, claim ou RPC editorial foi alterada.
- QA: `docs/qa/lote-camara-q2-apply-2026-08-20.md`.

## Tick contínuo — scout Câmara Q3/2026 parcial (2026-08-20)

- 1000 registros de listagem consultados em 10 páginas HTTP 200; `tipoVotacao` ausente em 1000/1000.
- Primeiro lote não retornou voto RS nominal; nominalidade não foi inferida pela ausência do campo.
- Nenhuma escrita ou classificação factual foi feita; próximo chunk deve confirmar `/votos` em concorrência bounded.
- QA: `docs/qa/lote-camara-q3-scout-parcial-2026-08-20.md`.

## Tick contínuo — scout Câmara Q3/2026 completo (2026-08-20)

- 1000 eventos descobertos; 992 `/votos` acessíveis; 8 bloqueados por 429/404.
- 9 eventos nominais RS confirmados, totalizando 174 votos.
- Nenhum voto foi aplicado; próximo chunk é coleta/identidade/FK/fontes Q3.
- QA: `docs/qa/lote-camara-q3-scout-completo-2026-08-20.md`.

## Tick contínuo — aplicação Câmara Q3/2026 (2026-08-20)

- Aplicados 9 proposições, 9 versões, 9 eventos e 121 votos com 22 FKs remotas exatas.
- Segunda execução: 0 inserts, 0 updates, 121 existentes; impacto zero.
- Perfis recalculados duas vezes: 4477 índices/41 perfis; Câmara 477 votos.
- 9 identidades pendentes e 8 eventos inacessíveis permanecem fora.
- QA: `docs/qa/lote-camara-q3-apply-2026-08-20.md`.

## Tick contínuo — Câmara Q3 extra nominal (2026-08-20)

- 4 eventos adicionais, 2 proposições, 4 versões e 75 votos aplicados com 23 FKs exatas.
- Segunda execução: 0 inserts, 0 updates, 75 existentes; impacto zero.
- Perfis: 4552 índices/41 perfis; Câmara 552 votos, ALRS 4000, Senado 455.
- 8 identidades pendentes permanecem fora.
- QA: `docs/qa/lote-camara-q3-extra-apply-2026-08-20.md`.

## Tick contínuo — fechamento Câmara Q3 (2026-08-20)

- Paginação completa: páginas 1–13 com 1270 eventos; página 14 retornou 0.
- Q3 fechado com 13 eventos nominais e 196 votos aplicados.
- 404/429 e identidades pendentes permanecem fail-closed.
- Próxima fase: R4 editorial e reconhecimento contínuo ALRS/Senado.
- QA: `docs/qa/lote-camara-q3-pagination-final-2026-08-20.md`.

## Tick contínuo — smoke R5 pós-Câmara Q3 (2026-08-20)

- Smoke local verde: 1002 cards, busca/detalhe/PWA offline, 0 falhas HTTP e 0 erros online.
- Auditoria: 4932 votos totais; Câmara 477/475 com fonte; ALRS 4000/3996; Senado 455/0.
- 1 matriz aprovada; comparação categorial mantém fallback sem cobertura aprovada.
- QA: `docs/qa/lote-r5-smoke-comparacao-pos-q3-2026-08-20.md`.

## Tick contínuo — fila R4 pós-Câmara Q2/Q3 (2026-08-20)

- 1 assessment aprovado com fonte cobre 1 versão, 1 evento e 5 votos.
- Q2/Q3 permanecem fatos nominais publicados, sem score/alinhamento/categoria editorial automática.
- Comparação categorial mantém fallback fora do recorte aprovado.
- QA: `docs/qa/lote-r4-review-queue-pos-q2-q3-2026-08-20.md`.

## Tick contínuo — fila R4 Câmara Q2/Q3 (2026-08-20)

- Gerada fila editorial com 13 versões e 196 votos factuais.
- Todos os itens `pending_review`, sem grupo/direção automática, `remote_apply=false` e revisão humana exigida.
- QA: `docs/qa/lote-r4-review-queue-camara-q2-q3-2026-08-20.md`.

## Tick contínuo — isolamento R4 Q2/Q3 (2026-08-20)

- 30 eventos Câmara Q2/Q3 auditados; 0 associados a matriz `approved`.
- Única matriz aprovada continua sendo o piloto PLP 230/2025.
- 196 votos Q2/Q3 permanecem fatos nominais fora de impacto.
- QA: `docs/qa/lote-r4-isolamento-q2-q3-2026-08-20.md`.

## Tick contínuo — revalidação Senado 6/6 com deriva persistente (2026-08-19T23:56Z)

- Lock bounded adquirido/liberado com `flock -n`; worktree iniciou limpa em `ef57622fe3133b1f3d2bf1dc8ae33dc63bdb7eee`.
- Reconhecimento oficial read-only: 6/6 HTTP 200, 6/6 prefixos PDF válidos, 1/6 coincidências de bytes e 0/6 coincidências SHA-256 contra o manifesto versionado. Evidência: `.orchestrator/runtime/senado-revalidation-current.json`.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados.
- Gates Node 24.19.0: 81 arquivos/371 testes, TypeScript, schema, `data:check` (1003 candidaturas/988 fotos), build e `git diff --check` verdes.
- Produção raiz e `/release.json`: HTTP 200; release observado após publicação `83cc367-20260819T235814262Z`, versão `0.2.474`, SHA completo idêntico e snapshot `row_count=1003`. Backup `334951434`, run `32315419428`, `completed/success`, `headSha` idêntico.
- Nenhuma escrita factual remota, atualização do manifesto, Supabase ou alteração do snapshot foi executada; Senado permanece fail-closed por deriva SHA-256.
- QA: `docs/qa/lote-senado-source-revalidation-2026-08-19-2356.md`.
- Próximo chunk: repetir os seis GETs oficiais sem gerar manifesto novo nem aplicar votos enquanto persistir a deriva; manter publicação documental independente.

## Tick contínuo — revalidação Senado 6/6 com deriva persistente (2026-08-19T23:18Z)

- Lock bounded adquirido/liberado com `flock -n`; worktree iniciou limpa em `b1ae3fbfe84fde9a7308330fa8c22bd995470dfc`.
- Reconhecimento oficial read-only: 6/6 HTTP 200, 6/6 prefixos PDF válidos, 4/6 coincidências de bytes e 0/6 coincidências SHA-256 contra o manifesto versionado. Evidência: `.orchestrator/runtime/senado-revalidation-current.json`.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados.
- Gates Node 24.19.0: 81 arquivos/371 testes, TypeScript, schema, `data:check` (1003 candidaturas/988 fotos), build e `git diff --check` verdes.
- Doctor cron permanece com FAIL restrito ao shell em Node 22.22.2; OpenCode ausente e Ollama sem resposta permanecem WARN opcionais.
- Nenhuma escrita factual remota, atualização do manifesto, Supabase ou alteração do snapshot foi executada; Senado permanece fail-closed por deriva SHA-256.
- QA: `docs/qa/lote-senado-source-revalidation-2026-08-19-2318.md`.
- Próximo chunk: repetir os seis GETs oficiais sem gerar manifesto novo nem aplicar votos enquanto persistir a deriva; manter publicação documental independente.

## Publicação/verificação — tick 23:21 UTC

- Commit documental `f25650cef6e2a1eb18b24e265b2846013d4c99e9` publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32312848279`, concluiu `completed/success` com `headSha` idêntico.
- Produção raiz e `/release.json`: HTTP 200; após propagação, release `f25650c-20260819T232136791Z`, snapshot `row_count=1003`; `commit_sha` nulo no payload, confirmado pelo `headSha` do run e prefixo do release.

## Publicação/verificação — tick 22:39 UTC

- Commit documental `5d02882954a8ccec55a29cd8f697e51569a55b68` publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32309764661`, concluiu `completed/success` com `headSha` idêntico.
- Produção raiz HTTP 200 e `/release.json` HTTP 200; após propagação, release confirmou SHA idêntico, `row_count=1003` e release `5d02882-20260819T223938755Z`.

## Tick contínuo — revalidação Senado 6/6 com deriva persistente (2026-08-19T22:38Z)

- Lock bounded adquirido/liberado com `flock -n`; worktree iniciou limpa em `22c5a577e663a760850882070d2fac6323b90c26`.
- Reconhecimento oficial read-only: 6/6 HTTP 200, 6/6 prefixos PDF válidos, 3/6 coincidências de bytes e 0/6 coincidências SHA-256 contra o manifesto versionado. Evidência: `.orchestrator/runtime/senado-revalidation-current.json`.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados.
- Gates Node 24.19.0: 81 arquivos/371 testes, TypeScript, schema, `data:check` (1003 candidaturas/988 fotos), build e `git diff --check` verdes.
- Doctor cron permanece com FAIL restrito ao shell em Node 22.22.2; OpenCode ausente e Ollama sem resposta permanecem WARN opcionais.
- Nenhuma escrita factual remota, atualização do manifesto, Supabase ou alteração do snapshot foi executada; Senado permanece fail-closed por deriva SHA-256.
- QA: `docs/qa/lote-senado-source-revalidation-2026-08-19-2238.md`.
- Próximo chunk: repetir os seis GETs oficiais sem gerar manifesto novo nem aplicar votos enquanto persistir a deriva; manter a publicação documental independente.

## Publicação/verificação final — tick 22:03 UTC

- Commit documental final `c8675b6e119ca6a06f96592a9b2b163c3c105e01` publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32306924768`, concluiu `completed/success` com `headSha` idêntico.
- Produção raiz e `/release.json`: HTTP 200; release confirma SHA idêntico, versão `0.2.468` e `snapshot.row_count=1003`.

## Publicação/verificação — tick 22:01 UTC

- Commit `8e774a6267ed792afd9f0e41e283ed63fcca79f1` publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32306802705`, concluiu `completed/success` com `headSha` idêntico.
- Produção raiz e `/release.json`: HTTP 200; release confirma SHA idêntico, versão `0.2.467` e `snapshot.row_count=1003`.

## Tick contínuo — revalidação Senado 6/6 com deriva persistente (2026-08-19T22:00Z)

- Lock bounded adquirido/liberado com `flock -n`; worktree iniciou limpa em `c1371d9481ed2a3ded804bc915986a8d5de7a184`.
- Reconhecimento oficial read-only: 6/6 HTTP 200, 6/6 prefixos PDF válidos, 2/6 coincidências de bytes e 0/6 coincidências SHA-256 contra o manifesto versionado. Evidência: `.orchestrator/runtime/senado-revalidation-current.json`.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados.
- Gates Node 24.19.0: 81 arquivos/371 testes, TypeScript, schema, `data:check` (1003 candidaturas/988 fotos), build e `git diff --check` verdes.
- Doctor cron permanece com FAIL restrito ao shell em Node 22.22.2; OpenCode ausente e Ollama sem resposta permanecem WARN opcionais.
- Nenhuma escrita factual remota, atualização do manifesto, Supabase ou alteração do snapshot foi executada; Senado permanece fail-closed por deriva SHA-256.
- QA: `docs/qa/lote-senado-source-revalidation-2026-08-19-2200.md`.
- Próximo chunk: repetir os seis GETs oficiais sem gerar manifesto novo nem aplicar votos enquanto persistir a deriva; manter a reconciliação local/publicação independente.

## Tick contínuo — revalidação Senado 6/6 com deriva persistente (2026-08-19T21:24Z)

- Lock bounded adquirido/liberado com `flock -n`; worktree iniciou limpa em `b1128436a73f41fdf6ba4442d239ebf7c56e6939`.
- Reconhecimento oficial read-only: 6/6 HTTP 200, 6/6 prefixos PDF válidos, 2/6 coincidências de bytes e 0/6 coincidências SHA-256 contra o manifesto versionado. Evidência: `.orchestrator/runtime/senado-revalidation-current.json`.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados.
- CSV oficial `../dataset2026/candidatos/lista_candidatos_2026.csv`: SHA-256 `7c80d8260618ddc18ce62b44f12f7c463032c937f7f6ea5179cf75943f4207ea`, 67.483 bytes; snapshot público com 1.003 candidaturas.
- Gates Node 24: 81 arquivos/371 testes, TypeScript, schema, `data:check` (1.003 candidaturas/988 fotos), build `0.2.0` e `git diff --check` verdes.
- Doctor cron permanece com FAIL restrito ao shell em Node 22.22.2; OpenCode ausente e Ollama sem resposta permanecem WARN opcionais.
- Nenhuma escrita factual remota, atualização do manifesto, Supabase ou alteração do snapshot foi executada; Senado permanece fail-closed por deriva SHA-256.
- QA: `docs/qa/lote-senado-source-revalidation-2026-08-19-2124.md`.
- Próximo chunk: repetir os seis GETs oficiais sem gerar manifesto novo nem aplicar votos enquanto persistir a deriva; manter a reconciliação local/publicação independente.

## Publicação/verificação — tick 21:25 UTC
- Commit documental `d6517dcf4b5bcf9d39ddaef34bb643400dfbcdfa` publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32303782063`, concluiu `completed/success` com `headSha` idêntico.
- Produção `https://rs.votopraquem.org/`: raiz HTTP 200 e `/release.json` HTTP 200.
- Release de produção confirma `release_id=d6517dc-20260819T212559975Z`, versão `0.2.0` e `snapshot.row_count=1003`; o `commit_sha` do JSON está nulo, mas o prefixo do release e o `headSha` do run confirmam o commit publicado.

## Tick contínuo — revalidação Senado 6/6 com deriva persistente (2026-08-19T20:48Z)

- Lock bounded adquirido/liberado com `flock -n`; worktree iniciou limpa em `aec4e6ca533d90d797824d6ec8ef2973d5c53555`.
- Reconhecimento oficial read-only: 6/6 HTTP 200, 6/6 prefixos PDF válidos, 5/6 coincidências de bytes e 0/6 coincidências SHA-256 contra o manifesto versionado. Evidência: `.orchestrator/runtime/senado-revalidation-current.json`.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados.
- Gates Node 24.19.0: 81 arquivos/371 testes, TypeScript, schema, `data:check` (1003 candidaturas/988 fotos), build `0.2.461` e `git diff --check` verdes.
- Doctor cron permanece com FAIL restrito ao shell em Node 22.22.2; OpenCode ausente e Ollama sem resposta são WARN opcionais. Gates foram executados com Node 24.19.0.
- Nenhuma escrita factual remota, atualização do manifesto, Supabase ou alteração do snapshot foi executada; Senado permanece fail-closed por deriva SHA-256.
- QA: `docs/qa/lote-senado-source-revalidation-2026-08-19-2048.md`.
- Próximo chunk: publicar esta documentação, verificar backup Cloudflare/produção e repetir os seis GETs oficiais sem gerar manifesto novo nem aplicar votos enquanto persistir a deriva.

## Publicação/verificação — documentação do tick 20:10 UTC

- Commit documental `1830d32ae9a49bbf8ee1b93a07ea835ac124739c` publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32297150184`, concluiu `completed/success` com `headSha` idêntico.
- Produção raiz HTTP 200 e `/release.json` HTTP 200; release confirma SHA idêntico, versão `0.2.461` e `row_count=1003`.

## Tick contínuo — revalidação Senado 6/6 com deriva persistente (2026-08-19T20:10Z)

- Lock bounded adquirido/liberado com `flock -n`; worktree iniciou limpa em `595cf9d47602e4a3f7741eba798be4cc518ae973`.
- Reconhecimento oficial read-only: 6/6 HTTP 200, 6/6 prefixos PDF válidos, 2/6 coincidências de bytes e 0/6 coincidências SHA-256 contra o manifesto versionado. Evidência: `.orchestrator/runtime/senado-revalidation-current.json`.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados.
- Gates com Node 24.19.0: 81 arquivos/371 testes, TypeScript, schema, `data:check` (1003 candidaturas/988 fotos), build `0.2.460` e `git diff --check` verdes.
- Publicação: backup Cloudflare `334951434`, run `32296940085`, `completed/success`, `headSha` idêntico; produção raiz e `/release.json` HTTP 200, release confirma SHA idêntico e `row_count=1003`.
- Doctor cron permanece com FAIL restrito ao shell em Node 22.22.2; OpenCode ausente e Ollama sem resposta são WARN opcionais. Gates foram executados com Node 24.19.0.
- Nenhuma escrita factual remota, atualização do manifesto, Supabase ou alteração do snapshot foi executada; Senado permanece fail-closed por deriva SHA-256.
- QA: `docs/qa/lote-senado-source-revalidation-2026-08-19-2010.md`.
- Próximo chunk: repetir os seis GETs oficiais sem gerar manifesto novo nem aplicar votos enquanto persistir a deriva; manter publicação documental independente.

## Tick contínuo — revalidação Senado 6/6 com deriva persistente (2026-08-19T19:26Z)

- Lock bounded adquirido/liberado com `flock -n`; worktree iniciou limpa em `7ea1ba3c242a9039b37008140c7ae97c8bb608ae`. Foi removido o arquivo vazio acidental `9` criado durante a primeira tentativa de lock.
- Reconhecimento oficial read-only: 6/6 HTTP 200, 6/6 prefixos PDF válidos, 3/6 coincidências de bytes e 0/6 coincidências SHA-256 contra o manifesto versionado. Evidência: `.orchestrator/runtime/senado-revalidation-current.json`.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados.
- Reconciliação explícita do CSV oficial contra o snapshot: SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`, 1003/1003 linhas e IDs após normalização dos cabeçalhos TSE, 0 somente no dataset e 0 somente no snapshot.
- Gates locais: 81 arquivos/371 testes, TypeScript, schema, `data:check` (1003 candidaturas/988 fotos), build (release local `0.2.459`, SHA local completo), e `git diff --check` verdes.
- Doctor cron permanece `OK=51 WARN=5 FAIL=1`; FAIL restrito ao shell em Node 22.22.2, enquanto o projeto exige Node 24; OpenCode ausente e Ollama sem resposta permanecem WARN opcionais.
- Produção raiz e `/release.json` responderam HTTP 200; a publicação ainda reporta versão `0.2.459`, aguardando confirmação do SHA deste commit após o ciclo de publicação.
- Nenhuma escrita factual remota, atualização do manifesto, Supabase ou alteração do snapshot foi executada; Senado permanece fail-closed por deriva SHA-256.
- QA: `docs/qa/lote-senado-source-revalidation-2026-08-19-1926.md`.
- Próximo chunk: publicar esta documentação, verificar backup Cloudflare/produção e repetir os GETs oficiais sem gerar manifesto novo nem aplicar votos enquanto persistir a deriva.

## Publicação/verificação — tick 18:52 UTC

- Commit documental `cd2080406e1e20f5e1acae9e4c54045d0f621098` publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32289724809`, concluiu `completed/success` com `headSha` idêntico.
- Produção raiz HTTP 200 e `/release.json` HTTP 200; release confirma SHA idêntico, versão `0.2.458` e snapshot `row_count=1003`.

## Tick contínuo — revalidação Senado 6/6 com deriva persistente (2026-08-19T18:50Z)

- Lock bounded adquirido/liberado com `flock -n`; worktree iniciou limpa em `9a622bb20e274e9743e837e5152bd3f1804ba291`.
- Reconhecimento oficial read-only: 6/6 HTTP 200, 6/6 prefixos PDF válidos, 3/6 coincidências de bytes e 0/6 coincidências SHA-256 contra o manifesto versionado. Evidência: `.orchestrator/runtime/senado-revalidation-current.json`.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados.
- Gates Node 24.19.0: 81 arquivos/371 testes, TypeScript, schema, `data:check` (1003 candidaturas/988 fotos), build e `git diff --check` verdes.
- Doctor cron permanece `OK=51 WARN=5 FAIL=1`; FAIL restrito ao shell em Node 22.22.2; OpenCode ausente e Ollama sem resposta permanecem WARN opcionais.
- Nenhuma escrita factual remota, atualização do manifesto, Supabase ou alteração do snapshot foi executada; Senado permanece fail-closed por deriva SHA-256.
- QA: `docs/qa/lote-senado-source-revalidation-2026-08-19-1850.md`.
- Próximo chunk: repetir os seis GETs oficiais sem gerar manifesto novo nem aplicar votos enquanto persistir a deriva; publicar a documentação após os gates.

## Publicação/verificação — tick 18:06 UTC

- Commit `ebe88327eb23da5c4a42a3c74a611d3695b1bc7f` publicado em `origin/main`.
- GitHub Actions `Deploy`, run `32285508631`, concluiu `completed/success` com `headSha` idêntico; quality, deploy e smoke passaram.
- Tentativa de disparar o backup `334951434` falhou por erro transitório de conexão com `api.github.com`; o primário publicou com sucesso.
- Produção raiz HTTP 200; `/release.json` confirma SHA idêntico, versão `0.2.456`, release `ebe8832-20260819T180855928Z` e snapshot `row_count=1003`.

## Tick contínuo — revalidação Senado 6/6 com deriva persistente (2026-08-19T18:06Z)

- Lock bounded adquirido/liberado com `flock -n`; worktree iniciou limpa em `eab91ce6af17f33e53dbe7cd4185f744d4709d7c`.
- Reconhecimento oficial read-only: 6/6 HTTP 200, 6/6 prefixos PDF válidos, 3/6 coincidências de bytes e 0/6 coincidências SHA-256 contra o manifesto versionado. Evidência: `.orchestrator/runtime/senado-revalidation-current.json`.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados.
- Gates Node 24.19.0: 81 arquivos/371 testes, TypeScript, schema, `data:check` (1003 candidaturas/988 fotos), build e `git diff --check` verdes.
- Doctor cron permanece `OK=48 WARN=5 FAIL=1`; FAIL restrito ao shell em Node 22.22.2; OpenCode ausente e Ollama sem resposta permanecem WARN opcionais.
- Nenhuma escrita factual remota, atualização do manifesto, Supabase ou alteração do snapshot foi executada; Senado permanece fail-closed por deriva SHA-256.
- QA: `docs/qa/lote-senado-source-revalidation-2026-08-19-1806.md`.
- Próximo chunk: repetir os seis GETs oficiais sem gerar manifesto novo nem aplicar votos enquanto persistir a deriva; manter gates locais e publicação documental.

## Tick contínuo — revalidação Senado 6/6 com deriva persistente (2026-08-19T17:30Z)

- Lock bounded adquirido/liberado com `flock -n`; worktree iniciou limpa em `745932af13f3a7ec0d77a1e73241387332520e1d`.
- Reconhecimento oficial read-only: 6/6 HTTP 200, 6/6 prefixos PDF válidos, 5/6 coincidências de bytes e 0/6 coincidências SHA-256 contra o manifesto versionado. Evidência: `.orchestrator/runtime/senado-revalidation-current.json`.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados.
- Gates Node 24.19.0: 81 arquivos/371 testes, TypeScript, schema, `data:check` (1003 candidaturas/988 fotos), build e `git diff --check` verdes.
- Doctor cron: `OK=48 WARN=5 FAIL=1`; FAIL restrito ao shell em Node 22.22.2; OpenCode ausente e Ollama sem resposta permanecem WARN opcionais.
- QA: `docs/qa/lote-senado-source-revalidation-2026-08-19-1730.md`.
- Nenhuma escrita factual remota, atualização do manifesto, Supabase ou alteração do snapshot foi executada; Senado permanece fail-closed por deriva SHA-256.
- Próximo chunk: repetir os seis GETs sem gerar manifesto novo nem aplicar votos enquanto persistir a deriva; manter gates locais e publicação documental.

## Tick contínuo — revalidação Senado 6/6 com deriva persistente (2026-08-19T16:50Z)

- Lock bounded adquirido/liberado com `flock -n`; worktree iniciou limpa em `735be6439103d337a1c08f8edbcdef8b6cc24016`.
- Reconhecimento oficial read-only: 6/6 HTTP 200, 6/6 prefixos PDF válidos, 2/6 coincidências de bytes e 0/6 coincidências SHA-256 contra o manifesto versionado. Evidência: `.orchestrator/runtime/senado-scout/revalidation-current.json`.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados.
- Gates locais: 81 arquivos/371 testes, TypeScript, schema, `data:check` (1003 candidaturas/988 fotos), build e `git diff --check` verdes.
- Nenhuma escrita factual remota, atualização do manifesto, Supabase, Cloudflare ou alteração do snapshot foi executada; Senado permanece fail-closed por deriva SHA-256.
- QA: `docs/qa/lote-senado-source-revalidation-2026-08-19-1650.md`.
- Próximo chunk: repetir os seis GETs oficiais sem gerar manifesto novo nem aplicar votos enquanto persistir a deriva; manter gates locais e tratar o shell cron Node 22 separadamente.

## Publicação/verificação — tick 16:52 UTC

- Commit `72828b514072ddf7cad9b748bc8316588995479e` publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32278314535`, concluiu `success` com `headSha` idêntico.
- Produção raiz HTTP 200; `/release.json` HTTP 200 confirma SHA idêntico, release `72828b5-20260819T165205122Z` e snapshot `row_count=1003`.
- Revalidação pós-propagação confirmou `rs.votopraquem.org/release.json` com SHA `6aa59c6260d033356be4f8c1566c35c7c4dc5dff`, correspondente ao run `32278480237`; Senado permanece fail-closed.

## Publicação/verificação — tick Senado 16:15 UTC

- Commit documental `81ee230a555fcd5e9c6a6a28626e4e852bf9c022` publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32274838148`, concluiu `completed/success` com `headSha` idêntico.
- Produção raiz HTTP 200; `/release.json` confirma SHA idêntico, versão `0.2.0` e snapshot `row_count=1003`.
- Senado permanece fail-closed por deriva SHA-256; nenhuma escrita factual remota foi executada.

## Tick contínuo — revalidação Senado 6/6 com deriva persistente (2026-08-19T16:12Z)

- Lock bounded adquirido/liberado com `flock -n`; worktree iniciou limpa em `07bb1a5012489903e2087a59151f19318c843274`.
- Reconhecimento oficial read-only: 6/6 HTTP 200, 6/6 prefixos PDF válidos, 3/6 coincidências de bytes e 0/6 coincidências SHA-256 contra o manifesto versionado. Evidência: `.orchestrator/runtime/senado-scout/revalidation-current.json`.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados.
- Gates Node 24.19.0: 81 arquivos/371 testes, TypeScript, schema, `data:check` (1003 candidaturas/988 fotos), build e `git diff --check` verdes.
- Doctor cron: `OK=51 WARN=5 FAIL=1`; FAIL restrito ao shell em Node 22.22.2; OpenCode ausente e Ollama sem resposta permanecem WARN opcionais.
- Nenhuma escrita factual remota, Supabase, Cloudflare ou alteração de snapshot foi executada; Senado permanece fail-closed por deriva SHA-256.
- QA: `docs/qa/lote-senado-source-revalidation-2026-08-19-1612.md`.
- Próximo chunk: repetir os seis GETs sem gerar manifesto novo nem aplicar votos enquanto persistir a deriva SHA-256; manter gates com Node 24 e tratar o shell cron separadamente.

## Tick contínuo — revalidação Senado 6/6 com deriva persistente (2026-08-19T15:34Z)

- Lock bounded adquirido/liberado com `flock -n`; worktree iniciou limpa em `a69f5c93cd607d0ca327b534783913d83248bb50`.
- Reconhecimento oficial read-only: 6/6 HTTP 200, 6/6 prefixos PDF válidos, 4/6 coincidências de bytes e 0/6 coincidências SHA-256 contra o manifesto versionado. Evidência: `.orchestrator/runtime/senado-scout/revalidation-current.json`.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados.
- Gates Node 24.19.0: 81 arquivos/371 testes, TypeScript, schema, `data:check` (1003 candidaturas/988 fotos), build e `git diff --check` verdes.
- Doctor cron: `OK=48 WARN=5 FAIL=1`; FAIL restrito ao shell em Node 22.22.2; OpenCode ausente e Ollama sem resposta permanecem WARN opcionais.
- Nenhuma escrita factual remota, Supabase, Cloudflare ou alteração de snapshot foi executada; Senado permanece fail-closed por deriva binária.
- QA: `docs/qa/lote-senado-source-revalidation-2026-08-19-1534.md`.
- Próximo chunk: repetir os seis GETs sem gerar manifesto novo nem aplicar votos enquanto persistir a deriva SHA-256; manter gates com Node 24.

## Release verification — tick Senado 15:35 UTC

- Commit `91e5aeb8c166297ec3bdc9fd62ba98030efbc057` publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32270981774`, concluiu `success` com `headSha` idêntico.
- Produção raiz HTTP 200; `/release.json` confirma SHA idêntico, versão `0.2.447` e snapshot `row_count=1003`.
- Senado permanece fail-closed por deriva SHA-256; nenhuma escrita factual remota foi executada.

## Release verification — tick Senado 14:59 UTC

- Commit `c23c14e0b9057347cff23e211f69bf1e61a7fd3e` publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32267316158`, concluiu `success` com `headSha` idêntico.
- Produção raiz HTTP 200; `/release.json` confirma SHA idêntico e `snapshot.row_count=1003`.
- Senado permanece fail-closed por deriva SHA-256; nenhum dado factual remoto foi aplicado.

## Tick contínuo — revalidação Senado 6/6 com deriva persistente (2026-08-19T14:57Z)

- Lock bounded adquirido/liberado com `flock -n`; worktree iniciou limpa em `f17acc51246609bb52ed4e0ac08c581afe9b4009`.
- Reconhecimento oficial read-only: 6/6 HTTP 200, 6/6 prefixos PDF válidos, 1/6 coincidências de bytes e 0/6 coincidências SHA-256 contra o manifesto versionado. Evidência: `.orchestrator/runtime/senado-scout/revalidation-current.json`.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados.
- Gates Node 24.19.0: 81 arquivos/371 testes, TypeScript, schema, `data:check` (1003 candidaturas/988 fotos), build e `git diff --check` verdes.
- Doctor cron: `OK=48 WARN=5 FAIL=1`; FAIL restrito ao shell em Node 22.22.2; OpenCode ausente e Ollama sem resposta permanecem WARN opcionais.
- Nenhuma escrita factual remota, Supabase, Cloudflare ou alteração de snapshot foi executada; Senado permanece fail-closed por deriva binária.
- QA: `docs/qa/lote-senado-source-revalidation-2026-08-19-1457.md`.
- Próximo chunk: repetir os seis GETs sem gerar manifesto novo nem aplicar votos enquanto persistir a deriva SHA-256; manter gates com Node 24.

## Tick contínuo — revalidação Senado 6/6 com deriva persistente (2026-08-19T14:14Z)

- Lock bounded adquirido/liberado com `flock -n`; worktree iniciou limpa em `7aecda37cfd110184331fd0db0a63d42c3299a3b`.
- Reconhecimento oficial read-only: 6/6 HTTP 200, 6/6 prefixos PDF válidos, 2/6 coincidências de bytes e 0/6 coincidências SHA-256 contra o manifesto versionado. Evidência: `.orchestrator/runtime/senado-scout/revalidation-current.json`.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados.
- Gates Node 24.19.0: 81 arquivos/371 testes, TypeScript, schema, `data:check` (1003 candidaturas/988 fotos), build, smoke local e `git diff --check` verdes.
- Doctor cron: `OK=48 WARN=5 FAIL=1`; FAIL restrito ao shell em Node 22.22.2; OpenCode ausente e Ollama sem resposta permanecem WARN opcionais.
- Nenhuma escrita factual remota, Supabase, Cloudflare ou alteração de snapshot foi executada; Senado permanece fail-closed por deriva binária.
- QA: `docs/qa/lote-senado-source-revalidation-2026-08-19-1415.md`.
- Próximo chunk: repetir os seis GETs sem gerar manifesto novo nem aplicar votos enquanto persistir a deriva SHA-256; manter gates com Node 24.

## Release verification — tick Senado 14:19 UTC

- Commit documental `f753739c54aebb0986b4f38225af14495225f50d` publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32263280981`, concluiu `success` com `headSha` idêntico.
- Preview do run HTTP 200 e `/release.json` confirma SHA `f753739c54aebb0986b4f38225af14495225f50d`, versão `0.2.442`, snapshot 1003.
- Domínio customizado raiz HTTP 200, porém `/release.json` ainda retorna SHA anterior `3c84e9ac231265b13581eb81b74a45aa1ebe7e1f`, versão `0.2.441`; publicação customizada permanece bloqueada por deriva de domínio/cache/roteamento.
- Revalidação final após novo backup: run `32263486665` concluiu `success` com `headSha` `a7a01f61f0fa93ab75b38a3caff393390a982c35`; produção raiz HTTP 200 e `/release.json` passou a confirmar esse SHA, versão `0.2.443`, snapshot `row_count=1003`.
- Senado permanece fail-closed por deriva SHA-256; nenhum dado factual remoto foi aplicado.

## Release verification — tick Senado 14:17 UTC

- Commit documental `3c84e9ac231265b13581eb81b74a45aa1ebe7e1f` publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32263142568`, concluiu `success` com `headSha` idêntico.
- Produção raiz e `/release.json`: HTTP 200; release confirma SHA idêntico, versão `0.2.441` e snapshot 1003.
- Senado permanece fail-closed por deriva SHA-256; nenhum dado factual remoto foi aplicado.

## Release verification — revalidação Senado (2026-08-19T13:40Z)

- Commit `d181d2d101ee32b792a62b29e2b5ad8fa5518a96` publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32259303211`, concluiu `completed/success` com `headSha` idêntico.
- Produção raiz HTTP 200; `/release.json` confirma SHA idêntico, versão `0.2.439` e snapshot `row_count=1003`.

## Tick contínuo — revalidação Senado 6/6 com deriva SHA persistente (2026-08-19T13:15Z)

- Lock bounded adquirido/liberado com `flock -n`; worktree iniciou limpa em `bc393440216db1aca8d08b2ad5376083ade4bf78`.
- Reconhecimento oficial read-only: 6/6 HTTP 200, 6/6 prefixos PDF válidos, 5/6 coincidências de bytes e 0/6 coincidências SHA-256 contra o manifesto versionado. Evidência: `.orchestrator/runtime/senado-scout/revalidation-current.json`.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados.
- Nenhuma escrita factual remota, atualização de manifesto, Supabase, Cloudflare ou alteração de código foi executada.
- Doctor cron: `OK=51 WARN=5 FAIL=1`; FAIL restrito ao shell cron em Node 22.22.2, enquanto o projeto exige Node 24; OpenCode ausente é WARN opcional.
- QA: `docs/qa/lote-senado-source-revalidation-2026-08-19-1315.md`.
- Próximo chunk: repetir os seis GETs sem gerar manifesto novo nem aplicar votos enquanto persistir a deriva SHA-256; executar gates locais com Node 24 quando disponível.

## Release verification — revalidação Senado (2026-08-19T13:02Z)

- Commit `21cc1b6c5098dc5c33e6dcf5a14af6c164d90673` publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32255815222`, concluiu `completed/success` com `headSha` idêntico.
- Produção raiz HTTP 200; `/release.json` confirmou SHA completo idêntico.
- Senado permanece fail-closed por deriva binária; nenhum dado factual remoto foi aplicado.
- QA: `docs/qa/lote-senado-source-revalidation-2026-08-19-1259.md`.

## Tick contínuo — revalidação Senado 6/6 com deriva persistente (2026-08-19T12:59Z)

- Lock bounded adquirido e liberado; worktree iniciou limpa em `d4fd3524c53d1833714410ba3e05cf8675c961cf`.
- Reconhecimento oficial read-only: 6/6 HTTP 200, 6/6 prefixos PDF válidos, 2/6 coincidências de bytes e 0/6 coincidências SHA-256 contra o manifesto versionado. Evidência: `.orchestrator/runtime/senado-scout/revalidation-current.json`.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados.
- Reconciliação explícita do CSV oficial contra o snapshot: 1003/1003 IDs, 0 somente no dataset e 0 somente no snapshot.
- Gates Node 24.19.0: 81 arquivos/371 testes, TypeScript, schema, `data:check` (1003 candidaturas/988 fotos), build e `git diff --check` verdes.
- Doctor cron: `OK=51 WARN=5 FAIL=1`; FAIL restrito ao shell em Node 22.22.2; OpenCode ausente como WARN opcional.
- Nenhuma escrita factual remota foi executada; Senado permanece fail-closed por deriva binária do catálogo.
- QA: `docs/qa/lote-senado-source-revalidation-2026-08-19-1259.md`.
- Próximo chunk: publicar esta documentação, verificar backup Cloudflare/produção e repetir os GETs no próximo tick sem gerar manifesto novo nem aplicar votos enquanto persistir a deriva.

## Release verification — revalidação Senado (2026-08-19T12:15:30Z)

- Commit documental `7beebc10167e12f8d92ff845b797ad7b3107bf25` publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32251540611`, concluiu `completed/success` com `headSha` idêntico.
- Produção raiz e `/release.json`: HTTP 200; `/release.json` confirma SHA `7beebc10167e12f8d92ff845b797ad7b3107bf25`, versão `0.2.435` e snapshot `1003`.
- QA atualizado em `docs/qa/lote-senado-source-revalidation-2026-08-19-1213.md`.
- Senado permanece fail-closed por deriva binária; nenhum dado factual remoto foi aplicado.

## Tick contínuo — revalidação Senado 6/6 com deriva persistente (2026-08-19T12:13:10Z)

- Lock bounded adquirido e liberado; worktree iniciou limpa.
- Reconhecimento oficial read-only: 6/6 HTTP 200, 6/6 prefixos PDF válidos, 4/6 coincidências de bytes e 0/6 coincidências SHA-256 contra o manifesto. Evidência: `.orchestrator/runtime/senado-scout/revalidation-current.json`.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados.
- Gates Node 24.19.0: 81 arquivos/371 testes, TypeScript, schema, `data:check` (1003 candidaturas/988 fotos), build e `git diff --check` verdes.
- Nenhuma escrita factual remota foi executada; Senado permanece fail-closed por deriva binária do catálogo.
- QA: `docs/qa/lote-senado-source-revalidation-2026-08-19-1213.md`.
- Próximo chunk: publicar esta documentação, verificar backup Cloudflare/produção e repetir os GETs no próximo tick sem gerar manifesto novo nem aplicar votos enquanto persistir a deriva.

## Release verification — tick Senado 11:50 UTC

- Commit documental `7e4e538db6e944f8901e3420ddd1ca2b261e238c` publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32249528119`, concluiu `completed/success` com `headSha` idêntico.
- Produção raiz e `/release.json`: HTTP 200; release confirma SHA completo idêntico, versão `0.2.433` e snapshot 1003.

## Tick contínuo — revalidação Senado 6/6 com deriva persistente (2026-08-19 11:48 UTC)

- Lock bounded adquirido e liberado; worktree iniciou limpa.
- Reconhecimento oficial read-only com retry controlado: 6/6 HTTP 200, 6/6 prefixos PDF válidos, 4/6 coincidências de bytes e 0/6 coincidências SHA-256 contra o manifesto versionado. Evidência: `.orchestrator/runtime/senado-scout/revalidation-current.json`.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados.
- Gates com Node 24.19.0: 81 arquivos/371 testes, TypeScript, schema, `data:check` (1003 candidaturas/988 fotos), build e `git diff --check` verdes.
- `npm run orch:doctor`: `OK=48 WARN=5 FAIL=1`; FAIL restrito ao shell em Node 22.22.2; OpenCode ausente, sem bloquear a rota local.
- Nenhuma escrita factual remota foi executada; Senado permanece fail-closed por deriva binária do catálogo.
- QA: `docs/qa/lote-senado-source-revalidation-2026-08-19-1148.md`.
- Próximo chunk: repetir os seis GETs oficiais com retry controlado; não gerar manifesto novo nem aplicar votos enquanto persistir a deriva.

## Tick contínuo — revalidação Senado 6/6 com deriva persistente (2026-08-19 11:06 UTC)

- Lock bounded adquirido e liberado; worktree iniciou limpa.
- Reconhecimento oficial read-only com retry controlado: 6/6 HTTP 200, 6/6 prefixos PDF válidos, 1/6 coincidências de bytes e 0/6 coincidências SHA-256 contra o manifesto versionado. Evidência: `.orchestrator/runtime/senado-scout/revalidation-current.json`.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados.
- Gates com Node v22.22.2: 79 arquivos/368 testes, TypeScript, schema, `data:check` (1003 candidaturas/988 fotos), build e `git diff --check` verdes.
- `npm run orch:doctor`: `OK=48 WARN=5 FAIL=1`; FAIL restrito ao shell em Node 22, enquanto o projeto exige Node 24; OpenCode ausente, sem bloquear a rota local.
- Nenhuma escrita factual remota foi executada; Senado permanece fail-closed por deriva binária do catálogo.
- QA: `docs/qa/lote-senado-source-revalidation-2026-08-19-1106.md`.
- Próximo chunk: publicar esta documentação e verificar backup Cloudflare/produção; no próximo tick repetir os GETs sem gerar manifesto novo nem aplicar votos enquanto persistir a deriva.

## Release verification — documentação do tick Senado 10:45 UTC

- Commit documental `35f695142b3731e1fe3cfbfb1f6f63aabf6c8fd0` publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32244291304`, concluiu `success` com `headSha` idêntico.
- Produção `https://rs.votopraquem.org`: HTTP 200 com User-Agent de verificação.
- Produção `/release.json`: HTTP 200; SHA idêntico ao commit, versão `0.2.426`.

## Tick contínuo — revalidação Senado 6/6 com deriva persistente (2026-08-19 10:45 UTC)

- Lock bounded adquirido durante os chunks e liberado ao finalizar; worktree iniciou limpa.
- Reconhecimento oficial read-only com retry controlado: 6/6 HTTP 200, 6/6 prefixos PDF válidos, 4/6 coincidências de bytes e 0/6 coincidências SHA-256 contra o manifesto versionado. Evidência: `.orchestrator/runtime/senado-scout/revalidation-current.json`.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados.
- Gates Node 24.19.0: 79 arquivos/368 testes, TypeScript, schema, `data:check` (1003 candidaturas/988 fotos), build e `git diff --check` verdes.
- Nenhuma escrita factual remota foi executada; Senado permanece fail-closed por deriva binária do catálogo.
- Doctor cron: `OK=48 WARN=5 FAIL=1`; FAIL restrito ao shell em Node 22.22.2; OpenCode ausente, sem bloquear a rota local.
- QA: `docs/qa/lote-senado-source-revalidation-2026-08-19-1045.md`.
- Próximo chunk: publicar a documentação deste tick, verificar o backup Cloudflare e produção; no próximo tick repetir os GETs sem gerar manifesto novo nem aplicar votos enquanto persistir a deriva.

## Release verification — tick Senado 10:23 UTC

- Commit documental `c9c7d024d06a42d74031989f3831a7e12886f748` publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32242405791`, concluiu `success` com `headSha` idêntico.
- Produção raiz e `/release.json`: HTTP 200; release confirma SHA completo idêntico, versão `0.2.423` e snapshot 1003.
- QA: `docs/qa/lote-senado-source-revalidation-2026-08-19-1022.md`.

## Tick contínuo — revalidação Senado 6/6 com deriva persistente (2026-08-19 10:22 UTC)

- Lock bounded adquirido durante o bloco e liberado ao finalizar; worktree iniciou limpa.
- Reconhecimento oficial read-only: 6/6 HTTP 200, 6/6 prefixos PDF válidos, 4/6 coincidências de bytes e 0/6 coincidências SHA-256 contra o manifesto versionado. Evidência: `.orchestrator/runtime/senado-scout/revalidation-current.json`.
- Dry-run `npm run impact:senado:sources:apply`: 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados.
- Gates Node 24.19.0: 79 arquivos/368 testes, TypeScript, schema, `data:check` (1003 candidaturas/988 fotos), build e `git diff --check` verdes.
- Nenhuma escrita factual remota foi executada; Senado permanece fail-closed por deriva binária do catálogo.
- Doctor cron: `OK=48 WARN=5 FAIL=1`; FAIL restrito ao shell em Node 22.22.2, enquanto o projeto exige Node 24. OpenCode ausente, sem bloquear a rota local.
- QA: `docs/qa/lote-senado-source-revalidation-2026-08-19-1022.md`.
- Próximo chunk: repetir GETs com retry controlado; não gerar manifesto novo nem aplicar votos enquanto persistir a deriva binária do catálogo.

## Release verification — tick Senado 09:57 UTC

- Commit documental `916ac23cbc3b777f1f61e8ae78e959d3d49aeac4` publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32240414747`, concluiu `success` com `headSha` idêntico.
- Produção raiz e `/release.json`: HTTP 200; release confirma SHA completo idêntico e snapshot 1003.
- QA: `docs/qa/lote-senado-source-revalidation-2026-08-19-0957.md`.

## Tick contínuo — revalidação Senado 6/6 com deriva persistente (2026-08-19 09:57 UTC)

- Lock bounded adquirido e liberado; worktree estava limpa antes do chunk.
- Reconhecimento oficial read-only: 6/6 HTTP 200, 6/6 prefixos PDF válidos, 3/6 coincidências de bytes e 0/6 coincidências SHA-256 contra o manifesto versionado. Evidência: `.orchestrator/runtime/senado-scout/revalidation-current.json`.
- Dry-run `npm run impact:senado:sources:apply`: 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados.
- Reconciliação read-only do CSV oficial local contra o snapshot: 1003/1003 IDs, 0 somente no dataset e 0 somente no snapshot.
- Nenhuma escrita factual remota foi executada; Senado permanece fail-closed por deriva binária do catálogo.
- Doctor cron: `OK=48 WARN=5 FAIL=1`; FAIL restrito ao shell em Node `v22.22.2`, enquanto o projeto exige Node 24.
- QA: `docs/qa/lote-senado-source-revalidation-2026-08-19-0957.md`.
- Próximo chunk: repetir GETs com retry controlado; não gerar manifesto novo nem aplicar votos enquanto persistir a deriva binária do catálogo.

## Release verification — tick Senado 09:37 UTC

- Commit `82ab4d97d659612dfe4bac6d1256d7845df3ef36` publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32238623203`, concluiu `success` com `headSha` idêntico.
- Produção raiz e `/release.json`: HTTP 200; release confirma SHA completo idêntico, versão `0.2.417`, snapshot 1003.

## Tick contínuo — revalidação Senado 6/6 com deriva persistente (2026-08-19 09:37 UTC)

- Lock bounded adquirido; reconhecimento oficial read-only refez os seis GETs com retry controlado: 6/6 HTTP 200 e prefixos PDF válidos.
- 2/6 respostas coincidiram em bytes e 0/6 em SHA-256 contra o manifesto versionado. Evidência: `.orchestrator/runtime/senado-scout/revalidation-current.json`.
- Dry-run `npm run impact:senado:sources:apply`: 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados.
- Gates Node 24.19.0: 79 arquivos/368 testes, TypeScript, schema, `data:check` (1003 candidaturas/988 fotos), build e `git diff --check` verdes.
- Doctor cron: `OK=51 WARN=5 FAIL=1`; FAIL restrito ao shell cron em Node 22.22.2. Nenhuma escrita factual ou remota foi executada.
- Produção raiz e `/release.json`: HTTP 200; release confirma SHA `9982351b92b13f8b9725f83b32e1ff878e0705d6`, versão `0.2.416`, snapshot 1003. Backup Cloudflare `334951434`, run `32236697661`, success com `headSha` idêntico.
- QA: `docs/qa/lote-senado-source-revalidation-2026-08-19-0937.md`.
- Próximo chunk: repetir GETs com retry controlado; não gerar manifesto novo nem aplicar votos enquanto persistir a deriva binária do catálogo Senado.

- Commit final `eaab9069d44c2689e629b254446277ea37b86a66` publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32236568369`, concluiu `success` com `headSha` idêntico.
- Produção raiz HTTP 200; `/release.json` confirma SHA completo idêntico, versão `0.2.415` e snapshot 1003.
- Nenhuma escrita factual remota foi executada; Senado permanece fail-closed.

## Tick contínuo — revalidação Senado 6/6 com deriva persistente (2026-08-19 09:13 UTC)

- Lock bounded adquirido e liberado; worktree iniciou limpa em `88edebfb465e84fee495f33856f55dcecf242d81`.
- Reconhecimento oficial read-only: 6/6 HTTP 200, 6/6 prefixos PDF válidos, 2/6 coincidências de bytes e 0/6 coincidências SHA-256 contra o manifesto versionado. Evidência preservada em `.orchestrator/runtime/senado-scout/revalidation-current.json`.
- Dry-run `npm run impact:senado:sources:apply`: 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados.
- Gates Node 24.19.0: 79 arquivos/368 testes, TypeScript, schema, `data:check` (1003 candidaturas/988 fotos), build e `git diff --check` verdes.
- Doctor cron: `OK=51 WARN=5 FAIL=1`; FAIL restrito ao shell em Node 22.22.2. Nenhuma escrita factual ou remota foi executada.
- Produção anterior revalidada: raiz HTTP 200; `/release.json` confirma SHA `88edebfb465e84fee495f33856f55dcecf242d81`, versão `0.2.414`, snapshot 1003.
- QA: `docs/qa/lote-senado-source-revalidation-2026-08-19-0913.md`.
- Próximo chunk: repetir GETs com retry controlado; não gerar manifesto novo nem aplicar votos enquanto persistir a deriva binária do catálogo Senado.

## Release verification — documentação final do tick (2026-08-19 08:52 UTC)

- Commit final `56a2ce2078153d07c8d83a8e743c9f61a6a20ca4` publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32234723842`, concluiu `success` com `headSha` idêntico.
- Produção raiz HTTP 200; `/release.json` confirma SHA completo idêntico,
  versão `0.2.413` e snapshot 1003.
- Nenhuma escrita factual remota foi executada; Senado permanece fail-closed.

## Release verification — documentação do tick (2026-08-19 08:51 UTC)

- Commit `92a955266071cd2df7ae3dcad3e459482dd42b0c` publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32234591902`, concluiu `success` com `headSha` idêntico.
- Produção raiz HTTP 200; `/release.json` confirma SHA completo idêntico,
  versão `0.2.412` e snapshot 1003.
- Nenhuma escrita factual remota foi executada; Senado permanece fail-closed.

## Tick contínuo — revalidação Senado 6/6 com deriva persistente (2026-08-19 08:49 UTC)

- Lock bounded adquirido e liberado; worktree estava limpa antes da documentação.
- Reconhecimento oficial read-only: 6/6 HTTP 200 e 6/6 assinaturas PDF válidas; 3/6 coincidências de bytes e 0/6 coincidências SHA-256 contra o manifesto versionado. A evidência foi preservada em `.orchestrator/runtime/senado-scout/revalidation-current.json`.
- Dry-run `npm run impact:senado:sources:apply`: 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados.
- Reconciliação do CSV oficial local contra o snapshot: 1003/1003 IDs, 0 somente no dataset e 0 somente no snapshot.
- Gates Node 24.19.0: 79 arquivos/368 testes, TypeScript, schema, `data:check` (1003 candidaturas/988 fotos), build e `git diff --check` verdes.
- Doctor cron: `OK=48 WARN=5 FAIL=1`; FAIL restrito ao shell em Node 22.22.2. Nenhuma escrita factual ou remota foi executada.
- Produção raiz HTTP 200; `/release.json` confirma SHA `fc0b06ce9af306d6d8fc2360cf133261e4de1fe1`, versão `0.2.411` e snapshot 1003. Backup Cloudflare `334951434`, run `32232867724`, success com `headSha` idêntico.
- QA: `docs/qa/lote-senado-source-revalidation-2026-08-19-0849.md`.
- Próximo chunk: repetir GETs com retry controlado; não gerar manifesto novo nem aplicar votos enquanto persistir a deriva binária do catálogo Senado.

## Tick contínuo — revalidação Senado 6/6 com deriva persistente (2026-08-19 08:15 UTC)

- Lock bounded adquirido e liberado; worktree estava limpa antes da documentação.
- Reconhecimento oficial read-only: 6/6 HTTP 200, prefixo PDF válido, 2/6 coincidências de bytes e 0/6 coincidências SHA-256 contra o manifesto versionado.
- Dry-run `scripts/apply-senado-nominal-sources.mjs`: 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados.
- Reconciliação do CSV oficial local contra o snapshot: 1003/1003 IDs, 0 somente no dataset e 0 somente no snapshot.
- Nenhuma escrita factual ou remota foi executada; Senado permanece fail-closed por deriva binária do catálogo.
- QA: `docs/qa/lote-senado-source-revalidation-2026-08-19-0815.md` e `docs/qa/lote-senado-release-verification-2026-08-19-0815.md`.
- Publicação verificada: commit `96840023a8281a137e10503ad87cb4f28718568f`, backup Cloudflare `334951434`, run `32232775185` success com `headSha` idêntico; produção `/release.json` HTTP 200, SHA idêntico, versão `0.2.410`, snapshot 1003.
- Próximo chunk: preservar/revisar a deriva binária dos PDFs e manter o Senado fail-closed; não gerar manifesto novo nem aplicar votos sem fonte estável, R0/schema/FK e idempotência.

## Tick contínuo — revalidação Senado 6/6 com deriva persistente (2026-08-19 07:58 UTC)

- Lock bounded adquirido e liberado; worktree estava limpa antes da documentação.
- Reconhecimento oficial read-only: 6/6 HTTP 200, assinatura PDF válida, 3/6 coincidências de bytes e 0/6 coincidências SHA-256 contra o manifesto versionado.
- Dry-run `scripts/apply-senado-nominal-sources.mjs`: 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados.
- Gates Node 24.19.0: 79 arquivos/368 testes, TypeScript, schema, `data:check` (1003 candidaturas/988 fotos), build e `git diff --check` verdes.
- Doctor cron: `OK=48 WARN=5 FAIL=1`; FAIL restrito ao shell Node 22. Nenhuma escrita factual ou remota foi executada.
- Publicação verificada para o commit documental final `a8e182d6886a7112abfc1fc166babfa079cdc98c`: backup Cloudflare `334951434`, run `32230593176`, `success` e `headSha` idêntico; produção HTTP 200 e `/release.json` confirmou SHA idêntico, versão `0.2.0` e snapshot 1003.
- O commit documental anterior `5774d3bf398e63f3e7f9f9ea6816443eec5258ec` também foi publicado e verificado com sucesso.
- QA: `docs/qa/lote-senado-source-revalidation-2026-08-19-0758.md`.
- Próximo chunk: preservar/revisar a deriva binária dos PDFs e manter o Senado fail-closed; não gerar manifesto novo nem aplicar votos sem fonte estável, R0/schema/FK e idempotência.

## Tick contínuo — revalidação Senado 6/6 com deriva persistente (2026-08-19 07:34 UTC)

- Lock bounded adquirido e liberado; worktree estava limpa antes da documentação e nenhum writer concorrente.
- Seis GETs oficiais Senado refeitos sequencialmente com retry controlado: 6/6 HTTP 200.
- 2/6 coincidiram em bytes com o manifesto; 0/6 coincidiram em SHA-256. Divergências foram preservadas em `.orchestrator/runtime/senado-scout/revalidation-current.json`.
- Dry-run `scripts/apply-senado-nominal-sources.mjs`: 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados.
- Gates Node 24.19.0: 79 arquivos/368 testes, TypeScript, schema, `data:check` (1003 candidaturas/988 fotos), build, sitemap e `git diff --check` verdes.
- Nenhum voto, identidade, FK, source_reference, matriz, claim, RPC, Supabase ou Cloudflare foi alterado.
- QA: `docs/qa/lote-senado-source-revalidation-2026-08-19-0734.md`.
- Publicação verificada: commit `b818bdcd49b663bcee13b9832ac3384df5e0a097` em `origin/main`; backup Cloudflare `334951434`, run `32228571803`, `success`, `headSha` idêntico; produção raiz HTTP 200 e `/release.json` confirmou SHA, versão `0.2.402` e snapshot 1003.
- Próximo chunk: preservar/revisar o conteúdo transitório para explicar a deriva de PDF antes de gerar manifesto novo; Senado permanece fail-closed.

## Release verification — revalidação Senado (2026-08-19 07:11 UTC)

- Commit `da85075c32d5b36b4121b11973d5d686b3ddbde2` está em `origin/main`.
- Backup Cloudflare `334951434`, run `32226647319`, concluiu `success` com `headSha` idêntico.
- Produção raiz e `/release.json`: HTTP 200; release confirma SHA completo `da85075c32d5b36b4121b11973d5d686b3ddbde2`, versão `0.2.399`, snapshot 1003.
- Nenhuma escrita factual foi executada; Senado permanece fail-closed por deriva binária do catálogo.

## Tick contínuo — revalidação Senado 6/6 com deriva persistente (2026-08-19 07:09 UTC)

- Lock bounded mantido por execução única; worktree limpa antes da documentação e nenhum writer concorrente.
- Seis GETs oficiais Senado refeitos sequencialmente com retry controlado: 6/6 HTTP 200.
- 0/6 coincidiram em bytes + SHA-256 com o manifesto versionado; todos os hashes/bytes observados foram preservados em `.orchestrator/runtime/senado-scout/revalidation.json`.
- Dry-run `scripts/apply-senado-nominal-sources.mjs`: 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados.
- Gates Node 24.19.0: 78 arquivos/367 testes, TypeScript, schema, `data:check` (1003 candidaturas/988 fotos), build e `git diff --check` verdes.
- Nenhum voto, identidade, FK, source_reference, matriz, claim, RPC, Supabase ou Cloudflare foi alterado.
- QA: `docs/qa/lote-senado-source-revalidation-2026-08-19-0709.md`.
- Próximo chunk: preservar/revisar o conteúdo transitório para explicar a deriva de PDF antes de gerar manifesto novo; Senado permanece fail-closed.

## Release verification — documentação da deriva Senado (2026-08-19 06:49 UTC)

- Commit `91d5358646b7f359f4440ba70c62f0c57ce5ca7d` publicado em `origin/main`.
- Gates Node 24.19.0: 78 arquivos/367 testes, TypeScript, schema, `data:check` (1003 candidaturas/988 fotos), build e `git diff --check` verdes.
- Produção raiz e `/release.json`: HTTP 200, mas ainda serve SHA anterior `ef1b37a70a3e74bd678afc27b0f45f14b84b3e92`; o commit documental ainda não foi propagado.
- Tentativas de listar/disparar workflow backup Cloudflare `334951434` falharam duas vezes por conexão com `api.github.com`; nenhum run deve ser atribuído sem `headSha` verificável.
- QA: `docs/qa/lote-senado-source-revalidation-drift-2026-08-19.md`.
- Próximo chunk: quando a API GitHub voltar, disparar o backup, confirmar `headSha=91d5358646b7f359f4440ba70c62f0c57ce5ca7d` e revalidar `/release.json`; em paralelo repetir os GETs Senado com retry e bytes preservados.

## Tick contínuo — deriva do catálogo oficial Senado detectada (2026-08-19 06:48 UTC)

- Lock bounded adquirido e liberado; worktree limpa no início; nenhum writer concorrente.
- Reconhecimento read-only refez os seis GETs oficiais Senado: 5/6 HTTP 200 e 1/6 com falha DNS transitória.
- Nenhuma das cinco respostas HTTP 200 coincidiu em bytes + SHA-256 com o manifesto versionado; o catálogo está stale/volátil e permanece fail-closed.
- Dry-run local de `scripts/apply-senado-nominal-sources.mjs`: 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados; o comando não consulta remoto em dry-run.
- Nenhuma fonte, voto, identidade, FK, candidato, proposição, matriz, claim, RPC, Supabase ou Cloudflare foi alterada.
- QA: `docs/qa/lote-senado-source-revalidation-drift-2026-08-19.md`.
- Próximo chunk: repetir GETs com retry controlado, preservar bytes transitórios e revisar novo manifesto somente após 6/6 HTTP 200; depois parser/dry-run usando somente `legislator_id`.

## Tick contínuo — catálogo oficial Senado preparado (2026-08-19 06:25 UTC)

- Lock bounded adquirido e liberado; worktree estava limpa no início; nenhum writer concorrente.
- Revalidação final dos seis endpoints oficiais Senado: 6/6 HTTP 200, 6 URLs únicas, 6 hashes únicos e payloads PDF. Uma falha DNS transitória em 2026/6341 foi recuperada com curl retry e registrada no manifesto final.
- Criados `data/legislative-import/senado/nominal-source-manifest-2026-08-19.json` e `nominal-source-catalog-input.json`, somente dry-run-ready; nenhum UUID foi inventado.
- `build-legislative-source-catalog.mjs` passou a aceitar prefixos oficiais Câmara/Senado; teste de contrato Senado adicionado.
- Gates Node 24.19.0: 78 arquivos/367 testes, TypeScript, schema, data:check (1003 candidaturas/988 fotos), build e diff check verdes.
- Nenhuma escrita de voto/FK/identidade/matriz/RPC foi executada; apenas 6 `source_references` oficiais foram cadastradas.
- QA: `docs/qa/lote-senado-source-catalogo-2026-08-19.md`.
- 6 `source_references` foram aplicadas com URL/hash exatos; Senado permanece fail-closed para votos porque os candidatos TSE não foram resolvidos e o writer `legislator_id` ainda está em preparação.
- Próximo chunk: adaptar o envelope PDF para dry-run factual usando somente `legislator_id`, sem aplicar votos até validar o writer idempotente.

## Tick contínuo — fontes Senado aplicadas e parser nominal preparado (2026-08-19)

- 6 `source_references` Senado aplicadas com URL/hash exatos; segunda execução inseriu 0.
- Parser oficial em PDF extraiu 48 proposições, 68 eventos e 184 votos em dry-run local.
- Legisladores remotos 6341, 1186 e 825 resolvidos; candidatos TSE 0, portanto o próximo writer deve usar `legislator_id` sem inferir `candidate_id`.
- Nenhum voto Senado, matriz, claim ou RPC foi aplicado.
- QA: `docs/qa/lote-senado-sources-parser-ready-2026-08-19.md`.

## Tick contínuo — envelope Senado por legislator_id (2026-08-19)

- Adaptador oficial produziu 48 proposições, 68 eventos e 184 votos em dry-run local.
- 3 legisladores preservados; 0 `candidate_tse_id` inferidos.
- URLs exatas resolvidas por legislador/ano; nenhum voto remoto aplicado.
- Próximo chunk: writer idempotente por `legislator_id`, após estabilização do manifesto PDF.
- QA: `docs/qa/lote-senado-envelope-legislator-id-2026-08-19.md`.

## Tick contínuo — contrato de comparação de votos por categoria (2026-08-19)

- Implementado contrato puro para comparar candidatos por `house`, `group_slug` e eventos comuns.
- Somente assessments `approved` entram; valores factuais permanecem separados de score/alinhamento.
- Teste focal 2/2 e TypeScript passaram.
- Supabase possui apenas 1 assessment aprovado no recorte atual; nenhuma categoria foi inventada.
- Próximo chunk: consulta pública de assessments aprovados e integração da `ComparePage` com fallback de cobertura insuficiente.
- QA: `docs/qa/lote-vote-category-comparison-contract-2026-08-19.md`.

## Tick contínuo — UI de comparação de votos por categoria (2026-08-19)

- `ComparePage` agora consulta índice factual, eventos e assessments aprovados e exibe valores por categoria/casa em eventos comuns.
- Fallback explícito permanece quando não há cobertura aprovada; nenhum score, recomendação ou categoria foi inventado.
- Suíte: 80 arquivos/370 testes; TypeScript e build verdes.
- QA: `docs/qa/lote-vote-category-comparison-ui-2026-08-19.md`.

## Tick contínuo — reparo residual FED-17 ALRS (2026-08-19)

- Writer oficial aplicou 11 `source_reference_id` e corrigiu 2 datas de eventos com evidência ALRS exata.
- Segunda execução: 0 alterações; idempotência confirmada.
- Auditoria pós-reparo: ALRS 3996/4000 votos com fonte; 4 sem fonte.
- Os 4 residuais são Enio Carlos Terra, identidade ALRS não localizada; permanecem fail-closed.
- QA: `docs/qa/lote-alrs-fed17-residual-repair-2026-08-19.md`.

## Release verification — documentação do tick (2026-08-19 06:01 UTC)

- Commit documental `9c62ada88cb3ff6bd5ee65922f270d9270d10db3` publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32221589008`, concluiu `success` com `headSha` idêntico.
- Produção raiz e `/release.json`: HTTP 200; release confirma SHA completo `9c62ada88cb3ff6bd5ee65922f270d9270d10db3`, versão `0.2.393`.
- QA do tick: `docs/qa/lote-continuous-ops-dataset-release-2026-08-19-0557.md`.
- Nenhuma escrita factual Supabase foi executada; aplicações Senado permanecem fail-closed.
- Próximo chunk: revalidar novamente o catálogo oficial Senado e suas seis `source_references`, sem aplicar enquanto URL/hash/UUID/FK não forem exatos.

## Tick contínuo — reconciliação dataset e release verificado (2026-08-19 05:58 UTC)

- Lock bounded adquirido e liberado; worktree limpa.
- `HEAD`/`origin/main` em `867c011258899f119a3c94b320a5b67e6840b2a0`.
- Doctor smoke: `OK=51 WARN=5 FAIL=1`; FAIL restrito ao shell cron em Node `v22.22.2`. Gates executados com Node `v24.19.0`.
- Reconciliação read-only correta do CSV oficial `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv`: 1003/1003 linhas e IDs contra o snapshot, 0 somente no dataset e 0 somente no snapshot.
- Gates locais: 78 arquivos/366 testes, TypeScript, schema, `data:check` (1003 candidaturas/988 fotos), build e `git diff --check` verdes.
- Produção raiz e `/release.json`: HTTP 200; release confirma SHA completo `867c011258899f119a3c94b320a5b67e6840b2a0`, versão `0.2.392`.
- Backup Cloudflare `334951434`: runs deste SHA ficaram `skipped`; disparo manual falhou com `error connecting to api.github.com`. Produção confirma o SHA, mas nenhum run específico deve ser atribuído.
- Nenhuma escrita factual Supabase foi executada.
- QA: `docs/qa/lote-continuous-ops-dataset-release-2026-08-19-0557.md`.
- Próximo chunk: revalidar GitHub API e localizar run concluído com `headSha=867c011258899f119a3c94b320a5b67e6840b2a0`; manter aplicações Senado fail-closed.

## Tick contínuo — reconciliação TSE e release bloqueado por rede (2026-08-19 05:36 UTC)

- Lock bounded adquirido e liberado; worktree limpa no início.
- `HEAD`/`origin/main` em `f16cdf8f382e442d3766e2044e26f25f2c6539df`.
- Doctor smoke: `OK=51 WARN=5 FAIL=1`; FAIL restrito ao shell cron em Node 22.22.2. Gates executados com Node 24.19.0.
- Reconciliação read-only do CSV oficial local `consulta_cand_2026_RS.csv` contra o snapshot: 1003/1003 linhas, 0 somente no dataset e 0 somente no snapshot; única divergência de apresentação: `210002533050`/TENENTE NETO com `ballot_name` ausente no snapshot.
- Gates locais: 78 arquivos/366 testes, TypeScript, schema, `data:check` (1003 candidaturas/988 fotos), build e `git diff --check` verdes.
- Commit documental `c876f0e73d4d244f07685158f075a8085e5bc982` publicado em `origin/main`; API GitHub continua indisponível para localizar/disparar o backup Cloudflare.
- Produção ainda serve `release.json` com SHA `f16cdf8f382e442d3766e2044e26f25f2c6539df`, versão `0.2.390` e snapshot 1003; o commit documental ainda não está propagado.
- Nenhuma escrita factual Supabase foi executada.
- QA: `docs/qa/lote-continuous-ops-recon-release-2026-08-19.md`.
- Próximo chunk: localizar o run do backup `334951434` quando a API GitHub voltar e confirmar `headSha=c876f0e73d4d244f07685158f075a8085e5bc982`; depois revalidar `/release.json`.

## Release verification — catálogo Senado (2026-08-19 05:00 UTC)

- Revalidação confirmou `origin/main` e `HEAD` em `a42567c0a661f19785dfd941273f4638db498d3d`.
- Backup Cloudflare `334951434`, run `32217515668`, concluiu `success` com `headSha` idêntico; runs posteriores do mesmo SHA ficaram `skipped`.
- Produção raiz e `/release.json` responderam HTTP 200; `release.json` confirmou SHA completo `a42567c0a661f19785dfd941273f4638db498d3d`, versão `0.2.388` e snapshot 1003.
- QA: `docs/qa/lote-senado-release-verification-2026-08-19.md`.
- Nenhuma escrita legislativa remota foi feita; Senado permanece fail-closed por ausência das seis `source_references`.
- Próximo chunk: preparar dry-run idempotente das seis `source_references`, com GET/hash/bytes e gates de identidade/schema/FK imediatamente antes de eventual `--apply`.

## Release verification pendente — catálogo Senado (2026-08-19 04:55 UTC)

- Commit `46c94ffd146a825629eba31d194ee9e6e1797f6c` publicado em `origin/main`.
- Backup Cloudflare `334951434` disparado manualmente; run `32217488055` está `in_progress` com `headSha` idêntico.
- Produção ainda expõe o release anterior `f32fbd35c6e8b2cf42bac8c3b75339b289e528ff`; não declarar a documentação deste tick como propagada até nova verificação.
- Próximo tick: consultar `gh run view 32217488055 --json status,conclusion,headSha`; após sucesso, confirmar `/release.json` com o SHA do commit.

## Tick contínuo — catálogo Senado nominal e reconciliação read-only (2026-08-19 04:53 UTC)

- Lock bounded adquirido e liberado; worktree estava limpa antes do chunk e nenhum writer concorrente foi observado.
- Produção revalidada: raiz e `/release.json` HTTP 200; `release.json` confirmou SHA completo `f32fbd35c6e8b2cf42bac8c3b75339b289e528ff`, versão `0.2.386`, snapshot 1003.
- Backup Cloudflare `334951434`, run `32215967150`, concluiu `success` com `headSha` idêntico; runs `32215969665` e `32216161304` ficaram `skipped`.
- Seis GETs oficiais Senado foram refeitos: 6/6 HTTP 200, payload PDF, bytes/SHA-256 completos. Catálogo transitório: `.orchestrator/runtime/senado-scout/endpoint-catalog-2026-08-19.json`.
- Schema remoto read-only confirmou `candidates.tse_candidate_id`, `legislators`, `legislative_votes.legislator_id/candidate_id/source_reference_id`, `voting_events.source_reference_id` e `source_references.url/content_hash`.
- Reconciliação exata resolveu os legisladores 6341, 1186 e 825 no remoto; consulta exata de candidatos RS por nome retornou 0 linhas. Nenhum `candidate_id` foi inferido.
- Consulta exata das seis URLs em `source_references` retornou 0/6; nenhum UUID remoto de fonte foi resolvido. Senado permanece fail-closed.
- Nenhuma proposição, versão, evento, voto, identidade, FK, `source_reference`, matriz, claim, RPC, RLS, Supabase ou Cloudflare foi alterado.
- QA: `docs/qa/lote-senado-nominal-catalogo-fk-reconciliation-2026-08-19.md`.
- Artefato de reconciliação: `.orchestrator/runtime/senado-scout/source-reference-reconciliation-2026-08-19.json`.
- Próximo chunk: preparar catálogo idempotente das seis `source_references`, revalidar URL/bytes/hash e identidade/FK imediatamente antes de eventual `--apply`; não publicar votos enquanto houver divergência.


## Tick contínuo — publicação verificada dataset/release (2026-08-19 04:08 UTC)

- Lock bounded adquirido e liberado; worktree limpa antes do chunk.
- Commit `887ad5503dff139fc2a0d4f776ec9a440c693e3e` publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32214606403`, concluiu `success` com `headSha` idêntico.
- Produção: raiz HTTP 200 e `/release.json` HTTP 200; release `887ad55-20260819T040815723Z` confirmou o SHA completo e snapshot 1003.
- QA: `docs/qa/lote-dataset-release-revalidacao-2026-08-19.md`.
- Próximo chunk: selecionar outro lote legislativo independente para auditoria read-only de fonte/schema/FK; manter ALRS FED-17 fail-closed.


## Tick contínuo — revalidação read-only de fontes ALRS FED-17 (2026-08-19 03:44 UTC)

- Lock bounded adquirido e liberado; nenhum writer concorrente.
- Cinco GETs sequenciais ao Portal da Transparência ALRS responderam HTTP 200.
- Bytes, SHA-256 e contagem de `data-item` coincidiram exatamente em 5/5 com `data/legislative-import/alrs-fed17/recovery-manifest.json`.
- `npm run impact:alrs:sources:backfill` em dry-run: 2 eventos elegíveis, 0 votos, 0 fontes, 3 eventos bloqueados e 1 identidade bloqueada.
- Auditoria estrita read-only segue exit 2 por lacunas reais: ALRS 3985/4000 votos com fonte, Câmara 279/281, Senado 0/455.
- Nenhuma escrita remota, identidade, FK, UUID, matriz, claim, RPC ou Cloudflare foi alterada.
- QA: `docs/qa/lote-alrs-fed17-revalidacao-fontes-2026-08-19.md`.
- Doctor do shell cron tem FAIL apenas por Node 22.22.2; gates deste chunk foram executados com Node 24.19.0.
- Próximo chunk: revalidar outro lote legislativo independente por fonte/schema/FK, mantendo a fila ALRS fail-closed até existir correspondência exata aplicável.

# Tick contínuo — materialização de perfis nominais Câmara (2026-08-19 03:21 UTC)

- Lock bounded adquirido e liberado; worktree limpa antes do chunk; nenhum writer concorrente.
- Gate remoto read-only passou: projeto Supabase vinculado, migrations alinhadas até `20260816100000`, schema legislativo presente e constraints compostas exatas em `legislator_vote_index (candidate_id, voting_event_id)` e `legislator_vote_profile (candidate_id, house)`.
- Dry-run `node scripts/build-vote-profile.mjs` passou com Node `v24.19.0`: 4.281 votos factuais com candidato, 4.281 índices e 41 perfis.
- Primeiro `--apply` passou; segundo `--apply` passou, comprovando idempotência.
- Releitura remota: 4.281 votos factuais com candidato, 4.281 índices e 41 perfis; ALRS 13 perfis/4.000 votos e Câmara 28 perfis/281 votos.
- Nenhuma migration, RLS/RPC/Auth/Storage, claim, matriz, identidade bloqueada ou fonte foi alterada; as 8 identidades históricas inelegíveis permanecem fail-closed.
- QA: `docs/qa/lote-camara-vote-profile-materialization-2026-08-19.md`.
- Gates locais completos passaram: 78 arquivos/366 testes, TypeScript, schema, `data:check` (1003 candidaturas/988 fotos), build e `git diff --check`.
- Commit `6c94c27bfb23440fa2fe849322accadbdb8410a8` publicado em `origin/main`.
- Disparo manual do backup `334951434` encontrou erro transitório de conexão com `api.github.com`; a confirmação independente de produção passou: HTTP 200 e `/release.json` com SHA completo `6c94c27bfb23440fa2fe849322accadbdb8410a8`, versão `0.2.0`, release `6c94c27-20260819T032347891Z`.
- A listagem posterior do workflow ainda não expôs run com este `headSha`; não atribuir sucesso de run específico sem essa evidência.
- QA: `docs/qa/lote-camara-vote-profile-materialization-2026-08-19.md`.
- Próximo chunk: selecionar o próximo lote legislativo independente sem inferir identidades ou votos sem fonte oficial.

# Tick contínuo — publicação da aplicação histórica Câmara (2026-08-19)

- Commit `ff92c3e50b6caec2dcf43038c1292fccbf6cdcd9` publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32210316104`, concluiu `success` com `headSha` idêntico.
- Produção HTTP 200; após propagação, `/release.json` confirmou SHA `ff92c3e`, versão `0.2.377`, snapshot com 1003 candidaturas.
- QA atualizado em `docs/qa/lote-camara-historical-apply-idempotent-2026-08-19.md`.
- Próximo chunk: materializar/revalidar perfis nominais Câmara, preservando `(candidate_id, house)` e as 8 identidades históricas bloqueadas.

# Tick contínuo — aplicação histórica Câmara idempotente (2026-08-19)

- Lock bounded adquirido e liberado; nenhum writer concorrente.
- API GitHub revalidada; `origin/main` e produção estavam em `16eb24b`, HTTP 200, versão `0.2.376`, snapshot 1003.
- Gate remoto read-only passou: migrations alinhadas até `20260816100000`, schema/FK legislativo presente, 18/18 pares TSE/UUID exatos e 7/7 `source_references` por URL/hash exatos.
- Auditoria refez 7 GETs oficiais Câmara: 7/7 HTTP 200, bytes/SHA-256 sem divergência.
- Primeira tentativa de `--apply` falhou fechada antes da escrita porque o catálogo remoto contém duplicata histórica de URL TSE fora do envelope; o writer foi corrigido para filtrar somente URLs esperadas, mantendo rejeição de duplicatas dentro do envelope.
- Teste focado: 2/2 verde. Dry-run: 2 proposições, 6 versões, 6 eventos, 84 votos, 18 elegíveis e 8 bloqueadas.
- Primeiro `--apply`: inseriu 2 proposições, 6 versões, 6 eventos e 84 votos; 84 votos tocados. Nenhuma matriz, claim, RPC ou editorial foi alterada.
- Segundo `--apply`: 0 inserts, 0 updates, 84 registros existentes e 0 votos tocados; idempotência comprovada.
- Gates locais: 78 arquivos/366 testes, TypeScript, schema, `data:check` (1003/988), build e diff check verdes.
- QA: `docs/qa/lote-camara-historical-apply-idempotent-2026-08-19.md`.
- Alteração ainda não publicada: commit/push deste writer e QA são o próximo passo bounded.

# Tick contínuo — release do writer histórico bloqueado por GitHub API (2026-08-19)

- Commit funcional `b9711f2` foi publicado em `origin/main`.
- Disparo manual do backup Cloudflare `334951434` falhou por `error connecting to api.github.com`.
- Produção segue HTTP 200, mas `/release.json` confirma somente SHA anterior `683286c...`, versão `0.2.374`; este commit ainda não foi verificado em produção.
- QA atualizado em `docs/qa/lote-camara-historical-idempotent-writer-dryrun-2026-08-19.md`.
- Próximo chunk: revalidar GitHub API e confirmar deploy de `b9711f2`; depois executar gate read-only de identidade/schema/FK/fontes antes de qualquer `--apply`.

# Tick contínuo — writer histórico Câmara em dry-run verificado (2026-08-19)

- Lock bounded adquirido e liberado; nenhum writer concorrente.
- Implementado `scripts/apply-camara-historical-resolved.mjs` com `dry-run` por padrão e `--apply` explícito; adicionado comando `npm run impact:camara:historical:write`.
- Contrato Vitest adicionado em `scripts/__tests__/apply-camara-historical-resolved.test.mjs`.
- Dry-run verificado: 2 proposições, 6 versões, 6 eventos, 84 votos, 18 identidades elegíveis, 8 bloqueadas, 7 fontes; zero escrita remota.
- Gates locais com Node 24.19.0: 78 arquivos/366 testes, TypeScript, schema, data:check (1003 candidaturas/988 fotos), build e diff check verdes.
- Doctor smoke: OK=51, WARN=5, FAIL=1; FAIL restrito à comprovação da rota MCP Codex read-only, com fallback Codex exec verde.
- QA: `docs/qa/lote-camara-historical-idempotent-writer-dryrun-2026-08-19.md`.
- Nenhuma proposição, evento, voto, identidade, FK, source_reference, matriz, RPC, Supabase ou Cloudflare foi alterada; 8 identidades inelegíveis permanecem fail-closed.
- Próximo chunk: revalidar read-only identidade remota por `tse_candidate_id`, schema/FK e 7 fontes por URL/hash; somente então executar `--apply`, provar idempotência e publicar.

# Tick contínuo — catálogo remoto histórico Câmara revalidado (2026-08-19)

- Lock bounded adquirido e liberado; nenhum writer concorrente.
- Consulta remota read-only paginada leu 132 `source_references`; as 7 URLs do envelope têm UUID remoto exato e hash coincidente (7/7, 0 ausentes, 0 divergentes).
- Artefato: `.orchestrator/runtime/camara-historical-scout/catalog-revalidation-2026-08-19.json`.
- `npm run impact:dryrun data/legislative-import/camara/historical-contract-envelope.json`: exit 0; 2 proposições, 6 versões, 6 eventos, 84 votos.
- Teste focado: 5/5 verde. Nenhuma escrita remota, identidade, FK, matriz, RPC ou Cloudflare foi alterada.
- QA: `docs/qa/lote-camara-historical-source-catalog-revalidation-2026-08-19.md`.
- Publicação verificada: backup Cloudflare `334951434`, run `32202957347`, concluiu `success` com `headSha=da8cd69dfdf7830a53575b18999f93a24f8b405c`; produção HTTP 200 e `/release.json` confirmaram SHA, versão `0.2.368` e 1003 candidaturas.
- Próximo chunk: implementar/revisar writer histórico idempotente dry-run por padrão, com `--apply` explícito, usando somente as 7 referências resolvidas e as 18 identidades elegíveis; manter 8 inelegíveis fail-closed.

# Tick contínuo — contrato histórico Câmara e dry-run factual (2026-08-19)

- Lock bounded adquirido e liberado; nenhum writer concorrente.
- Revalidação oficial das 7 URLs resolveu 7/7 HTTP 200; manifesto derivado confirmou bytes/SHA-256.
- Adaptador CLI fail-closed executado: 2 proposições, 6 versões, 6 eventos, 84 votos, 18 candidatos elegíveis e 8 registros bloqueados.
- `npm run impact:dryrun data/legislative-import/camara/historical-contract-envelope.json` passou sem escrita remota.
- Auditoria de fontes passou com 7 URLs HTTP 200; nenhuma FK, UUID, voto, matriz, RPC, Supabase ou Cloudflare foi alterada.
- Gates locais verdes: 76 arquivos/359 testes, TypeScript, schema, `data:check` (1003 candidaturas/988 fotos), build e `git diff --check`.
- QA: `docs/qa/lote-camara-historical-contract-dry-run-2026-08-19.md`.
- Commit `59246fe5fee32383cba3520741a151144f81214f` publicado; backup Cloudflare `334951434`, run `32201674930`, concluiu `success` com `headSha` idêntico; produção HTTP 200 e `/release.json` confirmaram o SHA.
- Próximo chunk: revalidar catálogo remoto `source_references` por URL/hash e preparar writer idempotente apenas se as 7 referências tiverem UUID exato; manter 8 identidades inelegíveis fail-closed.

# Tick contínuo — auditoria/aplicação de fontes históricas Câmara (2026-08-18)

- Lock bounded adquirido e liberado; worktree limpa antes do chunk; nenhum writer concorrente.
- Revalidação oficial read-only refez 7/7 GETs Câmara com HTTP 200 e coincidência exata de bytes/SHA-256 contra `historical-resolved-source-manifest.json`.
- Catálogo remoto `source_references` foi consultado antes da escrita: 125 linhas, 7 URLs ausentes.
- Primeira inserção falhou fechada por `source_references_source_category_check`; schema remoto aceita `oficial|imprensa|fact_check|outro`. Nenhuma linha foi inserida nessa tentativa.
- Retry idempotente com `source_category=oficial` inseriu 7 fontes; releitura confirmou 7/7 presentes e 7/7 hashes exatos. Nenhuma proposição, versão, evento, voto, identidade, FK, matriz ou RPC foi alterado.
- Artefatos: `.orchestrator/runtime/camara-historical-scout/catalog-audit-2026-08-18.json` e `source-apply-2026-08-18.json`.
- QA: `docs/qa/lote-camara-historical-source-catalog-audit-2026-08-18.md`.
- Deploy backup Cloudflare `334951434`, run `32198093850`, concluiu `success` com `headSha=d999496101ac7cd3a1f62e4e9b5b184c5954948f`; produção HTTP 200 e `/release.json` confirmaram o SHA, versão `0.2.360` e 1003 candidaturas.
- Próximo chunk: revalidar o envelope histórico contra as 7 referências resolvidas e preparar dry-run factual; manter os 4 `position=outro` e 8 identidades não elegíveis fail-closed.

# Tick contínuo — FED-26 adaptador de contrato Câmara histórico (2026-08-18)

- Lock bounded adquirido e liberado; worktree limpa no início; nenhum writer concorrente.
- Implementado `scripts/adapt-camara-historical-contract.mjs` com derivação fail-closed de número/ano, hashes oficiais, referências lógicas TSE e validação de 7 fontes.
- Teste focado verde: 5/5; suíte completa verde: 76 arquivos / 359 testes.
- Dry-run adaptado verde: 2 proposições, 6 versões, 6 eventos, 84 votos; nenhum SQL, Supabase, Cloudflare ou FK foi escrito.
- Gates verdes com Node 24.19.0: TypeScript, schema, `data:check` (1003 candidaturas / 988 fotos), build e `git diff --check`.
- QA: `docs/qa/lote-camara-historical-contract-adapter-2026-08-18.md`.
- 7 `source_references` permanecem sem UUID remoto resolvido; 8 identidades não elegíveis seguem fora. Publicação funcional verificada no backup Cloudflare `334951434`, run `32190857815`, `success`, `headSha=b50db97c7bd45045e640afcdd9d4261d25eb4621`; follow-up documental `91405ede184254175a19f29b56f268785b84e82d` também está em `origin/main` e `/release.json` o confirmou. A API GitHub ficou indisponível para um novo run do follow-up; nenhum código funcional mudou. Próximo chunk: auditoria read-only do catálogo remoto por URL/hash antes de qualquer aplicação idempotente.

# Tick contínuo — FED-26 revalidação de fontes nominais Câmara (2026-08-18)

- Lock bounded adquirido e liberado; worktree limpa no início; nenhum writer concorrente.
- Revalidação read-only refez 7 GETs oficiais: API Câmara (histórico, perfil, legislatura 56) e 4 páginas nominais legadas (9002, 9003, 9224, 9227), todos HTTP 200.
- Hashes e bytes dos 4 eventos repetiram exatamente o catálogo oficial versionado; histórico 73482 repetiu 14 itens e legislaturas 51–56.
- Artefato: `data/legislative-import/camara/historical-event-reconciliation.json`.
- QA: `docs/qa/lote-camara-historical-event-source-revalidation-2026-08-18.md`.
- Nenhum voto, identidade, UUID, FK, source_reference, Supabase ou Cloudflare foi alterado. Os 4 `position=outro` permanecem fail-closed.
- O parser leve não extraiu linhas HTML (`fontana_rows=[]`); isso foi registrado como bloqueio, sem transformar HTTP 200 em prova de voto.
- Gates locais verdes: 73 arquivos / 347 testes, TypeScript, schema, data:check (1003 candidaturas / 988 fotos), build e diff check.
- Commit local `943fcd6` criado; push `origin/main` falhou duas vezes por DNS (`Could not resolve host: github.com`), portanto o deploy backup não foi disparado neste tick e `main` local está 1 commit à frente.
- Produção anterior continua sendo apenas verificada, não é prova de publicação deste commit.
- Chunk concluído: parser HTML nominal robusto offline + fixture sanitizada + contrato Vitest em `scripts/lib/camara-historical-html.mjs`, `scripts/__tests__/camara-historical-html.test.mjs` e `fixtures/legislative-import/camara-historical-nominal.html`.
- Gates deste chunk verdes: 74 arquivos/351 testes, TypeScript, schema, `data:check` (1003 candidaturas/988 fotos), build e `git diff --check`.
- QA: `docs/qa/lote-camara-historical-html-parser-2026-08-18.md`. Nenhuma escrita remota; os 4 casos `position=outro` permanecem fail-closed.
- Chunk seguinte concluído: os quatro GETs oficiais (`9002`, `9003`, `9224`, `9227`) foram refeitos com o parser; 4/4 HTTP 200, hashes/bytes coincidentes e linhas exatas de Henrique Fontana/RS extraídas (`Não`, `Obstrução`, `Obstrução`, `Não`).
- QA: `docs/qa/lote-camara-historical-parser-revalidation-2026-08-18.md`; artefato transitório `.orchestrator/runtime/camara-historical-scout/parser-revalidation-2026-08-18.json`.
- Nenhum voto/identidade/FK/source_reference foi aplicado. O bloqueio `FED25_CAMARA_HISTORICAL_REMOTE_IDENTITY_LOOKUP_BLOCKED_ROLE` permanece; próximo chunk é resolver cargo histórico oficial e validar FK remota por `tse_candidate_id`.

# Tick contínuo — rota histórica OpenAPI Câmara (2026-08-18)

- Lock bounded adquirido e liberado; worktree estava limpa antes do chunk.
- OpenAPI oficial da Câmara (`/api/v2/api-docs`) confirmou a rota `GET /deputados/{id}/historico`, descrita como histórico de mudanças no exercício parlamentar.
- Probe oficial do perfil Câmara `73482` respondeu HTTP 200 com 14 itens históricos, incluindo legislaturas 51–56; hash `e08beccf1b578c5929143268a8d4da814668447c3a55fb1066dad69514d574fb` e 7634 bytes registrados.
- `mandatosExternos` respondeu HTTP 200 com 2 mandatos de vereador em Porto Alegre/RS (1993–1999), sem ser usado como prova de voto federal.
- Revalidação posterior teve falhas DNS/timeout intermitentes; nunca foi interpretada como ausência.
- Nenhum voto, identidade, UUID, FK, source reference ou escrita remota foi criado. Os 4 casos `position=outro` seguem fail-closed.
- Artefato: `data/legislative-import/camara/historical-historical-route-probe.json`.
- QA: `docs/qa/lote-camara-historical-legislature-openapi-probe-2026-08-18.md`.
- Próximo chunk: refazer a rota histórica com DNS estável e reconciliar somente intervalos/eventos nominais exatos.
- Publicação verificada: backup Cloudflare `334951434`, run `32159903258`, `success`, `headSha=e1c06c742497610d4a7a3b95b742fcaf92747609`; produção HTTP 200 em `/release.json`, SHA e1c06c7, versão 0.2.332, 1003 candidaturas.

# Tick contínuo — rota estruturada de legislatura Câmara (2026-08-18)

- Lock bounded adquirido e liberado; worktree estava limpa antes do chunk.
- Reconhecimento read-only na API oficial Dados Abertos Câmara: `GET /deputados/73482` HTTP 200 confirma Henrique Fontana Júnior, PT-RS e último status na legislatura 56; `GET /legislaturas?itens=100` HTTP 200 confirma as janelas das legislaturas 54 e 55.
- A rota presumida `GET /deputados/73482/legislaturas` respondeu HTTP 405; consultas agregadas RS por `idLegislatura=54/55` responderam HTTP 504. O 504 foi tratado como indisponibilidade, nunca como ausência histórica.
- Nenhum voto, identidade histórica, UUID, FK, source reference ou escrita remota foi criado. Os 4 casos `position=outro` permanecem fail-closed.
- Artefatos transitórios/hash: `.orchestrator/runtime/camara-historical-scout/`.
- QA: `docs/qa/lote-camara-historical-legislature-route-scout-2026-08-18.md`.
- Status mantido: `FED25_CAMARA_HISTORICAL_REMOTE_IDENTITY_LOOKUP_BLOCKED_ROLE`.
- Próximo chunk: consultar o OpenAPI oficial e testar rotas de histórico/mandato e paginação agregada menor.

# Release verification — evidência histórica Câmara (2026-08-18)

- Commit `faef2fdd499d3d2877e9ab7acc9aababd8cedd9b` confirmado em `origin/main`.
- Workflow backup Cloudflare `334951434`, run `32155139013`, concluiu `success` com `headSha` idêntico ao commit.
- Produção `https://rs.votopraquem.org` respondeu HTTP 200; `/release.json` confirmou SHA `faef2fdd499d3d2877e9ab7acc9aababd8cedd9b`, versão `0.2.328` e snapshot com 1003 candidaturas.
- Próximo tick: continuar somente a descoberta read-only de rota histórica estruturada; não aplicar os 4 casos `position=outro`.

# Tick contínuo — evidência oficial de cargo histórico Câmara (2026-08-18)

- Lock bounded adquirido e liberado; worktree estava limpa antes do chunk.
- Busca oficial localizou o perfil Câmara `73482` de Henrique Fontana; GETs diretos ao perfil e à variante anual `?ano=2014` foram registrados com HTTP, bytes e SHA-256 em `.orchestrator/runtime/camara-historical-scout/henrique-fontana-official-profile-probe.json`.
- A API aberta atual respondeu HTTP 200 com `data=[]`; não foi interpretada como ausência histórica.
- A página confirma `HENRIQUE FONTANA JÚNIOR` e `PT - RS`, mas não fornece, neste chunk, prova estruturada suficiente para alterar `position=outro` no remoto. Nenhuma escrita de identidade/voto/FK ocorreu.
- QA: `docs/qa/lote-camara-historical-role-evidence-2026-08-18.md`.
- Bloqueio mantido: `FED25_CAMARA_HISTORICAL_REMOTE_IDENTITY_LOOKUP_BLOCKED_ROLE`.
- Próximo chunk elegível: localizar rota histórica estruturada de legislatura/mandato no portal Câmara e revalidar cargo/período; manter os 4 casos fail-closed.

# STATE — eleicao2026

Atualizado: 2026-08-18 14:55 UTC
Status: `FED25_CAMARA_HISTORICAL_REMOTE_IDENTITY_LOOKUP_BLOCKED_ROLE`

## Tick contínuo — lookup remoto nominal Câmara (2026-08-18)

- Lock bounded adquirido e liberado; worktree limpa antes do chunk.
- Doctor smoke com Node 24.19.0: `OK=53 WARN=4 FAIL=0`; warnings: OpenCode ausente, Gemini legacy, Ollama sem preflight e rota opcional.
- Projeto remoto conferido: ref `hhqxhxcfkoijevxyzfky`; `supabase migration list --linked` alinhado até `20260816100000`.
- Consulta read-only por `tse_candidate_id` em lote de 20: 92 registros `matched_exact`, 20 IDs únicos, 20 linhas remotas, 0 ausentes.
- 4 ocorrências de Henrique Fontana ficaram bloqueadas porque o remoto classifica `position=outro`; não foi inferido cargo histórico. Os 10 `ambiguous` e 40 `not_found` continuam fail-closed.
- Artefato: `data/legislative-import/camara/historical-nominal-remote-identity-lookup.json`.
- QA: `docs/qa/lote-camara-historical-remote-identity-lookup-2026-08-18.md`.
- Backup remoto `334951434` disparado manualmente como run `32153053432`; `gh run watch --exit-status` concluiu verde em 42s, com build e deploy Cloudflare verdes. A consulta posterior `gh run view` sofreu falha intermitente de `api.github.com`, mas `/release.json` em produção confirma SHA completo `135213b7cf98433300de48d70d79083ce6d19935` e HTTP 200.
- Próximo chunk: manter os 4 casos `position=outro` bloqueados e pesquisar classificação histórica oficial Câmara; não aplicar votos até cargo/UF, proposição, data e fonte permanecerem exatos.

## Tick contínuo — reconciliação local nominal Câmara (2026-08-18)

- Lock bounded adquirido e liberado; nenhum writer concorrente. A reconciliação foi somente contra o snapshot público versionado.
- Dos 142 registros RS do dry-run: 92 `matched_exact`, 10 `ambiguous`, 40 `not_found` por `full_name`/`ballot_name` normalizados.
- Artefato: `data/legislative-import/camara/historical-nominal-local-reconciliation.json`; nenhum `tse_candidate_id` foi promovido a envelope aplicável e nenhuma escrita remota ocorreu.
- QA atualizado: `docs/qa/lote-camara-historical-nominal-dry-run-2026-08-18.md`.
- Commits `70aa5a0` e `1d68a09` foram publicados com sucesso em `origin/main` após uma segunda tentativa; a primeira falhou por DNS de `github.com`.
- Produção respondeu `HTTP 200` em `https://rs.votopraquem.org`.
- API do GitHub ficou intermitente: listagem de workflows funcionou, mas o disparo manual do backup `334951434` falhou por conexão a `api.github.com`; não afirmar run/deploy deste commit sem confirmação.
- Próximo chunk: lookup remoto read-only por `tse_candidate_id` somente para os 92 matches exatos, com conferência de cargo/UF e proposição/data/evento; 50 casos permanecem fail-closed.

## Tick contínuo — extração nominal histórica Câmara em dry-run (2026-08-18)

- Lock bounded adquirido e liberado; nenhum writer concorrente. Worktree limpa antes do chunk; `HEAD=4dccdd4fbc6151c9b1821cf010356f08e1690c3a`.
- As seis páginas nominais catalogadas foram refeitas sequencialmente: 6/6 HTTP 200, bytes e SHA-256 coincidentes.
- Parser fail-closed extraiu 142 registros RS de 32 nomes distintos, preservando proposição, `numvot`, data oficial, parlamentar, UF, voto e URL completa.
- Envelope dry-run: `data/legislative-import/camara/historical-nominal-vote-dry-run.json`; `candidate_tse_ids=0`, `remote_apply=false`, nenhuma FK/UUID/matriz/RPC criada.
- QA: `docs/qa/lote-camara-historical-nominal-dry-run-2026-08-18.md`.
- Próximo chunk: reconciliação read-only dos 142 registros por nome oficial exato contra `full_name`/`ballot_name` e `tse_candidate_id`, mantendo ausências/ambiguidades fail-closed.

## Tick contínuo — catálogo oficial de fontes nominais Câmara (2026-08-18)

- Lock bounded adquirido e liberado; nenhum writer concorrente. Worktree limpa no início; `HEAD=97da6805f917227c6d0dbfe5364ddc27eafaede4`.
- Fichas oficiais Câmara HTTP 200 confirmaram PEC 6/2019 (`2192459`) com `ideVotacao=9002,9003` e PL 3723/2019 (`2209381`) com `ideVotacao=9224..9227`.
- As seis páginas nominais oficiais responderam HTTP 200; bytes e SHA-256 foram coletados e versionados em `data/legislative-import/camara/historical-nominal-vote-source-catalog.json`.
- Nenhuma identidade, voto, FK, source reference, matriz ou escrita remota foi criada. O catálogo declara `dbf_code_to_numvot_mapping=not_individually_asserted` e `identity_reconciliation=pending`.
- QA: `docs/qa/lote-camara-historical-source-catalog-2026-08-18.md`.
- Workflow backup `334951434` não foi disparado automaticamente; foi acionado manualmente após o push e está `queued` no run `32148409007`, com `headSha=1f73e401d4e2f038bc890a4727f4a34aa52ef569`. Produção respondeu `HTTP 200`; o próximo tick deve aguardar/validar a conclusão e o `headSha` do deploy.
- Próximo chunk: refazer GET das seis páginas a partir do catálogo, validar hash/bytes e extrair registros nominais somente com proposição/data/identidade exatos, em dry-run.

## Tick contínuo — reconciliação offline DBF Câmara (2026-08-18)

- Lock bounded adquirido e liberado; nenhum writer concorrente. Worktree estava limpa no início; `HEAD=9f5efda32b3c9c508bdea6f92281768a3e523595`.
- Revalidação local dos seis DBFs oficiais: 186 registros RS, 19 correspondências únicas por arquivo, 10 nomes ausentes e 2 nomes ambíguos recorrentes. Nenhuma identidade ou voto foi inferido.
- PL 3723/2019: `CD190396`–`CD190400`, `NUMVOT` 9224–9227, 2019-11-05. PEC 6/2019: `CD190242`–`CD190244`, `NUMVOT` 9002–9003, 2019-08-07.
- QA: `docs/qa/lote-camara-historical-dbf-recon-2026-08-18.md`.
- Gates locais verdes: 73 arquivos / 347 testes, TypeScript, schema, `data:check` (1003 candidaturas / 988 fotos), build e `git diff --check`.
- Commits locais `fe58376` e `5e02763` criados. Push tentou três vezes e falhou por DNS (`Could not resolve host: github.com`); `origin/main` permanece em `9f5efda`. Produção respondeu HTTP 200.
- Scout oficial localizou o índice DBF da Câmara e confirmou a ficha PEC 6/2019; fetch direto neste shell falhou por DNS antes do HTTP. Nenhuma saída externa virou dado.
- Próximo chunk: repetir o fetch oficial quando DNS estiver disponível e localizar o catálogo histórico que ligue `NUMVOT` aos eventos/identidades, mantendo fail-closed.

## Tick contínuo — download e inspeção DBF Câmara (2026-08-18)

- Lock bounded adquirido e liberado; nenhum writer concorrente. Worktree limpa no início; `HEAD=15637a5fe95fa1bfcc92df6818a979b395399e5b`.
- Seis URLs oficiais da Câmara foram baixadas sequencialmente com HTTP 200. Cada DBF tem 44.312 bytes, 513 registros e SHA-256 individual no manifesto `data/legislative-import/camara/historical-dbf-manifest.json`.
- Schema comum inspecionado: `NUMVOT`, `NOME_PAR`, `VOTO`, `PARTIDO`, `ESTADO`; 31 registros RS por arquivo. Nenhum voto foi importado ou inferido.
- Brutos ficam somente em `.orchestrator/runtime/camara-historical-dbf/`; não entram no snapshot público.
- `npm run orch:doctor -- --smoke` com Node 24.19.0 iniciou e passou os checks visíveis, mas excedeu o timeout do supervisor durante probe externo; processos do tick foram encerrados. Registrar como bloqueio de verificação do executor.
- QA: `docs/qa/lote-camara-historical-dbf-evidence-2026-08-18.md`.
- Próximo chunk: reconciliação offline exata de `NUMVOT`/nome/voto contra proposição, data e catálogo TSE/remoto; manter ambiguidades fail-closed.
- Gates locais pós-manifesto: 73 arquivos/347 testes, TypeScript, schema, `data:check` (1003 candidaturas/988 fotos), build e `git diff --check` passaram. Commit local `841f2b0` criado; duas tentativas de push falharam por DNS de `github.com`. Produção respondeu `HTTP 200`.

## Tick contínuo — catálogo oficial DBF Câmara (2026-08-18)

- Lock bounded adquirido; nenhum writer concorrente; `HEAD=eb4d145d589dd75447e58e3209f36d3f0e28928d`, worktree limpa no início.
- `npm run orch:doctor -- --smoke` no shell cron falhou apenas pelo Node `v22.22.2`; o projeto exige Node `>=24 <25`. `npm run data:check` com Node `v24.19.0` passou: 1003 candidaturas e 988 fotos.
- Pesquisa oficial encontrou o índice DBF da 56ª Legislatura e URLs nominais para PL 3723/2019 (`CD190400`, `CD190398`, `CD190397`, `CD190396`) e PEC 6/2019 (`CD190242`, `CD190244`).
- A reunião oficial `58528` confirma nominal do PL 3723/2019 em 05/11/2019; `evento-legislativo/56938` é rota de sessão de 20/08/2019, não prova nominal individual exata do gap.
- Nenhum voto, UUID, hash, source reference ou identidade foi inferido; nenhuma escrita remota foi executada.
- Gates locais verdes: 73 arquivos/347 testes, TypeScript, schema, data-check, build e `git diff --check`.
- Commit local `facea44` publicado com sucesso: `main -> origin/main`; `git ls-remote` confirmou o mesmo SHA remoto.
- Produção respondeu `HTTP 200` em `https://rs.votopraquem.org` após o push. Consulta `gh run list` ficou bloqueada temporariamente por erro de conexão com `api.github.com`; não foi possível confirmar o run do workflow backup neste tick.
- QA: `docs/qa/lote-camara-historical-dbf-recon-2026-08-18.md`.
- Próximo chunk: baixar sequencialmente os DBFs oficiais, versionar manifesto de HTTP/bytes/SHA-256 e inspecionar sem aplicar.

## Tick contínuo — recuperação ALRS/Câmara bounded — 2026-08-18

- Lock adquirido e worktree confirmada limpa; nenhum writer concorrente.
- `npm run orch:doctor -- --smoke` passou com Node 24.19.0: OK=53, WARN=4, FAIL=0. O shell cron iniciou Node 22.22.2; a execução foi corrigida apenas no processo com `nvm use 24.19.0`.
- Backfill ALRS bloqueado por `FED-17: JWT issued at future`; nenhuma escrita remota.
- Auditoria legislativa read-only: exit 2; ALRS 3985/4000, Câmara 195/197, Senado 0/455 votos com fonte.
- Pesquisa oficial encontrou rota histórica Câmara para PL 3723/2019 (`evento-legislativo/56938` e texto Escriba), mas sem prova nominal individual exata; nenhum voto foi inferido.
- QA: `docs/qa/lote-continuous-ops-camara-alrs-2026-08-18.md`.
- Commit local `9ee011d` criado; `git push origin main` bloqueado por DNS (`Could not resolve host: github.com`). Produção também não pôde ser validada (`curl` HTTP 000 por timeout de resolução). Workflow backup confirmado remotamente como `334951434`, mas não disparado sem push.
- Próximo chunk: reconciliar rota oficial de votação nominal Câmara com os dois eventos pendentes; manter ALRS fail-closed até JWT válido.

## Tick contínuo — recuperação ALRS com fallback direto — 2026-08-18

- As cinco páginas oficiais ALRS do manifesto FED-17 foram refeitas por `curl` direto: HTTP 200, bytes, SHA-256 e contagem `data-item` coincidiram exatamente com o manifesto.
- `web_extract` sofreu 504 nessas páginas; o fallback direto funcionou. A saída do scraper não foi usada como dado.
- `npm run impact:alrs:sources:backfill` permaneceu verde em dry-run, mas sem plano aplicável: 2 eventos elegíveis, 0 votos, 0 fontes, 3 eventos bloqueados e 1 identidade bloqueada.
- Câmara: endpoints oficiais testados para os dois gaps históricos (`2192459`, `2209381`) retornaram HTTP 404; nenhum voto foi inferido.
- QA: `docs/qa/lote-alrs-source-recovery-2026-08-18.md`.
- Próximo chunk: comparar os `data-item` oficiais já validados com os eventos remotos e preparar plano somente com coincidência exata; em paralelo, localizar rota histórica Câmara oficial.

## Tick contínuo — 2026-08-18 08:57 UTC

- Infra local corrigida para Node `v24.19.0`; `npm run orch:doctor` passou com
  `OK=50 WARN=4 FAIL=0`. O primeiro FAIL era apenas o shell em Node 22.
- Gates locais passaram: **73 arquivos / 347 testes**, TypeScript, schema,
  `data:check` (**1003 candidaturas / 988 fotos**), build e `git diff --check`.
- Auditoria legislativa read-only encontrou **4652 votos**: ALRS 3985/4000,
  Câmara 195/197, Senado 0/455 com fonte. `--strict` segue fail-closed (exit 2).
- Backfill ALRS em dry-run: 2 eventos elegíveis, 0 fontes/votos planejados, 3
  eventos bloqueados e 1 identidade bloqueada. Nenhuma escrita remota.
- QA atualizado em `docs/qa/lote-continuous-ops-2026-08-18.md`.
- Próximo chunk: recuperar somente evidência oficial dos eventos ALRS elegíveis
  e auditar os 2 votos Câmara sem fonte; não executar `--apply` sem hash, bytes,
  URL, identidade, proposição e data exatos.
## Atualização FED-21 — envelope Câmara Q1 com identidades resolvidas (2026-08-18)

- Gate remoto read-only resolveu 24/24 FKs `candidates.id` por `tse_candidate_id`.
- Envelope factual consolidado com 7 proposições, 10 versões, 10 eventos e 190 votos.
- Oito identidades `identity_pending` permaneceram fora; nenhuma heurística foi usada.
- `npm run impact:dryrun data/legislative-import/camara/collector-2026-q1/resolved-envelope.json` passou.
- Nenhuma matriz de impacto/RPC foi executada; o writer factual aplicou somente dados Câmara com fonte.
- QA: `docs/qa/fed21-camara-q1-envelope-resolvido-2026-08-18.md`.
- Auditoria read-only encontrou 27 URLs Câmara HTTP 200 com hash; 27 `source_references` foram cadastradas idempotentemente.
- Writer aplicou 7 proposições, 10 versões, 10 eventos e 190 votos com 24 FKs remotas; terceira execução registrou 0 inserções, 0 updates e 0 votos tocados.
- Próximo chunk: materializar perfis Câmara e auditar cobertura; 8 identidades permanecem `identity_pending`.

## Atualização FED-22 — perfis nominais pós-Câmara Q1 (2026-08-18)

- `build-vote-profile.mjs --apply` executado duas vezes: 4197 votos indexados e 38 perfis.
- Distribuição: ALRS 4000, Câmara 197, Senado 455; separação `(candidate_id, house)` preservada.
- Nenhuma matriz, score, claim ou RPC editorial foi criado.
- QA: `docs/qa/fed22-vote-profiles-after-camara-q1-2026-08-18.md`.

## Correção do supervisor — fallback Hermes (2026-08-18)

- Tick manual do job falhou porque o fallback configurado era `gemini-2.5-flash`, modelo HTTP 404 para novos usuários.
- Fallback obsoleto removido do perfil `eleicao2026`; primário permanece `openai-codex/gpt-5.6-luna`.
- Rotação gratuita continua nos CLIs read-only do projeto (`opencode_free_pool`/scouts), sem depender do Gemini legado.
- `scripts/orchestrator/doctor.sh` agora falha se `gemini-2.5-flash` voltar ao fallback.

## Atualização FED-23 — lacunas históricas Câmara (2026-08-18)

- Os 2 votos Câmara sem fonte são PEC 6/2019 e PL 3723/2019.
- API oficial confirmou proposições 2192459 e 2209381, mas não retornou votação correspondente nas janelas trimestrais consultadas.
- Mantidos fail-closed; próximo scout deve buscar endpoint histórico/Diário da Câmara.
- QA: `docs/qa/fed23-camara-historical-source-gaps-2026-08-18.md`.

## Tick contínuo — revalidação histórica Câmara (2026-08-18 16:43 UTC)

- Lock bounded adquirido e liberado; worktree limpa no início; doctor com Node 24.19.0 passou `OK=53 WARN=4 FAIL=0`.
- Revalidação read-only oficial: `GET /deputados/73482/historico` HTTP 200, 14 itens, 7634 bytes, SHA-256 idêntico ao probe anterior `e08beccf1b578c5929143268a8d4da814668447c3a55fb1066dad69514d574fb`.
- `GET /legislaturas/56` respondeu HTTP 200 (226 bytes, SHA `e2df6500daab1e958f992cb609b669f0dc7c8ce024c05099242b99549722b1a6`) e o perfil `/deputados/73482` HTTP 200 (927 bytes, SHA `4cd0dfc2d3f6234919c088baf22316f02b0ac63cb6b976a95b786202e9c4f654`).
- Nenhum voto, identidade, UUID, FK, source reference ou escrita remota foi criado. Os 4 casos `position=outro` permanecem fail-closed.
- Artefato transitório: `.orchestrator/runtime/camara-historical-scout/revalidation-2026-08-18.json`.
- QA: `docs/qa/lote-camara-historical-revalidation-2026-08-18.md`.
- Commit `e2f4d98f71e71c69e40bbe14421ad9de0ab120bf` publicado; backup Cloudflare `334951434`, run `32161920563`, concluiu `success` com `headSha` idêntico; produção `/release.json` respondeu HTTP 200 com SHA confirmado e versão `0.2.334`.
- Próximo chunk: localizar ligação oficial exata entre eventos nominais pendentes, proposição, data, parlamentar/UF e voto; não promover por legislatura isolada.

## Atualização do fluxo contínuo — orquestração federal v2

- Supervisor durável ativo: `eleicao2026-continuous-progress`, job Hermes `c4278be3a8a5`, recorrência `every 15m`, workdir da worktree real, lock `.orchestrator/runtime/locks/continuous-progress.lock`.

- `docs/architecture/proposta-orquestracao-votacoes-federais-v2.md` passou a `active_continuous_orchestration`.
- `routing.yaml` agora define `continuous_progress`, ausência de espera entre gates e rota `public_data_reconnaissance`.
- Scouts CLI podem pesquisar portais oficiais em paralelo, somente read-only, retornando manifest/handoff; o writer único continua preservado.
- Bloqueios de identidade, fonte, schema ou segurança pausam apenas a mutação do item e disparam coleta segura, nunca espera passiva por prompt.
- Autorização do usuário cobre GitHub, Supabase e Cloudflare, mas Gate R0 e identidade remota continuam obrigatórios.

## Atualização FED-17 — Gate R0 identidade remota (2026-08-18)

- `supabase/.temp/project-ref` e `supabase projects list` coincidem em `hhqxhxcfkoijevxyzfky`, projeto `eleicao2026`, São Paulo.
- `supabase migration list` confirmou migrations locais/remotas alinhadas até `20260816100000`.
- Subgate seguinte: consultar `information_schema`, `candidates.tse_candidate_id` e tabelas legislativas no mesmo banco, sempre read-only.
- Nenhuma escrita remota foi executada.
- QA: `docs/qa/fed17-supabase-remote-identity-2026-08-18.md`.

## Atualização FED-18 — scout Câmara read-only (2026-08-18)

- Pool gratuito confirmou pipeline oficial existente e nenhum writer foi acionado.
- `/api/v2/deputados/{id}/votacoes` retornou HTTP 405 para os quatro IDs Câmara resolvidos; endpoint geral sofreu timeout.
- Não repetir a rota 405 nem interpretar timeout como ausência de votações.
- Próximo chunk: localizar rota oficial alternativa ou usar somente `vote-id` oficial conhecido, sempre dry-run.
- Descobridor read-only implementado em `scripts/discover-camara-vote-ids.mjs`; HTTP 405/timeout agora retornam `blocked` e código 2, nunca lista vazia válida.
- QA: `docs/qa/fed18-camara-scout-2026-08-18.md`.

## Atualização FED-19 — Câmara Q1/2026 dry-run (2026-08-18)

- Descobertos 100 eventos na janela trimestral; 10 nominais e 90 sem individualização.
- Coletados 268 votos RS em 10 envelopes; todos os 10 passaram `impact:dryrun`.
- 35 votos têm parlamentar remoto resolvido; 233 permanecem `identity_pending`.
- Artefatos derivados versionados; bruto removido e nenhum Supabase/RPC/matriz foi alterado.
- QA: `docs/qa/fed19-camara-q1-dry-run-2026-08-18.md`.
- Próximo chunk: resolver os 233 votos por `tse_candidate_id`, sem fuzzy matching.

## Atualização FED-17 — recuperação parcial ALRS (2026-08-18)

- Manifesto oficial com 5 páginas, URLs e hashes versionado em `data/legislative-import/alrs-fed17/recovery-manifest.json`.
- `scripts/backfill-alrs-missing-sources.mjs` implementado em dry-run por padrão, com `--apply` restrito a evidência exata.
- Aplicados 10 `source_reference_id` em 10 votos (`alrs_pl134_2023` e `alrs_pl77_2025`); segunda execução criou/atualizou zero.
- Auditoria pós-aplicação: 3985/4000 votos ALRS com fonte; 15 sem fonte.
- PL165, PL361, PL38 e Enio permanecem bloqueados por divergência, ambiguidade ou identidade ausente.
- QA: `docs/qa/fed17-alrs-source-recovery-2026-08-18.md`.

## Atualização FED-20 — reconciliação Câmara Q1 (2026-08-18)

- `scripts/reconcile-camara-q1-identities.mjs` consultou a rota oficial de votos e gerou `identity-reconciliation.json`.
- 32 deputados distintos: 24 correspondências exatas únicas e 8 `identity_pending`.
- Nenhum voto foi aplicado; próximo chunk: envelope factual somente dos 24 resolvidos, com fontes Câmara verificadas.
- QA: `docs/qa/fed20-camara-identity-reconciliation-2026-08-18.md`.

## Atualização de retomada — nova instrução Câmara (2026-08-17)

- O `../dataset2026` adicionou o task packet `hermes-task-deputados-federais-comparacao-v1.md`.
- A nova frente é `camara-deputados-federais-impact-comparison-v1`; `FED-0`
  (auditoria/read-only) foi concluída nesta sessão, sem escrita remota.
- O snapshot público atual foi revalidado localmente com 1.003 candidaturas,
  incluindo 434 candidatos a deputado federal.
- Consulta remota somente leitura confirmou: Câmara 3 eventos, 3 votos e 1 perfil;
  total 1.264 proposições, 1.347 eventos, 3.936 votos e 14 perfis.
- Cruzamento oficial conservador encontrou 23 correspondências exatas RS↔TSE e
  411 identidades pendentes; piloto futuro: Fernanda Melchionna, Maria do Rosário,
  Osmar Terra, Alceu Moreira e Afonso Hamm.
- A auditoria encontrou riscos já previstos no packet: agregação de perfil por
  candidato (em vez de candidato+casa), `maybeSingle()` no fetch e fonte ALRS
  hardcoded no dossiê. Esses riscos foram corrigidos na FED-1; FED-2 ainda não foi iniciado.
- Documento: `docs/qa/camara-federal-adaptacao-auditoria.md`.

## Atualização FED-1 — perfis multi-house (2026-08-17)

- FED-1 concluída: perfis agora são `voting_profiles[]`, indexados por
  `(candidate_id, house)` e exibidos em seções independentes por casa.
- Dry-run/aplicação do indexador: 3.481 votos, 14 perfis; remoto validado com
  `camara=1`, `alrs=13` e 0 duplicidades por `(candidate_id, house)`.
- Suíte: 305 testes passando; TypeScript, schema, data-check, build e smoke local
  verdes.
- QA: `docs/qa/fed1-multi-house-voting-profiles-2026-08-17.md`.
- FED-2 continua pendente para separar saldo nominal de impacto.

## Atualização FED-2 — fato versus impacto (2026-08-17)

- FED-2 concluída: o domínio agora expõe `nominal_balance` separado de
  avaliação de impacto; a coluna remota legada `profile_score` permanece apenas
  como compatibilidade de leitura.
- `interpretFactualVote` exige assessment para derivar alinhamento; sem
  assessment o voto permanece factual e `nao_avaliado`.
- Salvaguardas para `defending_vote=null`, `unclear`, ausência e `sem_dado`
  cobertas por testes.
- QA: `docs/qa/fed2-factual-vs-impact-2026-08-17.md`.
- Próximo arco: FED-3 — catálogo Câmara ↔ candidato TSE.

## Atualização FED-3 — catálogo Câmara ↔ candidato TSE (2026-08-17)

- FED-3 concluída para o catálogo institucional determinístico.
- API oficial retornou 513 deputados; o snapshot federal tem 434 candidaturas.
- Catálogo publicado com 22 correspondências `official_name_exact` e 412
  entradas `identity_pending`.
- Pendências não foram tratadas como ausência de mandato; históricos exigem
  consulta individual/histórica antes de vínculo.
- QA: `docs/qa/fed3-camara-candidate-catalog-2026-08-17.md`.
- Próximo arco: FED-4 — coletor oficial da Câmara em piloto/dry-run.

## Atualização FED-4 — coletor oficial Câmara (2026-08-17)

- FED-4 concluída no gate de piloto/dry-run; coletor somente leitura criado.
- Evento `2580259-24`: 425 registros brutos, nominal individualizado, 29 votos
  normalizados no recorte RS, 1 registro não normalizável.
- Envelope factual validado pelo importer existente: 1 proposição, 1 versão,
  1 evento e 29 votos; nenhum campo de impacto/alinhamento.
- Bruto fica local e ignorado pelo Git; manifesto e envelope são versionados.
- QA: `docs/qa/fed4-camara-collector-2026-08-17.md`.
- Próximo arco: FED-5 — lote factual piloto de 3–5 candidatos.

## Atualização FED-5 — lote factual piloto Câmara (2026-08-17)

- FED-5 concluída em dry-run com quatro vínculos seguros: Fernanda Melchionna,
  Maria do Rosário, Afonso Hamm e Osmar Terra.
- Pacote: 1 proposição, 1 versão, 1 evento e 4 votos factuais.
- Marcel van Hattem permanece somente como `regression_fixture_identity_pending`;
  não foi transformado em vínculo TSE.
- Nenhuma identidade pendente entrou no envelope seguro; nenhuma escrita remota.
- QA: `docs/qa/fed5-camara-pilot-2026-08-17.md`.
- Próximo arco: FED-6 — matrizes `pending_review`, nunca publicação automática.

## Atualização FED-6 — pacote de impacto `pending_review` (2026-08-17)

- FED-6 concluída como pacote de revisão, sem aprovação/publicação.
- Matriz do PLP 230/2025/SBT-1: `unclear`, `defending_vote=null`, confidence
  0.55, fontes oficiais Câmara e nenhuma revisão registrada.
- Manifesto liga 4 candidatos a 4 votos factuais, sem score ou alinhamento.
- `public_approval=false`, `remote_apply=false`; nenhum RPC ou escrita remota.
- QA: `docs/qa/fed6-camara-impact-pending-review-2026-08-17.md`.
- Próximo gate: revisão humana editorial antes de qualquer aprovação.

## Atualização FED-7A — prontidão remota Câmara (2026-08-17)

- Catálogo de 4 fontes oficiais e SQL separado de `source_references` preparado.
- Nenhum UUID remoto foi inventado: 4 source refs e 4 candidatos seguem sem
  resolução remota nesta etapa.
- `factual_sql_generated=false`, `remote_apply=false`, `impact_apply=false` e
  `public_approval=false`.
- SQL factual fica bloqueado até lookup remoto por `tse_candidate_id` e resolução
  dos IDs reais de `source_references`.
- QA: `docs/qa/fed7a-camara-remote-readiness-2026-08-17.md`.
- Bloqueio operacional resolvido: Node 24.19.0 ativado e usado no gate remoto.

## Atualização FED-7B — carga factual Câmara (2026-08-17)

- Node 24.19.0 ativado para o gate remoto.
- Lookup remoto por `tse_candidate_id` resolveu 4 candidatos; 4 source refs
  existentes foram recuperadas por `content_hash`.
- Writer factual aplicou 1 proposição, 1 versão, evento já existente e 4 votos;
  segunda passagem criou 0 linhas.
- Evento ficou com 5 votos totais porque Marcel já existia como fixture anterior;
  não houve duplicidade dos 4 novos votos.
- `impact_rows_created=0`, RPC de aprovação não chamado e matriz permanece
  `pending_review`.
- QA: `docs/qa/fed7b-camara-factual-apply-2026-08-17.md`.
- Próximo gate: revisão editorial da matriz antes de qualquer aprovação.

## Atualização FED-8 — idempotência e coleta 2580259-27 (2026-08-18)

- Writer factual reexecutado: 0 novas linhas (idempotente).
- Coleta 2580259-27 (Redação Final): votação simbólica, 0 votos individuais;
  não gerou envelope. O coletor preservou o JSON bruto.
- Remoto: 5 votos no evento, 5 candidatos distintos, 0 matrizes impacto.
- QA: `docs/qa/fed8-camara-idempotency-2026-08-18.md`.
- Próximo arco: FED-9 — ampliação do lote com mais eventos nominos.

## Atualização FED-9 — bloqueio Senado e coleta 2580259-27 (2026-08-18)

- Coleta confirmou que PLP 230/2025 Câmara tem apenas dois eventos:
  2580259-24 (nominal) e 2580259-27 (simbólica).
- `2580259-13` e `2580259-15` retornam 404 — não existem.
- Redirecionando verificação remota: evento 2580259-24 conclui com 5 votos
  (4 do lote + Marcel), 0 impact_rows, 0 RPC, worktree limpa, build/IDÊNTRICO
  e produção HTTP 200 em `ef77a57`.
- API do Senado `dados-legislacao` retorna 403 em todos os endpoints testados;
  `dadosabertos.senado.leg.br` exige autenticação (401).
- Próximo foco viável: ALRS nominais via
  `transparencia.al.rs.gov.br/parlamentares/votos-plenario` (HTML server-side).
- QA: `docs/qa/fed9-senado-block-2026-08-18.md`.

## Atualização FED-10 — votos nominais ALRS (2026-08-18)

- Coleta oficial processou 526 data-items de 7 deputados ALRS; 0 pending_matches.
- Envelope versionado: 102 proposições, 491 eventos e 526 votos nominais.
- Writer existente `scripts/import-senator-votes.mjs` aplicou os votos por `tse_candidate_id`; reaplicação idempotente não aumentou o conjunto.
- Remoto confirmado: 522 eventos ALRS, com os 491 eventos do envelope presentes; 7 candidatos TSE resolvidos.
- Nenhuma matriz de impacto foi criada ou alterada.
- QA: `docs/qa/fed10-alrs-nominal-2026-08-18.md`.
- Próximo gate: materializar/revalidar perfis nominais ALRS, sem score de impacto.

## Atualização FED-11 — perfis nominais ALRS (2026-08-18)

- `build-vote-profile.mjs --apply` materializou 4.007 índices factuais e 18 perfis por `(candidate_id, house)`.
- Remoto confirmou 13 perfis ALRS e 4.000 votos agregados; sem duplicidades novas.
- Perfil deriva somente contagens nominais; nenhuma matriz de impacto foi criada ou alterada.
- QA: `docs/qa/fed11-alrs-vote-profiles-2026-08-18.md`.
- Próximo gate: revisão de cobertura/exposição pública dos perfis ALRS.

## Atualização FED-12 — cobertura pública dos perfis ALRS (2026-08-18)

- Auditoria encontrou que `fetchAllCandidates()` não carregava `legislator_vote_profile`; a consulta individual já carregava.
- Corrigido com consulta em lote por candidatos, preservando `(candidate_id, house)` e sem alterar fatos/impacto.
- Teste direcionado: 29 testes passando; TypeScript passou.
- Smoke inicialmente encontrou carregamento bloqueado; lotes de 100 IDs foram paralelizados com `Promise.all`.
- Smoke final: 1002 cards, 0 falhas HTTP, 0 erros de console online e service worker pronto.
- QA: `docs/qa/fed12-public-alrs-profile-coverage-2026-08-18.md`.
- Próximo gate: validar smoke do dossiê/coleção após publicação.

## Atualização FED-13 — smoke público dos perfis ALRS (2026-08-18)

- Smoke de produção passou com 1002 cards, 0 falhas HTTP, 0 erros de console online, slug canônico, rota legada e offline.
- Dossiê de Adão Pretto Filho respondeu HTTP 200 e exibiu perfil nominal, Assembleia Legislativa do RS e fonte institucional ALRS.
- Nenhuma escrita remota, matriz de impacto ou aprovação editorial nesta fase.
- QA: `docs/qa/fed13-production-alrs-profile-smoke-2026-08-18.md`.
- Próximo gate: ampliar a cobertura de perfis ALRS para candidatos com múltiplas casas, sem misturar saldos nominais.

## Atualização FED-14 — cobertura multi-house (2026-08-18)

- Auditoria remota encontrou 18 perfis em 18 candidatos e 0 candidatos com mais de uma casa.
- Os 13 perfis ALRS permanecem separados por `house`; nenhum caso ALRS+Câmara foi inventado.
- Contrato local multi-house validado com 31 testes direcionados.
- QA: `docs/qa/fed14-multi-house-coverage-2026-08-18.md`.
- Próximo gate: repetir validação quando houver candidato real com duas casas.

## Atualização FED-15 — cobertura de fontes legislativas (2026-08-18)

- Auditor read-only criado em `scripts/audit-legislative-source-coverage.mjs` e comando `npm run impact:sources:audit`.
- Remoto: 93 `source_references`; 1398 versões, 1869 eventos e 4462 votos.
- ALRS: 31/1282 versões com fonte, 31/1678 eventos com fonte e 3975/4000 votos com fonte; 25 votos permanecem sem vínculo.
- Senado segue sem fontes nos registros históricos, conforme bloqueio FED-9.
- Nenhuma fonte artificial foi criada; modo `--strict` retorna código 2 quando há lacunas.
- A fila read-only agrupou os 25 votos ALRS sem fonte em 5 eventos para recuperação oficial; nenhum backfill foi aplicado.
- QA: `docs/qa/fed15-legislative-source-coverage-2026-08-18.md`.
- Próximo gate: capturar evidência oficial suficiente para os 25 votos ALRS sem fonte antes de qualquer backfill.

## Atualização FED-16 — plano de recuperação ALRS (2026-08-18)

- A fila de recuperação permanece somente diagnóstico e fail-closed.
- Eventos pendentes: `alrs_pl134_2023`, `alrs_pl165_2025`, `alrs_pl361_2025`, `alrs_pl38_2026` e `alrs_pl77_2025`.
- Critério de conclusão: obter HTML oficial/hash e URL por evento, revalidar candidato/evento e só então preparar dry-run de backfill.

## Checkpoint mais recente — migração de sessão (2026-08-17)

- Último commit: `85d7031` (`feat: exibir claims e perfil de votações no dossiê`).
- Produção live: release `0.2.275`, SHA `85d7031`; CI/deploy `32014969028` verde.
- Causa corrigida: fallback do snapshot descartava claims remotas; frontend não consultava `legislator_vote_profile`.
- UI agora combina snapshot + claims remotas por `tse_candidate_id` e exibe perfil nominal no dossiê com fonte ALRS.
- Verificação live real: Marcel van Hattem exibiu claims, 3 votos, 2 Sim, 1 Não e fonte ALRS.
- Worktree deve permanecer limpa após versionar este handoff.
- A pasta solicitada `../database2026` não existe; a fonte disponível consultada é `../dataset2026`.
- Handoff completo: `docs/handoff/2026-08-17-migracao-sessao-plano-implementacao.md`.
- Próximo arco: ALRS-0/ALRS-1/ALRS-2 e UI-1 conforme o planejamento externo; relatórios ALRS continuam staging, não fonte canônica automática.

## Checkpoint remoto — votos nominais ALRS + refinamento editorial (2026-08-17)

- Redesign publicado em `a4d1025`; pipeline factual ALRS aplicado no Supabase remoto.
- Importer `scripts/import-alrs-votes.mjs` criado como dry-run estrito: captura
  `data-item`, preserva HTML/SHA-256, exige catálogo ALRS→TSE e registra match
  ausente como pendência sem gerar voto.
- `SiteHeader`, `CandidateCard` e `CandidateSearch` receberam o primeiro bloco
  incremental do refinamento editorial, sem mudar dados nem estrutura de claims.
- Node 24.19.0: doctor smoke 54 OK, 2 WARN, 0 FAIL; `tsc`, schema,
  `data:check`, build e suíte completa 302/302 verdes.
- Portal ALRS respondeu HTTP 200 em 42/42 consultas sequenciais para 7 IDs
  catalogados por correspondência exata; 3456 `data-item`, 3453 votos, 0
  pendências e 3 duplicidades idempotentes.
- Supabase remoto: 3936 `legislative_votes`, 1264 proposições, 1264 versões,
  1347 eventos e 93 fontes; segunda passagem do importer inseriu 0 linhas.
- Perfis materializados com paginação completa: 3481 itens de índice e 14 perfis.

## Fase 3 (iniciada 2026-08-15)
- Schema: migration `20260815030000_candidate_profiles_and_election_results.sql` aplicada (db push) → tabelas `election_results`, `candidate_profiles` no remote ✅
- ETL `scripts/import-candidate-profiles.mjs`: 246 claims `pending_review` aplicados (49 bens declarados + 197 redes sociais) via service_role idempotente (dedupeAndInsert). Visible pra editors; anon vê só 281 published ✅
- Dados originais: bem_candidato (188 rows/49 candidatos), rede_social (197 URLs/69 candidatos), deepseek_json (22 perfis profundos) — do mirror `../dataset2026/`
- ⚠️ resultados eleitorais de outubro ainda não existem; a tabela `election_results` permanece preparada. O portal possui 3936 votos nominais legislativos factuais em `legislative_votes`.
- 📊 cobertura perfil: 49/49 bens, 68/69 redes sociais mapeadas pro snapshot (1 social SQ_CANDIDATO não no snapshot — fora do array)
- Drift: `claims.content_hash` NOT unique no remote (local tem constraint; ETL usa lookup prévio — não bloqueia)

## Orquestração MOA v2 (a partir de 2026-08-15)
- `scripts/moa-run.mjs` DEFAULT_CHAIN: openai/gpt-5.5 → `agy google-ai-pro` (read-only snapshot) → cf-ai-gateway/gpt-4o-mini → free pool → ollama
- Antigravity CLI `agy 1.1.12` autorizado como executor paralelo read-only sobre `git archive HEAD` (falhas não param Hermes). Teste ad-hoc: inspecionou data/ JSONs sem mutar.
- Removidas refs a `google/gemini-3.5-flash` read-only chain (substituída por `agy:google-ai-pro`). gemini CLI legacy mantido só pra account enterprise explícita.
- routing.yaml atualizado: `google_antigravity` com data_scope (snapshot + never secrets)

## Pipeline de Enrichment de Claims via AGY (iniciado 2026-08-15)

- Executor: Antigravity CLI (`agy`) com chave `ANTIGRAVITY_API_KEY` em `data/antigravity-key.txt` (nova chave recebida 2026-08-15).
- Modelo: Gemini 3.5 Flash (Low) via `ANTIGRAVITY_AGENT_MODEL`.
- Estrutura: blocos de 25 candidatos/pedido, prompts gerados por `scripts/generate-block-prompt.py`, output salvo em `.orchestrator/runtime/blocks/block-NNN-output.txt`.
- Ingestão: `scripts/import-agy-block.mjs` resolve UUID do candidato pelo `tse_candidate_id` no snapshot e insere claims como `pending_review` via `service_role` (key em `/home/lourenco/Projetos/raspador-candidados-2026/.env`).
- Blocos 0–4 executados e importados: 171 claims `pending_review` injetadas para 125 candidatos.
- Documentação do pipeline: `docs/usage/agy-enrich-blocks.md`.
- Blocos 5–40 (36 blocos × 25 = 900 candidatos restantes): prompts gerados.
- **Progresso real (2026-08-16, checkpoint FINAL):** TODOS os 41 blocos (0–40) gerados via AGY e importados no Supabase como `pending_review`, cobertura de ~1002 candidatos, **0 erros de importação** nos blocos restantes. Bloco 0 teve 21 erros de candidato-ausente-no-snapshot (7 slugs do AGY não constam em `public-candidates.json`).
- Causa raiz do `exit=46` descoberta: AGY em `--mode=plan --sandbox` tenta `read_file` fora do snapshot → headless auto-nega → output vazio → exit=46. Não-determinístico. Solução: `scripts/retry-agy-blocks.sh` (1 bloco por vez, retry 4x). Paralelismo massivo derruba o AGY (timeout DNS).
- ComparePage: filtro de cargos implementado (dropdown com `OFFICIAL_POSITIONS`: deputado_federal, deputado_estadual, governador, vice_governador, senador).
- Problemas resolvidos: exit=46 no bloco 1 (output corrompido → reprocessado com nova chave); erro DNS `lh3.googleusercontent.com` no bloco 3 (reprocessado, exit=0); compatibilidade padding 3 dígitos resolvida com symlinks `block-NNN-output.txt` → `block-N-output.txt`; `import-agy-block.mjs` lê `block-NNN-output.txt` (padStart 3).
- Próximo: aprovar claims com alta confiança via `approve-all-claims.mjs` após todos os blocos gerados.

## Selo de versão (produção)
- `/release.json`: version `0.2.240`, short_sha `9a359dd`, row_count 1003
- Header canto superior direito: **Versão 0.2.240** (0.2.{git rev-list count}; CI fix com fetch-depth:0 + GITHUB_RUN_NUMBER)
- Fix: CI shallow checkout via actions/checkout@v7 fazia git-rev-list count=1 → fallback 0.2.0. fetch-depth:0 + GITHUB_RUN_NUMBER exportados.

> Checkpoint operacional. Ao retomar, revalide Git, ambiente e somente os serviços necessários.

## Retomada recomendada

- Sessão sugerida: `eleicao2026-pos-fase2-matrizes-reais`.
- Ler primeiro:
  1. `AGENTS.md`;
  2. este `STATE.md`;
  3. `docs/handoff/2026-08-12-fechamento-fase2-proxima-sessao.md`;
  4. `docs/context-export/SCHEMA.md`.
- Revalidar no início:
  - `git status --short --branch`
  - `git rev-parse --short HEAD`
  - `npm run data:check`

## Git / produção

- Repositório: `Snerolino/eleicao2026`.
- Branch de produção: `main`.
- HEAD local: `a261771 chore: auditar claims coletadas antes da publicação`; produção funcional: `a4d1025`.
- Deploy desta sessão: wrangler pendente + push via fine-grained PAT (rede sandbox bloqueou github.com no shell; usuário fez push manual).
- Página `/impacto` publicada: exibe matriz `plp-230-2025-sbt-1-approved.json`.
- **Scrape pós-inscrição (2026-08-15)**: `consulta_cand_2026.zip` + `foto_cand2026_RS_div.zip` baixados do TSE oficial. Snapshot: **1002 candidaturas** (era 938). Novos: gov 6 (+1), vice-gov 6 (+1), dep fed 434 (+59), dep est 520 (+3), outro 24, sen 12.
- Fotos: 988/1002 oficiais TSE 2026; 14 sem foto (dep federais tardios faixa 2100025519xx, SOLIDARIEDADE/PRD — TSE não publicou, sem fabricar).
- Selos oficiais: 1002/1002 com `photo_source_url` TSE 2026 no snapshot; 1000/1002 no Supabase (extra 210002533050 preservado sem fonte 2026 por decisão anterior).
- Claims: 2650 published, 33 `pending_review` não públicas, 0 published sem fonte.

## Dados públicos atuais

- Fonte oficial TSE RS 2026 atualizada em **2026-08-15** via scrape pós-fim de inscrições.
- Manifesto TSE: 1002 registros oficiais (RS).
- Snapshot público: **1003 candidaturas** (era 938 no checkpoint 2026-08-12).
- Exclusão humana preservada: `FRANCISCO MARQUES NETO` e extras sem correspondência.
- Fotos rastreáveis: **988/1003**.
  - 984 matches exatos no ZIP oficial TSE 2026 por `SQ_CANDIDATO`.
  - 4 fallbacks conservadores de fonte oficial TSE 2024.
  - 14 sem match (dep federais tardios faixa 210002548xxx/5519xx, SOLIDARIEDADE/PRD — TSE não publicou).
- Selos oficiais (fonte TSE 2026): **1003/1003 candidaturas** com `photo_source_url`.
- Selo de versão pública: `0.2.{N}` (contador de commits / GITHUB_RUN_NUMBER no CI), exibido no canto superior direito do header (`/release.json`).
  - `docs/qa/fotos-candidatos-fontes-oficiais.md`
  - `docs/qa/fotos-pendentes-2026-08-12.md`
  - `docs/qa/fotos-pendentes-2026-08-12.json`
  - `docs/qa/fotos-pendentes-divulgacand-2026-08-12.json`

## Fase 2 da Matriz de Impacto — fechada

Status: `FECHADA`

Entregas concluídas e publicadas:

- Contrato operacional público de import legislativo com envelope
  `propositions[]` / `votes[]`.
- Importer dry-run legislativo.
- CLI `npm run impact:dryrun`.
- CLI `npm run impact:sql`.
- Gerador SQL determinístico/offline.
- Resolução de FKs de apoio por catálogo, sem heurística e sem fabricar UUID.
- Fixtures e testes do contrato mínimo.
- Migrations da Matriz de Impacto aplicadas no Supabase remoto.
- Grants/RLS públicos corrigidos e validados por REST anon.
- Context export atualizado.
- Produção Cloudflare atualizada e validada.

## Supabase remoto

- Projeto: `eleicao2026`.
- Ref público: `hhqxhxcfkoijevxyzfky`.
- URL pública: `https://hhqxhxcfkoijevxyzfky.supabase.co`.
- Migrations aplicadas:
  - `20260810090000_create_legislative_core.sql`
  - `20260810090100_create_impact_taxonomy.sql`
  - `20260810090200_create_impact_matrix.sql`
  - `20260810090300_create_impact_review_workflow.sql`
  - `20260810090400_create_impact_rls_and_approval.sql`
  - `20260812000000_grant_public_read.sql`
- Prova REST anon já realizada:
  - `beneficiary_groups`: 14 grupos.
  - `impact_matrices`: `[]` por RLS, esperado enquanto não há matriz aprovada.
  - `legislative_propositions`: HTTP 200 `[]`, esperado antes de carga real.
  - `approve_impact_matrix`: HTTP 401 para anon, esperado.

## Gates finais verdes

- `npm run test`: verde.
- `npx tsc --noEmit`: verde.
- `node scripts/validate-impact-schema.mjs`: verde.
- `npm run data:check`: verde, 1003 candidaturas / 988 fotos oficiais.
- `npm run build`: verde.
- `npm run smoke:local`: verde, 938 cards.
- `npm run smoke:preview -- --url https://rs.votopraquem.org`: verde.
- `npm run health:preview -- --url https://rs.votopraquem.org`: verde,
  `blocks_release=false`, HTTP failures 0.
- GitHub Actions `Deploy`: verde.

## Próximo arco funcional

`eleicao2026-pos-fase2-matrizes-reais`:

Checkpoint já realizado:

- Primeiro pacote real Câmara criado para `PLP 230/2025` / votação `2580259-24`.
- Voto factual de Marcel van Hattem (`candidate.id` `abdfe5f9-52ab-561f-aec5-afe475423fb9`) registrado como `nao` em dry-run.
- Arquivos:
  - `data/legislative-import/camara/plp-230-2025-votacao-2580259-24-marcel-van-hattem.json`
  - `data/legislative-import/camara/plp-230-2025-votacao-2580259-24-catalog.json`
  - `docs/handoff/2026-08-14-primeiro-pacote-real-impacto-dryrun.md`
- `impact:dryrun`, `impact:sql` e testes focados verdes.
- Correção local: resolução de deputado→candidato agora preenche `candidate_id`; `legislator_id` permanece `null` enquanto não houver tabela própria de legisladores.
- Source references oficiais do pacote PLP 230/2025 inventariadas em:
  - `data/legislative-import/camara/plp-230-2025-votacao-2580259-24-sources.json`
- CLI local criada:
  - `npm run impact:sources -- <sources.json>` gera catálogo local sem UUID inventado.
  - `npm run impact:sources -- --emit-sql <sources.json>` gera SQL revisável para `source_references` sem executar Supabase.
  - `npm run impact:sources -- --resolve-from-file /tmp/source-reference-ids.json <sources.json>` resolve catálogo a partir de IDs retornados por Hermes/CLI depois de autorização.
- Handoff de gate remoto criado:
  - `docs/handoff/2026-08-14-source-references-plp-230-pronto-para-gate.md`
- Gate remoto parcial autorizado/executado: upsert de 4 `source_references`
  oficiais no Supabase remoto, validação anon `source_references=4`.
- Catálogo do pacote atualizado com UUIDs reais em `sourceReferenceByKey`.
- SQL legislativo final regenerado em `/tmp/plp-230-legislative-import-resolved-sources.sql`, sem `null /* source_references */` e sem executar.
- Tentativa autorizada de aplicar SQL factual legislativo falhou com FK `legislative_votes_candidate_id_fkey`, porque `candidates` remoto ainda não contém `tse_candidate_id=210002547819` (`MARCEL VAN HATTEM`).
- Verificação pós-erro confirmou inserção parcial zero: `legislative_propositions=0`, `proposition_versions=0`, `voting_events=0`, `legislative_votes=0` para o pacote.
- Diagnóstico remoto: `candidates` tem 793 linhas; snapshot público versionado tem 938 candidaturas públicas.
- Handoff do bloqueio:
  - `docs/handoff/2026-08-14-gate-legislativo-bloqueado-candidato-remoto-ausente.md`
- Gate autorizado 1–6 executado depois do bloqueio:
  - candidato `MARCEL VAN HATTEM` sincronizado/upsertado remotamente por `tse_candidate_id=210002547819`;
  - total remoto `candidates`: 794;
  - SQL factual legislativo do pacote PLP 230/2025 aplicado;
  - validação remota: `candidate=1`, `legislative_propositions=1`, `proposition_versions=1`, `voting_events=1`, `legislative_votes=1`;
  - `impact_matrices_total=0`, `impact_matrices_approved=0`.
- Handoff do sucesso:
  - `docs/handoff/2026-08-14-gate-factual-plp-230-aplicado.md`
- Primeira matriz real criada:
  - `impact_matrices.id`: `4c8eaec1-8ee4-4027-939c-2d391b8f9cbe`
  - proposição: `camara-proposicao-2580259-plp-230-2025`
  - versão: `sbt-1-plen-2026-08-12`
  - `review_status`: `pending_review`
  - `severity`: 2
  - `structural_type`: `budgetary`
  - assessment: `pessoas_com_deficiencia`, `impact_direction=unclear`, `confidence=0.55`, 3 fontes.
  - `impact_reviews_count=0`, `approved_count=0`.
- Arquivos:
  - `data/impact-matrices/plp-230-2025-sbt-1-pending-review.json`
  - `docs/handoff/2026-08-14-primeira-matriz-real-pending-review.md`
- Candidatos remotos sincronizados com o snapshot público via `scripts/sync-candidates-snapshot.mjs --apply`:
  - snapshot público: 938 candidaturas;
  - remoto `candidates`: 939 linhas;
  - faltantes do snapshot no remoto: 0;
  - extra remoto preservado/fora do snapshot: `210002533050`;
  - `MARCEL VAN HATTEM` segue presente (`tse_candidate_id=210002547819`).
- Atalho adicionado: `npm run data:sync:supabase -- --apply`.
- Handoff: `docs/handoff/2026-08-14-sync-candidatos-remotos-snapshot-publico.md`.
- Primeira matriz real revisada/aprovada/publicada por RLS:
  - `impact_matrices.id`: `4c8eaec1-8ee4-4027-939c-2d391b8f9cbe`;
  - `review_status`: `approved`;
  - `approved_at`: `2026-08-14 17:30:34.389823+00`;
  - reviews remotos: 2 (`curadoria_interna=approved`, `painel_externo=approved`);
  - assessment público anon: 1;
  - reviews continuam ocultos para anon (`42501`).
- Arquivo versionado atual da matriz: `data/impact-matrices/plp-230-2025-sbt-1-approved.json`.
- Handoff: `docs/handoff/2026-08-14-primeira-matriz-real-approved-publicada.md`.

Próximos passos:

1. ~~Expor/consumir a matriz aprovada na UI pública~~ — CONCLUÍDO: página `/impacto` em produção.
2. Criar relatório QA da primeira publicação de matriz real — EM ANDAMENTO.
3. Decidir separadamente o destino do registro remoto extra `210002533050` (não público); não remover sem gate específico.
4. Planejar próximo pacote legislativo real mantendo o fluxo validado: fontes → factual → matriz pending → reviews → approve RPC.
5. Análises dos candidatos (claims): revisar `pending_review` via `editorial-workflow.mjs` e publicar via RPC `publish_claim`. Service role disponível como `SUPABASE_SECRET_KEY` (perfil eleicao2026 `.env`); usar com cautela, só o necessário.

Não inserir matriz publicada automaticamente. O estado inicial de qualquer matriz real deve ser `pending_review` e com fontes.
Lourenço autoriza/decide/revisa evidências; não precisa executar SQL nem escrever
no Supabase. Execução remota autorizada fica a cargo do Hermes/CLI, com logs e
validação.

## Fora do escopo já fechado

Não retomar como pendente:

- Aplicar migrations da Fase 2.
- Corrigir grants base para RLS público.
- Atualizar Cloudflare Pages para o fechamento da Fase 2.
- Atualizar candidatos oficiais TSE para 938 públicos.
- Investigar existência das 32 fotos pendentes atuais.

## Hermes / executores

- Hermes continua sendo o control plane.
- Codex MCP historicamente teve bloqueio 401 em parte da sessão; se necessário,
  revalidar antes de delegar escrita.
- OpenCode/Antigravity/free pool trabalham apenas sobre snapshot `git archive HEAD`,
  sem secrets, raw docs ou PII.
- Um writer por worktree.

## Gates permanentes

Sem autorização humana explícita própria, não fazer:

- migration Supabase remota;
- alteração RLS/RPC/Auth/Storage/Edge Function remota;
- secrets/credenciais;
- deploy Cloudflare;
- DNS/domínio;
- commit/push/PR/merge quando a autorização do arco não cobrir a ação.

`service_role` nunca entra no frontend, build, logs ou docs.

## Tick contínuo — scout de rota histórica oficial Câmara (2026-08-18 17:54 UTC)

- Lock bounded adquirido e liberado; worktree estava limpa no início; nenhum writer concorrente.
- Índice oficial de votações nominais da 56ª Legislatura confirmou a rota determinística dos DBFs dos dois gaps: PEC 6/2019 (`CD190242`, `CD190244`, 07/08/2019) e PL 3723/2019 (`CD190396`–`CD190400`, 05/11/2019).
- API oficial confirmou a proposição `2209381` como PL 3723/2019 e a tramitação da PEC `2192459`; tramitação não foi tratada como prova nominal individual.
- Artefato: `data/legislative-import/camara/historical-official-route-scout.json`.
- QA: `docs/qa/lote-camara-historical-official-route-scout-2026-08-18.md`.
- Nenhum voto, identidade, UUID, FK, source_reference, matriz ou escrita remota foi criado. Os quatro casos `position=outro` continuam fail-closed.
- Bloqueio real: DNS direto do shell para `dadosabertos.camara.leg.br` falhou; `web_extract` foi apenas fallback de reconciliação de rota, sem hash/bytes novos dos DBFs.
- Próximo chunk: refazer os seis GETs oficiais dos DBFs, verificar HTTP/bytes/SHA-256 contra o catálogo e reconciliar somente registros nominais exatos.


## Tick contínuo — revalidação dos DBFs nominais Câmara (2026-08-18 18:13 UTC)

- Lock bounded adquirido e liberado; worktree limpa antes do chunk; nenhum writer concorrente.
- Os seis GETs oficiais dos DBFs (`CD190242`, `CD190244`, `CD190396`, `CD190397`, `CD190398`, `CD190400`) responderam HTTP 200, 44.312 bytes cada, com SHA-256 6/6 idênticos ao catálogo versionado.
- Artefato transitório: `.orchestrator/runtime/camara-historical-scout/dbf-revalidation-2026-08-18.json`; QA: `docs/qa/lote-camara-historical-dbf-revalidation-2026-08-18.md`.
- Nenhum voto, identidade, UUID, FK, `source_reference`, matriz ou escrita remota foi criado. Os quatro casos `position=outro` permanecem fail-closed.
- Próximo chunk: reconciliar somente registros nominais com identidade oficial exata, proposição e data correspondentes; não aplicar ambiguidades.


## Release verification — revalidação DBFs Câmara (2026-08-18)

- Backup `334951434` run `32169951790` concluiu `success`, `headSha=b08eab0baf602ecb6ac8d188dcf758444fbaf664`; build e deploy backup verdes.
- Produção respondeu HTTP 200, mas o `/release.json` consultado imediatamente após o run ainda retornou SHA anterior `4fb426b...`; a propagação final deste commit requer nova verificação após o commit de QA/STATE.


## Release verification final — revalidação DBFs Câmara (2026-08-18)

- Commit `8302b29608d8b3e8fe6ca434fde2a8d27c193e82` foi publicado; backup `334951434`, run `32170124260`, concluiu `success`.
- Produção respondeu HTTP 200 e `/release.json` confirmou o mesmo SHA, versão `0.2.342`.
- Worktree permaneceu limpa após a verificação.

## Tick contínuo — reconciliação de cargo/UF nominal Câmara (2026-08-18 18:36 UTC)

- Lock bounded adquirido e liberado; worktree limpa antes do chunk; nenhum writer concorrente.
- Entrada `historical-nominal-remote-identity-lookup.json`: 92 registros `matched_exact`, SHA-256 `47c8f8528e613d7377a8a87b536aa77d0d67953fe6e2db042561d98faa28c551`.
- Gate read-only de cargo/UF: 84 registros elegíveis (`deputado_federal`, RS), 18 `tse_candidate_id` únicos.
- 8 registros permanecem bloqueados: Sanderson (4, remoto `senador`) e Henrique Fontana (4, remoto `outro`).
- Artefato: `data/legislative-import/camara/historical-role-reconciliation.json`; QA: `docs/qa/lote-camara-historical-role-reconciliation-2026-08-18.md`.
- `remote_apply=false`; nenhum voto, FK, UUID, source_reference, matriz, RPC, Supabase ou Cloudflare foi alterado.
- Próximo chunk: construir/auditar envelope factual dry-run dos 84 elegíveis, provar idempotência local e manter os 8 bloqueados fail-closed.

## Release verification — reconciliação de cargo/UF Câmara (2026-08-18)

- Commit `9d942c18e215c67267b013efeee45b1ceee6c194` publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32172065273`, concluiu `success` com `headSha` idêntico.
- Produção respondeu HTTP 200; `/release.json` confirmou SHA `9d942c18e215c67267b013efeee45b1ceee6c194` e versão `0.2.344`.
- Worktree estava limpa após o primeiro release; esta atualização documental requer novo commit/release.

## Tick contínuo — envelope histórico Câmara resolvido em dry-run (2026-08-18)

- Lock bounded adquirido e liberado; nenhum writer concorrente.
- Novo builder determinístico `scripts/build-camara-historical-resolved-envelope.mjs` e contrato Vitest criados; comando `npm run impact:camara:historical:envelope:build` executado.
- Resultado: 2 proposições, 6 eventos, 84 votos, 18 identidades elegíveis; somente `matched_exact` com cargo remoto `deputado_federal` e UF RS.
- Oito registros permanecem fail-closed: Sanderson (`senador`) e Henrique Fontana (`outro`). Nenhuma identidade foi inferida.
- Auditoria oficial: 7 URLs HTTP 200; os seis hashes nominais repetiram exatamente o catálogo (`6/6`).
- Idempotência local provada: segunda execução manteve SHA-256 idêntico do envelope e catálogo.
- Nenhuma escrita Supabase/Cloudflare, FK, UUID, source_reference, voto publicado ou matriz foi aplicada.
- Artefatos: `data/legislative-import/camara/historical-resolved-envelope.json`, `historical-resolved-catalog.json` e `historical-resolved-source-manifest.json`.
- QA: `docs/qa/lote-camara-historical-resolved-envelope-2026-08-18.md`.
- Gates focados verdes: builder, auditoria de fontes e 3 testes Vitest; doctor smoke registrou `FAIL` apenas pelo shell Node 22, corrigível com Node 24.19.0 disponível via `nvm use 24`.
- Próximo chunk: executar gates locais completos em Node 24 e revisar contrato/identidade/schema/FK antes de qualquer SQL remoto.

## Release verification — envelope histórico Câmara resolvido (2026-08-18)

- Commit `c1295745b58383dd6a59947a64d3595f4deb2edd` publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32174553709`, concluiu `success` com `headSha` idêntico.
- Produção respondeu HTTP 200; `/release.json` confirmou o mesmo SHA e versão `0.2.346`, snapshot 1003 candidaturas.
- QA atualizado com a evidência de publicação; nenhuma escrita legislativa remota foi feita.
- Próximo chunk elegível: auditoria de contrato e gate read-only de identidade/schema/FK dos 18 candidatos antes de qualquer SQL remoto.

## Tick contínuo — gate de contrato/schema/FK Câmara histórico (2026-08-18)

- Lock bounded adquirido e liberado; worktree limpa no início; nenhum writer concorrente.
- Builder determinístico refez o envelope: 2 proposições, 6 eventos, 84 votos, 18 identidades elegíveis.
- Teste focado passou: 1 arquivo, 3 testes; `validate-impact-schema.mjs` passou.
- Consulta read-only `information_schema` do Supabase confirmou `candidates.tse_candidate_id`, `legislative_votes.candidate_id`, `proposition_versions.text_hash` e referências de fonte no schema remoto.
- `impact:dryrun` falhou fechado com 212 erros reais: faltam `number`/`year` nas 2 proposições, `text_hash` nas 6 versões e os 84 votos usam `candidate_id`/`tse_candidate_id` fora do contrato v1.0.0 do planejador; as URLs ainda precisam de resolução em `source_reference_id` por catálogo/hash.
- Nenhum SQL, UUID, FK, source_reference, voto, proposição, evento ou matriz foi escrito remotamente.
- QA: `docs/qa/lote-camara-historical-contract-fk-gate-2026-08-18.md`.
- Bloqueio: adaptar o envelope ao contrato do planejador e resolver fontes/FKs por catálogo, sem promover os 8 registros bloqueados.
- Próximo chunk: implementar/testar o adaptador local fail-closed, depois repetir `impact:dryrun` e provar idempotência antes de qualquer writer remoto.

## Verificação de publicação — gate de contrato/schema/FK Câmara histórico

- Commit `3a25759` foi aceito pelo push (`00ae3d5..3a25759 main -> main`); tentativa adicional encontrou DNS intermitente.
- Produção respondeu HTTP 200 e `/release.json` confirmou `release_id=3a25759-20260818T192919494Z`, SHA completo `3a25759a0f614c9da2854fbb5be8f87568bd81c5` e snapshot de 1003 candidaturas.
- Workflow backup `334951434` foi identificado, mas a confirmação independente do run/`headSha` ficou bloqueada por `error connecting to api.github.com`.
- QA corrigido com a evidência real em `docs/qa/lote-camara-historical-contract-fk-gate-2026-08-18.md`.
- Próximo tick: revalidar `git ls-remote` e workflow backup quando a API GitHub voltar; depois implementar o adaptador local do envelope sem promover os 8 casos bloqueados.

## Tick contínuo — verificação do adaptador de contrato Câmara histórico (2026-08-18 22:25 UTC)

- Lock bounded adquirido e liberado; worktree limpa antes e depois; nenhum writer concorrente.
- Adaptador local fail-closed reexecutado com Node 24.19.0: 2 proposições, 6 versões, 6 eventos, 84 votos, 18 candidatos elegíveis e 7 fontes oficiais.
- `impact:dryrun` sobre envelope e catálogo adaptados passou com RC 0; plano sem escrita remota.
- Doctor smoke passou: `OK=53 WARN=4 FAIL=0`; gates completos passaram: 76 arquivos/359 testes, TypeScript, schema, `data:check` 1003 candidaturas/988 fotos, build e `git diff --check`.
- QA: `docs/qa/lote-camara-historical-contract-adapter-verification-2026-08-18.md`.
- Nenhum SQL, FK, UUID, source_reference, voto, matriz, RPC, Supabase ou Cloudflare foi escrito; oito registros inelegíveis permanecem fail-closed.
- Publicação verificada: commit `ac368980a0a0e0e7139720b235ab93cc10b15cf1` em `origin/main`; backup Cloudflare `334951434`, run `32192705790`, `success`, `headSha` idêntico; produção HTTP 200 e `/release.json` confirmou SHA completo e snapshot de 1003 candidaturas.
- Próximo chunk: auditoria read-only do catálogo remoto de `source_references` e FKs por `tse_candidate_id`, seguida de plano idempotente sem aplicar bloqueados.

## Tick contínuo — auditoria read-only do catálogo remoto Câmara histórico (2026-08-18 22:47 UTC)

- Lock bounded adquirido e liberado; worktree estava limpa antes do chunk; nenhum writer concorrente.
- Projeto remoto confirmado: ref `hhqxhxcfkoijevxyzfky`; `supabase migration list --linked` alinhado até `20260816100000`.
- Consulta read-only por URL e consulta independente por `content_hash` nas 7 fontes do manifesto: `0/7` correspondências exatas e `0/7` hashes encontrados; nenhum UUID remoto resolvido.
- QA: `docs/qa/lote-camara-historical-source-reference-catalog-audit-2026-08-18.md`.
- Nenhuma escrita Supabase/Cloudflare, SQL, FK, voto, proposição, evento, matriz ou RPC foi executada; 8 registros inelegíveis permanecem fail-closed.
- Bloqueio real: o catálogo remoto ainda não possui as 7 referências; não é seguro preencher `source_reference_id` nem aplicar o envelope.
- Próximo chunk: preparar plano idempotente de materialização das 7 `source_references`, revalidar identidade/schema/FK e somente então considerar `--apply`; não promover bloqueados.

## Release verification — auditoria read-only do catálogo remoto Câmara histórico (2026-08-18 22:49 UTC)

- Commit `3cd7be6ea4510f3547833e1e5e0952a3cdb2aba2` publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32194357763`, concluiu `success` com `headSha` idêntico ao commit.
- Produção respondeu HTTP 200 em `/release.json`; SHA `3cd7be6ea4510f3547833e1e5e0952a3cdb2aba2`, release `3cd7be6-20260818T224826675Z`, versão `0.2.355`, snapshot com 1003 candidaturas.
- Nenhuma referência histórica foi materializada remotamente; as 7 fontes continuam bloqueadas por ausência no catálogo e os 8 registros inelegíveis seguem fail-closed.
- Próximo chunk: preparar plano idempotente de `source_references` e repetir os gates de identidade/schema/FK antes de qualquer aplicação.

## Release verification — documentação do catálogo remoto Câmara histórico (2026-08-18 22:50 UTC)

- Commit `9871916949f21d34f3d9b717a2855d253afb7a7c` publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32194464071`, concluiu `success` com `headSha` idêntico ao commit.
- Após propagação/cache-busting, produção respondeu HTTP 200 em `/release.json` com SHA `9871916949f21d34f3d9b717a2855d253afb7a7c`, release `9871916-20260818T224958523Z` e snapshot de 1003 candidaturas.
- O catálogo remoto continua sem as 7 referências históricas; nenhum dado factual foi aplicado.
- Próximo chunk: preparar plano idempotente de `source_references` e repetir os gates de identidade/schema/FK antes de qualquer aplicação.

## Tick contínuo — plano idempotente de catálogo Câmara histórico (2026-08-18 23:15 UTC)

- Lock bounded adquirido e liberado; worktree limpa antes do chunk; nenhum writer concorrente.
- Manifesto oficial revalidado por comparação determinística: 7/7 URLs e hashes exatos no input do plano.
- Projeto remoto confirmado pelo CLI; migrations local/remoto alinhadas até `20260816100000`.
- `information_schema` read-only confirmou colunas de `source_references`, `candidates.tse_candidate_id` e tabelas legislativas.
- Consulta remota por URL + hash: 7 `missing`, 0 `hash_mismatch`, 0 UUID resolvidos.
- Criado `data/legislative-import/camara/historical-source-catalog-input.json`, somente dry-run-ready, sem UUID/FK/SQL/votos.
- Gates verdes: 76 arquivos/359 testes, TypeScript, schema, `data:check` (1003 candidaturas/988 fotos), build e `git diff --check`.
- Doctor smoke foi tentado com timeout de 180s; o shell do doctor detectou Node 22.22.2 apesar do PATH do processo e encerrou com timeout, sem mutação remota. Gates do projeto foram executados explicitamente com Node 24.19.0.
- QA: `docs/qa/lote-camara-historical-source-catalog-plan-2026-08-18.md`.
- Nenhuma referência, proposição, evento, voto, identidade, FK, matriz, Supabase ou Cloudflare foi escrita; os 8 casos inelegíveis permanecem fail-closed.
- Próximo chunk: executar dry-run remoto usando este input ou adaptar o writer histórico para aceitá-lo explicitamente; refazer GET/hash/bytes antes de qualquer `--apply`.

## Release verification — plano de catálogo Câmara histórico (2026-08-18)

- Commit `19b13448987a6f5d4ad738921920561088723b2d` confirmado em `origin/main`.
- Backup Cloudflare `334951434`, run `32196478017`, concluiu `success` com `headSha` idêntico.
- Produção respondeu HTTP 200; `/release.json` confirmou SHA `19b13448987a6f5d4ad738921920561088723b2d`, release `19b1344-20260818T231713881Z`, versão `0.2.358` e snapshot de 1003 candidaturas.
- Nenhuma referência histórica foi materializada remotamente; o catálogo permanece com 7 entradas ausentes e os 8 casos inelegíveis seguem fail-closed.
- Próximo chunk: dry-run remoto do input histórico, com revalidação oficial de URL/bytes/hash antes de qualquer aplicação idempotente.

## Tick contínuo — dry-run histórico Câmara e revalidação de fontes (2026-08-18)

- Lock bounded adquirido e liberado; nenhum writer concorrente.
- Node `v24.19.0` usado no chunk; o doctor executado no shell cron continua acusando Node 22, mas os gates do projeto foram executados explicitamente com Node 24.
- Adaptador local refez o envelope: 2 proposições, 6 versões, 6 eventos, 84 votos, 18 candidatos elegíveis, 7 fontes oficiais e 8 registros bloqueados.
- Auditoria oficial refez 7/7 GETs Câmara com HTTP 200; manifesto transitório registrou bytes e SHA-256 revalidados.
- `impact:dryrun` com envelope e catálogo adaptados passou RC 0; plano 2/6/6/84, nenhuma escrita remota.
- Artefatos transitórios em `.orchestrator/runtime/camara-historical-scout/`; QA: `docs/qa/lote-camara-historical-dry-run-source-revalidation-2026-08-18.md`.
- Nenhuma proposição, evento, voto, identidade, FK, `source_reference`, matriz, RPC, Supabase ou Cloudflare foi alterado; os 8 casos inelegíveis permanecem fail-closed.
- Próximo chunk: executar gates locais completos e publicar este checkpoint; depois auditar novamente o catálogo remoto e preparar writer idempotente das 7 referências, sem aplicar os bloqueados.

## Release verification — dry-run histórico Câmara e revalidação de fontes (2026-08-19)

- Commit `ccc44a1ee4bca20f0235ca9d2fd031b26aee9256` publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32199836179`, concluiu `success` com `headSha` idêntico.
- Produção respondeu HTTP 200; `/release.json` confirmou SHA completo, release `ccc44a1-20260819T000527903Z`, versão `0.2.362` e snapshot com 1003 candidaturas.
- Follow-up documental `af5318a87c6c8bf2d5a39cff5332e856007d8bc4` também foi publicado; backup `334951434`, run `32199939419`, concluiu `success` com `headSha` idêntico e produção confirmou o SHA final.
- Consolidação final `5e92d6ecff437c7e365fa00957ca87e84b80ce1c` foi publicada; backup `334951434`, run `32200089176`, concluiu `success` com `headSha` idêntico, produção HTTP 200 e `/release.json` confirmou release `5e92d6e-20260819T001012333Z`, versão `0.2.364` e snapshot com 1003 candidaturas.
- Próximo chunk: auditar novamente o catálogo remoto e preparar writer idempotente das 7 referências; nenhum dos 8 registros bloqueados pode ser promovido.

## Tick contínuo — writer idempotente de fontes históricas Câmara (2026-08-19 01:24 UTC)

- Lock bounded adquirido e liberado; nenhum writer concorrente.
- Doctor smoke com Node `v24.19.0`: `OK=53 WARN=4 FAIL=0`; OpenCode ausente e Ollama sem preflight continuam apenas warnings.
- Auditoria oficial `npm run impact:camara:sources:audit`: `7` URLs, todas HTTP 200; manifesto de bytes/SHA-256 regenerado.
- Writer em `scripts/apply-camara-q1-sources.mjs` ampliado para catálogo histórico explícito via `--input=`/`--manifest=`, dry-run por padrão, `--apply` explícito, paginação remota, revalidação pós-inserção e resolução somente de UUID + hash exatos.
- Teste focado criado: `5/5` verde. Gates completos: `77 arquivos / 364 testes`, TypeScript, schema, `data:check` (`1003` candidaturas/`988` fotos), build e diff check verdes.
- Dry-run histórico: `7` fontes planejadas, `7` validadas localmente, `remote_apply=false`, `inserted=0`, `votes_touched=0`.
- Nenhuma escrita Supabase, voto, proposição, evento, FK, identidade, matriz ou Cloudflare foi executada neste chunk; 8 identidades inelegíveis continuam fail-closed.
- Commit funcional em `origin/main`: `c90a371e0c56446fbb2e1865b6c51e58db57c4ac`.
- Produção ainda confirma o release anterior `50e484c5...` via `/release.json`; o run backup correspondente ao novo commit ainda não foi identificado/concluído neste tick.
- QA: `docs/qa/lote-camara-historical-idempotent-source-writer-2026-08-19.md`.
- Próximo chunk: verificar o workflow backup `334951434` para `headSha=c90a371...`, confirmar `/release.json`, depois executar dry-run do importador histórico factual sem promover os 8 bloqueados.

## Tick contínuo — verificação do dry-run factual histórico Câmara (2026-08-19 01:43 UTC)

- Lock bounded adquirido e liberado; nenhum writer concorrente.
- `HEAD`/`origin/main` confirmado em `5cac9a8a3cca5906f1178f55c575c84b99102d9b`.
- Backup Cloudflare `334951434`, run `32205537792`, concluiu `success` com `headSha` idêntico; run posterior `32205704978` foi `skipped`.
- Produção HTTP 200; `/release.json` confirmou SHA idêntico, versão `0.2.371` e snapshot de 1003 candidaturas.
- Builder histórico e auditoria oficial passaram: 2 proposições, 6 eventos, 84 votos, 18 identidades elegíveis; 7 URLs HTTP 200 com bytes/SHA-256 revalidados.
- `impact:dryrun` passou com plano 2/6/6/84 e nenhuma escrita remota.
- QA: `docs/qa/lote-camara-historical-dryrun-verification-2026-08-19.md`.
- Os 8 casos inelegíveis seguem fail-closed. Próximo chunk: auditar catálogo remoto e FKs por `tse_candidate_id`; materializar/aplicar somente após UUID/hash/schema/FK exatos.

## Release verification — dry-run factual histórico Câmara (2026-08-19)

- Commit `1c8fc0bcfef5fa2633143640844659c5fddabbff` foi publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32206014628`, concluiu `success` com `headSha` idêntico.
- Produção confirmada após o run: HTTP 200 em `/release.json`, SHA `1c8fc0bcfef5fa2633143640844659c5fddabbff`, versão `0.2.0`, snapshot com 1003 candidaturas.
- QA atualizado em `docs/qa/lote-camara-historical-dryrun-verification-2026-08-19.md`.
- Próximo chunk: auditar catálogo remoto e FKs por `tse_candidate_id`, mantendo os 8 casos inelegíveis fail-closed.

