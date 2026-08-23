# Lote continuous-ops — publicação verificada

**Data:** 2026-08-23 05:22 UTC

## Objetivo
Retomar o tick bounded, fechar os gates locais do pacote ALRS P0 e verificar a publicação sem promover fatos sem identidade ou fonte oficial exata.

## Reconhecimento e dados
- Os quatro casos residuais de Enio Carlos Terra continuam bloqueados: nenhum voto foi planejado/aplicado sem ID oficial e fonte exata.
- Senado continua fail-closed sem envelope nominal com SHA verificável.
- O snapshot público permanece em 1.003 candidaturas e 988 fotos oficiais; `npm run data:check` passou.

## Gates locais verificados
- `npm run test`: **401 testes/98 arquivos aprovados**.
- `npx tsc --noEmit`: **RC 0**.
- `node scripts/validate-impact-schema.mjs`: **RC 0**.
- `npm run data:check`: **RC 0**, 1.003 candidaturas, 988 fotos, 1 fonte TSE.
- `npm run build`: **RC 0**, 224 módulos, sitemap 1.003 candidatos + 2 estáticas; `release.json` local `44c5ccb-20260823T051856498Z`.
- `npm run smoke:local`: **RC 0**, 1.002 cards, 0 falhas HTTP, 0 erros online, service worker pronto.
- `git diff --check`: **RC 0**.

## Publicação verificada
- Commit publicado: `c8be4b754c602d4608d1578e0be0db5920aa3921` (`fix: corrigir fonte pl98 e fechar p0 editorial`).
- `origin/main` está no mesmo SHA; worktree limpa.
- Deploy primário `32620063530`: **success**, quality e deploy verdes.
- Backup `334951434`, run `32620104597`: **success**, disparado manualmente conforme o caminho confiável.
- Produção `https://rs.votopraquem.org/release.json`: **HTTP 200**, SHA `c8be4b754c602d4608d1578e0be0db5920aa3921`, versão `0.2.883`.

## Bloqueios e riscos
- A reconciliação factual remota permanece bloqueada por ausência de evidência oficial exata para os quatro casos ALRS e pelo envelope nominal do Senado ausente/verificável.
- Houve falha transitória de DNS ao consultar produção e a API GitHub; retries subsequentes passaram. Nenhum dado foi inventado.

## Publicação deste registro
- O registro foi commitado localmente em `1358925`.
- `git push origin main` e retry com `env -u GH_TOKEN` falharam com HTTP 403: `Permission to Snerolino/eleicao2026.git denied to Snerolino`.
- O commit anterior `c8be4b7` permanece publicado e verificado em produção; este registro documental aguarda a próxima tentativa de transporte Git.

## Próximo passo
Retentar `main -> main` quando a permissão efetiva do transporte Git aceitar o push; depois validar novamente backup, `headSha` e produção. Manter reconhecimento oficial read-only e avançar somente com lotes que passem R0, schema/FK, fonte oficial, dry-run e idempotência. Não aplicar os itens factuais bloqueados.
