# QA — lote continuous-ops recon — 2026-08-21 10:22 UTC

## Objetivo
Executar tick bounded do control plane: recon oficial read-only, auditoria do dataset vivo, gates locais e verificação da publicação, sem aplicar fatos sem R0/schema/FK/fonte/dry-run/idempotência.

## Entregue e verificado
- Lock `flock -n .orchestrator/runtime/locks/continuous-progress.lock` adquirido e liberado sem loop/sleep.
- Doctor: `OK=49`, `WARN=6`, `FAIL=2`.
- ALRS: `npm run impact:alrs:r4:sources` refez GET sequencial de 7 URLs oficiais; `http_200=7`, `ok=7`, `failed=0`; manifesto mudou somente em `generated_at`.
- FED-17: dry-run com 0 votos, 0 correções de data, 4 bloqueios remanescentes e `impact_touched=false`; nenhum dado remoto foi alterado.
- Senado: adaptação fail-closed porque `/tmp/senado-nominal-envelope-latest.json` não existe; nenhuma inferência de `legislator_id`, candidato ou PDF foi feita.
- Câmara: API oficial read-only em quatro janelas trimestrais de 2026 respondeu com HTTP válido e retornou IDs oficiais; nenhum evento, identidade, FK ou voto foi reconciliado/aplicado.
- Dataset vivo: 2 CSVs comparáveis de candidatos, `1003` IDs; snapshot `1003`; diferença `0` nos dois sentidos. Parsing validado com separador `;` e fallback de encoding, sem refresh.

## Gates locais (Node 24.19.0)
- `npm run test`: aprovado, `97` arquivos / `398` testes.
- `npx tsc --noEmit`: aprovado.
- `node scripts/validate-impact-schema.mjs`: aprovado.
- `npm run data:check`: aprovado, `1003` candidaturas / `988` fotos.
- `npm run build`: aprovado; sitemap `1003` candidatos + `2` estáticas; `release.json` gerado.
- `git diff --check`: aprovado.
- `npm run smoke:local`: aprovado; `1002` cards, `0` falhas HTTP, `0` erros online de console, service worker pronto.

## Estado dos dados
Nenhuma escrita factual, identidade, FK, voto, matriz, claim, source reference, Supabase, Cloudflare ou snapshot ocorreu. A reconciliação ALRS apenas atualizou o timestamp do manifesto; o conteúdo e hashes oficiais permaneceram verificados.

## Bloqueios reais
- Doctor shell usa Node `v22.22.2`, mas o projeto exige Node 24; gates foram executados com Node `v24.19.0`.
- Smoke Codex MCP falha por `401 invalid_refresh_token`; OpenCode está ausente e Ollama não respondeu ao preflight.
- Quatro votos ALRS residuais de Enio Carlos Terra continuam sem ID oficial e fonte exata.
- Auditoria de fontes permanece com gaps reais: ALRS `1251/1647/4`, Câmara `3/2/2`, Senado `112/188/455` (versões/eventos/votos sem fonte).
- Senado continua bloqueado por deriva criptográfica prévia e envelope transitório ausente.

## Publicação verificada antes deste tick
- Produção `https://rs.votopraquem.org`: HTTP `200`.
- `/release.json`: HTTP `200`, SHA `c97de368ab697e3286c62a8e2e84ab2539b6330f`, `row_count=1003`.

## Publicação concluída e verificada
- Commit `feb57c82ec22d1b5d31e9cfed4ee58f1e899604f` enviado para `origin/main`.
- Workflow backup Cloudflare `334951434`, run `32472389728`: `completed/success`, `headSha` idêntico ao commit.
- Produção: raiz e `/release.json` HTTP `200`; release `feb57c8-20260821T102338452Z`, SHA idêntico e `row_count=1003`.
- Smoke remoto aprovado: `1002` cards, `0` falhas HTTP, `0` erros online de console, service worker pronto.

## Próximo passo
Manter recon bounded e lane local independente. Aplicação remota permanece proibida até todos os gates exatos passarem.
