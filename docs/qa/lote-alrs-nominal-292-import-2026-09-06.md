# Lote ALRS — importação nominal dos 292 faltantes — 2026-09-06

## Objetivo
Fechar, sem fabricar dados, a lacuna factual de 292 votos nominais ALRS identificada na reconciliação oficial anterior.

## Entregue e verificado
- Reconciliação oficial: 44.054 linhas; 44.053 already_present_exact e 1 event_identity_collision preservada (Vilmar Zanchin / PL 246/2020, remoto sim versus fonte nao); nenhuma linha sobrescrita.
- Pacote Auth/RPC: 292 linhas deduplicadas, 292 inseridas, 0 conflitos, remote_apply=true, um chunk.
- Monitor: nominal_missing passou de 292 para 0; nominal_ambiguous=0 e nominal_blocked_proposition=0.
- Cada linha mantém URL oficial ALRS, hash da fonte, candidato, versão/evento e data; sem score, matriz ou assessment.

## Estado dos dados
- Votos nominais factual ALRS: 4.000 no monitor agregado; reconciliação ALRS: 44.054 linhas, incluindo as 292 novas linhas deste lote.
- Perfis, score e matriz não foram alterados por este lote.
- A colisão permanece bloqueada e separada; não é contada como voto corrigido.

## Bloqueios
- 1 colisão de evento/valor permanece fail-closed: a mesma proposição/data contém eventos ALRS distintos sem discriminante suficiente.
- Não houve aplicação de matriz, score, claim editorial ou inferência causal.

## Evidências
- data/legislative-import/alrs/alrs-nominal-vote-reconciliation-v1.json
- data/legislative-import/alrs/alrs-nominal-vote-import-current.json
- data/legislative-import/alrs/alrs-nominal-discovery-manifest-v1.json
- RPC autenticado import_alrs_nominal_votes: inserted=292, conflicts=0, already_present=0.

## Próximo passo
Continuar a recuperação oficial da colisão de evento e a fila editorial independente; manter score/matriz somente após assessment completo, evento vinculante e revisão exigida.
