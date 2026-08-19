# QA — comparação de votos por categoria na ComparePage

**Data:** 2026-08-19
**Modo:** integração pública com cobertura fail-closed

## Entregue

- `src/services/voteCategoryComparison.ts` consulta índice factual, eventos e
  matrizes aprovadas sem criar migration.
- `ComparePage` ganhou painel “Votos em categorias aprovadas”.
- Comparação usa somente eventos comuns entre candidatos selecionados.
- Votos são exibidos por categoria/casa e por valor factual.
- Sem assessment aprovado ou cobertura comum, a UI mostra fallback explícito e
  não fabrica categoria, score ou recomendação.

## Gates

- ComparePage + contrato: **8/8 testes**
- suíte completa: **80 arquivos / 370 testes**
- TypeScript: passou
- build: passou
- snapshot: 1003 candidaturas / 988 fotos
- impacto editorial: não alterado
