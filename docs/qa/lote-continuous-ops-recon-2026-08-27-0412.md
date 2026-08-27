# QA — continuous ops recon — 2026-08-27 04:12 (-03)

## Objetivo

Retomar o ciclo bounded após mudança no fingerprint: reconciliar votos nominais ALRS, adquirir fontes oficiais read-only, verificar filas e publicação sem inserir fatos sem fonte.

## Entregue e verificado

- Dataset TSE oficial versus snapshot: `1003/1003` IDs, diferença `0/0`; CSV `553194` bytes, SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.
- Reconciliação ALRS: `2092` linhas; `2092` já presentes exatamente; `missing_safe_to_import=0`, conflitos `0`, ambíguos `0`, bloqueios de identidade/proposição `0`.
- Importador factual executado em modo seguro: `source_rows=0`, `deduplicated_rows=0`, `status=idle_no_missing_safe_rows`; nenhuma escrita factual.
- Aquisição oficial read-only: `24/24` URLs HTTP OK, `3456` `data-item`; nenhum lote substantivo candidato foi promovido.
- Auditoria de fontes strict permanece fail-closed: gaps ALRS/Câmara/Senado em versões `1251/3/112`, eventos `1647/2/188` e votos `4/2/455`.
- Reparação FED-17 permaneceu bloqueada porque a evidência reproduzida mudou (URL ALRS solicitante `93`, HTTP/hash/bytes divergentes); não houve `--apply`.
- Fila editorial: `1261` pendências; lote de propostas `0`; nenhuma decisão editorial foi aplicada.

## Gates locais

- Node `24.19.0`.
- `npm run test`: RC 0, `413/413` testes em `102` arquivos.
- `npx tsc --noEmit`: RC 0.
- `node scripts/validate-impact-schema.mjs`: RC 0.
- `npm run data:check`: RC 0, `1003` candidaturas e `988` fotos.
- `npm run build`: RC 0, `233` módulos, sitemap `1003 + 2` URLs.
- `npm run smoke:local`: RC 0, `1002` cards, `0` falhas HTTP, `0` erros online, service worker pronto. O preview já existente ocupou a porta `4173`; o smoke reutilizou-o após a tentativa de inicialização.
- `git diff --check`: RC 0.

## Publicação

- Commit `b86d114bd0b0ab80987f81c0eddb209706689e70` (`perf: paralelizar aquisicao de fontes ALRS`) está em `main` e `origin/main`.
- Deploy primário `33049089441`: `success`, `headSha` igual ao commit.
- Backup `33049319326`: `skipped` no mesmo SHA, sem necessidade de acionamento adicional.
- Produção: `/` HTTP 200 e `/release.json` HTTP 200; `live_sha` igual a `b86d114bd0b0ab80987f81c0eddb209706689e70`, snapshot `1003`.
- `portal:publication:verify`: `published_verified`.
- Auditoria live de claims: `1000` publicadas, `0` sem fonte.

## Bloqueios e próximo passo

- Doctor continua degradado: shell Node 22, OpenCode ausente e smoke MCP não exercitado no modo rápido; os gates do projeto foram executados com Node 24.
- Não importar os quatro votos ALRS residuais enquanto a evidência oficial não reproduzir URL, hash e bytes exatos.
- Manter reconciliação read-only e retomar aquisição/recuperação quando o manifesto elegível ou a fonte oficial mudar.

Nenhuma matriz, score, claim, assessment, disposição editorial, migration ou escrita remota factual foi alterada neste lote.
