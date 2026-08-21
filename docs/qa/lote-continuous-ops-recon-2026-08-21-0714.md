# Lote continuous ops — recon oficial bounded — 2026-08-21 07:14Z

## Objetivo
Executar novo tick bounded das lanes oficiais e manter uma lane local independente sem promover dados sem fonte, identidade ou prova de idempotência.

## Entregue e verificado
- ALRS: `npm run impact:alrs:r4:sources` refez GET sequencial de 7 URLs oficiais; resultado: `http_200=7`, `ok=7`, `failed=0`. O manifesto atualizou somente `generated_at`; URLs, bytes e hashes permaneceram verificáveis.
- ALRS FED-17: `node scripts/repair-alrs-fed17-residual.mjs` em dry-run; `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- Câmara: API oficial `dadosabertos.camara.leg.br/api/v2/votacoes`, janela `2026-10-01`–`2026-12-31`, HTTP válido e `vote_ids=[]`; nenhum evento inferido.
- Senado: nenhum envelope foi adaptado/aplicado; deriva de bytes/SHA do manifesto permanece fail-closed.
- Dataset vivo: CSV completo `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv` com 1003 linhas/1003 IDs; snapshot com 1003 IDs; diferença por `SQ_CANDIDATO`: `0` somente no dataset e `0` somente no snapshot. O CSV segmentado de 213 linhas foi desconsiderado por não ser fonte completa.
- Lane local: `npm run impact:alrs:r4:substantive:requests` regenerou pacote com `9` pedidos e `8` versões; itens continuam `pending_substantive_source`, `human_review_required=true`, `remote_apply=false`.
- Auditoria de fontes read-only: ALRS sem fonte `1251` versões/`1647` eventos/`4` votos; Câmara `3/2/2`; Senado `112/188/455`; gaps reais preservados.

## Gates locais
- `npm run test`: 97 arquivos, 398 testes aprovados.
- `npx tsc --noEmit`: aprovado.
- `node scripts/validate-impact-schema.mjs`: aprovado.
- `npm run data:check`: 1003 candidaturas, 988 fotos oficiais.
- `npm run build`: aprovado; sitemap 1003 candidatos + 2 estáticas; `release.json` gerado.
- `npm run smoke:local`: 1002 cards, 0 falhas HTTP, 0 erros online de console, service worker pronto.
- `git diff --check`: aprovado.

## Escritas e segurança
Nenhuma escrita factual em Supabase, claims, source references, votos, identidades, FKs, matriz, Cloudflare ou snapshot público. A única alteração de worktree é o timestamp do manifesto ALRS e esta documentação/checkpoint.

## Bloqueios reais
1. FED-17 bloqueado por `JWT issued at future` quando requer consulta autenticada; nenhum voto foi aplicado.
2. Senado permanece bloqueado por divergência entre bytes/SHA atuais e manifesto versionado.
3. Câmara não retornou lote novo na janela consultada.
4. `npm run orch:doctor` permanece `OK=48`, `WARN=5`, `FAIL=1`: shell do cron usa Node 22.22.2; gates executados com Node 24.19.0. OpenCode ausente, fallback Ollama sem preflight e Codex MCP rápido não alteram a lane local segura.

## Publicação
Este tick está pronto para publicação documental após os gates verdes. Não há aplicação remota factual elegível.

## Próximo passo
Repetir recon bounded oficial e manter recuperação local de fontes substantivas ativa; qualquer aplicação remota continua condicionada a R0, schema/FK, fonte oficial exata, dry-run aprovado e idempotência.
