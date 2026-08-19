# QA — materialização de perfis nominais Câmara — 2026-08-19

## Objetivo

Materializar novamente o índice factual e os perfis agregados de votação após a
aplicação histórica Câmara, preservando a chave composta `(candidate_id, house)`
e sem promover as 8 identidades históricas mantidas em fail-closed.

## Evidência remota read-only antes da escrita

- Projeto Supabase vinculado confirmado por `supabase migration list --linked`.
- Migrations local/remoto alinhadas até `20260816100000`.
- Schema remoto confirmou `legislative_votes`, `voting_events`,
  `legislator_vote_index` e `legislator_vote_profile`.
- Constraints remotas confirmadas:
  - `legislator_vote_index`: `UNIQUE (candidate_id, voting_event_id)`;
  - `legislator_vote_profile`: `UNIQUE (candidate_id, house)`.

## Entrega verificada

- `node scripts/build-vote-profile.mjs` (Node `v24.19.0`): dry-run verde.
- Dry-run: 4.281 votos factuais com candidato, 4.281 linhas de índice e 41
  perfis planejados.
- Primeiro `--apply`: sucesso.
- Segundo `--apply`: sucesso; prova de idempotência sem erro de conflito.
- Consulta remota pós-apply:
  - `legislative_votes` com candidato: 4.281;
  - `legislator_vote_index`: 4.281;
  - `legislator_vote_profile`: 41;
  - `alrs`: 13 perfis / 4.000 votos;
  - `camara`: 28 perfis / 281 votos.

## Segurança e escopo

Nenhuma migration, RLS/RPC/Auth/Storage, claim, matriz editorial, identidade
bloqueada ou fonte foi alterada. O writer só materializou derivados dos votos
factuais já existentes. As 8 identidades históricas inelegíveis permanecem
fail-closed.

## Próximo passo

Executar os gates locais completos, publicar este checkpoint e verificar o
backup Cloudflare/produção. Depois, selecionar o próximo lote legislativo
independente sem inferir identidades ou votos sem fonte oficial.
