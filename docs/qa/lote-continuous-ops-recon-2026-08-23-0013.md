# QA — lote continuous ops recon — 2026-08-23 00:13 UTC

## Objetivo
Executar um tick bounded do control plane: manter reconhecimento oficial read-only ativo, verificar os gates locais e tentar publicar o estado já validado.

## Entregue e verificado
- ALRS FED-17 residual: `npm run impact:alrs:residual:repair` falhou fechado com `JWT issued at future`; nenhum voto, data ou fonte foi alterado.
- Câmara: consulta read-only oficial em 8 janelas trimestrais de 2025–2026, `max_pages=1`; 8 páginas `ok`, `blocked=null`, IDs transitórios descobertos, sem reconciliação ou aplicação.
- Senado: continua fail-closed sem envelope nominal verificável; nenhum fato promovido.
- Smoke local: 1.002 cards, mínimo esperado 1.002, 0 falhas HTTP, 0 erros online de console e service worker pronto.

## Estado dos dados
- `npm run data:check`: 1.003 candidaturas, 988 fotos oficiais e 1 fonte TSE.
- Nenhum candidato, voto, FK, source reference, claim ou snapshot foi alterado neste tick.
- Os quatro casos residuais de Enio Carlos Terra continuam bloqueados por ausência de ID oficial e fonte exata.

## Gates locais
- Node usado explicitamente: v24.19.0.
- Testes: 98 arquivos / 401 testes aprovados.
- TypeScript: aprovado.
- Schema de impacto e votos legislativos: aprovado.
- Build: 224 módulos, sitemap com 1.003 candidatos + 2 estáticas; `release.json` local `29b596a-20260823T001255993Z`.
- `git diff --check`: aprovado.

## Publicação e produção
- `git push origin main`: bloqueado por HTTP 403 — `Permission to Snerolino/eleicao2026.git denied to Snerolino`.
- Workflows remotos confirmados como ativos: backup `334951434`, primário `320564705`, verificador `335560210`.
- Produção revalidada: raiz HTTP 200; `/release.json` HTTP 200, live em `3aae2d06338f81dc0b8c5df92ecc61ed8825dda3` / versão `0.2.835`, ainda sem correspondência verificável com o HEAD local `29b596a`.
- Nenhum workflow novo, deploy Cloudflare ou write remoto foi acionado.

## Bloqueios reais
1. Permissão efetiva do GitHub rejeita o push da identidade `Snerolino`; isso impede acionar o deploy backup e publicar os commits locais.
2. ALRS rejeita a sessão por `JWT issued at future`; os 4 residuais permanecem fail-closed.
3. Doctor permanece degradado pelo shell padrão Node 22.22.2 incompatível com o requisito do projeto; gates foram executados com Node 24.19.0.

## Próximo passo automático
Retentar `main -> main` quando a permissão efetiva do GitHub permitir; após aceite, validar o run backup `334951434`, seu `headSha` e a produção. Manter ALRS/Senado sem aplicação até R0, schema/FK, fonte oficial exata, dry-run e idempotência verdes.
