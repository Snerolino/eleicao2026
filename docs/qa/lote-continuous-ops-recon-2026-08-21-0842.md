# Lote continuous ops — recon oficial e gates locais — 2026-08-21 08:42Z

## Objetivo
Executar um tick bounded do control plane: revalidar fontes oficiais ALRS/Câmara, manter o reparo residual fail-closed, comparar o dataset vivo ao snapshot público e verificar a aplicação local antes da publicação documental.

## Entregue e verificado
- Lock não bloqueante adquirido/liberado com `flock -n` em `.orchestrator/runtime/locks/continuous-progress.lock`.
- Recon ALRS: 7/7 URLs oficiais HTTP 200 e válidas; manifesto atualizado somente com o timestamp da coleta (`data/legislative-import/alrs/impact-merit-source-manifest.json`).
- Reparo ALRS FED-17 em dry-run: `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- Câmara: consulta read-only à API oficial em janelas de até três meses, HTTP válido; o output encontrou IDs oficiais no intervalo amplo consultado, mas nenhum registro foi aplicado, reconciliado ou promovido.
- Pacote local de pedidos de fonte substantiva regenerado: 9 pedidos / 8 versões.
- Validador de fonte substantiva falhou fechado como esperado: 25 itens sem fonte substantiva, nenhum dado aplicado.
- Dataset vivo: CSV oficial de candidatos com 1003 linhas/IDs; snapshot com 1003 IDs; diferença `only_dataset=0`, `only_snapshot=0`.
- Evidências brutas do tick: `.orchestrator/runtime/continuous-tick-20260821T084228Z/` e `.orchestrator/runtime/continuous-tick-20260821T084454Z/`.

## Gates locais
Executados com Node `v24.19.0`:
- `npm run test`: 97 arquivos / 398 testes, todos passaram.
- `npx tsc --noEmit`: passou.
- `node scripts/validate-impact-schema.mjs`: passou.
- `npm run data:check`: passou; 1003 candidaturas, 988 fotos oficiais.
- `npm run build`: passou; sitemap com 1003 candidatos + estáticas = 1005 URLs; `release.json` gerado para o HEAD `ac16a6b`.
- `git diff --check`: passou.
- `npm run smoke:local`: passou; 1002 cards visíveis, 0 falhas HTTP, 0 erros de console online, service worker pronto.

## Estado dos dados
Nenhuma candidatura, foto, identidade, FK, voto, matriz, claim, source reference ou snapshot público foi inventado ou aplicado. O único arquivo rastreado alterado pelo tick é o manifesto ALRS, com evidência oficial reobtida e hashes preservados.

## Bloqueios reais
- 4 itens ALRS residuais continuam sem identidade oficial/fonte exata; reparo permanece dry-run.
- 25 itens substantivos continuam sem fonte substantiva oficial; validação fail-closed.
- Senado permanece bloqueado enquanto bytes/SHA dos PDFs não coincidirem com o manifesto de origem.
- Doctor do shell continua FAIL por Node `v22.22.2`; os gates do projeto foram executados comprovadamente com Node `v24.19.0`. Smoke MCP Codex continua indisponível por `401 invalid_refresh_token`; rota não foi repetida.

## Publicação e verificação externa
- Commit publicado: `fffebaa154d3f4e7c2e108b13256a8932ac6e299` (`main -> origin/main`).
- Backup Cloudflare `334951434`, run `32464751253`: `completed/success`, `headSha` idêntico ao commit.
- Produção: raiz HTTP 200 e `/release.json` HTTP 200; release `fffebaa-20260821T084702933Z`, `sha` idêntico, snapshot `row_count=1003`.
- Smoke remoto: 1002 cards, 0 falhas HTTP, 0 erros de console online, service worker pronto.

## Próximo passo
Iniciar novo tick bounded de recon oficial e lane local independente. Aplicação remota factual continua condicionada a R0, schema/FK, fonte oficial exata, dry-run e idempotência.
