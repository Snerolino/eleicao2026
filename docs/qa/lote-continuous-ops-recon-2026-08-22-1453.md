# Lote continuous-ops — recon oficial — 2026-08-22 14:53Z

## Objetivo
Executar um tick bounded do control plane, mantendo recon oficial read-only e verificando se há evidência nova para aplicação factual.

## Entregue e verificado
- Lock não bloqueante adquirido e liberado via `flock -n`.
- Câmara dos Deputados: consulta oficial read-only em oito janelas trimestrais de 2025-01-01 a 2026-12-31, `max_pages=1`; 8/8 janelas retornaram `status=ok`, `blocked=null`. Os `vote_ids` permanecem transitórios: não houve reconciliação de identidade, escrita ou promoção.
- ALRS residual FED-17: `repair-alrs-fed17-residual.mjs --help` executou o dry-run padrão e retornou `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`. Os quatro casos de Enio Carlos Terra continuam sem ID oficial e fonte exata.
- Auditoria estrita de fontes: exit code 2, com gaps reais — versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`. Nenhum fato foi promovido.
- Produção independente: `https://rs.votopraquem.org` retornou HTTP 200. `/release.json` retornou HTTP 200, release `823e9df-20260822T115410420Z`, snapshot oficial com 1.003 registros e SHA `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.
- Dataset/snapshot: sem mudança detectada no tick; o estado vigente permanece 1.003 IDs públicos e 988 fotos, conforme checkpoint anterior.

## Estado dos dados
- Nenhuma escrita em Supabase, Cloudflare ou dados legislativos.
- Senado permanece fail-closed: `/tmp/senado-nominal-envelope-latest.json` ausente.
- Worktree sem alterações funcionais; somente esta documentação e o checkpoint serão registrados.

## Bloqueios reais
- `git push origin main` falhou HTTP 403: `Permission to Snerolino/eleicao2026.git denied to Snerolino`; nenhum workflow novo foi acionado.
- O script da Câmara exige `--start` e `--end` explícitos; a tentativa sem esses argumentos falhou com `intervalo de datas inválido`. Reexecutado corretamente com as janelas oficiais e passou.
- Reconciliação ALRS continua sem ID/fonte exata; Senado sem envelope PDF/`legislator_id`/SHA verificável; gaps de fontes estritos continuam abertos.

## Próximo passo
Retentar `main -> main` em próximo tick quando a permissão efetiva do GitHub permitir. Se aceito, acompanhar o workflow backup Cloudflare `334951434`, verificar `headSha` contra o commit e repetir validação HTTP/produção. Manter Câmara, ALRS e Senado em reconciliação read-only/fail-closed até R0, schema/FK, fonte oficial, dry-run e idempotência verdes.
