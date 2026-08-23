# QA — continuous ops recon — 2026-08-23 11:31 UTC

## Objetivo
Executar um tick bounded do control plane: revalidar bootstrap, manter recon oficial fail-closed, conferir dataset vivo, fechar gates locais e tentar publicação/verificação sem fabricar evidência.

## Entregue e verificado
- Lock bounded com `flock -n` adquirido e liberado.
- Bootstrap revalidado: HEAD local `32b3be8`; `main` está 5 commits à frente de `origin/main`; worktree limpa antes do registro.
- Dataset vivo comparado ao snapshot por `SQ_CANDIDATO`: `1003/1003` IDs; diferença `0`. CSV oficial: `553194` bytes, SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`. Snapshot: `1003` IDs únicos.
- Auditoria read-only de fontes RC 0: gaps reais preservados — versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`.
- ALRS FED-17 residual falhou fechado com `fetch failed`; os 4 casos Enio Carlos Terra continuam sem ID oficial e fonte exata.
- Câmara oficial consultada na janela `2025-01-01`–`2025-03-31`, uma página; retornou `network_error`/`fetch failed`, sem IDs e sem reconciliação.
- Senado permanece fail-closed, sem envelope nominal com SHA verificável.
- Gates locais com Node 24.19.0: `npm run test` — 401 testes/98 arquivos verdes; `npx tsc --noEmit` verde; `validate-impact-schema` verde; `npm run data:check` — 1003 candidaturas, 988 fotos, 1 fonte TSE; `npm run build` — 224 módulos, sitemap 1003 candidatos + 2 estáticas, `release.json` local `32b3be8-20260823T113108215Z`; `git diff --check` verde.

## Bloqueios reais
- GitHub API falhou por indisponibilidade de rede (`error connecting to api.github.com`); push/publicação não puderam ser verificados neste tick.
- Produção falhou por DNS (`rs.votopraquem.org`, HTTP 000, resolução timeout); não há evidência nova de deploy.
- Doctor permanece degradado: shell Node 22.22.2 apesar do requisito Node 24, OpenCode ausente e smoke MCP Codex sem evidência estruturada; auth Codex reportou token expirado. Nenhum segredo foi lido ou exposto.
- Auditoria strict de fontes continua bloqueada pelas lacunas acima; nenhuma escrita Supabase/Cloudflare, identidade, FK, source reference, claim ou voto factual foi feita.

## Próximo passo
Retentar transporte Git e rede em próximo tick; após `main -> main`, consultar o workflow backup `334951434`, validar `headSha` e produção. Manter ALRS/Senado/Câmara fail-closed e só aplicar fatos após R0, schema/FK, fonte oficial exata, dry-run e idempotência.
