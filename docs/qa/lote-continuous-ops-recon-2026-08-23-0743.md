# Lote continuous-ops — reconhecimento oficial 2026-08-23 07:43Z

## Objetivo
Executar o próximo tick bounded das lanes oficiais, mantendo fail-closed para ALRS, Senado e Câmara, e validar o snapshot público sem mutação factual.

## Entregue e verificado
- Lock bounded `flock -n` adquirido/liberado sem loop ou sleep.
- Node 24.19.0 selecionado para os gates do projeto.
- ALRS FED-17 residual em dry-run: `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- Auditoria de fontes read-only: versões sem fonte `1251/3/112` (ALRS/Câmara/Senado), eventos sem fonte `1647/2/188`, votos sem fonte `4/2/455`; gaps reais preservados.
- Câmara: consulta oficial `dadosabertos.camara.leg.br/api/v2`, janelas trimestrais 2025–2026, `status=ok` em 8 janelas e IDs oficiais retornados; nenhuma reconciliação ou aplicação.
- Dataset vivo versus snapshot: `1003/1003` registros, nenhum somente no CSV ou no snapshot; SHA do CSV `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.
- `npm run data:check`: RC 0; `1003` candidaturas, `988` fotos oficiais e `1` fonte TSE.

## Estado dos dados
Nenhum candidato, voto, identidade, FK, source reference, claim, snapshot, Supabase remoto ou Cloudflare foi alterado. As quatro pendências ALRS de Enio Carlos Terra permanecem sem ID oficial/fonte exata. Senado continua sem envelope nominal com SHA verificável.

## Bloqueios reais
- ALRS: não há evidência oficial exata e identidade oficial para os quatro residuais; dry-run não planejou escrita.
- Senado: envelope `/tmp/senado-nominal-envelope-latest.json` ausente; adaptação/aplicação impossíveis sem envelope e deriva verificáveis.
- Fontes legislativas: gaps substantivos reais, auditoria permanece não-verde.
- Doctor: shell padrão Node 22.22.2 incompatível com o requisito Node 24; OpenCode ausente. O tick usou Node 24.19.0 diretamente.
- Publicação: `HEAD` local continua à frente de `origin/main`; transporte Git já rejeitou HTTP 403 no tick anterior. Não declarar deploy novo sem `main -> main` aceito.

## Publicação e verificação
- Gates locais verdes: 401 testes em 98 arquivos, TypeScript, schema, `data:check`, build, `git diff --check`.
- Commit local criado: `c65c4e94474d5f8c798a942cb05b7fa0d6e1cd41` (`docs: registrar recon oficial bounded`).
- `git push origin main` foi retentado 3 vezes e rejeitado em todas com RC 128 / HTTP 403: `Permission to Snerolino/eleicao2026.git denied to Snerolino`.
- `gh api` continua reportando identidade `Snerolino` com `push=true` e `admin=true`, evidenciando divergência entre API e transporte HTTPS; `HEAD` local está 3 commits à frente de `origin/main`.
- Produção existente revalidada: raiz HTTP 200; `/release.json` HTTP 200, `sha=0bc536152731c7244e48863f37d09aabb3012f94`, `row_count=1003`. Não houve deploy deste commit e não há `headSha` novo para validar.

## Próximo passo
Corrigir/revalidar o transporte Git HTTPS e retentar `main -> main`; somente após aceite validar workflow backup Cloudflare `334951434`, `headSha`, `/release.json` e smoke remoto. Manter aplicação factual remota bloqueada até R0/schema/FK/fonte/dry-run/idempotência.
