# QA — lote contínuo editorial ALRS 002 — 2026-08-27

## Objetivo

Processar o próximo lote editorial ALRS somente com classificação/revisão independentes, hash exato e RPC autenticada de editor/admin.

## Entregue e verificado

- Lote `alrs-impact-editorial-batch-001-v2` reconstruído com 25 proposições e 75 ocorrências/votos factuais.
- Classificador gerou 25 decisões.
- Reviewer independente: `valid=true`, 25 decisões, 25 aprovadas, 0 `needs_changes`, 0 erros, 0 itens exigindo revisão externa.
- Hash validado: `51526590c213fe14cf0988011cf8f0eadb24f07edda775a9de19f810024fb620`.
- Aplicação remota feita exclusivamente pela RPC `record_impact_editorial_disposition`, com sessão Supabase Auth e papel editor/admin: 25/25 `applied`, 0 erros.
- Read-back via Supabase REST autenticado: 25 esperadas, 25 retornadas, 0 ausentes, 0 não aprovadas, 0 divergências de `review_key`; metodologia `1.0.0`.
- Portal público verificado: `published_verified`; raiz e `/release.json` HTTP 200.

## Estado dos dados

- Monitor: fingerprint `271e0e77ceae9938f05136355436dbc164ed346dabd9a93e2f007d0f2b76362d`.
- Itens editoriais pendentes no monitor: 1261.
- Votos factuais: 4000.
- Descoberta nominal: 27723 itens; reconciliação nominal: 25616 linhas resolvidas, 0 missing, 0 ambíguas e 0 bloqueadas por proposição.
- Auditoria estrita de fontes permanece fail-closed: versões sem fonte ALRS/Câmara/Senado `1251/3/112`; eventos `1647/2/188`; votos `4/2/455`. Nenhum fato sem fonte foi criado.

## Bloqueios

- O ciclo autônomo completo não concluiu a reconciliação pós-apply porque `npx supabase db query --linked` falhou com autenticação PostgreSQL da role temporária (`FATAL: password authentication failed for user cli_login_postgres...`). Isso bloqueia somente a reconciliação CLI/metadados e a reconstrução automática do próximo lote; não afetou a RPC Auth nem o read-back REST autenticado deste lote.
- Commit local criado: `637a7398adffa45bc75306ef1dd3db123df187f2` (`feat: aplica lote editorial alrs 002`). O `git push origin main` foi retestado e bloqueado novamente por HTTP 403: `Permission to Snerolino/eleicao2026.git denied to Snerolino`. Nenhum deploy foi iniciado neste tick; produção permanece no commit remoto anterior.

## Próximo passo

Retestar transporte Git; se aceitar, acompanhar CI/deploy backup Cloudflare, validar `headSha` e produção. Em paralelo, corrigir/revalidar a credencial da CLI Supabase para permitir reconciliação e reconstrução do próximo lote. Manter gaps de fonte em recuperação fail-closed, sem fuzzy matching ou publicação automática.
