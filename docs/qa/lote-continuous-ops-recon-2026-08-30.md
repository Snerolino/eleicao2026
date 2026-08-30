# QA — reconciliação contínua oficial e saúde de publicação — 2026-08-30

## Objetivo

Executar o próximo chunk bounded após a mudança de fingerprint monitorada, priorizando reconciliação oficial read-only, sincronização do estado público e verificação do portal sem promover fatos sem fonte.

## Entregue e verificado

- Lock exclusivo `flock` adquirido e liberado sem concorrência. Worktree iniciou limpa em `main`, `HEAD=4d7750d5e785afd76b975436c7816ca8184cf410`; `origin/main` e `HEAD` estão alinhados (`0/0`).
- Descoberta oficial Câmara read-only para `2026-01-01` a `2026-12-31`, em 4 janelas trimestrais e 1 página por janela: `4/4` respostas HTTP válidas, `300` `vote_ids`, `blocked=null`. Nenhum evento, voto, identidade, FK ou Supabase foi escrito.
- Monitor local: `pending_editorial_items=1261`, `factual_votes=4000`; o fingerprint retornado pelo CLI foi `271e0e77ceae9938f05136355436dbc164ed346dabd9a93e2f007d0f2b76362d`. A mudança de fingerprint recebida pelo monitor externo preserva as mesmas contagens; não foi tratada como dado novo sem evidência material.
- `npm run data:check`: `1003` candidaturas, `988` fotos oficiais e `1` fonte TSE.
- `npm run portal:publication:verify`: `published_verified`; portal e `/release.json` HTTP 200.

## Publicação

- Registro documental commitado localmente (hash final registrado após o amend); `git push origin main` falhou em 3 tentativas com HTTP 403 (`Permission to Snerolino/eleicao2026.git denied to Snerolino`). Portanto nenhum workflow/deploy novo foi acionado.

## Estado dos dados e bloqueios

- Nenhum refresh do `../dataset2026`, snapshot público ou banco remoto foi necessário neste chunk; não há diff factual aplicado.
- A auditoria de fontes e os itens editoriais sem gate específico continuam fail-closed conforme o STATE vigente. Não foram inventadas URLs, votos, IDs ou UUIDs.
- Doctor permanece degradado pelo Node 22 do shell (o projeto requer Node 24) e OpenCode ausente; isso não impediu os comandos read-only executados.

## Próximo passo

Manter reconciliação oficial bounded e avançar somente em lotes com fonte, identidade, FK, dry-run e idempotência comprovados; não aplicar matriz/score ou fatos remotos por atalho.
