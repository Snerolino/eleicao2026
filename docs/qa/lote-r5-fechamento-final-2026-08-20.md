# QA — fechamento final R5

**Data:** 2026-08-20

## Smoke local

- cards: **1002**
- busca/detalhe canônico: passou
- comparação: rota compartilhável e tabela presentes
- offline/PWA: passou
- service worker: pronto
- falhas HTTP: **0**
- erros de console online: **0**

## Smoke produção

- URL: `https://rs.votopraquem.org/`
- cards: **1002**
- comparação: passou
- offline/PWA: passou
- falhas HTTP: **0**
- erros de console online: **0**
- health-check: `status=ok`
- release: `c2ae329-20260820T203554888Z`
- RLS: `failures=[]`
- alerts: `[]`

R5 está fechado para o recorte atual. A comparação exibe fatos nominais e saldos
somente para categorias aprovadas; coberturas ausentes permanecem `não avaliado`.
