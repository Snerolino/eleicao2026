# Lote continuous-ops — recon oficial e gates locais

**Data:** 2026-08-23 05:43 UTC

## Objetivo
Executar um tick bounded do control plane: manter recon oficial read-only ativa, conferir o dataset vivo, verificar gates locais e não promover fatos sem R0, identidade/FK, fonte oficial exata, dry-run e idempotência.

## Reconhecimento oficial
- ALRS FED-17 residual: falhou fechado com `JWT issued at future`; os 4 casos de Enio Carlos Terra permanecem bloqueados, sem votos planejados ou aplicados.
- Câmara: `scripts/discover-camara-vote-ids.mjs --start 2025-01-01 --end 2026-12-31 --max-pages 1` retornou `8/8` janelas trimestrais `status=ok`, `blocked=null` e IDs apenas transitórios de descoberta; nenhuma reconciliação ou aplicação.
- Auditoria de fontes read-only: versões sem fonte ALRS/Câmara/Senado `1251/3/112`; eventos `1647/2/188`; votos `4/2/455`. O gap estrito continua real e não foi suprimido.
- Senado permanece fail-closed sem envelope nominal com SHA verificável.

## Dataset
- CSV oficial `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv` e snapshot: `1003/1003` registros; diferença de IDs `0/0`.
- SHA-256 do CSV: `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.

## Gates locais verificados
- `npm run test`: **RC 0**, 401 testes/98 arquivos aprovados.
- `npx tsc --noEmit`: **RC 0**.
- `node scripts/validate-impact-schema.mjs`: **RC 0**.
- `npm run data:check`: **RC 0**, 1.003 candidaturas, 988 fotos oficiais e 1 fonte TSE.
- `npm run build`: **RC 0**, 224 módulos, sitemap 1.003 candidatos + 2 estáticas, `release.json` local `2d94c3a-20260823T054336605Z`.
- `git diff --check`: **RC 0**.
- Worktree após os gates: apenas este registro QA novo; nenhum dado factual ou serviço remoto foi alterado.

## Bloqueios
- Publicação do registro depende do transporte Git: push anterior do commit documental `1358925` foi rejeitado por HTTP 403 (`Permission to Snerolino/eleicao2026.git denied to Snerolino`).
- Verificação externa no tick: raiz `https://rs.votopraquem.org` retornou HTTP 000 por falha de resolução DNS; `/release.json` respondeu HTTP 200, mas ainda aponta para SHA anterior `2d94c3a68bd37fe471198998d4c6ddde6f440a9e` e release `2d94c3a-20260823T052851177Z`.
- Doctor global continua degradado por shell Node 22.22.2, embora os gates tenham sido executados explicitamente com Node 24.19.0; OpenCode está ausente e Codex MCP permanece não exercitado no modo rápido.
- Nenhuma escrita factual remota, Supabase ou Cloudflare foi executada.

## Próximo passo
Retentar `main -> main`; se aceito, validar workflow backup `334951434`, `headSha` e `/release.json` em produção. Manter ALRS/Senado fail-closed e avançar somente lotes com evidência oficial exata e gates completos.
