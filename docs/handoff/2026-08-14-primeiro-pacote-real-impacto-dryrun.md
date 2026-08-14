# Handoff — Primeiro pacote real de proposição/voto em dry-run

Data: 2026-08-14
Status: `DRY_RUN_VERDE_SEM_ESCRITA_REMOTA`
Arco: `eleicao2026-pos-fase2-matrizes-reais`

## Resumo

Foi criado o primeiro pacote real e pequeno para o importer legislativo da Matriz
de Impacto Populacional v1, usando fonte oficial da Câmara dos Deputados. O lote
não executa escrita remota e não publica matriz. Ele valida o caminho factual:
proposição -> versão votada -> evento de votação -> voto nominal de candidato do
snapshot público.

## Fonte oficial

Fonte base: Dados Abertos da Câmara dos Deputados.

- Deputado federal oficial Câmara:
  - Marcel van Hattem
  - ID Câmara: `156190`
  - Endpoint: `https://dadosabertos.camara.leg.br/api/v2/deputados/156190`
- Candidato no snapshot público TSE 2026:
  - Nome: `MARCEL VAN HATTEM`
  - `tse_candidate_id`: `210002547819`
  - `candidate.id`: `abdfe5f9-52ab-561f-aec5-afe475423fb9`
  - Cargo 2026: `senador`
- Proposição principal:
  - `PLP 230/2025`
  - ID Câmara: `2580259`
  - Endpoint: `https://dadosabertos.camara.leg.br/api/v2/proposicoes/2580259`
- Versão votada:
  - `SBT 1 PLEN`, ID Câmara `2643385`
  - Inteiro teor: `https://www.camara.leg.br/proposicoesWeb/prop_mostrarintegra?codteor=3170169`
  - Hash registrado no pacote: `sha256:31af44e79eb97220e4d9c8736161fb871a0cd7a4baeb4bac6fe91b28e2da8aa9`
- Votação nominal:
  - ID Câmara: `2580259-24`
  - Endpoint: `https://dadosabertos.camara.leg.br/api/v2/votacoes/2580259-24`
  - Votos: `https://dadosabertos.camara.leg.br/api/v2/votacoes/2580259-24/votos`
  - Resultado oficial: `Sim: 333; Não: 91; Total: 424`
  - Voto de Marcel van Hattem: `Não`, registrado em `2026-08-12T19:35:13`.

## Arquivos criados

- `data/legislative-import/camara/plp-230-2025-votacao-2580259-24-marcel-van-hattem.json`
- `data/legislative-import/camara/plp-230-2025-votacao-2580259-24-catalog.json`
- `scripts/__tests__/legislative-real-package.test.mjs`

## Correção técnica incluída

Antes deste lote, o SQL gerado resolvia o catálogo `legislatorsToCandidateId` para
`legislator_id`. Como o schema atual possui `candidate_id references candidates(id)`
e `legislator_id` ainda não tem tabela/FK própria, isso deixaria o vínculo
eleitoral útil vazio.

Correção aplicada:

- `legislator_id`: permanece `null` enquanto não há tabela própria de legisladores;
- `candidate_id`: recebe a resolução do catálogo `legislatorsToCandidateId`.

Evidência no SQL gerado:

```sql
insert into legislative_votes (..., legislator_id, candidate_id, value, ...)
values (..., null, 'abdfe5f9-52ab-561f-aec5-afe475423fb9', 'nao', ...);
```

## Gates executados

```bash
npm run impact:dryrun -- data/legislative-import/camara/plp-230-2025-votacao-2580259-24-marcel-van-hattem.json
```

Resultado:

- `legislative_propositions`: 1
- `proposition_versions`: 1
- `voting_events`: 1
- `legislative_votes`: 1
- nenhuma escrita realizada.

```bash
npm run impact:sql -- data/legislative-import/camara/plp-230-2025-votacao-2580259-24-marcel-van-hattem.json --catalog data/legislative-import/camara/plp-230-2025-votacao-2580259-24-catalog.json
```

Resultado: SQL gerado, revisável, sem executar.

```bash
npx vitest run scripts/__tests__/legislative-sql-generator.test.mjs scripts/__tests__/legislative-real-package.test.mjs scripts/__tests__/legislative-importer.test.mjs --reporter=verbose
```

Resultado:

- 3 arquivos de teste;
- 20 testes;
- todos verdes.

## Pendência antes de qualquer escrita remota

Ainda falta catálogo real de `source_references`. O SQL atual mantém
`source_reference_id` como `null /* source_references:<url> */` para as fontes,
sem fabricar UUID. Isso é correto para dry-run, mas bloqueia aplicação remota
confiável até o catálogo/loader de fontes estar pronto.

## Próximo passo recomendado

1. Criar/validar catálogo real de `source_references` para as URLs oficiais deste lote.
2. Rodar `impact:sql` novamente com source refs resolvidas.
3. Produzir handoff de revisão humana.
4. Só com autorização explícita de Lourenço, Hermes/CLI executa escrita remota —
   Lourenço não precisa escrever manualmente no Supabase.

## Fora de escopo neste lote

- Nenhuma escrita Supabase.
- Nenhuma matriz publicada.
- Nenhuma RPC de aprovação.
- Nenhuma alteração de RLS/migration remota.
