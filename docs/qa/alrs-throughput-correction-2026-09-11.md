# QA — lane ALRS fonte-first, colisões e P0/P1 — 2026-09-11

## Correção executada

- Lane exclusiva gerada em `data/legislative-import/alrs/alrs-exclusive-editorial-lane-v1.json`.
- Writer separado da autoria Câmara por `flock`.
- Builder determinístico de microbatches adicionado como `npm run impact:alrs:exclusive-lane`.
- Segunda execução byte-for-byte idêntica.

## Colisões

- 18 `version_key` collision keys.
- 65 proposition versions afetadas no audit; 93 eventos afetados após revalidação.
- 8 hipóteses `same_text_multiple_events_possible`.
- 10 hipóteses `version_identity_mismatch_possible`.
- `remote_apply=false`; nenhuma colisão foi promovida ou sobrescrita automaticamente.
- As 6 resoluções existentes permanecem como evidência oficial read-only; as demais exigem revisão de texto/hash/evento.

## P0/P1 fonte-first

- Fila canônica: 112 versões (`30` P0 + `82` P1), `671` votos factuais.
- Pacote meritório fonte-first atual: 25 versões (`5` P0 + `20` P1), `149` votos.
- Manifesto substantivo revalidado: `7/7` URLs HTTP 200, `ok=7`, `failed=0`.
- Validador do pacote: `ok=true`, `errors=[]`, `checked=25`.
- Nenhum apply remoto, aprovação pública, score ou matriz criada.

## Planner e bloqueio correto

O planner foi executado e falhou fechado:

- `input_versions=23` no pacote confirmado;
- `planned_versions=0`;
- `plan_entries=0`;
- `remote_apply=false`;
- erro global: pacote ainda não aprovado/publicado;
- 20 versões sem `editorial_disposition`.

Isso confirma que a fonte está verde, mas o gate editorial humano ainda não foi preenchido. Não é permitido converter ausência de disposição em `assess`, score ou matriz.

## Próximo passo obrigatório

1. Resolver as 18 colisões por texto/hash/evento oficial.
2. Registrar uma disposição para cada versão no `/admin`:
   `assess`, `no_direct_population_group`, `taxonomy_gap` ou `excluded`.
3. Para `assess`, preencher assessment completo e rationale humano.
4. Regenerar planner; só aceitar `planned_versions>0` após todos os erros zerarem.
5. Criar matriz em `pending_review`, aprovar via RPC/editor role, aplicar idempotentemente e fazer fan-out.

Nenhuma migration, RLS, Auth, Storage, Edge Function, Supabase factual ou Cloudflare factual foi alterada nesta correção.

## Apply autorizado posterior

- O batch externo P2 de 15 disposições foi validado com 15/15 IDs e review keys exatos.
- O hash externo foi preservado em `external_batch_sha256`; o hash canônico interno foi recalculado pelo contrato do repositório.
- Apply via sessão Supabase Auth e papel `admin`: `15/15` disposições aplicadas via `record_impact_editorial_disposition`.
- Read-back: `15/15` exato.
- Segunda execução: `15/15 already_present`, `0` novas chamadas RPC.
- Duas disposições `assess` (PL-43/2019 e PL-27/2024) já possuem matrizes remotas `approved`, preservadas sem downgrade/duplicação.
- PL-377/2023 permanece sem assessment completo e não foi convertido em matriz.
- Nenhum fan-out ou score automático foi executado.

## PL-377/2023 — proposta editorial pendente

- Disposição: `assess`.
- Grupo proposto: `servidores_publicos`.
- `impact_direction=positive`.
- `textual_defending_vote=sim`.
- `event_defending_vote=null` até confirmar a versão/emenda da CCJ vinculada ao evento nominal.
- Severidade proposta: `3`.
- Tipo estrutural proposto: `structural`.
- Votos favoráveis reportados: `41`.
- Artefato: `data/legislative-import/alrs/p2-pl377-editorial-assessment-proposal-v1.json`.
- `score_eligible=false`, `remote_apply=false`, `public_approval=false`.

A proposta não é uma aprovação. O próximo gate é conferir a versão/emenda oficial
associada ao evento nominal antes de preencher `event_defending_vote` ou liberar
matriz/score.
