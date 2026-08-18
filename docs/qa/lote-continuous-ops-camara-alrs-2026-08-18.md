# QA — tick contínuo: recuperação ALRS e rota histórica Câmara (2026-08-18)

## Objetivo

Executar uma retomada bounded read-only para validar a infraestrutura local,
reavaliar a fila de recuperação ALRS e localizar evidência oficial para os dois
votos históricos da Câmara sem fonte.

## Evidência executada

- Lock contínuo adquirido exclusivamente durante o chunk; nenhum writer ativo e
  worktree inicialmente limpa.
- `npm run orch:doctor -- --smoke` passou após selecionar explicitamente Node
  `v24.19.0`: **OK=53, WARN=4, FAIL=0**. Warnings: OpenCode ausente, Gemini
  legacy, Ollama sem resposta e rota opcional correspondente; nenhum bloqueio
  do caminho Codex/Antigravity.
- Sem a seleção de Node 24, o mesmo doctor falhou porque o shell cron iniciou
  Node `v22.22.2`; o projeto exige `>=24 <25`. O tick corrigiu a execução de
  forma bounded com `source ~/.nvm/nvm.sh; nvm use 24.19.0`, sem alterar segredo
  ou processo persistente.
- `npm run impact:alrs:sources:backfill` não avançou: o Supabase retornou
  `FED-17: JWT issued at future`. Nenhuma escrita remota foi executada.
- Auditoria legislativa read-only retornou exit 2 por lacunas reais. Cobertura:
  ALRS 3985/4000 votos, Câmara 195/197, Senado 0/455.

## Câmara — resultado da pesquisa oficial

A busca oficial localizou páginas do Portal da Câmara para a proposição
`2209381` (PL 3723/2019), incluindo o registro de sessão
`/evento-legislativo/56938` e o texto oficial em `escriba.camara.leg.br`.
Isso comprova uma rota histórica de sessão/documentação, mas não prova, por si
só, votos nominais individuais para o evento remoto pendente. O evento
`56938` é de 20/08/2019 e a página consultada descreve a sessão e seus trechos;
não foi usado para preencher voto, identidade, hash ou `source_reference`.
A rota de dados abertos/API para os dois IDs históricos continua pendente de
reconciliação exata com o evento e a votação nominal correspondente.

## Bloqueios fail-closed

- ALRS: token/JWT com validade futura impede o backfill neste ambiente; a
  evidência HTML do manifesto FED-17 permanece válida, mas não houve plano
  aplicável neste tick.
- Câmara: rota de sessão encontrada, porém sem prova nominal individual exata;
  os dois votos continuam sem fonte. Não inferir votos a partir de placar,
  sessão, discurso ou página de proposição.
- Auditoria `--strict` continua deliberadamente não verde enquanto existirem
  lacunas.

## Alterações

- Somente este relatório e o checkpoint operacional foram atualizados.
- Commit local criado: `9ee011d` (`docs: registra retomada contínua ALRS e Câmara`).
- `git push origin main` falhou com DNS/network: `Could not resolve host: github.com`; portanto o commit está local e ainda não publicado no GitHub.
- Verificação de produção também ficou bloqueada por DNS (`curl`: HTTP 000, resolução expirou); nenhum deploy foi disparado.
- Nenhuma migration, RPC, matriz de impacto, claim, dado factual, Supabase ou
  Cloudflare foi alterado.

## Próximo chunk bounded

Retomar a pesquisa Câmara pela rota oficial de texto/sessão e endpoints de
votação nominal, exigindo correspondência exata entre proposição, evento, data,
identidade e valor. Reexecutar o backfill ALRS somente quando o gate de JWT
estiver válido; manter `--apply` bloqueado sem plano verificável e prova de
idempotência.
