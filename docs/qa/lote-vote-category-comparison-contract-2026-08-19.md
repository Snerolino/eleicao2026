# QA — contrato de comparação de votos por categoria

**Data:** 2026-08-19
**Modo:** implementação local e contrato puro

## Entregue

- `src/domain/impact/vote-category-comparison.ts`
- `src/domain/impact/__tests__/vote-category-comparison.test.ts`

O contrato:

- aceita somente fatos com matriz `approved`;
- compara apenas eventos comuns entre os candidatos selecionados;
- preserva a casa legislativa e `group_slug`;
- contabiliza `sim`, `nao`, `abstencao`, `ausente` e `obstrucao` separadamente;
- não calcula score, alinhamento, afinidade ou recomendação;
- não transforma `nominal_balance` em impacto.

## Gate de dados

O Supabase remoto possui apenas 1 assessment aprovado no recorte atual. Por isso
nenhuma categoria foi inventada para preencher lacunas; a UI só deve renderizar
comparações quando existirem assessments aprovados e fontes compatíveis.

## Verificação

- teste focal: **2/2 passando**;
- TypeScript: passou.

Próximo chunk: consulta pública das avaliações aprovadas e integração da tabela
na `ComparePage`, preservando o fallback explícito de cobertura insuficiente.
