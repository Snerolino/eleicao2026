# Lote continuous-ops — recon oficial e gates locais — 2026-08-22 23:10 UTC

## Objetivo
Executar um tick bounded do control plane: manter a recon oficial read-only, conferir o snapshot contra o CSV oficial, validar o build local e tentar a publicação do HEAD local.

## Entregue e verificado
- Lock não bloqueante adquirido e liberado com `flock -n`.
- CSV oficial `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv`: 1.003 linhas, 553.194 bytes, SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.
- Snapshot público: 1.003 registros; nenhuma alteração factual neste tick.
- Testes: 401 aprovados em 98 arquivos.
- TypeScript, schema de impacto, `data:check`, build e `git diff --check`: aprovados.
- Build: 224 módulos, sitemap com 1.003 candidatos + 2 rotas estáticas, `release.json` local `1f511b5-20260822T230852414Z`.
- Smoke local: 1.002 cards, 0 falhas HTTP, 0 erros de console online e service worker pronto.

## Recon oficial / bloqueios
- ALRS FED-17: bloqueado fail-closed por `JWT issued at future`; os 4 residuais de Enio Carlos Terra permanecem sem ID oficial e fonte exata.
- Câmara: tentativa de descoberta não avançou porque o comando recusou `--help` e exige `--max-pages` entre 1 e 100; nenhum ID foi tratado como fato e nenhuma reconciliação foi aplicada.
- Senado: fail-closed por ausência do envelope nominal verificável.
- Não houve escrita em Supabase, Cloudflare, claims, votos, FKs ou source references.

## Publicação
O push inicial e o push pós-documentação falharam com RC 128 / HTTP 403: `Permission to Snerolino/eleicao2026.git denied to Snerolino`. `gh api user` retornou `Snerolino`, mas a autorização efetiva do remoto continua insuficiente. Nenhum workflow novo foi acionado. HEAD local `74ed146` está 21 commits à frente de `origin/main`. Produção foi revalidada: raiz HTTP 200 e `/release.json` HTTP 200, live `3aae2d0`/SHA `3aae2d06338f81dc0b8c5df92ecc61ed8825dda3`, versão `0.2.835`, snapshot 1.003. Workflows remotos ativos: backup `334951434`, primário `320564705` e verificador `335560210`.

## Próximo passo
Retentar `main -> main` após correção da permissão efetiva do GitHub; somente depois validar o workflow backup `334951434`, `headSha` e a produção. Aplicação factual remota continua condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.
