# QA — smoke R5 após Câmara Q2/Q3 e comparação categorial

**Data:** 2026-08-20

## Smoke local

- cards visíveis: **1002**
- busca: passou
- detalhe canônico: passou
- offline/PWA: passou
- falhas HTTP: **0**
- erros de console online: **0**
- service worker: pronto

## Auditoria factual

- votos totais: **4932**
- Câmara: 477 votos, 475 com fonte;
- ALRS: 4000 votos, 3996 com fonte;
- Senado: 455 votos, ainda sem fonte;
- matrizes aprovadas: **1**

A comparação por categoria permanece fail-closed quando não há assessment
aprovado com fonte e eventos comuns. Nenhum score ou recomendação foi criado.

## Resultado

R5 smoke verde. O strict global permanece código 2 apenas pelas filas factuais
já documentadas; isso não bloqueia as lanes independentes de implementação,
reconhecimento e publicação.
