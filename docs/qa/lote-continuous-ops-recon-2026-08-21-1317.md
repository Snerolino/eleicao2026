# Lote continuous-ops — recon oficial e gates locais — 2026-08-21 13:17 UTC

## Objetivo
Executar novo tick bounded das quatro lanes: recon oficial ALRS/Câmara/Senado, diff do dataset vivo, pacote local independente e verificação/publicação somente após gates verdes.

## Recon oficial (somente leitura / fail-closed)
- ALRS FED-17 residual: bloqueado por erro real `JWT issued at future` ao consultar o Supabase para plano dry-run; nenhum voto, data, FK ou fonte foi aplicado.
- ALRS recovery manifest: 5 fontes oficiais preservadas, com URLs completas, IDs TSE, bytes e SHA-256; evidência não foi alterada.
- Câmara: API oficial `https://dadosabertos.camara.leg.br/api/v2`, 4 janelas trimestrais de 2026, todas `status=ok`; IDs oficiais retornados, sem reconciliação ou aplicação.
- Senado: adaptação fail-closed porque `/tmp/senado-nominal-envelope-latest.json` não existe; nenhum legislator_id, candidato, voto ou fonte foi inferido.
- Auditoria estrita de fontes: 1.397 proposições, 1.431 versões, 1.902 eventos e 5.007 votos; gaps reais: versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`; exit 2 mantido.
- Dataset vivo: CSV oficial 1.003 linhas/IDs; snapshot 1.003 linhas/IDs; somente dataset `0`, somente snapshot `0`.

## Lane local entregue
- Pacote ALRS substantivo regenerado: `7` requisições, `6` versões e `5` versões excluídas por fonte substantiva verde.
- `remote_apply=false`, `human_review_required=true`; não houve escrita factual remota.

## Gates locais (Node 24.19.0)
- `npm run test`: 98 arquivos / 400 testes aprovados.
- `npx tsc --noEmit`: aprovado.
- `node scripts/validate-impact-schema.mjs`: aprovado.
- `npm run data:check`: 1.003 candidaturas / 988 fotos, aprovado.
- `npm run build`: aprovado; sitemap 1.005 URLs e `release.json` gerado.
- `npm run smoke:local`: 1.002 cards, 0 falhas HTTP, 0 erros de console online, service worker pronto.
- `git diff --check`: aprovado; nenhuma alteração de código não intencional.

## Bloqueios reais
- Quatro votos residuais Enio/Terra seguem sem identidade e fonte exata; `JWT issued at future` impede o dry-run FED-17.
- Senado sem envelope transitório e com deriva de evidência; fail-closed.
- Auditoria estrita mantém gaps substantivos; não inventar fontes, hashes, IDs ou votos.
- Doctor do shell permanece FAIL por Node 22.22.2; gates foram executados explicitamente em Node 24.19.0. Codex MCP permanece indisponível por `401 invalid_refresh_token`.

## Publicação
A documentação deste tick será commitada e publicada pelo workflow backup Cloudflare `334951434`; validar `headSha`, HTTP 200, `/release.json` e smoke remoto após o push.

## Próximo passo
Nova recon bounded oficial e lane local independente. Aplicação factual remota somente após R0, schema/FK, fonte oficial exata, dry-run e idempotência.
