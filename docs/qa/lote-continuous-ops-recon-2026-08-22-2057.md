# QA — tick contínuo: recon oficial, gates locais e publicação — 2026-08-22 20:57 UTC

## Objetivo
Executar um tick bounded do control plane, mantendo recon oficial read-only,
validando o snapshot e os gates locais antes de qualquer publicação ou aplicação
factual remota.

## Entregue e verificado
- Lock não bloqueante adquirido e liberado com `flock -n`.
- ALRS FED-17 residual executado em dry-run: `planned_votes=0`,
  `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
  Os quatro casos de Enio Carlos Terra continuam sem ID oficial e fonte exata.
- Auditoria read-only de fontes: ALRS sem fonte `4/4000` votos, Câmara `2/552`,
  Senado `455/455`; versões sem fonte `1251/3/112`; eventos sem fonte
  `1647/2/188`. Nenhum fato foi promovido.
- Câmara oficial consultada em 8 janelas trimestrais de 2025–2026; todas
  retornaram `status=ok`, sem reconciliação ou escrita.
- `data:check`: 1.003 candidaturas, 988 fotos oficiais, 1 fonte TSE.
- Gates locais com Node 24.19.0: 401 testes em 98 arquivos, TypeScript,
  schema de impacto, build, sitemap (1.003 candidatos + 2 estáticas),
  `git diff --check` e smoke local.
- Smoke local: 1.002 cards, 0 falhas HTTP, 0 erros de console online,
  service worker pronto; detalhe canônico de Priscila Voigt Severiano
  validado offline.

## Bloqueios
- Publicação bloqueada: `git push origin main` retornou RC 128 / HTTP 403:
  `Permission to Snerolino/eleicao2026.git denied to Snerolino`.
- Verificação remota: workflows backup `334951434`, primário `320564705` e
  verificador `335560210` estão ativos; `/release.json` de produção respondeu
  HTTP 200 no release `3aae2d0`/SHA `3aae2d06338f81dc0b8c5df92ecc61ed8825dda3`
  (`0.2.835`), sem correspondência com o HEAD local.
- Sem push, nenhum workflow Cloudflare foi acionado; não há novo `headSha` ou
  release de produção para validar neste tick.
- ALRS residual permanece fail-closed por falta de identidade/fonte exata.
- Senado permanece fail-closed sem envelope nominal verificável.
- `npm run orch:doctor` continua RC 1 porque o shell usa Node 22.22.2, embora
  os gates do projeto tenham sido executados explicitamente com Node 24.19.0.

## Estado dos dados e segurança
Nenhum candidato, voto, proposição, evento, identidade, FK, source reference,
claim, Supabase ou Cloudflare foi alterado. Nenhum segredo foi lido ou exposto.

## Próximo passo
Retentar `git push origin main` em próximo tick; somente se aceito, consultar o
workflow backup `334951434`, conferir `headSha` com o commit e validar HTTP 200 e
`release.json` em `https://rs.votopraquem.org`. Manter aplicação remota
condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.
