# STATE — eleicao2026

Atualizado: 2026-08-17 -03
Status: `F5_ALRS_VOTOS_NOMINAIS_PUBLICADOS_UI_CORRIGIDA`

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
  hardcoded no dossiê. FED-1 ainda não foi iniciado.
- Documento: `docs/qa/camara-federal-adaptacao-auditoria.md`.

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
