# QA — revalidação de fontes ALRS FED-17 — 2026-08-19

## Objetivo

Revalidar, em modo read-only, as cinco páginas oficiais do Portal da
Transparência ALRS usadas pelo manifesto FED-17 antes de qualquer backfill.
Nenhum voto, identidade, URL, hash ou UUID foi inferido.

## Evidência verificada

GET sequencial direto ao portal oficial, com HTTP 200 em todas as páginas e
coincidência exata de bytes, SHA-256 e contagem de `data-item`:

| solicitante | bytes | data-item | SHA-256 |
|---:|---:|---:|---|
| 93 | 589283 | 109 | `4f41ddb84d7139397aadeab10d379d0e55950fd0514d6e8e2bc5dba65b309014` |
| 2122 | 540317 | 99 | `97492fb28e6d85e94f379128037535d99191664dcb518fa484aac915749cd9bc` |
| 2153 | 534734 | 97 | `268f0655e02118fa60b63f4616c10525aa66d4f5aa04a57e9b58afd62f80ce76` |
| 2136 | 541531 | 99 | `69833351d77c5617073e6981571b212c71d20999099306ce3d797e4d60a5d5ae` |
| 2162 | 495335 | 89 | `c12c6f762fabed296f48f7e9044b2f5ea42ec290dd6af46117721d6bc6eafaf1` |

Resultado: **5/5 fontes exatas** contra
`data/legislative-import/alrs-fed17/recovery-manifest.json`.

## Gates read-only

- `npm run data:check`: verde — 1003 candidaturas, 988 fotos oficiais.
- `node scripts/validate-impact-schema.mjs`: verde.
- `npm run impact:alrs:sources:backfill`: dry-run verde — 2 eventos elegíveis,
  0 votos planejados, 0 fontes planejadas, 3 eventos bloqueados e 1 identidade
  bloqueada.
- `npm run impact:sources:audit -- --strict`: exit 2 por lacunas reais; não é
  tratado como sucesso: ALRS 3985/4000 votos com fonte, Câmara 279/281,
  Senado 0/455.
- Worktree estava limpa antes deste relatório; nenhuma escrita remota ocorreu.

## Bloqueios reais

O HTML oficial permanece íntegro, mas o writer não encontrou correspondência
exata aplicável nos dois eventos elegíveis. Os três eventos com divergência ou
ambiguidade e a identidade ALRS ausente do catálogo permanecem fail-closed.
Não executar `--apply` sem coincidência exata de proposição, data, candidato,
valor, URL e hash.

O doctor do shell cron retornou `FAIL` somente porque o shell iniciou Node
22.22.2, enquanto o projeto exige Node 24. Neste chunk os comandos do projeto
foram executados com Node 24.19.0.

## Publicação

- Commit `1f4eec2ec4e8ec37b4263d7bd5a952315414fa68` publicado em `origin/main`.
- Workflow backup `334951434`, run `32213337592`, foi disparado com `headSha`
  idêntico e permaneceu `in_progress` na última consulta.
- `gh run watch` encontrou erro transitório de conexão com `api.github.com`; não
  foi usado como prova de sucesso.
- A verificação de produção neste instante não foi conclusiva: a raiz teve
  falha DNS e `/release.json` respondeu HTTP 403. Não declarar deploy concluído;
  revalidar no próximo tick após o run.

## Próximo passo

Revalidar o run `32213337592` e `/release.json` para o SHA acima. Depois manter
a fila ALRS em recuperação read-only e avançar somente quando surgir prova
oficial adicional que produza plano não vazio. Não promover os registros
bloqueados.
