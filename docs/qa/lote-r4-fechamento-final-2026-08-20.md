# QA — fechamento R4 após resolução dos três pendentes

**Data:** 2026-08-20

## Resultado final

- 13/13 itens da fila revisados;
- 12 aprovados como `procedural_only`/`no_direct_population_group`/`taxonomy_gap`;
- 1 assessment populacional aprovado: PLP 41/2026 → `mulheres`, `positive`, `sim`, 0.99;
- 0 itens `pending_review` restantes na fila Q2/Q3.

Os três pendentes (PL 9657, PL 1183 e PL 1928) foram resolvidos por API/eventos
oficiais Câmara como requerimentos de retirada de pauta. Portanto não herdam o
impacto populacional dos projetos.

## Segurança

- votos nominais permanecem fatos separados;
- itens procedimentais não entram no score;
- `geral` não foi usado como grupo;
- nenhuma matriz vazia artificial foi criada;
- nenhum ranking/recomendação foi produzido.

## Evidência dos scouts

- Câmara: URLs oficiais de proposição, votação, evento e votos HTTP 200;
- Senado: 6/6 HTTP 200, mas SHA divergente preservado fail-closed;
- ALRS: ID Enio não localizado em fontes oficiais, residual preservado.
