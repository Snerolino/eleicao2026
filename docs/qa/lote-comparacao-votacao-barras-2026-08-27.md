# QA — comparação de votação por barras — 2026-08-27

## Objetivo
Evoluir a comparação pública de saldos por grupo populacional para uma leitura visual por barras, preservando a tabela numérica legada como fallback acessível e mantendo a separação entre fato nominal e impacto metodológico.

## Entregue e verificado
- Novo `VoteCategoryScoreTableBar` com barras divergentes, estado “não avaliado” distinto de zero, legenda e disclaimer anti-ranking.
- Colunas mantêm a ordem de seleção dos candidatos; grupos seguem ordem canônica.
- Alternância acessível entre “Gráfico de barras” e “Tabela numérica”, com `aria-pressed` coberto por teste.
- `build-vote-profile.mjs` passou a buscar páginas de votos em paralelo após contagem exata, sem alterar o contrato dos fatos.
- Testes unitários dos novos componentes e domínio incluídos.

## Gates locais
- `npm test`: **RC 0**, 426/426 testes em 105 arquivos.
- `npx tsc --noEmit`: **RC 0**.
- `node scripts/validate-impact-schema.mjs`: **RC 0**.
- `npm run data:check`: **RC 0**, 1003 candidaturas, 988 fotos oficiais, 1 fonte TSE.
- `npm run build`: **RC 0**, 236 módulos, sitemap com 1003 candidatos + 2 rotas estáticas.
- `npm run smoke:local`: **RC 0**, 1002 cards, 0 falhas HTTP, 0 erros online, service worker pronto. O preview já estava ativo na porta 4173; o smoke reutilizou-o.
- `git diff --check`: **RC 0**.

## Estado factual e fontes
- Monitor contínuo: 1261 itens editoriais pendentes, 4000 votos factuais.
- Auditoria de fontes read-only: gaps preservados e fail-closed — versões ALRS/Câmara/Senado 1251/3/112; eventos 1647/2/188; votos 4/2/455.
- Reparação ALRS residual: bloqueada porque a evidência oficial mudou (`solicitante=93&ano=2026`); 0 votos aplicados.
- Nenhum Supabase, candidato, FK, claim, assessment, matriz ou score editorial foi alterado.

## Publicação e bloqueios
- Commit local: `7bdaa452d359f3deff911c50afcd3e9804476ee3` (`feat: evoluir comparação de votação por barras`).
- Push da branch `feature/evolucao-comparacao-votacao-barras`: bloqueado por HTTP 403 — `Permission to Snerolino/eleicao2026.git denied to Snerolino`.
- Portanto, nenhum workflow novo foi acionado para este commit. Produção permanece no SHA `dc233bcc5dacc8fb26c5321b48d08c9068e60b18`; raiz e `/release.json` continuam HTTP 200, release `dc233bc-20260827T091417298Z`.

## Próximo passo
Retentar o transporte Git no próximo tick. Após `main -> main`/branch publicada, validar CI, workflow backup `334951434`, `headSha`, produção e smoke implantado. Manter os gaps de fonte e os 4 votos ALRS residuais bloqueados até evidência oficial reproduzida com URL, hash, bytes e match exato.
