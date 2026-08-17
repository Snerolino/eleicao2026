# RELEASE — v1.5.0 Diferencial Votação Nominal RS (2026-08-16/17)

Status: **PUBLICADO** (rs.votopraquem.org HTTP 200, commit `621d3fe`)

## Sumário do release
1. Aviso "Sem dados públicos verificados" removido de todos os cards.
2. 483 votos nominais indexados (455 senadores + 28 candidatos ALRS/Câmara).
3. 33 claims `pending_review` de 48 deputados auditoria.
4. `verify-cli-output.mjs` recriado fail-closed (snapshot + --live).
5. Migration `legislators_lookup` aplicada + index de performance.

## Detalhes

### 1. CandidateCard sem aviso
`src/components/candidates/CandidateCard.tsx`: quando não há claim publicada, o card fica **vazio** (sem texto), mantendo apenas nome/partido/foto + link. `CandidateDossierPage` preserva seu fail-closed honesto.

### 2. Votação nominal — dados e scripts
| Fonte | Script | Volume | house |
|---|---|---|---|
| Senado Federal (API parlam-serviciosweb) | `scripts/parse-senado-votes.mjs` + `scripts/import-senator-votes.mjs` | 455 votos (112 props, 172 events) | senado |
| dataset2026/matriz_impacto `mulheres` | `data/deputies-votes-alrs.json` → `import-senator-votes.mjs` | 25 votos (7 deputadas) | alrs |
| Câmara/Marcel van Hattem | `data/deputies-votes-alrs.json` | 3 votos | camara |
| **Total** | | **483** | |

- `import-senator-votes.mjs`: idempotente (select-then-insert retry), aceita `candidate_tse_id` OU `legislator_external_id`, gera `content_hash` (sha1) em source_references.
- `scripts/build-vote-profile.mjs`: materializa `legislator_vote_index` + `legislator_vote_profile` (sim=+1, nao=-1, abstencao/ausente/obstrucao=0).
- 7 perfis publicados (28 votos com candidate_id).

### 3. Claims de auditória de deputados
- `scripts/import-deputies-audit.mjs`: converte `candidatos_deputados_estaduais_rs_2026.md` → claims `pending_review` (fail-closed: só para candidatos rastreados no snapshot, candidate_id resolvido via tse no Supabase).
- 33 claims `historico_politico` inseridas (fontes: TSE/DivulgaCand, TRE-RS, TCE-RS, ALRS, DJE, TJ-RS).

### 4. verify-cli-output.mjs (recovery)
- Snapshot: 1003 candidaturas, contrato `tse_candidate_id` único/não-nulo.
- Live: 2650 published claims → **0 sem fonte** (códigos 0/10/30/40).
- Fail-closed: NÃO publica sem fonte.

### 5. Circuit breaker (documentado em docs/qa)
- AGY headless (OpenCode free pool): HTTP 429 (rate-limit Drupal AJAX da ALRS).
- ww4.al.rs.gov.br: 504 + AJAX sem API pública.
- Fallback: `../dataset2026` (fonte curadora primária) → 25 votos da linha `mulheres`.
- Decisão: 483 é o teto factual. Não inventa voto. Senado é a fonte de votação nominal individual completa.

## Migrations aplicadas (Supabase remoto)
- `20260816100000_legislators_lookup.sql`: tabela `legislators` (house, external_id, full_name, party, term_start, term_end, source_reference_id) + idx.
- `20260816090400_legislator_vote_profile_index.sql` (já aplicada — checkpoint Fases 0-1).

## Estado de dados (Supabase remoto)
- `claims`: 2650 published (0 sem fonte), 33 pending_review.
- `legislative_votes`: 483 (455 legislator_id, 28 candidate_id, 0 sem source).
- `legislator_vote_index`: 28.
- `legislator_vote_profile`: 7.
- `legislators`: 3 (Mourão 6341, Heinze 1186, Paim 825).
- `source_references`: 69 com source_url compartilhado entre claims → comportamento correto (mesmo documento, facts distintos).

## Arquivos novo/modificado (este release)
- scripts/parse-senado-votes.mjs (criado)
- scripts/import-senator-votes.mjs (refatorado: legislator_id + content_hash + retry)
- scripts/build-vote-profile.mjs (materializa por candidate_id)
- scripts/import-deputies-audit.mjs (criado)
- scripts/verify-cli-output.mjs (recriado)
- supabase/migrations/20260816100000_legislators_lookup.sql
- data/senators-votes-rs.json, data/deputies-votes-alrs.json
- src/components/candidates/CandidateCard.tsx
- docs/qa/lote-votacao-rs-completo-2026-08-16.md, docs/qa/lote-votacao-rs-circuit-breaker-2026-08-16.md

## Deploy
- Build: `621d3fe-20260817T012520105Z`
- Backup Cloudflare Pages: SUCCESS (run 31984973787).
- rs.votopraquem.org: HTTP 200.
