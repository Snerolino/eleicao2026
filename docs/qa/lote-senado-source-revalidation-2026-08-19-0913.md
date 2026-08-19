# QA — revalidação das fontes nominais do Senado (2026-08-19 09:13 UTC)

## Objetivo

Executar um tick bounded de reconhecimento oficial read-only, repetir os GETs
sequenciais do catálogo Senado e manter a aplicação factual fail-closed enquanto
as respostas binárias permanecerem voláteis.

## Entregue e verificado

- Lock não bloqueante adquirido e liberado por execução única.
- Seis GETs oficiais do Senado refeitos sequencialmente, com até três tentativas:
  `https://legis.senado.leg.br/parlam-servicosweb/api/v1/relatorios/votacoes-nominais/ano/<ano>/parlamentar/<id>`.
- Transporte: **6/6 HTTP 200**.
- Assinatura PDF (`255044462d312e35`): **6/6**.
- Comparação contra o manifesto versionado:
  - bytes iguais: **2/6**;
  - SHA-256 iguais: **0/6**.
- Evidência transitória preservada em
  `.orchestrator/runtime/senado-scout/revalidation-current.json`, sem entrar no
  snapshot público.
- `npm run impact:senado:sources:apply` sem `--apply`:
  `planned=6`, `already_existing=0`, `missing=0`, `inserted=0`,
  `votes_touched=0`.
- Nenhuma escrita Supabase, voto, identidade, FK, claim, matriz, RPC,
  RLS/Auth/Storage ou Cloudflare foi executada.

## Estado dos dados

- `npm run data:check`: **1003 candidaturas**, **988 fotos oficiais**, **1 fonte
  TSE**.
- O catálogo Senado permanece somente como preparação de fonte; não houve
  promoção de identidade Senado para `candidate_id` nem publicação de votos.

## Gates locais — Node 24.19.0

- `npm run test -- --passWithNoTests`: **79 arquivos, 368 testes, 0 falhas**.
- `npx tsc --noEmit`: **exit 0**.
- `node scripts/validate-impact-schema.mjs`: **exit 0**.
- `npm run data:check`: **exit 0**.
- `npm run build`: **exit 0**, sitemap **1005 URLs** e release gerado para
  `88edebfb465e84fee495f33856f55dcecf242d81`.
- `git diff --check`: **exit 0**.
- Doctor do shell cron: `OK=51 WARN=5 FAIL=1`; o FAIL é exclusivamente Node
  `v22.22.2` no shell, enquanto o projeto exige Node 24. Os gates foram
  executados com Node `v24.19.0`.

## Publicação/verificação do estado anterior

- Worktree iniciou limpa em `88edebfb465e84fee495f33856f55dcecf242d81`.
- Produção raiz: **HTTP 200**.
- `/release.json`: SHA `88edebfb465e84fee495f33856f55dcecf242d81`, versão `0.2.414`,
  snapshot `1003`.
- Este relatório ainda precisa ser publicado no ciclo bounded atual.

## Bloqueio real

O portal Senado continua volátil: **0/6 SHA-256 atuais coincidem** com o
manifesto. Não gerar manifesto novo nem aplicar fontes/votos com conteúdo que
não possa ser revalidado de forma estável e reproduzível.

## Próximo chunk bounded

Repetir GETs oficiais sequenciais com retry controlado. Só revisar o manifesto
após captura coerente; então reexecutar R0, schema/FK, dry-run e prova de
idempotência. Senado permanece fail-closed até esses gates.
