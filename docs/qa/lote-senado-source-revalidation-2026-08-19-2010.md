# QA — revalidação de fontes nominais do Senado (2026-08-19 20:10 UTC)

## Objetivo
Revalidar, em modo somente leitura, as seis fontes oficiais do Senado e confirmar que o catálogo permanece fail-closed antes de qualquer aplicação factual.

## Entrega verificada
- Reconhecimento oficial: `6/6` respostas HTTP 200.
- Prefixo PDF válido: `6/6`.
- Coincidência de bytes com o manifesto versionado: `2/6`.
- Coincidência SHA-256 com o manifesto versionado: `0/6`.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: `planned=6`, `already_existing=0`, `missing=0`, `inserted=0`, `votes_touched=0`.
- Nenhuma escrita factual remota foi executada.

## Gates locais
Executados com Node `v24.19.0`:
- `npm run test`: 81 arquivos, 371 testes aprovados.
- `npx tsc --noEmit`: aprovado.
- `node scripts/validate-impact-schema.mjs`: aprovado.
- `npm run data:check`: 1003 candidaturas, 988 fotos oficiais.
- `npm run build`: aprovado; release local `0.2.460`, SHA `595cf9d47602e4a3f7741eba798be4cc518ae973`.
- `git diff --check`: aprovado; worktree limpa após a execução.

## Publicação/verificação
- Backup Cloudflare remoto `334951434`, run `32296940085`: `completed/success`.
- `headSha` do run: `595cf9d47602e4a3f7741eba798be4cc518ae973`.
- Produção `https://rs.votopraquem.org/`: HTTP 200.
- Produção `/release.json`: HTTP 200; SHA idêntico, versão `0.2.460`, `row_count=1003`.

## Estado dos dados e bloqueios
- Snapshot público segue válido: 1003 candidaturas e 988 fotos.
- O Senado permanece bloqueado somente no item afetado: todos os GETs oficiais estão acessíveis e com prefixo PDF válido, mas nenhuma fonte coincide por SHA-256 com o manifesto versionado. Não gerar manifesto novo automaticamente e não aplicar votos sob deriva binária.
- `npm run orch:doctor` reporta `FAIL` apenas porque o shell do cron usa Node `22.22.2`, embora o projeto exija Node 24; a execução dos gates foi corrigida localmente com Node `24.19.0`. OpenCode ausente e Ollama sem resposta são WARN opcionais.

## Próximo passo
No próximo tick, repetir os seis GETs oficiais sem gerar manifesto novo; manter o writer factual parado até resolução explícita da deriva SHA-256 e continuar a verificação/publicação documental independente.
