# QA — lote continuous ops recon — 2026-08-22 23:31Z

## Objetivo
Executar um tick bounded do control plane: revalidar lock/estado, manter a recon oficial fail-closed, conferir o snapshot vivo, rodar os gates locais e tentar a publicação autorizada.

## O que foi entregue e verificado
- Lock não bloqueante adquirido e liberado com `flock -n` em `.orchestrator/runtime/locks/continuous-progress.lock`.
- Recon ALRS FED-17 executada em dry-run por `node scripts/repair-alrs-fed17-residual.mjs --help`/fluxo atual: `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- Nenhum voto, identidade ou URL foi inventado ou promovido. Os quatro casos de Enio Carlos Terra continuam bloqueados porque o manifesto oficial registra `not_present_in_official_ALRS_option_catalog`.
- Snapshot validado: 1.003 candidaturas, 988 fotos oficiais e 1 fonte TSE (`npm run data:check`).
- Dataset local permaneceu sem alteração factual; o estado anterior registra correspondência 1.003/1.003 com `../dataset2026` e SHA oficial `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.

## Gates locais
Todos verdes com Node 24.19.0:
- `npm run test`: 98 arquivos, 401 testes aprovados.
- `npx tsc --noEmit`: OK.
- `node scripts/validate-impact-schema.mjs`: OK.
- `npm run data:check`: OK, 1.003 candidaturas / 988 fotos / 1 fonte TSE.
- `npm run build`: OK, 224 módulos; sitemap com 1.003 candidatos + 2 estáticas; `release.json` local `9288146-20260822T233152675Z`.
- `git diff --check`: OK; worktree limpa antes da documentação deste tick.
- `npm run smoke:local`: primeira execução falhou por timeout transitório esperando `table`; repetição imediata passou: 1.002 cards, 0 falhas HTTP, 0 erros de console online, service worker pronto.

## Publicação e produção
- `git push origin main` tentado após os gates e rejeitado com RC 128: HTTP 403, `Permission to Snerolino/eleicao2026.git denied to Snerolino`.
- HEAD local: `9288146df1500b500e619e46ef339f9dcdae8835`; ramo `main` está 22 commits à frente de `origin/main`.
- Nenhum workflow novo foi acionado por causa da rejeição do push.
- Produção não foi alterada neste tick. Após a repetição verde do smoke, `/` e `/release.json` foram revalidados com HTTP 200. Nenhum workflow novo foi acionado porque o push continuou rejeitado.

## Bloqueios reais
1. **GitHub push:** credencial identifica `Snerolino`, mas o remoto devolve 403 de permissão para o repositório.
2. **Doctor:** shell padrão usa Node 22.22.2 enquanto o projeto exige Node 24; Codex MCP/exec está em circuito aberto por token expirado (`invalid_refresh_token`), OpenCode ausente. Os gates do projeto foram executados explicitamente com Node 24.19.0.
3. **Recon factual:** ALRS residual continua sem ID oficial/fonte exata; Senado permanece fail-closed sem envelope nominal verificável; nenhuma aplicação remota foi feita.

## Próximo passo
Retentar somente a publicação após a permissão efetiva do GitHub ser corrigida. Se `main -> main` for aceito, disparar/verificar o workflow backup `334951434`, conferir `headSha` contra este commit e validar produção. Manter ALRS, Senado e Câmara em recon read-only; aplicação remota continua condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.
