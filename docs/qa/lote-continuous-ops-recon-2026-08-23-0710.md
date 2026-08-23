# QA — continuous ops recon — 2026-08-23 07:10Z

## Objetivo
Retomar o tick contínuo: validar publicação do commit documental, reexecutar gates locais e manter a reconciliação factual fail-closed.

## Entregue e verificado
- `origin/main` agora aponta para `0bc536152731c7244e48863f37d09aabb3012f94`; a primeira tentativa deste tick retornou HTTP 403, mas a verificação posterior confirmou o commit remoto.
- Backup Cloudflare disparado manualmente (`334951434`) e concluído com sucesso: run `32624462504`, `headSha=0bc536152731c7244e48863f37d09aabb3012f94`.
- Produção: raiz HTTP 200 e `/release.json` HTTP 200; release `0bc5361-20260823T064558287Z`, versão `0.2.892`, snapshot `1003`.
- Testes: `401` testes em `98` arquivos, RC 0.
- TypeScript: `npx tsc --noEmit`, RC 0.
- Contratos: `node scripts/validate-impact-schema.mjs`, RC 0; `npm run data:check`, RC 0 (`1003` candidaturas, `988` fotos, `1` fonte TSE).
- Build: `224` módulos, sitemap `1003 + 2`, `release.json` gerado, RC 0.
- Smoke local: `1002` cards, `0` falhas HTTP, `0` erros online, service worker pronto, RC 0.
- Dataset vivo: `consulta_cand_2026_RS.csv` comparado por `SQ_CANDIDATO`; `1003/1003`, diferença `0/0`, SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.

## Recon oficial / bloqueios
- Auditoria read-only regular RC 0: versões sem fonte ALRS/Câmara/Senado `1251/3/112`; eventos `1647/2/188`; votos `4/2/455`.
- Auditoria estrita RC 2 pelos gaps reais acima; nenhuma escrita factual foi feita.
- ALRS residual dos quatro casos Enio Carlos Terra permanece bloqueado sem ID oficial e fonte exata; Senado permanece fail-closed sem envelope nominal com SHA verificável.
- Doctor RC 1 por shell Node `22.22.2` enquanto o projeto exige Node 24; rota OpenCode ausente. Gates foram executados explicitamente com Node `24.19.0`.
- Nenhuma migration, RLS/RPC/Auth/Storage, escrita Supabase ou dado sem fonte foi aplicado.

## Próximo passo
Manter recon oficial read-only de ALRS/Senado/Câmara e aguardar evidência exata; no próximo tick revalidar produção/CI e avançar somente lote que passe R0, schema/FK, fonte oficial, dry-run e idempotência.
