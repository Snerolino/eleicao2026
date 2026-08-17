# QA — Fase ALRS Transparência + Refinamento Editorial

Data: 2026-08-17
Status: implementação local validada; sem escrita Supabase nesta fase.

## Dados novos encontrados no `dataset2026`

- `relatorios/pesquisas/alrs_mandato_2021.md`
- `relatorios/pesquisas/alrs_mandato_2022.md`
- `relatorios/pesquisas/alrs_mandato_2023.md`
- `relatorios/pesquisas/alrs_mandato_2024.md`
- `relatorios/pesquisas/alrs_mandato_2025.md`
- `relatorios/pesquisas/votacoes_plenario_alrs_2026.md`
- `relatorios/pesquisas/proposicoes_alrs_2026.md`
- `relatorios/pesquisas/candidatos_deputados_estaduais_rs_2026.md`
- dossiês de candidatos ao Executivo e ao Senado;
- `refinamento-visual.html`.

Os relatórios históricos ALRS contêm placares e registros de tramitação. Eles não
foram convertidos em votos individuais. A nova fonte oficial para essa etapa é o
Portal da Transparência ALRS.

## Fonte oficial de votação individual

```text
https://transparencia.al.rs.gov.br/parlamentares/votos-plenario
```

Consulta por parlamentar/ano:

```text
/parlamentares/votos-plenario/pesquisa?solicitante=<id>&ano=<ano>
```

A resposta verificada é HTML server-side com registros `data-item` contendo:

```text
nomeDeputado, dataVotacao, tipoProjeto, numProposicao,
anoProposicao, materia, voto, resultadoVotacao
```

A consulta real de `solicitante=13&ano=2025` retornou HTTP 200 e 184 registros.

## Importer local

Arquivos:

- `src/domain/impact/alrs-vote-importer.ts`
- `scripts/import-alrs-votes.mjs`
- `fixtures/legislative-import/alrs-data-items.html`
- `fixtures/legislative-import/alrs-id-catalog.json`
- `scripts/__tests__/alrs-vote-importer.test.mjs`
- `scripts/__tests__/alrs-vote-importer-cli.test.mjs`

Características:

- dry-run por padrão;
- nenhuma leitura de `.env` ou Supabase;
- fonte restrita a `transparencia.al.rs.gov.br` via HTTPS;
- hash SHA-256 do HTML bruto;
- catálogo explícito ALRS → `tse_candidate_id`;
- candidato sem match vira pendência, não voto;
- normalização estrita: `sim`, `nao`, `abstencao`, `ausente`, `obstrucao`;
- valores desconhecidos falham;
- bancada, subscrição e preferência não são tratados como voto individual;
- chave natural idempotente por fonte, parlamentar, matéria, data e hash da matéria.

Execução validada:

```text
node scripts/import-alrs-votes.mjs --solicitante 13 --ano 2025 \
  --catalog fixtures/legislative-import/alrs-id-catalog.json \
  --candidates data/public-candidates.json \
  --html fixtures/legislative-import/alrs-data-items.html --json

5 data-item · 5 votos planejados · 0 pendências · 0 escritas
```

## Refinamento visual implementado

Fonte de direção: `dataset2026/refinamento-visual.html`.

- masthead editorial com dateline, regra dupla e marca inline;
- navegação preservada com foco visível;
- Lora para display e IBM Plex para corpo/dados;
- cartões com lombada lateral por categoria de fonte;
- filtros com tratamento editorial e chip de mulheres;
- arredondamento reduzido para o sistema editorial;
- texto sem fonte não é exibido no rodapé do card;
- dados, claims e regras de publicação permanecem inalterados;
- estados de acessibilidade e movimento reduzido preservados.

## Gates locais

- Node: `v24.19.0`;
- `orch:doctor --smoke`: 54 OK, 2 WARN, 0 FAIL;
- testes: 302/302;
- `tsc --noEmit`: OK;
- `validate-impact-schema`: OK;
- `data:check`: 1003 registros no snapshot bruto; 1 exclusão explícita (`210002533050`) mantém a coleção pública em 1002 cards visíveis; 988 fotos oficiais;
- build Vite/PWA: OK;
- `git diff --check`: OK.

## Limite desta fase

Nenhum voto ALRS foi aplicado no Supabase remoto. O próximo lote requer:

1. catálogo oficial completo de IDs ALRS;
2. coleta sequencial por parlamentar/ano com backoff;
3. dry-run agregado e revisão de contagens;
4. autorização separada para escrita remota;
5. reindexação de perfis após importação factual.

## Auditoria de publicação dos blocos de claims

- 42 blocos JSON verificados independentemente: 1026 candidatos e 2150 claims;
- 2135 hashes de conteúdo únicos;
- auditoria remota confirmou 2683 claims: 2650 `published` e 33 `pending_review`;
- o importador idempotente `scripts/import-agy-runtime-pending.mjs` encontrou 0
  registros novos para aplicar: os hashes já estão no remoto;
- 21 candidatos (42 claims) permanecem sem resolução no snapshot público e não
  foram associados por heurística;
- nenhuma claim foi promovida automaticamente: itens sem URL exata permanecem
  sob revisão editorial.
