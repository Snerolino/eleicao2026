# QA — Reconhecimento oficial bounded Senado/ALRS/Câmara (2026-08-20 14:59 UTC)

## Objetivo

Revalidar, em modo somente leitura e sob lock bounded, as três lanes oficiais
prioritárias sem promover votos, identidades, FKs ou referências remotas.

## Evidência verificada

- Câmara: API oficial `https://dadosabertos.camara.leg.br/api/v2/votacoes`, janela
  `2026-10-01`–`2026-12-31`, uma página HTTP 200, zero votações e nenhum bloqueio.
  Nenhum evento foi inferido.
- Senado: seis GETs oficiais HTTP 200; seis prefixos PDF válidos; 1/6
  coincidências de bytes contra o manifesto versionado e 0/6 coincidências de
  SHA-256. A deriva permanece fail-closed; manifesto não foi alterado.
- ALRS: portal oficial HTTP 200, 77.442 bytes, SHA-256
  `sha256:6a386d7d8b9ae17f8f5107b0cb6c90d71795a8568f08ed7c5972746a4ac0bab1`, zero
  `data-item`, sem `Enio Carlos Terra` e sem `Terra`. Os quatro residuais seguem
  sem ID oficial e fonte exata.
- Dataset vivo: `../dataset2026/candidatos/lista_candidatos_2026.csv` presente com
  322 linhas/IDs únicos; os 322 IDs estão contidos no snapshot público de 1003,
  que tem 681 IDs adicionais. Este CSV isolado não é paridade completa do
  dataset; nenhum refresh ou sincronização foi aplicado neste tick.

## Estado e bloqueios

- `remote_apply=false`: nenhuma escrita Supabase, snapshot, claim, manifesto,
  fonte, voto, identidade, FK, Cloudflare ou matriz ocorreu.
- Senado bloqueado por deriva persistente de SHA contra o manifesto.
- ALRS bloqueado por ausência de entidades/`data-item` na rota pública consultada;
  HTTP 200 não foi tratado como prova de ausência.
- Câmara sem lote elegível nesta janela; não houve dado a aplicar.

## Publicação e verificação

- Gates locais: `npm run test` 82 arquivos/372 testes, TypeScript, schema,
  `data:check` (1003 candidaturas/988 fotos), build e `git diff --check`, todos
  exit 0.
- Commit publicado: `f399eb62bbe94ec6c54f01e6c534080b2e8267de` (`docs: registrar
  recon oficial bounded`), `main -> main`.
- Backup Cloudflare `334951434`, run `32383613166`, `completed/success`,
  `headSha` idêntico ao commit.
- Produção: raiz HTTP 200; domínio customizado e preview confirmaram `/release.json`
  com SHA `f399eb62bbe94ec6c54f01e6c534080b2e8267de`, release
  `f399eb6-20260820T150155974Z`, snapshot `row_count=1003`.
- Worktree final limpa: `## main...origin/main`.

## Próximo passo

Manter a reconciliação oficial bounded: repetir Senado somente para detectar
mudança verificável, continuar ALRS por rota oficial com ID exato e avançar a
próxima janela Câmara elegível. Paralelamente, manter gates locais/publicação
documental independentes; nenhum bloqueio factual deve interromper a operação.

Artefatos transitórios: `.orchestrator/runtime/continuous-tick-2026-08-20/`.
