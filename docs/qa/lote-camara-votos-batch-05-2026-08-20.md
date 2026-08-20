# QA — Câmara: coleta nominal bounded, lote 05

**Data:** 2026-08-20 UTC  
**Modo:** reconhecimento oficial read-only + dry-run; nenhuma escrita remota

## Objetivo

Avançar a lane de reconhecimento da Câmara consultando exclusivamente o endpoint oficial `/votacoes/{id}/votos` para o quinto lote de 25 IDs da janela 2026-07-01 a 2026-09-30, sem inferir votos individuais a partir de listagens, placares ou respostas vazias.

## Entrega verificada

- Fonte oficial: `https://dadosabertos.camara.leg.br/api/v2`.
- Entrada: `.orchestrator/runtime/camara-discovery-current.json`, descoberta read-only com 300 IDs e páginas HTTP válidas.
- Coletor: `scripts/collect-camara-votes.mjs`, executado com Node `v22.22.2`.
- Lote processado: 25 IDs, posições 101–125 da descoberta.
- Artefatos brutos: 25 arquivos em `.orchestrator/runtime/camara-votes-batch-05/`.
- Manifesto: `2e1d0ebb48706f969fa561e3dc4d0ade2610b0ff9c63f57983c9e520c4dbc07d` (SHA-256), URLs `/votacoes/{id}/votos` oficiais em 25/25 eventos.
- Resultado: 25 eventos, 2 respostas individualizadas, 94 votos brutos e 10 votos RS no envelope dry-run.
- Eventos nominalizados: `2168586-96` e `2193266-77`; ambos tiveram `detail.id` exatamente igual ao `vote_id`, proposição oficial e fonte URL completa.
- Verificação independente: `events=25`, `raw_files=25`, `all_exact=true`; os dois envelopes têm proposição `PL`, URL oficial de proposição, evento oficial e somente 5 votos RS cada.
- O coletor terminou com exit 0 e declarou nenhuma escrita remota realizada.
- Nenhuma identidade TSE, FK, classificação editorial ou voto foi aplicado; os IDs de deputado permanecem referências oficiais da Câmara no envelope transitório.

## Gates locais

- `npm run test`: exit 0 — 82 arquivos, 372 testes aprovados.
- `npx tsc --noEmit`: exit 0.
- `node scripts/validate-impact-schema.mjs`: exit 0 — checkpoint do schema aprovado.
- `npm run data:check`: exit 0 — 1003 candidaturas, 988 fotos oficiais.
- `npm run build`: exit 0 — sitemap com 1003 candidatos + estáticas = 1005 URLs; release local `768ff81-20260820T082327408Z`.
- `git diff --check`: exit 0.
- Worktree: somente `STATE.md` e este QA versionados; artefatos brutos permanecem transitórios em `.orchestrator/runtime/`.

## Publicação e verificação

- Commit funcional/documental do lote: `d6a0b6bd8b43c14cfd2b344ad4226a801e913e67`, publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32348599354`: `completed/success`, `headSha` idêntico ao commit.
- Produção `https://rs.votopraquem.org/`: raiz HTTP 200 e `/release.json` HTTP 200.
- `release.json` confirmou `release_id=d6a0b6b-20260820T082421010Z`, `sha` completo idêntico, versão `0.2.518` e snapshot `row_count=1003`.
- Smoke remoto exit 0: 1002 cards visíveis (mínimo esperado 1002), busca 2 resultados, detalhe/canonical/offline OK, service worker pronto, 0 falhas HTTP e 0 erros de console online.
- A documentação deste QA/STATE foi incluída no commit seguinte e exigirá nova verificação final do backup antes do fechamento do lote.

## Bloqueios e escopo

- Respostas vazias no endpoint `/votos` não foram convertidas em votação simbólica; permaneceram `outro` e fail-closed.
- Os dois eventos nominalizados ainda não entram em `remote_factual_apply`: falta concluir catálogo/reconciliação de identidade contra `tse_candidate_id`, schema/FK remoto, dry-run de escrita e prova de idempotência.
- ALRS continua bloqueado pelo JWT `issued at future` e sem ID oficial exato para os quatro residuais de Enio Carlos Terra.
- Senado continua fail-closed pela deriva SHA-256 dos seis PDFs frente ao manifesto; nenhum hash foi atualizado.
- `npm run orch:doctor -- --smoke` permanece com FAIL estrutural conhecido quando o shell cron resolve Node 22; este lote foi executado sem dependência de executor externo.

## Próximo passo

Rodar todos os gates locais, publicar somente a documentação se estiverem verdes, verificar o release em produção e iniciar o lote 06 dos IDs Câmara. Manter ALRS/Senado em reconciliação fail-closed e não aplicar os dois envelopes até R0/schema/FK/fonte/dry-run/idempotência.
