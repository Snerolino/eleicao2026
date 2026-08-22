# QA — tick contínuo: recon oficial, gates locais e publicação — 2026-08-22 21:22 UTC

## Objetivo
Executar um tick bounded do control plane, mantendo as lanes oficiais em leitura,
confirmando dataset e gates locais, e tentando a publicação autorizada sem
promover fatos sem fonte.

## Entregue e verificado
- Lock não bloqueante adquirido e liberado com `flock -n`.
- Dataset inventariado contra `../dataset2026`: snapshot com 1.003 registros;
  o CSV oficial de candidatos contém 1.003 linhas de dados. `data:check` confirmou
  1.003 candidaturas, 988 fotos oficiais e 1 fonte TSE.
- Câmara oficial consultada em 8 janelas trimestrais de 2025–2026, com todas as
  páginas desta execução em `status=ok`; os IDs permaneceram transitórios e não
  houve reconciliação nem escrita.
- ALRS FED-17 residual falhou fechado por `JWT issued at future`; nenhum voto ou
  correção foi planejado. Os 4 casos de Enio Carlos Terra continuam sem ID oficial
  e fonte exata.
- Auditoria read-only de fontes (RC 0): votos sem fonte ALRS `4/4000`, Câmara
  `2/552`, Senado `455/455`; versões sem fonte `1251/3/112`; eventos sem fonte
  `1647/2/188`. Nenhum fato foi promovido.
- Gates locais com Node 24.19.0: `npm run test -- --passWithNoTests` — 401 testes
  em 98 arquivos; `npx tsc --noEmit` — RC 0; schema de impacto — RC 0;
  `data:check` — RC 0; `npm run build` — RC 0, sitemap com 1.003 candidatos +
  2 estáticas e release local gerado; `git diff --check` — RC 0.
- Smoke com build configurado para Supabase ficou bloqueado em `Carregando lista
  de candidatos` após duas tentativas (`cards=0`), sem erro HTTP observável no
  comando. Para isolar a dependência externa, o build foi refeito com as variáveis
  Supabase vazias, usando o snapshot público versionado; o smoke snapshot-only
  passou: 1.002 cards, busca com 2 resultados, detalhe/canonical slug e offline
  verificados, 0 falhas HTTP e 0 erros de console online, service worker pronto.
- O endpoint Supabase anon respondeu HTTP 200 em consulta mínima; a causa do
  carregamento prolongado na jornada completa não foi promovida a defeito sem
  diagnóstico adicional.

## Bloqueios
- Publicação bloqueada: `git push origin main` retornou RC 128 / HTTP 403:
  `Permission to Snerolino/eleicao2026.git denied to Snerolino`. Após o commit
  documental `ecf3892`, o HEAD local segue 13 commits à frente de `origin/main`;
  nenhum workflow novo foi acionado.
- `npm run orch:doctor` continua RC 1 porque o shell cron usa Node 22.22.2,
  enquanto o projeto exige Node 24; os gates foram executados explicitamente com
  Node 24.19.0. OpenCode ausente permanece WARN.
- Senado permanece fail-closed sem envelope nominal verificável.

## Estado dos dados e segurança
Nenhum candidato, voto, proposição, evento, identidade, FK, source reference,
claim, Supabase remoto ou Cloudflare foi alterado. Nenhum segredo foi lido ou
exposto.

## Próximo passo
Retentar `git push origin main`; somente após aceitação acompanhar o workflow
backup Cloudflare `334951434`, conferir `headSha` e validar HTTP 200 e
`release.json` em `https://rs.votopraquem.org`. Manter ALRS/Senado fail-closed e
aplicação remota condicionada a R0, schema/FK, fonte oficial, dry-run e
idempotência. Abrir diagnóstico separado para a latência da jornada Supabase se
ela persistir.
