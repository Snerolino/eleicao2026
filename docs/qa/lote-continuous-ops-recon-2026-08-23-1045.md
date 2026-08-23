# QA — lote continuous ops recon — 2026-08-23 10:45 UTC

## Objetivo
Executar mais um tick bounded: manter as lanes de recon oficial ativas, validar dataset/snapshot, repetir os gates locais e retentar a publicação sem aplicar fatos remotos.

## Entregue e verificado
- Lock bounded foi testado com `flock -n .orchestrator/runtime/locks/continuous-progress.lock` e liberado sem loop/sleep.
- Câmara oficial read-only: `8/8` janelas trimestrais 2025–2026 retornaram `status=ok`, `blocked=null`; IDs oficiais foram apenas inventariados. Nenhuma identidade, voto ou fonte foi reconciliada/aplicada.
- Auditoria de fontes read-only RC 0: versões sem fonte ALRS/Câmara/Senado `1251/3/112`; eventos `1647/2/188`; votos `4/2/455`. A fila factual permanece aberta.
- ALRS FED-17 residual falhou fechado antes da coleta: `JWT issued at future`. Os quatro casos de Enio Carlos Terra continuam sem ID oficial e fonte exata; nenhum voto foi inventado ou escrito.
- Dataset/snapshot conferidos: `1003` registros no snapshot, `1003` IDs únicos; CSV oficial presente com `553194` bytes e SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.
- Gates em Node `v24.19.0`: `401/401` testes em `98` arquivos; TypeScript RC 0; schema RC 0; `data:check` RC 0 (`1003` candidaturas, `988` fotos, `1` fonte TSE); build RC 0 (`224` módulos, sitemap `1003 + 2`, release local `85176ed-20260823T104525983Z`); `git diff --check` RC 0.
- Produção parcialmente verificada: `/release.json` HTTP 200; a raiz falhou por timeout de resolução DNS (`HTTP 000`). Não houve deploy novo.

## Bloqueios reais
- A primeira tentativa de `git push origin main` falhou por DNS (`Could not resolve host: github.com`); a retentativa alcançou o remoto e falhou com HTTP 403 (`Permission to Snerolino/eleicao2026.git denied to Snerolino`). O commit deste tick `125ea9f` deixa `main` local `4` commits à frente de `origin/main`; nenhum workflow remoto foi acionado.
- O reparo ALRS não avançou porque o token JWT local foi rejeitado como emitido no futuro; fail-closed preservado.
- Doctor permanece degradado por Node 22 no shell padrão, OpenCode ausente e smoke Codex sem evidência estruturada; os gates do projeto foram executados explicitamente em Node 24.19.0.
- Nenhuma mutação factual, Supabase remoto, Cloudflare, identidade, FK, source reference ou claim ocorreu.

## Próximo passo
Retentar transporte Git e, somente após `main -> main`, validar o workflow backup `334951434`, `headSha` e `/release.json`. Continuar recon ALRS/Senado/Câmara em modo read-only; aplicação factual permanece condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.
