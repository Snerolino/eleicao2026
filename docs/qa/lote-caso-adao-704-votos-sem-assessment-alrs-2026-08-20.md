# QA — caso Adão Pretto Filho: votos ALRS sem score por categoria

**Data:** 2026-08-20

## Auditoria remota

- candidato: Adão Pretto Filho;
- `tse_candidate_id`: `210002534036`;
- votos factuais: **704**;
- casa: **ALRS**;
- distribuição: 600 `sim`, 104 `nao`;
- eventos ALRS do candidato: 704.

## Cobertura de impacto

- eventos ALRS remotos: 1678;
- versões ALRS: 1282;
- matrizes aprovadas ALRS: **0**;
- matrizes aprovadas totais: 2, ambas Câmara;
- assessment aprovado compatível com ALRS: **0**.

Conclusão: não é ausência de votos. É ausência de assessments populacionais
aprovados para a casa ALRS. Sem assessment da mesma versão/casa, score por
categoria seria inventado; a UI agora informa isso explicitamente.

A consulta de eventos e matrizes usa lotes de até 100 IDs, evitando URL PostgREST
excessiva em perfis com centenas de votos.

## Correção pública

O dossiê mantém a distribuição factual e exibe:

> Há votos factuais na casa Assembleia Legislativa RS, mas ainda não há
> avaliações populacionais aprovadas para gerar score por categoria.

Nenhum voto factual foi alterado.

## Gates

- 84 arquivos / 377 testes;
- TypeScript, build e smoke local verdes;
- produção será verificada após publicação.
