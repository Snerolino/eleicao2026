# QA — lote continuous-ops recon — 2026-08-21 16:40 UTC

## Objetivo
Executar um tick bounded do control plane: reconhecimento oficial read-only,
comparação do dataset vivo com o snapshot público, gates locais e verificação de
produção, sem promover fatos cuja identidade ou fonte estejam incompletas.

## Entregue e verificado
- ALRS FED-17 residual em dry-run: `planned_votes=0`,
  `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- Câmara: API oficial `dados.camara.leg.br/api/v2/votacoes`, 8 janelas de até
  três meses entre 2025-01-01 e 2026-12-31, `8/8` páginas iniciais HTTP válidas,
  700 IDs descobertos; nenhum evento, voto, identidade ou FK aplicado.
- Senado: envelope nominal transitório não disponível; nenhuma adaptação,
  identidade, FK ou voto promovido (fail-closed).
- Dataset oficial completo
  `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv`:
  1.003 linhas/IDs; snapshot: 1.003 linhas/IDs; diferença `0/0`.
- Auditoria de cobertura Supabase foi somente leitura e manteve gaps reais:
  versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos
  `4/2/455`; comando estrito saiu com código 2. Nenhuma escrita remota ocorreu.

## Gates locais (Node 24.19.0)
- `npm run test`: **0**, 98 arquivos, 400 testes aprovados.
- `npx tsc --noEmit`: **0**.
- `node scripts/validate-impact-schema.mjs`: **0**.
- `npm run data:check`: **0**, 1.003 candidaturas, 988 fotos oficiais.
- `npm run build`: **0**, sitemap com 1.003 candidatos + estáticas e `release.json` gerado.
- `git diff --check`: **0**.
- `npm run smoke:local`: **0**, 1.002 cards visíveis, 0 falhas HTTP, 0 erros de console online, service worker pronto.
- Produção `https://rs.votopraquem.org`: HTTP **200**.

## Estado dos dados
Nenhum dado factual, claim, source reference, identidade, FK, voto, snapshot,
Supabase ou Cloudflare foi alterado neste lote. A fonte permanece obrigatória e
os quatro residuais ALRS continuam bloqueados por ausência de identidade/fonte
exata.

## Bloqueios reais
- `npm run orch:doctor`: código 1 porque o shell padrão usa Node 22.22.2,
  embora os gates tenham sido executados explicitamente com Node 24.19.0.
- Codex MCP permanece indisponível por `401 invalid_refresh_token`; OpenCode
  está ausente e Ollama não respondeu ao preflight.
- Push GitHub continua pendente dos ticks anteriores por HTTP 403; não há
  publicação nova neste tick. O workflow backup confiável é `334951434`.
- Auditoria estrita de fontes falha por gaps substantivos existentes, não por
  erro do auditor.

## Próximo passo
Manter a recon oficial bounded: buscar exclusivamente ID oficial e fonte exata
para os quatro votos Enio Carlos Terra; manter Senado fail-closed enquanto a
SHA deriva e o envelope não existe; continuar Câmara em novos lotes. Em paralelo,
resolver o bloqueio efetivo de push e, após `main -> main`, acionar/verificar o
workflow backup `334951434`. Aplicação remota somente após R0, schema/FK, fonte
official, dry-run e idempotência.
