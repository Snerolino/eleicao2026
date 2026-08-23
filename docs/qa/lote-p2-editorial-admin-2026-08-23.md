# QA — lote P2 editorial no Admin — 2026-08-23

## Objetivo

Disponibilizar no `/admin` a fila humana do pacote ALRS P2, mantendo as fontes oficiais visíveis e registrando a disposição exclusivamente pela RPC protegida, sem publicar voto ou matriz automaticamente.

## Entregue e verificado

- `/admin` renderiza as 5 versões do pacote `p2-microbatch-2-editorial-review-pack.json`.
- Cada item exibe a página oficial da proposição e links das fontes oficiais de voto.
- Disposições aceitas: `assess`, `no_direct_population_group`, `taxonomy_gap` e `excluded`.
- Justificativa obrigatória no frontend e no banco com mínimo de 20 caracteres.
- Registro chama `record_impact_editorial_disposition(...)`; após sucesso, bloqueia o item somente na sessão corrente.
- Migration `20260823110000_create_editorial_disposition_queue.sql` presente localmente e confirmada no remoto pela `supabase migration list`.
- Consulta remota confirmou `impact_editorial_dispositions`, `proposition_versions`, `editor_roles` e `has_editor_role(uuid)`.
- `supabase db lint --linked`: RC 0, sem erros de schema.
- Documentação curada atualizada em `docs/context-export/SCHEMA.md` e `CHANGELOG.md`.

## Estado dos dados

- Pacote P2: 5 versões, 5 fontes verdes, 5 disposições pendentes.
- `remote_apply=false` e `public_approval=false` no pacote; nenhuma disposição factual foi registrada neste tick.
- Snapshot público: 1003 candidaturas, 988 fotos oficiais e 1 fonte TSE; `data:check` verde.
- ALRS residual dos 4 casos Enio Carlos Terra continua bloqueado sem ID oficial e fonte exata; Senado continua fail-closed.

## Gates locais

- Node `v24.19.0`.
- Testes: `401` testes em `98` arquivos, RC 0.
- TypeScript: RC 0.
- Schema de impacto: RC 0.
- `npm run data:check`: RC 0.
- `npm run build`: RC 0, 225 módulos, sitemap 1003 candidatos + 2 estáticas, `release.json` local gerado.
- `npm run smoke:local`: RC 0, 1002 cards, 0 falhas HTTP, 0 erros online, service worker pronto.
- `git diff --check`: RC 0.

## Bloqueios

- Nenhum bloqueio local ou de schema neste lote.
- Transporte Git ainda precisa ser retestado; ticks anteriores registraram HTTP 403 no push para `Snerolino/eleicao2026`.
- Recon factual ALRS/Senado permanece fail-closed por falta de evidência oficial completa. Não houve escrita factual remota.

## Próximo passo

Commitar este lote, retentar `main -> main` e, se o transporte aceitar, validar o workflow backup `334951434`, `headSha`, HTTP de produção e `/release.json`. Depois manter reconhecimento oficial independente e só aplicar fatos com R0, schema/FK, fonte exata, dry-run e idempotência comprovados.
