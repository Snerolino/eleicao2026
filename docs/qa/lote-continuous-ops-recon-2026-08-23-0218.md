# QA — continuous ops recon — 2026-08-23 02:18 UTC

## Objetivo
Executar tick bounded do control plane com recon oficial read-only, gates locais, smoke e tentativa de publicação, sem promover fatos sem identidade e fonte verificáveis.

## Entregue e verificado
- Lock bounded adquirido/liberado com `flock -n`.
- Dataset vivo conferido contra `../dataset2026`: 1.003 IDs no CSV e 1.003 no snapshot, diferença 0/0; SHA do CSV `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.
- ALRS FED-17 residual em dry-run: `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- Câmara oficial consultada em 8 janelas trimestrais 2025–2026, `8/8` páginas `ok`, `blocked=null`, 700 IDs transitórios; nenhuma reconciliação ou aplicação.
- Senado permaneceu fail-closed sem envelope nominal/SHA verificável.
- `npm run test -- --passWithNoTests`: RC 0 — 98 arquivos, 401 testes aprovados.
- `npx tsc --noEmit`: RC 0.
- `node scripts/validate-impact-schema.mjs`: RC 0.
- `npm run data:check`: RC 0 — 1.003 candidaturas, 988 fotos oficiais, 1 fonte TSE.
- `npm run build`: RC 0 — 224 módulos, sitemap 1.003 candidatos + 2 estáticas, `release.json` local `dff3612-20260823T021646071Z`.
- `npm run smoke:local`: primeira tentativa falhou por carregamento assíncrono com 0 cards; repetição passou com 1.002 cards, 0 HTTP failures, 0 erros de console online e service worker pronto.
- `git diff --check`: RC 0; nenhum segredo lido ou exposto.

## Estado dos dados
Nenhuma escrita em Supabase, Cloudflare, snapshot, candidatos, votos, FKs, claims ou source references. A auditoria read-only mantém os gaps: versões sem fonte ALRS/Câmara/Senado `1251/3/112`; eventos `1647/2/188`; votos `4/2/455`.

## Bloqueios reais
1. ALRS: os 4 casos Enio Carlos Terra continuam sem ID oficial e fonte exata; não houve alteração.
2. Senado: envelope nominal e SHA não verificáveis; aplicação proibida.
3. Auditoria estrita retornou RC 2 pelos gaps de fontes acima; isso é fila de recuperação, não motivo para inventar evidência.
4. Doctor retornou RC 1: shell Node 22 incompatível com requisito Node 24; smoke Codex MCP sem evidência estruturada por token expirado/401; OpenCode ausente. Gates do projeto foram executados com Node 24.19.0.
5. Publicação: após o commit documental `34d622c`, `git push origin main` foi retentado duas vezes e falhou RC 128: primeira tentativa HTTP 403 (`Permission to Snerolino/eleicao2026.git denied to Snerolino`), segunda tentativa por falha DNS (`Could not resolve host: github.com`). HEAD local ficou 34 commits à frente de `origin/main`; nenhum workflow novo foi acionado.
6. Produção revalidada independentemente: raiz HTTP 200 e `/release.json` HTTP 200, ainda no release `3aae2d0`/versão `0.2.835`, SHA `3aae2d06338f81dc0b8c5df92ecc61ed8825dda3`, sem correspondência com o HEAD local. Workflow backup `334951434` mais recente está `completed/skipped` para o SHA antigo.

## Próximo passo
Retentar `git push origin main` quando a credencial efetiva e a rede permitirem; se aceitar, verificar o workflow backup Cloudflare `334951434`, comparar `headSha` com o commit publicado e validar produção (`https://rs.votopraquem.org` e `/release.json`). Manter ALRS/Senado fail-closed e Câmara somente como catálogo read-only até R0/schema/FK/fonte/dry-run/idempotência.
