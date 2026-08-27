# Lote continuous ops — editorial ALRS batch 002 — 2026-08-27

## Objetivo
Executar o próximo ciclo bounded de reconciliação, revisar independentemente um lote editorial ALRS e aplicar somente decisões com hash exato por RPC autenticada editor/admin.

## Entregue e verificado
- Reconciliação remota read-only: `407` versões resolvidas e `407` versões já presentes em matrizes; `51` candidatos de perfil.
- Reconciliação nominal ALRS: `25.616` linhas; `25.616` matches exatos; `25.616` já presentes; `missing=0`, `conflicts=0`, `ambiguous=0`, `blocked_identity=0`, `blocked_proposition=0`.
- Materialização derivada: `28.839` votos, `28.839` índices e `79` perfis; sem alteração de score/matriz aprovada.
- Lote `alrs-impact-editorial-batch-001-v2`: `25` proposições, `75` ocorrências/votos factuais, hash validado pelo reviewer; `25/25` decisões aprovadas, `0` needs_changes e `0` external_review_required.
- Aplicação do lote anterior exatamente validado: `25/25` chamadas `record_impact_editorial_disposition` autenticadas retornaram `applied`, `0` erros. A reconciliação seguinte confirmou `407` versões já presentes, incluindo o avanço de `382` para `407`.
- Novo lote foi reconstruído após a aplicação e permanece separado para revisão; nenhuma aplicação automática foi feita sobre ele.
- Fontes ALRS: `24` URLs oficiais OK, `3.456` `data-item`, `0` bloqueios e `0` candidatos substantivos novos.
- Portal: `published_verified`; produção raiz e `/release.json` HTTP `200`.

## Estado dos dados
- Snapshot público: `1.003` candidaturas e `988` fotos; `npm run data:check` verde.
- Votos factuais e perfis foram apenas reconciliados/materializados; não houve inserção factual nominal neste ciclo (`missing=0`).
- Nenhuma matriz/score aprovada foi alterada; decisões editoriais foram gravadas apenas pelo RPC autenticado.

## Gates locais
- Node `v24.19.0`.
- Testes: `438/438` em `106` arquivos.
- TypeScript, schema de impacto, `data:check`, build e `git diff --check`: verdes.
- Build: `237` módulos; sitemap `1.003 + 2` URLs; release local regenerado.

## Transporte e publicação
- Commit local: `63b7c97`.
- `git push origin main` foi retentado `3` vezes e falhou em todas com HTTP `403`: `Permission to Snerolino/eleicao2026.git denied to Snerolino`.
- Por isso, nenhum workflow novo foi acionado e não há `headSha` novo para validar em produção. A produção HTTP 200 verificada é a já publicada, não este commit.

## Bloqueios
- `npm run orch:doctor`: `FAIL` apenas porque o shell cron usa Node `v22.22.2` enquanto o projeto exige Node 24; OpenCode ausente é `WARN`. Gates do projeto foram executados explicitamente com Node 24.
- Auditoria estrita de fontes substantivas continua fail-closed nos gaps registrados anteriormente; nenhum fato sem fonte foi criado.
- Transporte Git/deploy deve ser retestado após o commit; não declarar produção atualizada por este lote sem `headSha` correspondente.

## Próximo passo
Reconciliar/revisar o novo lote mantendo fonte, hash e RPC autenticados; aplicar somente após validação independente. Depois tentar `main -> main`, verificar workflow backup Cloudflare `334951434`, `headSha`, produção e `release.json`.
