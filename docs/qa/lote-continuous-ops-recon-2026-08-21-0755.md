# Lote continuous ops — recon bounded oficial — 2026-08-21 07:55 UTC

## Objetivo
Executar novo tick bounded das lanes oficiais, verificar o dataset vivo e fechar os gates locais sem aplicar dados factuais sem fonte/identidade/FK válidos.

## Entregue e verificado
- Lock não bloqueante adquirido/liberado com `flock -n`.
- Recon executada por `.orchestrator/runtime/bounded-recon.mjs` com Node 24.19.0.
- Evidências: `.orchestrator/runtime/tick-20260821T075555Z/`.
- Senado: 6/6 HTTP 200, 6/6 PDFs válidos, 4/6 bytes coincidentes e 0/6 SHA coincidentes com o manifesto; fail-closed.
- ALRS: HTTP 200, 77.442 bytes, SHA-256 `sha256:6a386d7d8b9ae17f8f5107b0cb6c90d71795a8568f08ed7c5972746a4ac0bab1`, 0 `data-item`, sem ocorrência de Enio/Terra na página de catálogo; nenhum voto ou ID inferido.
- Câmara: HTTP 200, JSON válido, janela 2026-10-01–2026-12-31, 0 registros novos.
- Dataset vivo: 7 CSVs comparáveis, 1003 IDs no snapshot, 0 ausentes no snapshot; nenhum refresh aplicado.

## Estado dos dados
Nenhuma escrita factual, identidade, FK, voto, matriz, claim, source reference, Supabase, Cloudflare ou snapshot foi realizada. A lane remota permanece bloqueada por R0/schema/FK/fonte/dry-run/idempotência.

## Bloqueios reais
- Senado: deriva de SHA em 6/6 fontes; não publicar.
- ALRS: catálogo sem `data-item` e sem Enio/Terra; não inventar ID ou voto.
- Câmara: nenhum `vote_id` no intervalo consultado.
- `npm run orch:doctor`: FAIL porque o shell está em Node 22.22.2; gates executados com Node 24.19.0. WARNs não bloqueantes: OpenCode ausente, gateway Hermes com Node divergente e Ollama sem preflight.

## Verificação local
- `npm run test`: exit 0.
- `npx tsc --noEmit`: exit 0.
- `node scripts/validate-impact-schema.mjs`: exit 0.
- `npm run data:check`: exit 0, 1003 candidaturas e 988 fotos oficiais.
- `npm run build`: exit 0; sitemap com 1003 candidatos + 2 URLs estáticas; `release.json` gerado com SHA `069105268f54`.
- `git diff --check`: exit 0.
- `npm run smoke:local`: exit 0; 1002 cards, 0 falhas HTTP, 0 erros de console online e service worker pronto.

## Publicação verificada
- Commit `7c8f84919cc2838a67d5de310d012185172503f9` enviado para `origin/main`.
- Backup Cloudflare `334951434`, run `32461005226`: `completed/success`, `headSha` idêntico.
- Produção: `https://rs.votopraquem.org` HTTP 200.
- `release.json` em produção confirma SHA idêntico, `row_count=1003`, release `7c8f849-20260821T075850993Z`.
- Smoke remoto: exit 0; 1002 cards, 0 falhas HTTP, 0 erros de console online e service worker pronto.

## Próximo passo
Manter recon oficial e lane local independentes. Senado, ALRS e Câmara continuam fail-closed; aplicação remota somente após R0/schema/FK/fonte/dry-run/idempotência.
