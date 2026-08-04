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
| 3 | Maurício Dziedricki | PODE | `210002534272` | Câmara dos Deputados — `https://www.camara.leg.br/deputados/75431/biografia`; site oficial de campanha — `https://www.depmauriciors.com.br/` | `historico_politico` + `plataforma` em `pending_review` |

Motivo do item 1: Fernanda foi a única deputada federal em exercício encontrada no snapshot atual por correspondência direta de nome/urna. O restante da bancada federal do RS não aparece neste snapshot público parcial pelos mesmos partidos/nomes, então não deve ser forçado.

Motivo do item 2: Fábio Ostermann aparece no snapshot como candidato a deputado federal pelo NOVO e possui site oficial de campanha com biografia e pautas; a claim de plataforma baseada em material de campanha foi avaliada e arquivada (não publicada) por decisão editorial — só `historico_politico` e `summary` foram publicados.

Motivo do item 3: Maurício Dziedricki (PODE) tem perfil institucional rastreável na Câmara dos Deputados (`75431`) e coincidência de partido com o snapshot, além de site oficial de campanha; entrou como próximo dossiê federal, sem publicação direta.

> **Não-forçado (ambiguidade documentada):** Marcicleio "Marcelo Brum da Costa" (PODE 2026 no snapshot, `210002534292`) tem fonte institucional da Câmara (`205863`) que o registra filiado ao Republicanos/2022, indicando troca de partido. Por haver divergência de legenda entre fonte oficial e registro atual, a plataforma não foi inferida para evitar conflito; o histórico poderia ser montado da biografia da Câmara em lote posterior, com verificação de filiação atual.

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

Sem publicação direta via `service_role`.
