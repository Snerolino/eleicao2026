# QA — FED-12: cobertura pública dos perfis ALRS

**Data:** 2026-08-18
**Status:** corrigido, testado e publicado

## Achado

A consulta individual de dossiê já carregava `legislator_vote_profile` por
`candidate_id`, mas a consulta da coleção pública (`fetchAllCandidates`) não
carregava os perfis. Em cenários de fallback/merge do snapshot, isso fazia os
perfis ALRS desaparecerem da coleção pública, apesar de existirem no remoto.

## Correção

- adicionada consulta em lote a `legislator_vote_profile` com `.in('candidate_id', ...)`;
- agrupamento preserva a chave lógica `(candidate_id, house)`;
- `nominal_balance` continua sendo apenas derivado de `profile_score` factual;
- nenhuma alteração em votos, matrizes, claims, RLS ou schema remoto;
- dossiê individual continua usando a consulta existente por candidato.

## Evidência

- teste direcionado: **29 testes passando** em `src/services/__tests__/candidates.test.ts`;
- contrato novo verifica perfil ALRS presente na coleção pública e casa preservada;
- TypeScript: passou;
- suíte completa e build executados antes da publicação.

## Limites

A cobertura pública depende de `candidate_id` existir no conjunto de candidatos
carregado e dos perfis remotos terem RLS público de leitura. O fallback continua
sem inventar perfis: candidatos sem linha derivada recebem `voting_profiles: []`.
