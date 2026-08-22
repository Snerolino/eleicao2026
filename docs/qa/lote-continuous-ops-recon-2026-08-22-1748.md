# Lote continuous-ops — recon oficial e gates locais — 2026-08-22 17:48 UTC

## Objetivo
Executar um tick bounded do control plane, manter as lanes oficiais read-only,
validar o dataset vivo, fechar os gates locais e verificar a publicação sem
promover fatos sem fonte.

## Reconhecimento oficial
- ALRS FED-17 residual em dry-run, com Node 24.19.0: `planned_votes=0`,
  `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
  Os quatro votos residuais de Enio Carlos Terra continuam sem ID oficial e
  fonte exata; nenhuma escrita remota ocorreu.
- Câmara: API oficial `dadosabertos.camara.leg.br/api/v2/votacoes`, 8 janelas
  trimestrais de 2025–2026, todas `status=ok`, sem bloqueio. IDs oficiais foram
  observados, mas não houve reconciliação, vínculo ou aplicação.
- Senado: sem envelope nominal verificável; lane permaneceu fail-closed.
- Auditoria de fontes regular: RC 0. Auditoria estrita: RC 2 pelos gaps reais:
  versões sem fonte ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188` e
  votos `4/2/455`.
- Dataset: CSV oficial e snapshot têm `1003/1003` IDs, diferenças `0/0`;
  CSV SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.

## Gates locais verificados
- `npm run test`: RC 0 — 401 testes em 98 arquivos.
- `npx tsc --noEmit`: RC 0.
- `node scripts/validate-impact-schema.mjs`: RC 0.
- `npm run data:check`: RC 0 — 1.003 candidaturas, 988 fotos, 1 fonte TSE.
- `npm run build`: RC 0 — sitemap 1.003 candidatos + 2 estáticas; release local
  `2571e6c-20260822T174741306Z`.
- `npm run smoke:local`: RC 0 — 1.002 cards, 0 falhas HTTP, 0 erros de console
  online, service worker pronto.
- `git diff --check`: RC 0.
- Node usado nos gates: `v24.19.0` (o shell padrão continua em v22.22.2).

## Publicação e bloqueios
- Produção: raiz HTTP 200; `/release.json` HTTP 200, SHA live
  `2571e6c5fa9200745c6fcddbd687807db448fe4b`, versão `0.2.833`, snapshot
  1.003 com o SHA oficial acima. O SHA live corresponde ao HEAD local antes da
  documentação deste tick.
- `git push origin main`: bloqueado por HTTP 403 real — `Permission to
  Snerolino/eleicao2026.git denied to Snerolino`. Nenhum workflow novo foi
  acionado neste tick.
- Doctor continua com FAIL de infraestrutura porque o shell cron usa Node
  22.22.2 enquanto o projeto exige Node 24; os gates foram executados
  explicitamente com Node 24.19.0. OpenCode segue ausente e a rota MCP/Codex
  não foi repetida.
- Nenhuma migration, RLS/RPC/Auth/Storage, aplicação factual Supabase ou
  alteração Cloudflare foi feita.

## Próximo passo
Retentar `git push origin main` no próximo tick; se aceito, acompanhar o workflow
backup Cloudflare `334951434`, comparar `headSha` com o commit publicado e
revalidar `/release.json`. Manter ALRS/Senado e qualquer aplicação factual
condicionados a R0, schema/FK, fonte oficial, dry-run e idempotência.
