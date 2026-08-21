# QA — tick contínuo: recon oficial + pacote ALRS de mérito

**Data:** 2026-08-21T01:42Z  
**Modo:** bounded, read-only para fontes e fail-closed para aplicação factual

## Objetivo

Manter as quatro lanes ativas: reconciliação oficial prioritária (ALRS/Senado/Câmara), preparação local independente e publicação somente após gates verdes.

## Reconhecimento oficial verificado

- **ALRS:** URL oficial `https://transparencia.al.rs.gov.br/parlamentares/votos-plenario`, HTTP 200, 77.442 bytes, SHA-256 `sha256:6a386d7d8b9ae17f8f5107b0cb6c90d71795a8568f08ed7c5972746a4ac0bab1`; 0 ocorrências de `data-item`, sem `Enio Carlos Terra` e sem `Terra`. Os quatro votos residuais (`alrs_pl134_2023`, `alrs_pl165_2025`, `alrs_pl361_2025`, `alrs_pl77_2025`) permanecem sem ID oficial/fonte exata.
- **Senado:** 6/6 URLs oficiais HTTP 200, 1/6 coincidência de bytes e 0/6 coincidências SHA-256 com o manifesto de 2026-08-19. Gate de deriva permanece fail-closed; nenhum PDF, identidade, FK ou voto foi promovido.
- **Câmara:** API oficial `votacoes` na janela `2026-10-01`–`2026-12-31`, HTTP 200, JSON válido, 0 registros. Nenhum evento foi inferido.
- Artefatos read-only: `.orchestrator/runtime/continuous-tick-20260821T014207Z/`.

## Lane local

`npm run impact:alrs:r4:merit` em Node 24: 25 versões, 149 votos factuais, 5 P0, 20 P1 e 4 colisões excluídas fail-closed. O pacote permanece `pending_review`, sem grupos/direção/defending_vote e sem aplicação remota.

A lane P0 independente também extraiu evidência oficial das 7 URLs ALRS do pacote: 7/7 HTTP 200 e 526 objetos `data-item`; a busca exata não encontrou Enio/Terra. O artefato `data/legislative-import/alrs/p0-official-event-evidence.json` mantém URLs, bytes e SHA por fonte, com `remote_apply=false`. Isso não resolve a identidade dos quatro residuais e não autoriza aplicação.

## Bloqueios reais

1. ALRS não expõe o candidato residual no catálogo atual; falta rota histórica oficial, ID exato e fonte HTML/hash.
2. Senado apresenta deriva de bytes/SHA contra o manifesto versionado.
3. Câmara não retornou lote oficial na janela consultada.
4. `npm run orch:doctor` segue exit 1 pelo shell Node 22.22.2, embora os gates do projeto sejam executáveis com Node 24.19.0; OpenCode ausente e Ollama sem preflight são avisos opcionais.

## Segurança / aplicação

Nenhuma escrita em snapshot, manifesto factual, source reference, voto, identidade, FK, Supabase, Cloudflare ou matriz de impacto ocorreu. Sem fonte oficial exata, a fila permanece fail-closed.

## Publicação / verificação

- Commit final: `74bb92a70279b4b0dc92ea6b6e7f700e21b2878f`, `main` sincronizada com `origin/main`.
- Backup Cloudflare `334951434`, run `32437580967`: `completed/success`, `headSha` idêntico.
- Produção: raiz HTTP 200; `/release.json` HTTP 200, SHA `74bb92a70279b4b0dc92ea6b6e7f700e21b2878f`, `row_count=1003`, release `74bb92a-20260821T014847154Z`.

## Próximo passo

Repetir recon bounded pelas rotas oficiais e manter a revisão local do pacote ALRS independente. Só planejar/aplicar fatos após identidade oficial, fonte exata, R0/schema/FK, dry-run e segunda execução idempotente.
