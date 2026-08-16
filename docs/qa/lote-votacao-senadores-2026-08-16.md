# QA — Bloco votação senadores (2026-08-16)

Status: PUBLICADO ✅

## Estado do Supabase remoto (auditado ao vivo)
- Claims publicadas: **2650**, **0 sem fonte** (regra absoluta ok).
- Bloco senadores fact-check reverso (`d598d2d` + `fdf6a18`): 30 claims publicadas, **22 com source_url primária**.
- Votos factuais (`688f922`): **3** (1 existente deputy PLP 230/2025 + 2 novos Marcel van Hattem).
- Perfis materializados (`build-vote-profile.mjs --apply`): **1** legislator_vote_profile.
- Vote index: **3** linhas (sim=+1 / nao=-1).

## Versionamento
| Build | Commit | Status | URL | HTTP |
|---|---|---|---|---|
| 31962890017 | 75df403 | SUCCESS (backup) | rs.votopraquem.org | 200 |
| 31974387630 | 688f922 | SUCCESS (backup) | rs.votopraquem.org | 200 |

## Evidence
- `scripts/import-senator-votes.mjs` idempotente (select-then-insert).
- `scripts/build-vote-profile.mjs` materializa sim=+1/nao=-1/abstencao=ausente=0.
- `data/senator-votes-initial.json` envelope versionado.

## Próximo passo
Continuar faturamento de votos de senadores (extrair da API do Senado via Antigravity quando snapshot Git permitir, ou incremental via cron).
