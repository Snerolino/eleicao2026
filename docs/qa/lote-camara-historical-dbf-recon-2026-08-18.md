# QA — reconciliação histórica Câmara por índice DBF oficial (2026-08-18)

## Objetivo

Executar um chunk bounded read-only para localizar, em fonte oficial da Câmara,
as votações nominais correspondentes aos dois eventos sem fonte individual:
PEC 6/2019 (`2192459`) e PL 3723/2019 (`2209381`).

## Estado operacional

- Lock contínuo adquirido somente durante o chunk; nenhum writer concorrente.
- Worktree estava limpa no início, em `main`, `HEAD=eb4d145d589dd75447e58e3209f36d3f0e28928d`.
- O shell do cron iniciou Node `v22.22.2`; o projeto exige Node `>=24 <25`. O
  doctor foi executado e retornou `FAIL` somente por essa versão do shell, além
  de warnings opcionais de OpenCode/Ollama/Antigravity. O gate de dados foi
  reexecutado com Node `v24.19.0` e passou.
- `npm run data:check`: **candidaturas 1003; fotos oficiais 988; fontes TSE 1**.

## Evidência oficial encontrada

A página oficial do índice de votações da 56ª Legislatura — 1ª Sessão Legislativa
lista arquivos DBF nominais com URL completa:

- PL 3723/2019 — Subemenda Substitutiva Global, 05/11/2019:
  `https://www.camara.leg.br/Internet/votacaodbf/56Primeira/CD190400.dbf`
- PL 3723/2019 — requerimento de adiamento por 1 sessão:
  `https://www.camara.leg.br/Internet/votacaodbf/56Primeira/CD190398.dbf`
- PL 3723/2019 — requerimento de adiamento por 2 sessões:
  `https://www.camara.leg.br/Internet/votacaodbf/56Primeira/CD190397.dbf`
- PL 3723/2019 — requerimento de retirada de pauta:
  `https://www.camara.leg.br/Internet/votacaodbf/56Primeira/CD190396.dbf`
- PEC 6/2019 — segundo turno, 07/08/2019:
  `https://www.camara.leg.br/Internet/votacaodbf/56Primeira/CD190242.dbf`
- PEC 6/2019 — requerimento de retirada de pauta, 07/08/2019:
  `https://www.camara.leg.br/Internet/votacaodbf/56Primeira/CD190244.dbf`

A página oficial de votação para a reunião `58528` confirma o evento nominal do
PL 3723/2019 em 05/11/2019, com proposição, tipo e resultado agregado; ela lista
votos individuais, mas ainda não foi usada para preencher o lote remoto porque a
reconciliação exige o registro nominal oficial exato e identidade remota.

A rota oficial de sessão `https://www.camara.leg.br/evento-legislativo/56938`
(e o texto Escriba vinculado) foi localizada, mas corresponde à sessão de
20/08/2019 e não prova, sozinha, um voto nominal individual para o evento
pendente. Nenhum voto foi inferido de placar, sessão, discurso ou página de
proposição.

## Resultado e bloqueios

- A pesquisa avançou de “rota desconhecida” para um catálogo oficial de arquivos
  DBF candidatos, com proposição, data, descrição e URL completa.
- Os arquivos ainda precisam ser baixados, validados como DBF, ter bytes e
  SHA-256 registrados em manifesto e ser reconciliados por proposição, data,
  evento e identidade exatos antes de qualquer envelope ou escrita.
- Não foram inventados `vote_id`, UUID, hash, `source_reference` ou valor de voto.
- ALRS permanece separado e bloqueado pelo JWT `issued at future`, conforme
  checkpoint anterior.

## Alterações e verificação

- Alterado somente este relatório e `.orchestrator/STATE.md`.
- Nenhuma migration, RPC, matriz, claim, Supabase, Cloudflare ou dado factual
  remoto foi alterado.
- Commit local `9536208` (`docs: registra catálogo histórico da Câmara`) foi
  criado após os gates. `git push origin main` falhou por DNS
  (`Could not resolve host: github.com`); `main` ficou dois commits à frente de
  `origin/main`.
- Produção não pôde ser validada: `curl` retornou HTTP 000 por timeout de
  resolução. O workflow backup remoto `334951434` foi confirmado via `gh`, mas
  não foi disparado sem push.

## Próximo chunk bounded

Baixar sequencialmente apenas os DBFs oficiais acima, registrar manifesto com
HTTP/bytes/SHA-256 e inspecionar o schema/linhas sem aplicar dados. Depois,
selecionar somente arquivos com correspondência exata de proposição e data; o
writer deve permanecer fail-closed até haver identidade e fonte verificadas.
