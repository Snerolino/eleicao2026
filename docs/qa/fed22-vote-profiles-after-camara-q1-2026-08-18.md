# QA — FED-22: perfis nominais após batch Câmara Q1

**Data:** 2026-08-18
**Modo:** materialização factual idempotente

## Resultado

- `node scripts/build-vote-profile.mjs --apply`: passou duas vezes.
- votos factuais com candidato indexados: **4197**
- `legislator_vote_index`: **4197** linhas
- `legislator_vote_profile`: **38** perfis

Distribuição remota por casa:

- ALRS: **4000** votos
- Câmara: **197** votos
- Senado: **455** votos

O batch Câmara Q1 adicionou 190 votos aos 7 votos Câmara existentes. A chave de
perfil `(candidate_id, house)` foi preservada; nenhum perfil ALRS foi misturado ou
sobrescrito pela Câmara.

Nenhuma matriz de impacto, score editorial, claim ou RPC de aprovação foi criado.
