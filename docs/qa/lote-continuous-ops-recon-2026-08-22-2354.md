# QA — lote continuous-ops recon — 2026-08-22 23:54 UTC

## Objetivo
Executar um tick bounded do control plane: manter reconhecimento oficial read-only ativo, verificar gates locais e tentar a publicação pendente sem promover fatos sem evidência.

## Entregue e verificado
- Lock `.orchestrator/runtime/locks/continuous-progress.lock` adquirido e liberado com `flock -n`.
- Câmara: `scripts/discover-camara-vote-ids.mjs --start 2025-01-01 --end 2026-12-31 --max-pages 1` consultou 8 janelas trimestrais oficiais; 8 páginas `ok`, 0 bloqueios e 700 IDs transitórios. Nenhum ID foi reconciliado ou aplicado.
- ALRS FED-17 residual: `scripts/repair-alrs-fed17-residual.mjs` em dry-run retornou `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`. Os quatro casos de Enio Carlos Terra continuam sem ID oficial/fonte exata.
- Senado: envelope nominal `/tmp/senado-nominal-envelope-latest.json` ausente; lane permanece fail-closed.
- Auditoria read-only de fontes: RC 0, com gaps reais preservados: versões sem fonte ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`.
- Dataset/snapshot sem alteração factual; gate público confirma 1.003 candidaturas, 988 fotos oficiais e 1 fonte TSE.

## Gates locais
Executados em sequência com resultado verde:
- `npm run test`: 401 testes em 98 arquivos, todos passaram.
- `npx tsc --noEmit`: RC 0.
- `node scripts/validate-impact-schema.mjs`: checkpoint OK.
- `npm run data:check`: 1.003 candidaturas / 988 fotos / 1 fonte TSE.
- `npm run build`: 224 módulos; sitemap 1.003 candidatos + 2 estáticas; `release.json` local `2b9bee3-20260822T235404782Z`.
- `git diff --check`: RC 0 antes da documentação; commit documental local `99bd705` criado.

## Publicação e bloqueios
- `git push origin main` falhou com HTTP 403: `Permission to Snerolino/eleicao2026.git denied to Snerolino`.
- HEAD local `99bd705` está 24 commits à frente de `origin/main`; nenhum workflow novo foi acionado.
- Workflows remotos confirmados: backup `334951434`, primário `320564705`, verificador `335560210`.
- `npm run orch:doctor -- --smoke` continua RC 1: shell Node 22.22.2 enquanto o projeto exige Node 24; MCP Codex retorna token expirado/401 e OpenCode está ausente. Antigravity passou a leitura sanitizada; não repetir Codex neste tick.
- Nenhum candidato, voto, FK, source reference, claim, Supabase remoto ou Cloudflare foi alterado.

## Próximo passo
Corrigir/revalidar a permissão efetiva do GitHub e retentar `main -> main`; somente após push aceito validar o workflow backup `334951434`, `headSha` e produção. Aplicação factual remota continua condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.
