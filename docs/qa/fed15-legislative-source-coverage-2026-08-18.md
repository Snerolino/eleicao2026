# QA — FED-15: auditoria de cobertura das fontes legislativas

**Data:** 2026-08-18
**Status:** auditoria concluída; lacunas documentadas, sem preenchimento especulativo

## Auditoria read-only do Supabase

O novo comando `npm run impact:sources:audit` consulta somente as tabelas
legislativas e não executa INSERT, UPDATE, DELETE ou migration.

| Tabela | Total | ALRS com fonte | ALRS sem fonte | Câmara com fonte | Senado com fonte |
| --- | ---: | ---: | ---: | ---: | ---: |
| proposition_versions | 1398 | 31 | 1251 | 1 | 0 |
| voting_events | 1869 | 31 | 1647 | 1 | 0 |
| legislative_votes | 4462 | 3975 | 25 | 5 | 0 |

A auditoria encontrou **93 source_references** no remoto. As proposições não
possuem coluna de fonte própria; a rastreabilidade ocorre nas versões, eventos
e votos.

## Decisão de segurança

Não foram criadas fontes artificiais para os registros sem vínculo. Os 25 votos
ALRS sem fonte não carregam URL/hash suficiente no registro remoto para uma
resolução segura. Os registros históricos do Senado permanecem sem fonte por
causa do bloqueio já documentado na FED-9.

O auditor oferece `--strict`, que retorna código 2 quando há lacunas, permitindo
que um gate futuro impeça publicação factual incompleta:

```bash
npm run impact:sources:audit
node scripts/audit-legislative-source-coverage.mjs --strict
```

## FED-16 — fila de recuperação preparada

O auditor também agrupa os votos ALRS sem fonte por evento. A execução remota
identificou **5 eventos** para recuperar: `alrs_pl134_2023` (6 votos),
`alrs_pl165_2025` (6), `alrs_pl361_2025` (6), `alrs_pl38_2026` (1) e
`alrs_pl77_2025` (6). A fila é somente diagnóstico e usa o motivo
`source_evidence_not_linked`; não cria URL, hash ou UUID.

## Contrato local

`scripts/__tests__/source-coverage.test.mjs`: **3 testes passando**.
A função agrega por casa, resolve relações aninhadas e sinaliza qualquer lacuna.

Nenhum dado factual, matriz de impacto, claim, RLS ou schema remoto foi alterado.
