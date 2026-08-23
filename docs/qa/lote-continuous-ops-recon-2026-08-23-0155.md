# QA — continuous ops recon — 2026-08-23 01:55 UTC

## Objetivo
Executar o tick bounded do control plane: recon oficial read-only de ALRS/Câmara, gates locais e preparação da publicação sem promover fatos sem fonte.

## Entregue e verificado
- Lock `.orchestrator/runtime/locks/continuous-progress.lock` adquirido com `flock -n` e liberado ao fim do tick.
- ALRS FED-17 residual executado em dry-run implícito; falhou fechado com `JWT issued at future` (RC 1). Nenhum voto, data, fonte ou FK foi alterado.
- Câmara oficial consultada em 8 janelas trimestrais entre 2025-01-01 e 2026-12-31, uma página por janela: RC 0, 8 páginas, nenhum bloqueio e 700 IDs transitórios. Sem reconciliação ou aplicação.
- Senado continua fail-closed por ausência de envelope nominal verificável.
- `npm run test -- --passWithNoTests`: RC 0 — 98 arquivos, 401 testes aprovados.
- `npx tsc --noEmit`: RC 0.
- `node scripts/validate-impact-schema.mjs`: RC 0.
- `npm run data:check`: RC 0 — 1.003 candidaturas, 988 fotos oficiais, 1 fonte TSE.
- `npm run build`: RC 0 — 224 módulos, sitemap com 1.003 candidatos + 2 estáticas, `release.json` local `59242cc-20260823T015550125Z`.
- Worktree sem alterações funcionais antes desta documentação; nenhum segredo foi lido ou exposto.

## Estado dos dados
Nenhuma escrita em Supabase, Cloudflare ou snapshot público. Os bloqueios de fonte/identidade permanecem preservados. Recon Câmara produziu apenas evidência transitória, não uma carga factual reconciliada.

## Bloqueios reais
1. ALRS: token remoto rejeitado por `JWT issued at future`; os 4 casos Enio Carlos Terra continuam sem ID oficial e fonte exata.
2. Senado: SHA/envelope nominal ainda não verificável; aplicação permanece proibida.
3. Publicação: o commit documental `dc4de33` foi criado após os gates, mas `git push origin main` foi rejeitado novamente pelo GitHub com HTTP 403 (`Permission to Snerolino/eleicao2026.git denied to Snerolino`). `gh api` identifica o usuário `Snerolino` e reporta `push=true/admin=true`, portanto há divergência entre a identidade/permissão da API e a credencial efetiva do transporte Git; HEAD segue local à frente de `origin/main`.
4. Infra: doctor reporta shell padrão Node 22 incompatível com requisito Node 24, Codex MCP/exec com token expirado (401) e OpenCode ausente. Este tick usou Node 24.19.0 e gates locais passaram.

## Próximo passo
Retentar `git push origin main` após o gate verde; se aceito, disparar/verificar o workflow backup Cloudflare `334951434`, comparar `headSha` com o commit publicado e validar `https://rs.votopraquem.org`/`release.json`. Manter recon ALRS/Senado fail-closed e seguir Câmara apenas como catálogo read-only até R0/schema/FK/fonte/dry-run/idempotência.
