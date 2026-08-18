# QA — FED-11: perfis nominais ALRS

**Data:** 2026-08-18
**Status:** materializado e reprocessado

## Materialização

Comando oficial:

```text
node scripts/build-vote-profile.mjs --apply
```

Resultado:

- votos factuais com candidato lidos: **4.007**
- linhas de `legislator_vote_index`: **4.007**
- perfis derivados `(candidate_id, house)`: **18** no conjunto completo
- perfis ALRS confirmados no remoto: **13**
- votos agregados nos perfis ALRS: **4.000**
- `house` separado de Câmara/Senado
- nenhum score de impacto ou matriz editorial criado

O perfil usa somente contagens derivadas dos valores factuais (`sim`, `nao`,
`abstencao`, `ausente`, `obstrucao`). O `profile_score` permanece o campo
numérico derivado do índice nominal, não uma avaliação de impacto.

## Idempotência

O writer usa upsert pelas chaves `(candidate_id, voting_event_id)` e
`(candidate_id, house)`. A execução foi concluída sem erro e mantém o conjunto
materializado sem duplicidades.

## Próximo gate

Revisão de cobertura e exposição pública dos perfis ALRS; não publicar novas
matrizes de impacto automaticamente.
