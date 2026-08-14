# Handoff — Source references PLP 230/2025 prontas para gate remoto

Data: 2026-08-14
Status: `SOURCE_REFS_REMOTAS_APLICADAS_SQL_LEGISLATIVO_RESOLVIDO`
Arco: `eleicao2026-pos-fase2-matrizes-reais`
Pacote factual: `PLP 230/2025` / votação Câmara `2580259-24` / Marcel van Hattem

## Resumo

Foram concluídos os passos 1–7 do planejamento para resolver `source_references`
do primeiro pacote real da Matriz de Impacto. Após autorização explícita de
Lourenço, Hermes executou apenas o upsert remoto das quatro `source_references`
oficiais, consultou os UUIDs reais e regenerou o SQL legislativo final com
`source_reference_id` resolvido.

Lourenço não escreveu no Supabase. Hermes executou via CLI/processo local com
credenciais protegidas e sem imprimir `.env.local` ou service role.

## Arquivos criados/alterados

- `data/legislative-import/camara/plp-230-2025-votacao-2580259-24-sources.json`
- `scripts/build-legislative-source-catalog.mjs`
- `scripts/__tests__/legislative-source-references.test.mjs`
- `scripts/__tests__/legislative-source-catalog.test.mjs`
- `package.json` (`impact:sources`)
- `data/legislative-import/camara/plp-230-2025-votacao-2580259-24-catalog.json`
  agora contém `sourceReferenceByKey` resolvido com UUIDs reais.

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
- `/tmp/source-reference-ids.json`
  - SHA-256: `e9d46dde03225e02bb7c6730bed1618b44bc260946bb2d3d4ad2e9b15cba98c4`
- `/tmp/plp-230-source-catalog-resolved.json`
  - SHA-256: `758267b2f4c2dd1dd1c309c5b21a0e0b521916245cb30c3057109e604cdaa0ee`
- `/tmp/plp-230-legislative-import-resolved-sources.sql`
  - SHA-256: `665e473ef9e024ff0b1fbda1a94c43455d927d114c18354ac5b5b9dc7b3c30e2`

Checagem de segredos nesses artefatos: `NO_SECRETS_OK` / `LEGISLATIVE_SQL_RESOLVED_OK`.

## Escrita remota executada neste gate

Escopo autorizado e executado: somente upsert de quatro linhas em
`source_references`, por `content_hash`.

Resultado:

- `upserted`: 4
- `/tmp/source-reference-ids.json` gerado com `content_hash -> id`
- leitura pública anon validada: `anon_read_ok=true`, `source_references=4`

Nada além de `source_references` foi escrito neste gate.

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

A integração do catálogo resolvido foi aplicada ao arquivo principal:

`data/legislative-import/camara/plp-230-2025-votacao-2580259-24-catalog.json`

Regra preservada: nenhum UUID foi fabricado; todos vieram do retorno remoto de
`source_references`.

O SQL legislativo final foi regenerado em:

`/tmp/plp-230-legislative-import-resolved-sources.sql`

Validação:

- não contém `null /* 'source_references:`;
- não contém padrões de segredo (`service_role`, `apikey`, `Authorization`, `Bearer`);
- mantém `candidate_id = abdfe5f9-52ab-561f-aec5-afe475423fb9` para Marcel van Hattem.

## Comando executado por Hermes após autorização

Hermes executou o equivalente seguro abaixo, carregando credenciais protegidas em
processo local sem imprimir valores:

```bash
node scripts/build-legislative-source-catalog.mjs --emit-sql \
  data/legislative-import/camara/plp-230-2025-votacao-2580259-24-sources.json \
  > /tmp/plp-230-source-references-upsert.sql

# Depois, Hermes executou upsert via Supabase JS/service role,
# capturou id/content_hash e gravou /tmp/source-reference-ids.json.
```

## O que foi escrito no Supabase

Somente registros em `source_references` para as quatro URLs oficiais listadas
acima. Nenhuma matriz foi publicada por este passo.

Uma segunda autorização pode cobrir o SQL factual legislativo:

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

> Autoriza Hermes a executar o SQL factual legislativo resolvido do pacote
> PLP 230/2025 (`legislative_propositions`, `proposition_versions`,
> `voting_events`, `legislative_votes`)? Nenhuma matriz será publicada.

Se autorizado, Lourenço continua sem escrever manualmente no Supabase; Hermes
executa e valida.
