# QA — Bloco votos RS completo (2026-08-16)

Status: PUBLICADO (rs.votopraquem.org HTTP 200)

## Fontes primárias
- Senado: `https://legis.senado.leg.br/parlam-servicosweb/api/v1/relatorios/votacoes-nominais/ano/{ano}/parlamentar/{id}` (PDF via oficial, convertido com pdftotext).
- ALRS: `matriz_impacto_v1_deputados_rs_2026.md` + `votacoes_plenario_alrs_2026.md` (../dataset2026, fonte oficial).

## Volume (auditado ao vivo)
| Métrica | Valor |
|---|---|
| legislative_votes | 483 |
| legislator_vote_index | 28 (com candidate_id) |
| legislator_vote_profile | 7 |
| legislators (lookup) | 3 (Mourão 6341, Heinze 1186, Paim 825) |
| senators votes | 455 |
| ALRS deputy votes | 25 |
| claims published | 2650 (0 sem fonte) |

## Scripts (versionados)
- scripts/parse-senado-votes.mjs — parser oficial Senado PDF->envelope.
- scripts/import-senator-votes.mjs — idempotente (select-then-insert), aceita candidate_tse_id x legislator_external_id, content_hash na source_references.
- scripts/build-vote-profile.mjs — materializa sim=+1/nao=-1/abstencao=ausente=0.

## Migrations
- supabase/migrations/20260816100000_legislators_lookup.sql (tabela legislators + idx).

## Decisão de projeto
- Senadores em exercício sem candidatura 2026 (Mourão/Heinze/Paim) indexam em legislators (voto fático registrado), NÃO em legislator_vote_profile (exigiu candidate_id). Votação nominal deles é auditável via legislative_votes, mas não gera perfil de candidato — correto, pois não são candidatos 2026.

## Auditoria de redundância
- 0 candidatos com múltiplos "summary".
- 0 content substring redundancy.
- 69 candidatos com source_url compartilhado entre claims → comportamento correto (ex.: TSE dados abertos citado por summary + financial_declarations + social_media, facts distintos).
