# Tick contínuo — FED-26 revalidação de fontes nominais Câmara (2026-08-18)

- Lock bounded adquirido e liberado; worktree limpa no início; nenhum writer concorrente.
- Revalidação read-only refez 7 GETs oficiais: API Câmara (histórico, perfil, legislatura 56) e 4 páginas nominais legadas (9002, 9003, 9224, 9227), todos HTTP 200.
- Hashes e bytes dos 4 eventos repetiram exatamente o catálogo oficial versionado; histórico 73482 repetiu 14 itens e legislaturas 51–56.
- Artefato: `data/legislative-import/camara/historical-event-reconciliation.json`.
- QA: `docs/qa/lote-camara-historical-event-source-revalidation-2026-08-18.md`.
- Nenhum voto, identidade, UUID, FK, source_reference, Supabase ou Cloudflare foi alterado. Os 4 `position=outro` permanecem fail-closed.
- O parser leve não extraiu linhas HTML (`fontana_rows=[]`); isso foi registrado como bloqueio, sem transformar HTTP 200 em prova de voto.
- Gates locais verdes: 73 arquivos / 347 testes, TypeScript, schema, data:check (1003 candidaturas / 988 fotos), build e diff check.
- Próximo chunk: parser HTML robusto offline + teste de contrato, depois nova coleta; não aplicar remoto sem identidade/cargo/UF/proposição/data/voto exatos.

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
