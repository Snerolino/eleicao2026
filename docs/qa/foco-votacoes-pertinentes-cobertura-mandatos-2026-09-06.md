# QA — foco em votações pertinentes e cobertura — 2026-09-06

## Entrega

A página pública de dossiê agora:

1. mostra no registro detalhado somente votações com `assessment_group` pertencente à taxonomia populacional canônica;
2. mantém os fatos agregados da casa separados do subconjunto pertinente;
3. exibe cobertura de votações localizadas, pertinentes e pontuadas;
4. exibe a instituição legislativa da casa;
5. exibe mandatos com instituição e datas quando `mandate_history` oficial estiver disponível;
6. informa explicitamente quando datas de mandato não foram localizadas, sem inferir mandato a partir de votos.

## Contrato de cobertura

- `pertinentes / localizadas`: votações com grupo populacional canônico;
- `pontuadas / pertinentes`: votações pertinentes com `score_eligible=true`;
- ausência de denominador retorna `não avaliado`, nunca zero.

A avaliação por categoria continua restrita a assessments aprovados/contestados com fonte, conforme o contrato de impacto.

## Verificação

- testes direcionados: **8/8**;
- suíte completa: **496/496** em **119** arquivos;
- TypeScript: OK;
- schema de impacto: OK;
- `data:check`: **1003** candidaturas e **988** fotos oficiais;
- build: **245 módulos**;
- smoke local: **1002 cards**, **0** falhas HTTP, **0** erros online, service worker pronto;
- `git diff --check`: OK.

## Limite conhecido

O snapshot atual não contém histórico estruturado de mandatos para todos os candidatos. A UI não fabrica datas: informa a ausência e mostra a instituição da casa e a cobertura temporal das votações catalogadas.
