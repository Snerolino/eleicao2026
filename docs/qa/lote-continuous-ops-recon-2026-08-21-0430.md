# QA — Recon bounded oficial e pacote de fontes substantivas — 2026-08-21 04:30Z

## Objetivo
Executar o próximo tick contínuo sem promover fatos sem fonte: revalidar ALRS,
Senado e Câmara, regenerar o pacote local de pedidos de fonte substantiva e
confirmar que o pacote ALRS P0/P1 continua fail-closed.

## Entregue e verificado

- Recon ALRS oficial: HTTP 200, 77.442 bytes, SHA-256
  `6a386d7d8b9ae17f8f5107b0cb6c90d71795a8568f08ed7c5972746a4ac0bab1`, zero
  `data-item`; nenhum evento Enio/Terra foi inferido.
- Recon Câmara oficial: janela `2026-10-01` a `2026-12-31`, HTTP 200, JSON
  válido, 176 bytes; nenhum registro novo.
- Recon Senado: 6/6 HTTP 200 e prefixo PDF válido; 2/6 bytes coincidem com o
  manifesto de 2026-08-19 e 0/6 SHA coincidem. O gate permanece bloqueado por
  deriva do conteúdo, sem atualização do manifesto e sem aplicação.
- `node scripts/build-alrs-substantive-source-request-pack.mjs`: 9 pedidos para
  8 versões, artefato `data/legislative-import/alrs/substantive-source-request-pack-v1.json`.
- `npm run impact:alrs:r4:substantive:sources`: falhou fechado como esperado,
  25/25 itens sem fonte substantiva; nenhuma escrita factual ocorreu.
- `node scripts/repair-alrs-fed17-residual.mjs --help`: dry-run implícito com
  0 votos planejados, 0 correções de data e 4 residuais bloqueados; nenhum
  impacto tocado.
- Diff do dataset vivo: 0 CSVs comparáveis detectados nesta varredura, 0 IDs
  ausentes no snapshot; nenhum refresh foi aplicado.

## Gates locais

Executados com Node 24.19.0:

- `npm run test`: **398 testes / 97 arquivos, verde**.
- `npx tsc --noEmit`: **verde**.
- `node scripts/validate-impact-schema.mjs`: **verde**.
- `npm run data:check`: **verde**, 1003 candidaturas / 988 fotos oficiais.
- `npm run build`: **verde**, sitemap 1003 candidatos + 2 estáticas; release
  `281cdf0-20260821T043123725Z`.
- `git diff --check`: **verde**.
- `npm run smoke:local`: **verde**, 1002 cards, 0 falhas HTTP e 0 erros de
  console online; service worker pronto.

## Bloqueios reais

- Quatro residuais Enio Carlos Terra continuam sem ID oficial e fonte exata.
- Senado continua com SHA divergente do manifesto; fail-closed.
- Câmara não retornou lote novo.
- As 25 versões ALRS continuam sem fonte substantiva exata fora da rota de
  votos; não são elegíveis para aplicação remota.
- `npm run orch:doctor` ainda reporta FAIL de infraestrutura porque o shell
  padrão usa Node 22.22.2, embora os gates tenham sido executados com Node
  24.19.0. OpenCode ausente e Ollama sem preflight permanecem WARN opcionais.

## Estado de publicação

Este tick só produziu evidência read-only e documentação. Nenhuma identidade,
FK, voto, matriz, claim ou source reference foi alterada; não houve escrita
factual em Supabase. A documentação foi publicada no commit
`1646526907999fae5a4def41a23bcb9426509814` pelo workflow backup Cloudflare
`334951434`, run `32447332560`, concluído com sucesso e `headSha` idêntico.
Produção respondeu HTTP 200; `/release.json` confirmou o mesmo SHA e
`snapshot.row_count=1003`. Smoke remoto: 1002 cards, 0 falhas HTTP e 0 erros
de console online.

## Próximo passo

Manter a recon bounded: recuperar somente fonte substantiva oficial exata para
as 8 versões do pacote de pedidos; repetir Senado até SHA/bytes estáveis; e
continuar preparando lotes locais independentes. Aplicação remota somente após
R0, schema/FK, fonte oficial, dry-run e idempotência comprovados.
