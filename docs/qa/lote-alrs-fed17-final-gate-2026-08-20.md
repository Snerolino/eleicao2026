# QA — fechamento R1 ALRS

**Data:** 2026-08-20
**Status:** preparação/aplicação factual concluída; 4 residuais fail-closed

## Fechado

- 3996/4000 votos ALRS têm `source_reference_id`.
- 11 votos foram reparados no último sublote com evidência oficial exata.
- 2 eventos tiveram a data corrigida para a página oficial ALRS.
- Segunda execução do reparador produziu 0 alterações.
- Nenhuma matriz, claim, score ou RPC editorial foi tocada.

## Residual factual

Restam exatamente 4 votos sem fonte:

- `alrs_pl134_2023` — Enio Carlos Terra
- `alrs_pl165_2025` — Enio Carlos Terra
- `alrs_pl361_2025` — Enio Carlos Terra
- `alrs_pl77_2025` — Enio Carlos Terra

O catálogo oficial ALRS não contém ID verificável para `210002534312`. As buscas
oficiais não localizaram um ID alternativo; fuzzy matching e inferência nominal
estão proibidos.

## Auditoria

A CLI Supabase read-only confirmou os quatro residuais e o schema remoto. O
script Node do auditor encontrou `JWT issued at future` no credential JWT do
ambiente, mas isso não afetou a confirmação CLI nem foi contornado lendo segredo.

`impact:sources:audit --strict` não pode ser declarado verde enquanto os quatro
votos permanecerem sem fonte/identidade. R1 está encerrada operacionalmente para
todos os casos comprováveis e permanece aberta somente como fila factual residual.

## Próximas fases liberadas

- R2/R3: manutenção e expansão factual independente;
- R4: somente revisão de matrizes aprováveis com fonte;
- R5: UI/comparação com fallback de cobertura;
- reconhecimento ALRS continua em background para eventual ID oficial de Enio.
