# QA — revalidação de fontes nominais Senado (2026-08-19 07:34 UTC)

## Objetivo
Revalidar read-only os seis endpoints oficiais de relatórios nominais do Senado e confirmar se o manifesto versionado ainda representa os bytes atuais, sem aplicar votos ou identidades.

## Entregue e verificado
- 6/6 GETs oficiais responderam HTTP 200, com retry controlado.
- Artefato transitório: `.orchestrator/runtime/senado-scout/revalidation-current.json`.
- Comparação independente por bytes e SHA-256 contra `data/legislative-import/senado/nominal-source-manifest-2026-08-19.json`:
  - 2/6 coincidiram em bytes;
  - 0/6 coincidiram em SHA-256;
  - divergências observadas: `2025/6341` (138360 vs 138361 bytes), `2025/825` (138151 vs 138150), `2026/1186` (97428 vs 97431), `2026/825` (97375 vs 97376); os demais mantiveram bytes, mas não o hash.
- `scripts/apply-senado-nominal-sources.mjs` em dry-run: 6 planejadas, 0 ausentes, 0 inseridas, 0 votos tocados.
- Reconciliação explícita do CSV TSE local ainda requer parsing delimitado por `;`; o arquivo tem cabeçalho único com campos separados por ponto e vírgula. Não houve alteração do snapshot.

## Gates locais
Executados com Node `v24.19.0`:
- `npm run test -- --passWithNoTests`: **79 arquivos / 368 testes verdes**.
- `npx tsc --noEmit`: **verde**.
- `node scripts/validate-impact-schema.mjs`: **verde**.
- `npm run data:check`: **verde — 1003 candidaturas / 988 fotos / 1 fonte TSE**.
- `npm run build`: **verde — sitemap com 1003 candidatos + 1005 URLs; release `c5f50c1-20260819T073434227Z`**.
- `git diff --check`: **verde**.
- Worktree antes da documentação: limpa; nenhum código ou dado público alterado.

## Estado dos dados e bloqueios
- Senado permanece **fail-closed**: o catálogo oficial é volátil e diverge do manifesto; não atualizar manifesto nem publicar votos automaticamente.
- Não foram alterados votos, candidatos, identidades, FKs, `source_references`, claims, matrizes, RPC, RLS, Supabase ou Cloudflare.
- O dry-run reporta `already_existing=0` porque não consulta remoto em modo dry-run; isso não é autorização para inserir fontes.

## Próximo passo
Preservar os seis payloads transitórios e revisar a causa da deriva de PDF; somente gerar novo manifesto após decisão/validação de uma captura estável. Depois repetir gates de identidade/schema/FK e manter o writer de votos por `legislator_id`, sem inferir `candidate_id`.
