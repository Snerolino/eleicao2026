# QA — reconhecimento oficial bounded Senado/ALRS/Câmara — 2026-08-20 23:57Z

## Objetivo

Executar novo tick read-only das fontes oficiais prioritárias, verificar o dataset vivo e manter aplicação factual fail-closed quando identidade, hash ou fonte exata não estiverem comprovados.

## Evidência verificada

- **Senado:** 6/6 URLs oficiais HTTP 200; 6/6 prefixos PDF válidos; 0/6 bytes coincidentes e 0/6 SHA-256 coincidentes com `data/legislative-import/senado/nominal-source-manifest-2026-08-19.json`. Nenhum manifesto, voto, identidade ou FK foi promovido.
- **ALRS:** `https://transparencia.al.rs.gov.br/parlamentares/votos-plenario` HTTP 200, 77.442 bytes, SHA-256 `sha256:6a386d7d8b9ae17f8f5107b0cb6c90d71795a8568f08ed7c5972746a4ac0bab1`, 0 atributos `data-item`, sem `Enio Carlos Terra` e sem `Terra`. Os quatro residuais continuam sem ID oficial e fonte exata.
- **Câmara:** API oficial na janela `2026-10-01`–`2026-12-31`, uma página HTTP 200, JSON válido, 0 `vote_ids`; nenhum evento inferido.
- **dataset2026:** snapshot público com 1.003 IDs; 10 CSVs comparáveis; 0 IDs ausentes no snapshot. Nenhum refresh/sincronização aplicado.
- Artefatos read-only: `.orchestrator/runtime/continuous-tick-20260820T235752Z/`.

## Gates locais

- `npm run test -- --passWithNoTests`: **exit 0**, 85 arquivos, 381 testes aprovados.
- `npx tsc --noEmit`: **exit 0**.
- `node scripts/validate-impact-schema.mjs`: **exit 0**.
- `npm run data:check`: **exit 0**, 1.003 candidaturas, 988 fotos oficiais, 1 fonte TSE.
- `npm run build`: **exit 0**, sitemap com 1.003 candidatos + 1.005 URLs e `release.json` gerado para `266b71c-20260820T235917574Z`.
- `git diff --check`: **exit 0**.
- `npm run smoke:local`: **exit 0**, 1.002 cards, 0 falhas HTTP, 0 erros de console online, detalhe e service worker aprovados.
- `npm run orch:doctor`: **exit 1** somente pelo shell cron Node 22.22.2 enquanto o projeto exige Node 24; OpenCode ausente e Ollama sem preflight são WARNs opcionais.

## Estado dos dados e publicação

Nenhuma escrita factual em snapshot, manifesto, `source_references`, claims, votos, identidades, FKs, Supabase ou matriz de impacto ocorreu. Este lote altera somente documentação QA e artefatos transitórios locais.

## Bloqueios reais

1. Senado: deriva contínua de bytes/SHA contra o manifesto versionado; gate fail-closed.
2. ALRS: catálogo consultado não expõe `data-item` nem o candidato residual; falta fonte exata/ID oficial.
3. Câmara: janela consultada está vazia.
4. Doctor do cron: shell Node 22.22.2, apesar da recon executada com Python e gates locais verdes.

## Próximo passo

Publicar este checkpoint documental após smoke local, verificar o backup Cloudflare e a confirmação de SHA em produção; no próximo tick repetir reconciliação bounded sem promover deriva e manter a lane local independente ativa.
