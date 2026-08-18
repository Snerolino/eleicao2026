# QA — FED-13: smoke público dos perfis ALRS

**Data:** 2026-08-18
**Status:** produção validada

## Smoke completo em produção

URL: `https://rs.votopraquem.org`

- cards públicos: **1002**
- busca: passou
- dossiê canônico por slug: passou
- rota legada UUID: passou
- modo offline: passou
- service worker: pronto
- falhas HTTP: **0**
- erros de console online: **0**

## Perfil ALRS em dossiê real

Candidato testado: Adão Pretto Filho

`/candidatos/adao_pretto_filho_210002534036`

- HTTP: **200**
- título do documento: presente
- “Perfil de votações nominais”: presente
- “Assembleia Legislativa do RS”: presente
- fonte “Portal da Transparência ALRS”: presente

O teste confirma a cadeia completa: voto factual remoto → perfil derivado por
casa → carregamento público → dossiê com fonte institucional.

## Gate

Nenhuma escrita remota foi necessária nesta fase. Nenhuma matriz de impacto foi
criada ou alterada.
