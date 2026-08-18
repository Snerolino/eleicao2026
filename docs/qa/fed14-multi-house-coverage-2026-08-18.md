# QA — FED-14: cobertura multi-house

**Data:** 2026-08-18
**Status:** auditoria concluída; nenhum caso multi-house atual

## Auditoria remota

- perfis derivados: **18**
- candidatos com perfil: **18**
- candidatos com mais de uma casa: **0**
- perfis ALRS: **13**
- perfis de outras casas: mantidos separados pelo campo `house`

Não existe, nesta carga, candidato com perfil simultâneo ALRS+Câmara. Portanto,
não foi feita nenhuma escrita ou alteração artificial para criar um cenário que
não está presente nos dados.

## Contrato multi-house

A cobertura continua protegida por testes locais:

- `buildVoteProfileRows` agrega por `candidate_id:house`;
- fixture com ALRS e Câmara para o mesmo candidato gera dois perfis distintos;
- coleção pública agrupa perfis por candidato e preserva cada casa;
- dossiê renderiza uma seção por casa usando `key={profile.house}`.

Testes direcionados: **31 passando**.

## Próximo gate

Quando surgir um candidato com duas casas no remoto, repetir a auditoria com
fixture real e validar o dossiê público. Até lá, manter a separação estrutural e
não inferir multi-house por nome ou por proximidade de identidade.
