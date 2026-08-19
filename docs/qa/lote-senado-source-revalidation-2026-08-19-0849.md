# QA — revalidação das fontes nominais do Senado (2026-08-19 08:49 UTC)

## Objetivo

Executar um tick bounded de reconhecimento oficial read-only, preservar a
comparação binária do catálogo Senado e manter qualquer aplicação factual
fail-closed enquanto as respostas do portal forem voláteis.

## Entregue e verificado

- Refeitos sequencialmente os 6 GETs oficiais do Senado:
  `https://legis.senado.leg.br/parlam-servicosweb/api/v1/relatorios/votacoes-nominais/ano/<ano>/parlamentar/<id>`.
- Resultado de transporte: **6/6 HTTP 200**.
- Assinatura PDF (`255044462d312e35`): **6/6**.
- Comparação contra `data/legislative-import/senado/nominal-source-manifest-2026-08-19.json`:
  - bytes iguais: **3/6**;
  - SHA-256 iguais: **0/6**;
  - deriva observada inclusive nos três casos com bytes iguais, indicando
    conteúdo binário não estável/regerado.
- Evidência transitória preservada em:
  `.orchestrator/runtime/senado-scout/revalidation-current.json`.
- `npm run impact:senado:sources:apply` executado sem `--apply`:
  `planned=6`, `already_existing=0`, `missing=0`, `inserted=0`,
  `votes_touched=0`.
- Nenhuma escrita em Supabase, voto, identidade, FK, claim, matriz, RPC,
  RLS/Auth/Storage ou Cloudflare foi feita.

## Estado dos dados

- Reconciliação explícita do CSV oficial local contra o snapshot:
  `1003` linhas/IDs no dataset, `1003` no snapshot, `0` somente no dataset e
  `0` somente no snapshot.
- `npm run data:check`: **1003 candidaturas**, **988 fotos oficiais**, fontes
  TSE `1`.

## Gates locais (Node 24.19.0)

- `npm run test -- --passWithNoTests`: **79 arquivos, 368 testes, 0 falhas**.
- `npx tsc --noEmit`: **exit 0**.
- `node scripts/validate-impact-schema.mjs`: **exit 0**.
- `npm run data:check`: **exit 0**.
- `npm run build`: **exit 0**, sitemap com `1003` candidatos + estáticas,
  `1005` URLs; release gerado para o HEAD atual.
- `git diff --check`: **exit 0**; worktree limpa após o build.
- Doctor: `OK=48 WARN=5 FAIL=1`; o único FAIL é o shell do cron usando Node
  `v22.22.2` quando o projeto exige Node 24. Os gates foram executados com
  Node `v24.19.0`.

## Publicação/verificação

- O lote documental foi commitado e enviado para `origin/main` no commit
  `92a955266071cd2df7ae3dcad3e459482dd42b0c`.
- Backup Cloudflare workflow `334951434`: run `32234591902` concluído
  `success`, com `headSha` idêntico ao commit publicado.
- Produção raiz: **HTTP 200**.
- `https://rs.votopraquem.org/release.json`: SHA completo coincide com o
  commit publicado, snapshot `1003`, versão `0.2.412`.

## Bloqueio real

O catálogo oficial é volátil: nenhum dos 6 SHA-256 atuais coincide com o
manifesto versionado. Por segurança, não gerar manifesto novo neste tick e
não aplicar fontes/votos com conteúdo que não possa ser revalidado de forma
estável.

## Próximo passo bounded

Revalidar novamente o catálogo oficial com GET sequencial e retry controlado.
Só considerar novo manifesto após uma captura coerente e reproduzível; depois
reexecutar gates R0/schema/FK, dry-run e prova de idempotência. Até lá, Senado
permanece fail-closed.
