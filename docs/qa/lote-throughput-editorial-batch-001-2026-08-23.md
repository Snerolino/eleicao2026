# QA — mudança de unidade de produção e circuito de throughput

**Data:** 2026-08-23

## Lote editorial 001

Gerado por matéria (`proposition_version_id`), com fan-out previsto para todos os
votos/candidatos ligados:

```text
25 matérias
161 candidatos cobertos
171 votos factuais
prioridade = candidate_count × factual_vote_count
remote_apply=false
public_approval=false
```

Cada item contém:

```text
recommended_disposition
recommended_rationale
recommendation_confidence
source_gate=needs_substantive_source_check
```

A recomendação é proposta, não aprovação. Itens sem fonte substantiva verde não
podem avançar para matriz.

Artefato:

```text
data/legislative-import/alrs/impact-editorial-batch-001-v1.json
```

## Circuit breaker

O job `eleicao2026-continuous-progress` agora usa:

```text
monitor_script=scripts/continuous-progress-monitor.mjs
schedule=every 15m
continuity=true
```

O monitor emite fingerprint estável. Ticks sem mudança são suprimidos, sem novo
QA repetitivo. O prompt também registra duas falhas de push/403 como um único
blocker operacional até mudança de credencial/estado.

## Métricas de throughput

O control plane passa a priorizar:

```text
matérias analisadas
matrizes aprovadas
votos cruzados
perfis atualizados
perfis MVP/950
```

Sem contar testes/relatórios como métrica primária, salvo falha de gate.
