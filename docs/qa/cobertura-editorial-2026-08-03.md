# Cobertura editorial — 2026-08-03

Status após fechamento do E0 majoritário.

## Resumo por cargo

| Cargo | Total candidaturas no Supabase | Com histórico publicado | Com plataforma publicada | Cobertura mínima |
|---|---:|---:|---:|---:|
| Governador / vice-governador | 2 | 2 | 2 | 100% |
| Senador | 4 | 4 | 4 | 100% |
| Deputado federal | 88 | 1 publicado | 0 publicados / 1 pendente | lote inicial pendente |
| Deputado estadual | 111 | 0 | 0 | 0% |
| Outros | 8 | 0 | 0 | 0% |

Observação: o snapshot público versionado tem 212 candidaturas; o Supabase remoto contabilizou 213 candidatos por incluir 111 deputados estaduais, enquanto o snapshot público expõe 110 nessa categoria. A diferença deve ser auditada antes de novo refresh público amplo.

## Claims por cargo/categoria/status

| Cargo | Categoria | Status | Total |
|---|---|---|---:|
| deputado_estadual | summary | published | 110 |
| deputado_federal | historico_politico | published | 1 |
| deputado_federal | plataforma | pending_review | 1 |
| deputado_federal | summary | published | 88 |
| governador | historico_politico | published | 2 |
| governador | plataforma | published | 2 |
| governador | summary | published | 2 |
| outro | summary | published | 8 |
| senador | historico_politico | published | 4 |
| senador | plataforma | published | 4 |
| senador | summary | published | 4 |

## Próximo lote editorial iniciado

O plano pós-review prioriza deputados federais em exercício. Cruzamento conservador entre a Câmara dos Deputados (UF=RS) e o snapshot público encontrou correspondência direta apenas para:

| Prioridade | Candidato no snapshot | Partido | TSE candidate id | Fonte oficial inicial | Status |
|---:|---|---|---|---|---|
| 1 | Fernanda Melchionna e Silva | PSOL | `210002533902` | Câmara dos Deputados — `https://www.camara.leg.br/deputados/204407`; Radar do Congresso — `https://radar.congressoemfoco.com.br/parlamentar/1204407/discursos` | `historico_politico` publicado; `plataforma` em `pending_review` |

Motivo: é a única deputada federal em exercício encontrada no snapshot atual por correspondência direta de nome/urna. O restante da bancada federal do RS não aparece neste snapshot público parcial pelos mesmos partidos/nomes, então não deve ser forçado.

## Gate do próximo lote

Para a Fernanda Melchionna:

1. revisar no `/admin` a claim `plataforma` criada como `pending_review` usando Radar do Congresso;
2. publicar via RPC se a revisão editorial aceitar a fonte, ou pedir ajuste caso prefira aguardar programa eleitoral oficial;
3. validar UI pública do dossiê.

Sem publicação direta via `service_role`.
