# Lote continuous-ops — recon oficial e gates locais — 2026-08-22 17:26 UTC

## Objetivo
Executar um tick bounded do control plane: manter recon oficial read-only ativa,
verificar o snapshot contra o `dataset2026`, fechar os gates locais e validar o
estado de publicação sem promover fatos sem fonte.

## Entregue e verificado
- Lock bounded testado com `flock -n` no caminho
  `.orchestrator/runtime/locks/continuous-progress.lock`; lock liberado ao fim da
  operação.
- ALRS FED-17 residual executado em dry-run com Node 24.19.0:
  `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`,
  `impact_touched=false`. Os quatro casos Enio Carlos Terra permanecem bloqueados
  por ausência de ID oficial e fonte exata; nenhuma escrita remota ocorreu.
- Câmara oficial consultada em modo read-only pela API de dados abertos em 8
  janelas trimestrais de 2025–2026, todas HTTP `ok`, sem bloqueio; foram
  observados IDs oficiais transitórios, sem reconciliação ou aplicação.
- Senado permaneceu fail-closed: não houve envelope nominal verificável e nenhum
  fato foi promovido.
- Auditoria de fontes regular: RC 0. Auditoria estrita: RC 2 pelos gaps reais,
  sem suprimir o gate: versões sem fonte ALRS/Câmara/Senado `1251/3/112`, eventos
  `1647/2/188` e votos `4/2/455`.
- Reconciliação de dados: CSV oficial `consulta_cand_2026_RS.csv` e snapshot com
  `1003/1003` IDs, diferenças `0/0`; SHA do CSV
  `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.

## Gates locais
- `npm run test`: RC 0 — 401 testes em 98 arquivos.
- `npx tsc --noEmit`: RC 0.
- `node scripts/validate-impact-schema.mjs`: RC 0.
- `npm run data:check`: RC 0 — 1.003 candidaturas, 988 fotos, 1 fonte TSE.
- `npm run build`: RC 0 — sitemap 1.003 candidatos + 2 estáticas; release local
  `5c25ee6-20260822T172518608Z`.
- `npm run smoke:local`: RC 0 — 1.002 cards, 0 falhas HTTP, 0 erros de console
  online, service worker pronto.
- `git diff --check`: RC 0.
- Worktree limpa antes da documentação; nenhum arquivo factual foi alterado.

## Publicação e bloqueios
- `https://rs.votopraquem.org/release.json?cb=continuous-ops` respondeu HTTP 200
  e reportou `sha=5c25ee656ced3283002b8a5c2c83400a55f9e558`, versão `0.2.830`,
  snapshot 1.003 com o SHA oficial acima.
- A raiz `https://rs.votopraquem.org` retornou HTTP 000 nesta tentativa por
  falha DNS (`Could not resolve host`); portanto não afirmar saúde da página
  raiz neste tick.
- Workflows remotos confirmados: backup Cloudflare `334951434`, primário
  `320564705`, verificador `335560210`.
- Push/deploy não foram executados neste tick porque a documentação deste lote
  ainda precisava ser registrada e a publicação anterior permanece condicionada
  ao bloqueio real de permissão GitHub HTTP 403. Nenhuma migration, RLS, RPC,
  Auth, Storage, Supabase factual ou Cloudflare remoto foi alterado.

## Próximo passo
Retentar `git push origin main` após registrar este checkpoint; se aceito,
acompanhar o workflow backup `334951434`, comparar `headSha` com
`5c25ee656ced3283002b8a5c2c83400a55f9e558` e revalidar produção. Manter ALRS,
Senado e qualquer aplicação factual condicionados a R0, schema/FK, fonte oficial,
dry-run e idempotência.
