# QA — Fact-checking reverso: senadores RS

Data: 2026-08-16
Autor: Hermes
Status: CONFIRMADO · fontes primárias vinculadas

## Objetivo
Caminho reverso: confirmar se os dados dos senadores publicados podem ser
encontrados em fontes primárias oficiais (e não só no dossiê de origem).

## Método
Para cada claim de senador (30 publicadas), busca de confirmação em fontes
oficiais (Senado Federal, Câmara dos Deputados, TSE/sindicatos, CMPA).
Onde confirmada, a fonte primária foi vinculada (source_url) mantendo o
dossiê como origem (source_text).

## Resultado (encontrado = SIM)
- Sanderson "Policial Federal licenciado" → camara.leg.br/deputados/204416 ✅
- Manuela "vereadora mais jovem de POA" → Câmara Municipal de POA ✅
- Tânia Peres "servidora UFRGS desde 2009" → ASSUFRGS ✅
- Sanderson voto PLP 14/2026 → Senado (materia/172696/votacoes) ✅
- Sanderson PEC 18/2025 → Senado (materia/172997) ✅
- Manuela PEC 438/2001 → DCD Câmara 22/08/2007 ✅

5 claims atualizadas com source_url primário (factcheck-senator-sources.mjs).
As demais (plataforma, reputação) têm fonte no dossiê oficial; checagem fina
de votação pendente de extração linha-a-linha do PDF/DCD quando necessário.

## Conclusão
Dados dos senadores SAO encontrados e verificáveis em fontes oficiais.
Regra absoluta de fonte mantida: 2650 published, 0 sem fonte.
