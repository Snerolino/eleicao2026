# Lote continuous-ops — recon oficial e gates locais — 2026-08-21 13:40 UTC

## Objetivo
Executar um tick bounded das lanes oficiais ALRS, Senado/Câmara e dataset vivo,
sem promover dados factuais sem identidade, fonte, schema/FK, dry-run e
idempotência comprovados.

## Entregue e verificado
- Lock `.orchestrator/runtime/locks/continuous-progress.lock` adquirido com
  `flock -n` e liberado ao fim do tick; nenhum writer concorrente.
- ALRS P0 e P1: 7/7 URLs oficiais HTTP 200 e 526 itens oficiais; os artefatos
  `p0-official-event-evidence.json` e `p1-official-event-evidence.json` foram
  regenerados. Nenhum ID novo de Enio/Terra foi inferido.
- FED-17 residual em dry-run: `planned_votes=0`,
  `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- Auditoria de fontes read-only: 1.397 proposições, 1.431 versões, 1.902
  eventos e 5.007 votos. Gaps reais permanecem: versões ALRS/Câmara/Senado
  `1251/3/112`, eventos `1647/2/188` e votos `4/2/455`.
- Auditoria estrita retornou exit 2 por esses gaps; o resultado foi tratado como
  bloqueio factual, não suprimido.
- Snapshot/dataset: `npm run data:check` verde com 1.003 candidaturas e 988
  fotos oficiais; nenhum refresh ou diff factual foi aplicado.

## Gates locais
Executados com Node 24.19.0:
- `npm run test`: exit 0, 98 arquivos e 400 testes.
- `npx tsc --noEmit`: exit 0.
- `node scripts/validate-impact-schema.mjs`: exit 0.
- `npm run data:check`: exit 0, 1.003/988.
- `npm run build`: exit 0; sitemap com 1.005 URLs e `release.json` gerado.
- `npm run smoke:local`: exit 0; 1.002 cards, 0 falhas HTTP, 0 erros de
  console online, service worker pronto.
- `git diff --check`: exit 0.

## Publicação/verificação
Não houve alteração rastreada após a recon: `git status` permaneceu limpo em
`main` no commit `b7bb235c2f99651e2d99df220967df7a97b48237`; portanto não houve
novo commit/push/deploy neste tick. A produção existente foi verificada:
raiz HTTP 200 e `/release.json` com SHA idêntico, `row_count=1003`, versão
`0.2.714`.

## Bloqueios reais
- Quatro votos ALRS residuais de Enio Carlos Terra continuam sem ID oficial e
  fonte exata individualizável; o reparo permanece fail-closed.
- Gaps substantivos de fontes permanecem na auditoria estrita.
- Senado segue sem envelope nominal oficial verificável; nenhuma inferência de
  `legislator_id`, PDF, voto ou hash foi feita.
- `orch:doctor` ainda falha porque o shell padrão usa Node 22.22.2, embora os
  gates do projeto tenham sido executados com Node 24.19.0; OpenCode ausente é
  WARN opcional.

## Próximo passo
Manter recon bounded oficial e lane local independente. Tentar aplicação remota
somente após R0, schema/FK, fonte oficial exata, dry-run e prova de idempotência;
sem isso, manter os itens bloqueados e não escrever votos, fontes, identidade ou
matriz.
