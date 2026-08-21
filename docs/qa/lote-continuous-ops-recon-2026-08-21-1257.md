# Lote continuous-ops — pacote ALRS e publicação — 2026-08-21 12:57 UTC

## Objetivo
Verificar e publicar o pacote local de requisições de fontes substantivas ALRS sem aplicar fatos remotamente.

## Entregue e verificado
- `build-alrs-substantive-source-request-pack.mjs` preserva URLs oficiais, `source_reference_id` separado e pedidos por grupo.
- Pacote: 7 requisições, 6 versões P1, 5 versões P0 excluídas por fonte substantiva verde.
- `remote_apply=false`, `human_review_required=true`, fontes substantivas ainda pendentes.

## Gates locais (Node 24.19.0)
- `npm run test`: 98 arquivos / 400 testes aprovados.
- `npx tsc --noEmit`: aprovado.
- `node scripts/validate-impact-schema.mjs`: aprovado.
- `npm run data:check`: 1.003 candidaturas / 988 fotos, aprovado.
- `npm run build`: aprovado; sitemap 1.005 URLs e `release.json` gerado.
- `git diff --check`: aprovado; worktree limpa.
- Smoke built preview: 1.002 cards, 0 falhas HTTP, 0 erros de console online, service worker pronto.

## Bloqueios reais
- Quatro votos residuais ALRS Enio/Terra continuam sem identidade e fonte exata.
- Senado permanece fail-closed sem envelope transitório e com deriva de evidência.
- Auditoria estrita de fontes continua com gaps reais; nenhuma fonte ou voto foi inventado/aplicado.
- Doctor do shell continua FAIL por Node 22.22.2; gates executados com Node 24.19.0. Codex MCP permanece indisponível por `401 invalid_refresh_token`.

## Publicação verificada
- Commit `6d5a3730023ec91a9fd1c0d7d6ec2d143dd4fa21` em `origin/main`.
- Backup Cloudflare `334951434`, run `32484300926`: `completed/success`, `headSha` idêntico.
- Produção `https://rs.votopraquem.org`: HTTP 200; `/release.json` confirmou SHA idêntico, `release_id=6d5a373-20260821T125647847Z`, `row_count=1003`.

## Próximo passo
Nova recon bounded oficial e lane local independente. Aplicação factual remota somente após R0, schema/FK, fonte oficial exata, dry-run e idempotência.
