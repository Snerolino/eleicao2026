# STATE — eleicao2026

Atualizado: 2026-08-15 05:12 -03
Status: `SCRAPE_POS_INSCRICAO_1002_SELOS_VERSAO_PUBLICADOS`

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
- HEAD/produção atual: `a78e00e test: ajustar snapshot p/ fonte oficial TSE 2026 unificada (erani melo escapou)`.
- Deploy desta sessão: wrangler pendente + push via fine-grained PAT (rede sandbox bloqueou github.com no shell; usuário fez push manual).
- Página `/impacto` publicada: exibe matriz `plp-230-2025-sbt-1-approved.json`.
- **Scrape pós-inscrição (2026-08-15)**: `consulta_cand_2026.zip` + `foto_cand2026_RS_div.zip` baixados do TSE oficial. Snapshot: **1002 candidaturas** (era 938). Novos: gov 6 (+1), vice-gov 6 (+1), dep fed 434 (+59), dep est 520 (+3), outro 24, sen 12.
- Fotos: 988/1002 oficiais TSE 2026; 14 sem foto (dep federais tardios faixa 2100025519xx, SOLIDARIEDADE/PRD — TSE não publicou, sem fabricar).
- Selos oficiais: 1002/1002 com `photo_source_url` TSE 2026 no snapshot; 1000/1002 no Supabase (extra 210002533050 preservado sem fonte 2026 por decisão anterior).
- Claims: 281 publicadas, 0 pendentes.

## Dados públicos atuais

- Fonte oficial TSE RS 2026 atualizada em **2026-08-15** via scrape pós-fim de inscrições.
- Manifesto TSE: 1002 registros oficiais (RS).
- Snapshot público: **1002 candidaturas** (era 938 no checkpoint 2026-08-12).
- Exclusão humana preservada: `FRANCISCO MARQUES NETO` e extras sem correspondência.
- Fotos rastreáveis: **988/1002**.
  - 984 matches exatos no ZIP oficial TSE 2026 por `SQ_CANDIDATO`.
  - 4 fallbacks conservadores de fonte oficial TSE 2024.
  - 14 sem match (dep federais tardios faixa 210002548xxx/5519xx, SOLIDARIEDADE/PRD — TSE não publicou).
- Selos oficiais (fonte TSE 2026): **1002/1002 candidaturas** com `photo_source_url`.
- Selo de versão pública: `0.2.{N}` (contador de commits / GITHUB_RUN_NUMBER no CI), exibido como "Versão 0.2.298" no canto superior direito do header (`/release.json`).
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
- `npm run data:check`: verde, 938 candidaturas / 906 fotos.
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
