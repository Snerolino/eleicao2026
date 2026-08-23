# QA — cobertura de deputados estaduais e fila editorial

**Data:** 2026-08-23

## Universo público/remoto

```text
snapshot público: 521 deputados estaduais
Supabase candidates RS/2026: 521 deputados estaduais
```

## Votos ALRS disponíveis

```text
3.171 votos em 11 candidatos estaduais
4.000 votos ALRS totais no remoto
3.996 votos com source_reference_id
4 votos na recovery queue
11 perfis legislator_vote_profile house=alrs
```

Os 510 candidatos restantes não foram tratados como “sem votos”; a ausência de
registro oficial não é convertida em zero. Permanecem fora de publicação factual
até existir fonte nominal ALRS/TSE verificável.

## Recovery queue

A tentativa dry-run de recuperação retornou:

```text
planned_votes=0
blocked_events=3
blocked_identity=1
```

Nenhuma escrita foi feita nessa recuperação.

## Editorial

As cinco disposições P2 foram resolvidas pelo `/admin`. O painel agora carrega
`impact_editorial_dispositions` remoto e não reapresenta itens `approved` após
relogin/reload.

Assessment pendente:

```text
PL 43/2019 → mulheres
```

Sem publicação automática de direção, severity, confiança ou score.
