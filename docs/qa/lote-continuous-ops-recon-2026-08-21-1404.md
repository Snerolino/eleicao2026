# Lote continuous-ops — recon oficial e gates locais — 2026-08-21 14:04 UTC

## Objetivo
Executar um tick bounded das lanes oficiais e locais, sem promover dados factuais sem identidade oficial, fonte exata, schema/FK, dry-run e idempotência.

## Reconhecimento oficial read-only
- Lock `.orchestrator/runtime/locks/continuous-progress.lock` foi adquirido com `flock -n` e liberado ao fim do tick.
- ALRS P0/P1: 7/7 URLs oficiais HTTP 200, 526 itens oficiais; evidências regeneradas sem mudança factual e sem inferência de ID para os quatro votos residuais de Enio Carlos Terra.
- Auditoria estrita de cobertura: 1.397 proposições, 1.431 versões, 1.902 eventos e 5.007 votos. Gaps reais: versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188` e votos `4/2/455`; exit 2 preservado como bloqueio factual.
- Câmara: API oficial respondeu com IDs em janelas de até três meses; nenhuma reconciliação ou aplicação foi feita.
- Senado: adaptação fail-closed por ausência de `/tmp/senado-nominal-envelope-latest.json`; nenhum `legislator_id`, PDF, voto, URL ou hash foi inventado.
- Dataset vivo: `npm run data:check` confirmou 1.003 candidaturas e 988 fotos oficiais; não houve diff ou refresh factual.

## Gates locais — Node 24.19.0
- `npm run test`: exit 0, 98 arquivos e 400 testes.
- `npx tsc --noEmit`: exit 0.
- `node scripts/validate-impact-schema.mjs`: exit 0.
- `npm run data:check`: exit 0, 1.003/988.
- `npm run build`: exit 0; sitemap com 1.005 URLs e `release.json` gerado.
- `npm run smoke:local`: exit 0; 1.002 cards, 0 falhas HTTP, 0 erros de console online e service worker pronto.
- `git diff --check`: exit 0; worktree sem alteração prévia não intencional.

## Bloqueios reais
- Quatro votos ALRS residuais permanecem sem identidade oficial e fonte individualizável.
- Gaps de fontes substantivos permanecem na auditoria estrita.
- Senado permanece sem envelope nominal verificável e com deriva de evidência.
- `npm run orch:doctor` retorna FAIL porque o shell padrão usa Node 22.22.2; os gates foram executados explicitamente com Node 24.19.0. OpenCode ausente é WARN opcional. Nenhuma credencial foi lida ou exposta.

## Publicação verificada
- Commit `2d0aaa82dcee2cdaeb8b1449fba5e5dd39c07486` publicado em `origin/main`.
- Workflow backup Cloudflare `334951434`, run `32490222626`: `completed/success`, `headSha` idêntico.
- Deploy preview confirmado em `https://1ffe46c6.portal-transparencia-rs.pages.dev`; `/release.json` confirmou SHA `2d0aaa82dcee2cdaeb8b1449fba5e5dd39c07486` e `row_count=1003`.
- Produção `https://rs.votopraquem.org`: HTTP 200; `/release.json?cb=2d0aaa8` confirmou o mesmo SHA e `row_count=1003` (a consulta sem cache-buster ainda retornava release anterior durante a propagação).
- Não houve escrita factual remota; apenas documentação operacional/checkpoint foi publicada.

## Próximo passo
Manter recon bounded e lane local independente; aplicação remota somente após R0, schema/FK, fonte exata, dry-run e idempotência.
