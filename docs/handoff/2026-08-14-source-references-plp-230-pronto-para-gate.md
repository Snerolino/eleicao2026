# Handoff — Source references PLP 230/2025 prontas para gate remoto

Data: 2026-08-14
Status: `SOURCE_REFS_SQL_PRONTO_SEM_ESCRITA_REMOTA`
Arco: `eleicao2026-pos-fase2-matrizes-reais`
Pacote factual: `PLP 230/2025` / votação Câmara `2580259-24` / Marcel van Hattem

## Resumo

Foram concluídos os passos 1–7 do planejamento local para resolver
`source_references` do primeiro pacote real da Matriz de Impacto, sem executar
escrita no Supabase.

Lourenço não precisa escrever no Supabase. Se autorizar o gate remoto, Hermes/CLI
executa os comandos, captura logs, consulta UUIDs reais e valida o resultado.

## Arquivos criados/alterados

- `data/legislative-import/camara/plp-230-2025-votacao-2580259-24-sources.json`
- `scripts/build-legislative-source-catalog.mjs`
- `scripts/__tests__/legislative-source-references.test.mjs`
- `scripts/__tests__/legislative-source-catalog.test.mjs`
- `package.json` (`impact:sources`)

## Fontes oficiais inventariadas

Todas públicas/oficiais da Câmara:

1. `https://dadosabertos.camara.leg.br/api/v2/proposicoes/2580259`
   - tipo: `camara_api_proposicao`
   - hash: `sha256:d7ae8159cf6f0e238f5d1b88ffa438383f8db99fe4380968e81806a317472a25`
   - método: `canonical-json-v1`
2. `https://www.camara.leg.br/proposicoesWeb/prop_mostrarintegra?codteor=3170169`
   - tipo: `camara_inteiro_teor`
   - hash: `sha256:f40a924f3eb603a307d8a7436b33713fd267cf335594b054e128162962417b5c`
   - método: `raw-bytes-v1`
3. `https://dadosabertos.camara.leg.br/api/v2/votacoes/2580259-24`
   - tipo: `camara_api_votacao`
   - hash: `sha256:f0a77d919b46f801fb4fe86bd9900c93fd0d6317c31326f48579c1beccddc112`
   - método: `canonical-json-v1`
4. `https://dadosabertos.camara.leg.br/api/v2/votacoes/2580259-24/votos`
   - tipo: `camara_api_votos`
   - hash: `sha256:3dd6bb755324f51e652058147b5354eb433e53884c3bd4460401f0836a372531`
   - método: `canonical-json-v1`

## Artefatos temporários gerados para revisão

Gerados em `/tmp`, não versionados:

- `/tmp/plp-230-source-catalog-unresolved.json`
  - SHA-256: `c20bd154e49a57fd7c4623dbc44b5016db8989515b1d325418ee6af9701bf6e9`
- `/tmp/plp-230-source-references-upsert.sql`
  - SHA-256: `85ff63beabaf4f8b55fecceda0089122c6e9f841c48da71ea1ba9ce4ef8ff13f`
- `/tmp/plp-230-legislative-import-unresolved-sources.sql`
  - SHA-256: `1c04c4e95d06e96f8642a448a401d1ff438484d0e757831ca99bb8567a80a5a9`

Checagem de segredos nesses artefatos: `NO_SECRETS_OK`.

## Comandos locais já disponíveis

Gerar catálogo sem UUID remoto:

```bash
npm run impact:sources -- \
  data/legislative-import/camara/plp-230-2025-votacao-2580259-24-sources.json
```

Gerar SQL revisável para upsert de `source_references`:

```bash
npm run impact:sources -- --emit-sql \
  data/legislative-import/camara/plp-230-2025-votacao-2580259-24-sources.json
```

Resolver catálogo a partir de arquivo `content_hash -> uuid` produzido por Hermes
após query autorizada:

```bash
npm run impact:sources -- \
  --resolve-from-file /tmp/source-reference-ids.json \
  data/legislative-import/camara/plp-230-2025-votacao-2580259-24-sources.json
```

## Estado do passo 6

A integração do catálogo resolvido ao pacote real está preparada, mas não foi
aplicada ao arquivo principal porque ainda não existem UUIDs reais de
`source_references` para essas quatro fontes no contexto local.

Regra preservada: não fabricar UUID.

Enquanto não houver UUID real, o SQL legislativo segue com comentários seguros:

```sql
null /* 'source_references:<url-oficial>' */
```

Depois do gate remoto, Hermes deve:

1. executar upsert das quatro `source_references`;
2. consultar `id, content_hash` retornados;
3. gerar `/tmp/source-reference-ids.json`;
4. rodar `impact:sources -- --resolve-from-file ...`;
5. mesclar `sourceReferenceByKey` resolvido no catálogo do pacote;
6. gerar `impact:sql` final sem `null /* 'source_references:`;
7. só então aplicar SQL legislativo, se essa segunda aplicação também estiver autorizada.

## Comando que Hermes executará se Lourenço autorizar escrita remota de fontes

> Não executado neste bloco.

Comando conceitual seguro, a ser materializado por Hermes com credenciais locais
sem imprimir `.env.local`:

```bash
node scripts/build-legislative-source-catalog.mjs --emit-sql \
  data/legislative-import/camara/plp-230-2025-votacao-2580259-24-sources.json \
  > /tmp/plp-230-source-references-upsert.sql

# Depois, Hermes executa o SQL via Supabase CLI/psql autorizado,
# captura o retorno id/content_hash e grava /tmp/source-reference-ids.json.
```

## O que será escrito no Supabase se autorizado

Somente registros em `source_references` para as quatro URLs oficiais listadas
acima. Nenhuma matriz será publicada por este passo.

Depois disso, uma segunda autorização pode cobrir o SQL factual legislativo:

- `legislative_propositions`
- `proposition_versions`
- `voting_events`
- `legislative_votes`

Nenhuma `impact_matrix` publicada nasce automaticamente. Qualquer matriz real
deve começar como `pending_review`.

## Gates focados executados

```bash
npx vitest run scripts/__tests__/legislative-source-references.test.mjs scripts/__tests__/legislative-source-catalog.test.mjs --reporter=verbose
```

Resultado: 2 arquivos, 6 testes, verdes.

```bash
node scripts/build-legislative-source-catalog.mjs ...
node scripts/build-legislative-source-catalog.mjs --emit-sql ...
```

Resultado: catálogo/SQL gerados, sem segredos.

## Próximo gate humano possível

Pergunta para Lourenço, quando quiser avançar para escrita remota:

> Autoriza Hermes a executar apenas o upsert remoto das quatro `source_references`
> oficiais do pacote PLP 230/2025, consultar os UUIDs retornados e regenerar o SQL
> legislativo final? Nenhuma matriz será publicada.

Se autorizado, Lourenço continua sem escrever manualmente no Supabase; Hermes
executa e valida.
