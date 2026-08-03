# Cobertura editorial — 2026-08-03

Status após fechamento do E0 majoritário.

## Resumo por cargo

| Cargo | Total candidaturas no Supabase | Com histórico publicado | Com plataforma publicada | Cobertura mínima |
|---|---:|---:|---:|---:|
| Governador / vice-governador | 2 | 2 | 2 | 100% |
| Senador | 4 | 4 | 4 | 100% |
| Deputado federal | 88 | 0 publicados / 1 pendente | 0 | lote inicial pendente |
| Deputado estadual | 111 | 0 | 0 | 0% |
| Outros | 8 | 0 | 0 | 0% |

Observação: o snapshot público versionado tem 212 candidaturas; o Supabase remoto contabilizou 213 candidatos por incluir 111 deputados estaduais, enquanto o snapshot público expõe 110 nessa categoria. A diferença deve ser auditada antes de novo refresh público amplo.

## Claims por cargo/categoria/status

| Cargo | Categoria | Status | Total |
|---|---|---|---:|
| deputado_estadual | summary | published | 110 |
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
| 1 | Fernanda Melchionna e Silva | PSOL | `210002533902` | Câmara dos Deputados — `https://www.camara.leg.br/deputados/204407` | `historico_politico` em `pending_review` |

Motivo: é a única deputada federal em exercício encontrada no snapshot atual por correspondência direta de nome/urna. O restante da bancada federal do RS não aparece neste snapshot público parcial pelos mesmos partidos/nomes, então não deve ser forçado.

## Gate do próximo lote

Para a Fernanda Melchionna:

1. revisar no `/admin` a claim `historico_politico` criada como `pending_review` usando fonte Câmara;
2. criar claim `plataforma` apenas quando houver fonte pública de campanha/partido ou entrevista verificável;
3. revisão humana no `/admin`;
4. publicação via RPC;
5. validar UI pública do dossiê.

Sem publicação direta via `service_role`.
