# Lote continuous ops — recon oficial bounded — 2026-08-21 06:49Z

## Objetivo
Executar um tick bounded das quatro lanes: reconciliação oficial read-only, lane local independente, verificação de publicação e avaliação fail-closed de aplicação remota.

## Entregue e verificado
- ALRS: `npm run impact:alrs:r4:sources` refez GET sequencial de 7 URLs oficiais; resultado real: `http_200=7`, `ok=7`, `failed=0`. O manifesto só atualizou `generated_at`; URLs, hashes e bytes permaneceram iguais.
- ALRS FED-17: `npm run impact:alrs:residual:repair` permaneceu dry-run bloqueado por `JWT issued at future`; `0` aplicações e nenhuma escrita factual.
- Câmara: API oficial `dadosabertos.camara.leg.br/api/v2/votacoes`, janela `2026-10-01`–`2026-12-31`, HTTP válido e `vote_ids=[]`; nenhum evento inferido.
- Dataset vivo: `consulta_cand_2026/consulta_cand_2026_RS.csv` com 1003 linhas/1003 IDs; snapshot com 1003 IDs; diferença por `SQ_CANDIDATO`: `0` somente no dataset e `0` somente no snapshot.
- Não houve escrita em Supabase, claims, source references, votos, identidades, FKs, matriz, Cloudflare ou snapshot público.

## Estado dos dados
O snapshot público continua em 1003 candidaturas e 988 fotos rastreáveis, conforme checkpoint anterior. A recon ALRS permanece verificável; os quatro residuais Enio Carlos Terra continuam sem ID oficial e fonte exata. Senado permanece fail-closed por deriva de SHA/bytes registrada no checkpoint. Câmara não trouxe lote novo.

## Gates / ambiente
- `npm run orch:doctor`: `OK=48`, `WARN=5`, `FAIL=1`; FAIL conhecido: shell do cron usa Node 22.22.2, enquanto o projeto exige Node 24. Gates de projeto devem usar o binário Node 24 explícito.
- Recon executada com Node 24.19.0.
- O lock bounded foi usado com `flock -n` e liberado ao fim do tick.

## Publicação verificada
- Commit `49a1ce938e7e1c4576947535328b353891cadfd3` publicado em `origin/main`.
- Workflow backup Cloudflare `334951434`, run `32456140033`: `completed/success`, `headSha` idêntico.
- Produção: raiz HTTP 200; `/release.json` SHA `49a1ce938e7e1c4576947535328b353891cadfd3`, `row_count=1003`.
- Smoke remoto: 1002 cards, 0 falhas HTTP, 0 erros de console online, service worker pronto.

## Bloqueios reais
1. FED-17 não pode consultar/aplicar enquanto o JWT do ambiente estiver com emissão futura (`JWT issued at future`).
2. Senado não pode promover PDFs enquanto bytes/SHA divergirem do manifesto oficial versionado.
3. Câmara não possui novos `vote_ids` na janela consultada.
4. Doctor do shell permanece vermelho por Node 22.22.2; não impede execução local com Node 24.19.0.

## Próximo passo
Manter a recon bounded oficial ativa e iniciar novo chunk local independente. Qualquer aplicação remota continua condicionada a R0, schema/FK, fonte oficial exata, dry-run aprovado e prova de idempotência.
