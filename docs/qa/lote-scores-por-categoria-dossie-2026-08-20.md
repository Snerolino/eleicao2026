# QA — scores por categoria no dossiê do candidato

**Data:** 2026-08-20

## Mudança pública

O dossiê não apresenta mais `nominal_balance` como avaliação do candidato.

Agora exibe separadamente:

1. distribuição factual de votos:
   `sim`, `não`, `abstenção`, `ausente`, `obstrução`;
2. impacto populacional por categoria, somente quando houver:
   - assessment `approved`/`contested`;
   - grupo oficial;
   - fonte associada;
   - voto elegível para o cálculo.

Scores aparecem como `+0,62`/`-0,08`; ausência de cobertura aparece como
`não avaliado`, nunca como zero.

## Verificação

- testes focais: **9/9**;
- suíte: **84 arquivos / 377 testes**;
- TypeScript: passou;
- build: passou;
- smoke local: 1002 cards, 0 falhas HTTP, 0 erros de console online;
- PWA/offline: passou.
