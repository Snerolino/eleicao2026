# Lote ALRS — isolamento de identidade do evento PL 246/2020 — 2026-09-06

## Objetivo
Resolver fail-closed a colisão Vilmar Zanchin / PL 246/2020 de 22/12/2020, em que a mesma versão/data representava eventos ALRS distintos e o voto remoto `sim` divergia da fonte oficial `nao`, sem sobrescrever o fato existente.

## Entregue e verificado
- Fonte oficial: Portal da Transparência ALRS, URL anual completa preservada; `source_sha256=262bd3372fbab2013c9af9c42217645e7170141b43e96ab30310c07ce774b528`.
- Identidade exata: `event_identity=sha256:5a9771a0ff26202617510474918b5d2759e01ea1e4ba39fc3c57d102d8d506d3`; `source_matter_hash=sha256:9db7bdadde17c8f0ae259c9f393ee796bcdabe3a2e00984019b73b70e2078ed8`.
- Migration `20260906090000_alrs_event_identity.sql` confirmada no remoto por `supabase migration list`; função remota contém `event_identity`.
- Aplicação Auth/RPC: `inserted=1`, `conflicts=0`, `already_present=0`, `remote_apply=true`.
- Read-back remoto: evento `alrs-nominal-8dc8f327854480285821328d07c099fc`, candidato `dd04c71f-ce43-44b1-bec0-be8e3d7ed258`, versão `954c62d1-83d4-4530-b21f-8a164e740957`, valor `nao`, data `2020-12-22`, URL/hash oficiais exatos.
- Idempotência: segunda aplicação Auth/RPC retornou `inserted=0`, `already_present=1`, `conflicts=0`.

## Estado e bloqueios
- O registro factual remoto anterior `sim` não foi alterado; a colisão deixou de ser um overwrite potencial e passou a dois eventos identificados por `event_identity`.
- Nenhum score, matriz, assessment ou claim foi criado/publicado.
- O campo `source_matter_hash` permanece evidência do objeto ALRS no envelope; o vínculo persistido do evento usa `event_identity` e a fonte oficial hashada.

## Artefatos
- `supabase/migrations/20260906090000_alrs_event_identity.sql`
- `scripts/import-alrs-nominal-votes.mjs`
- `data/legislative-import/alrs/alrs-pl246-event-identity-import-v1.json`

## Publicação verificada
- Commit publicado: `a38a5b9fb438c0ab400466ad8c9233603550ba5f`.
- Backup Cloudflare `334951434`, run `34054614245`: `completed/success`, `headSha` exato.
- Produção: raiz HTTP 200; `/release.json` HTTP 200, SHA exato, release `0.2.1237`, snapshot `1003`.

## Próximo passo
Reexecutar a reconciliação ALRS completa para confirmar `event_identity_collisions=0` no snapshot vigente e continuar a fila editorial separada, mantendo `pending_review`, `withheld` e `approved` distintos.
