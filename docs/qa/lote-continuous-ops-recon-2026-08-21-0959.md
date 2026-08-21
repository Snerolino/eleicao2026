# QA — lote continuous-ops recon — 2026-08-21 09:59 UTC

## Objetivo
Executar um tick bounded do control plane: revalidar lock/estado, reconhecer fontes oficiais sem aplicar fatos, auditar o dataset vivo, fechar gates locais e verificar a publicação existente.

## Entregue e verificado
- Lock `flock -n .orchestrator/runtime/locks/continuous-progress.lock` adquirido e liberado sem loop/sleep.
- Doctor executado: `OK=49`, `WARN=6`, `FAIL=2`.
- Recon ALRS: `npm run impact:alrs:r4:sources` refez GET sequencial de 7 URLs oficiais; `http_200=7`, `ok=7`, `failed=0`; manifesto atualizado somente em `generated_at`.
- Auditoria read-only de fontes: ALRS sem fonte `1251` versões, `1647` eventos, `4` votos; Câmara `3/2/2`; Senado `112/188/455`. O comando terminou com `has_gaps=true`; nenhum gap foi suprimido.
- Reparo FED-17 não executou aplicação: o comando retornou `JWT issued at future`; nenhum voto/data foi tocado.
- Dataset vivo: 6 CSVs comparáveis de candidatos, `1003` IDs; snapshot `1003`; diferença `0` em ambos os sentidos. Um CSV não comparável falhou por byte CP1252, sem ser usado no conjunto de candidatos.
- Gates Node `v24.19.0`: `97` arquivos/`398` testes aprovados; TypeScript aprovado; schema de impacto aprovado; `data:check` aprovado (`1003` candidaturas, `988` fotos); build Vite/PWA aprovado; sitemap `1003` candidatos + `2` estáticas; `git diff --check` aprovado; smoke local aprovado (`1002` cards, `0` HTTP failures, `0` erros online de console, service worker pronto).
- Produção já publicada verificada: `https://rs.votopraquem.org` HTTP `200`; `/release.json` HTTP `200`, SHA `0ada04c734dc3233229a465ae58a91c4583e4158`, snapshot `row_count=1003`.

## Estado dos dados
Nenhuma escrita factual, identidade, FK, voto, matriz, claim, source reference, Supabase ou snapshot ocorreu. O único arquivo modificado é o manifesto ALRS, com atualização do timestamp de reconciliação; a evidência permanece fail-closed.

## Bloqueios reais
- FED-17: token Supabase com `JWT issued at future`, impedindo o dry-run de identidade/aplicação.
- Quatro votos ALRS residuais de Enio Carlos Terra continuam sem ID oficial e fonte exata.
- Senado: deriva de bytes/SHA e envelope transitório ausente; não adaptar nem publicar PDFs sem correspondência criptográfica.
- Auditoria de fontes continua com gaps substantivos reais.
- Doctor shell falha porque o shell cron usa Node `v22.22.2` enquanto o projeto exige Node 24; gates foram executados corretamente com Node `v24.19.0`.
- Smoke Codex MCP falha por `401 invalid_refresh_token`; OpenCode ausente e Ollama sem preflight são rotas opcionais, não bloquearam os gates locais.

## Publicação
- Commit `6731c1247a3141372c4c628db7fa8a7ab25b5287` criado e enviado para `origin/main` (`docs: registrar recon oficial e gates do tick`).
- Workflow backup Cloudflare `334951434`, run `32470554577`: `completed/success`, `headSha` idêntico ao commit.
- Produção: raiz HTTP `200`; `/release.json` confirmou SHA idêntico, release `6731c12-20260821T100022968Z` e `row_count=1003`.

## Próximo passo
Manter a recon bounded oficial e a lane local independente; tentar novo FED-17 somente após o JWT deixar de estar no futuro. Qualquer aplicação remota permanece condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.
