# QA — Câmara votos nominais, lote 06

- **Data:** 2026-08-20
- **Objetivo:** consultar, em modo somente leitura, os 25 `vote_id` oficiais da Câmara nas posições 126–150 da janela `2026-07-01` a `2026-09-30`, preservando respostas brutas e emitindo envelope apenas quando o endpoint oficial individualizar votos.

## Entrega verificada

- Descoberta oficial: `300` IDs, sem bloqueio, via `https://dadosabertos.camara.leg.br/api/v2/votacoes`.
- Lote processado: `25` eventos (`2392226-55` até `2473101-43`, conforme manifesto de descoberta).
- Coleta oficial: `https://dadosabertos.camara.leg.br/api/v2/votacoes/{id}` e `/votos`.
- Resultado: `1` evento nominal individualizado, `24` sem registros individuais; `37` votos brutos; `4` votos RS no envelope dry-run.
- Evento individualizado: `2434783-64`; identidade, UF e valor foram preservados somente nos registros retornados pela API oficial.
- Manifesto do coletor: `.orchestrator/runtime/camara-batch-06/collector/manifest.json`.
- SHA-256 do manifesto: `40b0399b34a790f52943360509d0389d3f7921b4223beba42e9d944bfe733499`.
- Verificação independente: `79/79` checks passaram — IDs únicos, `detail.id` exato, URLs oficiais, contagens brutas e fontes dos votos do envelope.
- Nenhuma escrita em Supabase, snapshot público, claims ou dados factuais remotos foi realizada.

## Gates locais

- `npm run test`: **0**, `82` arquivos, `372` testes aprovados.
- `npx tsc --noEmit`: **0**.
- `node scripts/validate-impact-schema.mjs`: **0**, checkpoint OK.
- `npm run data:check`: **0**, `1003` candidaturas e `988` fotos oficiais.
- `npm run build`: **0**, sitemap com `1003` candidatos + estáticas e `release.json` gerado.
- `git diff --check`: **0**.
- Node usado nos gates: `v24.19.0`.

## Estado e bloqueios

- **ALRS:** continua fail-closed para os quatro residuais de Enio Carlos Terra; sem ID oficial exato/fonte válida aplicável.
- **Senado:** continua fail-closed enquanto a revalidação dos PDFs mantiver deriva de SHA-256 do manifesto.
- **Doctor:** `FAIL` operacional conhecido porque o shell do cron inicia Node `v22.22.2`, embora os gates tenham sido executados com Node `v24.19.0`; OpenCode ausente e gateway/Ollama permanecem avisos opcionais. Não foi alterada infraestrutura neste lote.
- Não houve inferência a partir de respostas vazias, matching heurístico, UUID inventado ou fonte fabricada.

## Publicação e verificação externa

- Commit `e041fcfc1e5c2b3a2b704e29f73cc45ea93ff253` publicado em `origin/main`.
- Backup Cloudflare `334951434`: run `32352044974`, `completed/success`, `headSha` idêntico.
- Produção `https://rs.votopraquem.org`: raiz HTTP 200.
- `/release.json` no domínio customizado, na última verificação, retornou uma publicação anterior (`0315780`, versão `0.2.0`), apesar do run final `32352375195` ter `headSha` `234e455`; a divergência de propagação/roteamento permanece e a produção customizada não foi declarada alinhada ao commit final.
- Smoke local exit 0: `1002` cards, mínimo esperado `1002`, `0` falhas HTTP e `0` erros de console online.

## Próximo passo

Iniciar Câmara lote 07 (posições 151–175), mantendo ALRS e Senado independentes e fail-closed.
