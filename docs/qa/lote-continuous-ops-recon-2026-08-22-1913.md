# Lote continuous-ops — recon oficial e gates locais — 2026-08-22 19:13Z

## Objetivo
Executar um tick bounded do control plane: manter recon oficial read-only ativa,
verificar o estado local e preparar publicação somente após gates verdes, sem
promover fatos sem fonte oficial.

## Entregue e verificado
- Lock não bloqueante adquirido com `flock -n` e liberado ao fim do tick.
- ALRS FED-17 residual executado em modo seguro; falhou fechado com causa real
  `fetch failed`. Os quatro casos de Enio Carlos Terra permanecem sem ID oficial
  e fonte exata; nenhum voto foi inserido.
- Câmara consultada exclusivamente pela API oficial em 8 janelas trimestrais
  2025–2026; todas responderam `status=ok`. O resultado contém IDs de votação
  transitórios, sem reconciliação de identidade e sem aplicação.
- Senado permaneceu fail-closed: envelope nominal verificável ausente em
  `/tmp/senado-nominal-envelope-latest.json`.
- Workflows GitHub oficiais confirmados: backup `334951434`, primário `320564705`
  e verificador `335560210`.

## Gates locais
- Node explícito: `v24.19.0` (o shell padrão continua em Node `v22.22.2`,
  incompatível com `package.json`).
- `npm run test -- --passWithNoTests`: OK — 98 arquivos, 401 testes.
- `npx tsc --noEmit`: OK.
- `node scripts/validate-impact-schema.mjs`: OK — fixtures válidas aceitas e
  inválidas rejeitadas.
- `npm run data:check`: OK — 1.003 candidaturas, 988 fotos oficiais, 1 fonte TSE.
- `npm run build`: OK — sitemap com 1.003 candidatos + 2 estáticas e
  `release.json` local `f24b2f7-20260822T191233705Z`.
- `git diff --check`: OK.
- Worktree verificada antes da documentação: somente o estado esperado do tick.

## Estado dos dados
Dataset vivo e snapshot público permanecem no checkpoint conhecido de 1.003
candidaturas; nenhuma alteração factual foi feita. Nenhuma escrita no Supabase,
Cloudflare ou em fonte remota ocorreu.

## Bloqueios reais
- ALRS residual: endpoint retornou `fetch failed`; identidade/fonte exata ausentes.
- Senado: envelope nominal verificável ausente; fail-closed.
- Produção: `curl https://rs.votopraquem.org` retornou HTTP `000` por timeout de
  resolução DNS neste tick.
- Doctor ainda registra FAIL porque o shell invoca Node 22; os gates foram
  executados comprovadamente com Node 24.19.0.
- Publicação Git permanece condicionada à permissão efetiva do remoto; tentativas
  anteriores do mesmo arco retornaram HTTP 403.

## Próximo passo
Retentar `git push origin main`; se aceito, disparar/verificar o workflow backup
`334951434`, comparar `headSha` com o commit publicado e validar HTTP 200 da
produção e o release live. Manter ALRS/Senado fail-closed e qualquer aplicação
remota condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.
