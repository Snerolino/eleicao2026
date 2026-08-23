# QA — lote continuous ops recon oficial — 2026-08-23 11:50 UTC

## Objetivo
Executar um tick bounded do control plane: revalidar o snapshot público, manter reconhecimento oficial read-only ativo e tentar publicar os commits documentais pendentes.

## Entregue e verificado
- Lock `flock -n .orchestrator/runtime/locks/continuous-progress.lock` adquirido e liberado sem loop/sleep.
- Ambiente de gates explícitos: Node `v24.19.0`.
- `npm run data:check`: RC 0 — `1003` candidaturas, `988` fotos oficiais, `1` fonte TSE.
- Reconhecimento oficial Câmara read-only: `8` janelas trimestrais (`2025-01-01` a `2026-12-31`), `8/8` páginas `ok`, `700` IDs transitórios, nenhum dado reconciliado ou aplicado.
- ALRS FED-17 residual dry-run: RC 0, `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`. Os quatro casos Enio Carlos Terra continuam sem ID oficial e fonte exata.
- Auditoria de fontes read-only: RC 0 no modo regular; gaps reais permanecem: versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`.

## Estado dos dados
Nenhum candidato, identidade, voto, FK, source reference, claim, Supabase remoto ou Cloudflare foi alterado. Senado permanece fail-closed por ausência de envelope nominal com SHA verificável. A Câmara foi apenas inventariada; IDs transitórios não foram vinculados a candidatos.

## Publicação
`env -u GH_TOKEN git push origin main` falhou com RC 128 e causa real: HTTP 403, `Permission to Snerolino/eleicao2026.git denied to Snerolino`. O HEAD local continua à frente de `origin/main`; nenhum workflow novo ou deploy foi acionado neste tick.

## Bloqueios
- Transporte Git HTTPS sem permissão efetiva, apesar de tentativas anteriores e da divergência conhecida com a API do GitHub.
- `orch:doctor` segue degradado pelo shell Node 22.22.2 incompatível com o requisito Node 24, OpenCode ausente e rota MCP Codex não exercitada/credencial previamente expirada. Os gates deste tick usaram Node 24.19.0 diretamente.
- ALRS residual sem evidência oficial exata; Senado sem envelope nominal verificável; gaps de fontes legislativas permanecem.

## Próximo passo
Retentar o transporte Git no próximo tick; se `main -> main` for aceito, validar o workflow backup Cloudflare `334951434`, seu `headSha` e HTTP 200 de `https://rs.votopraquem.org`/`release.json`. Manter aplicação factual remota condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.
