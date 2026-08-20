# QA — scout Câmara Q3/2026 parcial

**Janela:** 2026-07-01 a 2026-09-30
**Modo:** read-only

## Evidência

- primeira página: 100 eventos acessíveis;
- paginação consultada: 10 páginas × 100 = **1000 eventos**;
- HTTP das páginas: 200;
- `tipoVotacao`: ausente em 1000/1000 registros;
- primeiro lote de 100: nenhum voto RS nominal encontrado;
- nenhum evento foi classificado como não nominal apenas pela ausência do campo.

A nominalidade continua exigindo confirmação pela rota oficial
`/votacoes/{vote_id}/votos`. O trimestre tem mais registros além das 10 páginas
consultadas; o scout não baixou indiscriminadamente todos os votos.

## Gate

Nenhuma identidade, voto, fonte, FK, Supabase ou Cloudflare foi alterada. Próximo
chunk: continuar pré-coleta paginada Q3 com concorrência bounded e confirmar
nominalidade somente em `/votos`.
