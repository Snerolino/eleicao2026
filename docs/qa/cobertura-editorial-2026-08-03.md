# Cobertura editorial — 2026-08-03

Status após fechamento do E0 majoritário.

## Resumo por cargo

| Cargo | Total candidaturas no Supabase | Com histórico publicado | Com plataforma publicada | Cobertura mínima |
|---|---:|---:|---:|---:|
| Governador / vice-governador | 2 | 2 | 2 | 100% |
| Senador | 4 | 4 | 4 | 100% |
| Deputado federal | 88 | 1 publicado / 1 pendente | 1 publicado / 1 pendente | 1 dossiê completo publicado |
| Deputado estadual | 111 | 0 | 0 | 0% |
| Outros | 8 | 0 | 0 | 0% |

Observação: o snapshot público versionado tem 212 candidaturas; o Supabase remoto contabilizou 213 candidatos por incluir 111 deputados estaduais, enquanto o snapshot público expõe 110 nessa categoria. A diferença deve ser auditada antes de novo refresh público amplo.

## Claims por cargo/categoria/status

| Cargo | Categoria | Status | Total |
|---|---|---|---:|
| deputado_estadual | summary | published | 110 |
| deputado_federal | historico_politico | pending_review | 1 |
| deputado_federal | historico_politico | published | 1 |
| deputado_federal | plataforma | pending_review | 1 |
| deputado_federal | plataforma | published | 1 |
| deputado_federal | summary | published | 88 |
| governador | historico_politico | published | 2 |
| governador | plataforma | published | 2 |
| governador | summary | published | 2 |
| outro | summary | published | 8 |
| senador | historico_politico | published | 4 |
| senador | plataforma | published | 4 |
| senador | summary | published | 4 |

## Lote federal iniciado

O plano pós-review prioriza deputados federais em exercício. Cruzamento conservador entre a Câmara dos Deputados (UF=RS) e o snapshot público encontrou correspondência direta apenas para:

| Prioridade | Candidato no snapshot | Partido | TSE candidate id | Fonte oficial inicial | Status |
|---:|---|---|---|---|---|
| 1 | Fernanda Melchionna e Silva | PSOL | `210002533902` | Câmara dos Deputados — `https://www.camara.leg.br/deputados/204407`; Radar do Congresso — `https://radar.congressoemfoco.com.br/parlamentar/1204407/discursos` | dossiê mínimo publicado: `historico_politico` + `plataforma` |
| 2 | Fábio Ostermann | NOVO | `210002533006` | Site oficial — `https://www.fabioostermann.com.br/` | `historico_politico` + `summary` publicados; `plataforma` arquivada (`rejected`/`needs_changes`) |
| 3 | Maurício Dziedricki | PODE | `210002534272` | Câmara dos Deputados — `https://www.camara.leg.br/deputados/75431/biografia`; site oficial de campanha — `https://www.depmauriciors.com.br/` | dossiê mínimo publicado: `historico_politico` + `plataforma` |
| 4 | Marcelo Brum | PODE | `210002534292` | Câmara dos Deputados — `https://www.camara.leg.br/deputados/205863/biografia` | `historico_politico` em `pending_review` |

Motivo do item 1: Fernanda foi a única deputada federal em exercício encontrada no snapshot atual por correspondência direta de nome/urna. O restante da bancada federal do RS não aparece neste snapshot público parcial pelos mesmos partidos/nomes, então não deve ser forçado.

Motivo do item 2: Fábio Ostermann aparece no snapshot como candidato a deputado federal pelo NOVO e possui site oficial de campanha com biografia e pautas; a claim de plataforma baseada em material de campanha foi avaliada e arquivada (não publicada) por decisão editorial — só `historico_politico` e `summary` foram publicados.

Motivo do item 3: Maurício Dziedricki (PODE) tem perfil institucional rastreável na Câmara dos Deputados (`75431`) e coincidência de partido com o snapshot, além de site oficial de campanha; entrou como próximo dossiê federal e foi aprovado no `/admin` em 2026-08-05 (`historico_politico` + `plataforma` publicados via RPC).

Motivo do item 4: Marcelo Brum é candidato federal pelo PODE em 2026 (confirmado por fontes de convenção/campanha, em linha com o snapshot PODE `210002534292`). A `historico_politico` foi montada da biografia institucional da Câmara (`205863`, mandato 2019-2023). A `plataforma` **não** foi inferida: a página de partido encontrada é de legenda anterior (Republicanos/2022) e não há fonte de campanha PODE rastreável sólida — mantém-se pendente de fonte.

## Gate do próximo lote

Para a Fernanda Melchionna:

1. dossiê mínimo federal publicado e validado na UI pública;
2. manter monitoramento para fontes eleitorais oficiais posteriores.

Para Fábio Ostermann:

1. revisar no `/admin` as claims `historico_politico` e `plataforma` criadas como `pending_review` usando o site oficial;
2. publicar via RPC se a revisão editorial aceitar a fonte, ou pedir ajuste caso prefira aguardar programa eleitoral oficial;
3. validar UI pública do dossiê após aprovação.

Para Maurício Dziedricki:

1. revisar no `/admin` as claims `historico_politico` e `plataforma` criadas como `pending_review` usando fontes Câmara + site oficial de campanha;
2. publicar via RPC se a revisão editorial aceitar a fonte;
3. validar UI pública do dossiê após aprovação.

Para Marcelo Brum:

1. revisar no `/admin` o `historico_politico` criado como `pending_review` a partir da biografia institucional da Câmara;
2. publicar via RPC se a revisão editorial aceitar a fonte;
3. a `plataforma` permanece pendente de fonte — buscar e adicionar apenas se surgir fonte de campanha PODE rastreável (convenção/site/imprensa oficial), sem inferir de biografia.

Sem publicação direta via `service_role`.
