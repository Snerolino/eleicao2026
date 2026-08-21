# Lote continuous ops — propostas P0 ALRS e verificação de fontes

- **Data:** 2026-08-21T02:52:14Z
- **Objetivo:** manter a lane local ativa com pacote de propostas substantivas P0 e revalidar, por GET oficial bounded, as fontes ALRS do pacote de mérito.

## Entregue e verificado

- `npm run impact:alrs:r4:p0:proposals` executado com Node 24. Resultado: `2` versões e `2` avaliações propostas em `data/legislative-import/alrs/p0-assessment-proposal-pack-v1.json`.
- O pacote permanece `pending_review`, exige revisão humana e mantém `remote_apply=false`; não houve publicação editorial nem aplicação factual remota.
- `npm run impact:alrs:r4:sources` executado com Node 24. Resultado: `7/7` URLs HTTP 200, `7/7` válidas, `0` falhas; manifesto atualizado em `data/legislative-import/alrs/impact-merit-source-manifest.json`.
- A reconciliação oficial continua fail-closed para os quatro votos residuais de Enio Carlos Terra: sem ID oficial e fonte exata não houve inferência, vínculo ou escrita.

## Gates locais

- `npm run test`: **0**, 95 arquivos, 396 testes aprovados.
- `npx tsc --noEmit`: **0**.
- `node scripts/validate-impact-schema.mjs`: **0**, contrato bom/ruim validado.
- `npm run data:check`: **0**, 1003 candidaturas e 988 fotos oficiais.
- `npm run build`: **0**, sitemap com 1003 candidatos/1005 URLs e `release.json` gerado para o HEAD local.
- `npm run smoke:local`: **0**, 1002 cards visíveis, 0 falhas HTTP e 0 erros de console online; service worker pronto.
- `git diff --check`: **0**.

## Estado dos dados e bloqueios

- Nenhum snapshot público, identidade, FK, voto, matriz, claim, Supabase ou Cloudflare foi alterado.
- Senado permanece fail-closed enquanto os hashes dos PDFs divergirem do manifesto.
- Câmara permanece sem eventos novos na janela consultada.
- Doctor do cron segue com FAIL conhecido por Node 22.22.2 no shell; a execução dos gates usou Node 24. OpenCode ausente e Ollama sem preflight são WARNs opcionais.

## Próximo passo

Publicar este checkpoint documental e o novo timestamp do manifesto; depois confirmar o workflow backup do Cloudflare, `release.json` e smoke de produção. Manter as lanes oficiais bounded ativas sem aplicação factual.

## Publicação verificada

- Commit publicado em `origin/main`: `a44350885c6868f447191921e3feec4e63dadeb0`.
- Workflow backup `334951434`, run `32441385902`: `completed/success`, `headSha` idêntico ao commit.
- Deploy confirmou preview `28f0fc34.portal-transparencia-rs.pages.dev`; tanto preview quanto domínio `https://rs.votopraquem.org` retornaram `/release.json` HTTP 200 com SHA `a44350885c6868f447191921e3feec4e63dadeb0`.
- Smoke remoto: **0**, 1002 cards, 0 falhas HTTP e 0 erros de console online; service worker pronto.
