# QA — lote continuous ops recon — 2026-08-22 18:40 (-03)

## Objetivo
Executar um tick bounded do control plane: manter a reconnaissance oficial ativa,
revalidar o residual ALRS FED-17 e a descoberta read-only da Câmara, fechar os gates
locais e tentar publicação sem aplicar fatos remotos.

## Entregue e verificado
- ALRS FED-17 residual em dry-run: `planned_votes=0`,
  `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
  Os quatro casos de Enio Carlos Terra permanecem sem ID oficial e fonte exata.
- Câmara oficial (`dadosabertos.camara.leg.br`) consultada read-only em 8 janelas
  trimestrais de 2025–2026, todas `status=ok`; IDs foram apenas coletados no output,
  sem reconciliação ou escrita.
- Produção revalidada: raiz HTTP 200 e `/release.json` HTTP 200. Release live:
  `3aae2d0-20260822T180456083Z`, SHA
  `3aae2d06338f81dc0b8c5df92ecc61ed8825dda3`, versão `0.2.835`, snapshot 1.003.

## Gates locais
Executados com Node 24.19.0:
- `npm run test`: 401 testes / 98 arquivos, verde.
- `npx tsc --noEmit`: verde.
- `node scripts/validate-impact-schema.mjs`: verde.
- `npm run data:check`: 1.003 candidaturas, 988 fotos oficiais, 1 fonte TSE.
- `npm run build`: verde; sitemap 1.003 candidatos + 2 estáticas; release local
  `cb0e283-20260822T214249360Z`.
- `npm run smoke:local`: verde; 1.002 cards, 0 falhas HTTP, 0 erros de console
  online, service worker pronto.
- `git diff --check`: verde.

## Estado dos dados e segurança
Nenhum candidato, voto, FK, `source_reference`, claim, Supabase remoto ou Cloudflare
foi alterado. Não houve promoção de fato sem fonte. Senado continua fail-closed por
falta de envelope nominal verificável; aplicação remota continua condicionada a
R0, schema/FK, fonte oficial exata, dry-run e idempotência.

## Bloqueio real
`git push origin main` falhou com RC 128 / HTTP 403:
`Permission to Snerolino/eleicao2026.git denied to Snerolino`. O HEAD local continua
14 commits à frente de `origin/main`; nenhum workflow novo foi acionado. Workflows
backup `334951434`, primário `320564705` e verificador `335560210` permanecem ativos.

## Próximo passo
Retentar `main -> main` no próximo tick; se aceito, validar o workflow backup
`334951434`, o `headSha` concluído e a produção. Manter ALRS/Senado fail-closed e
continuar a recon oficial read-only da Câmara sem bloquear os gates locais.
