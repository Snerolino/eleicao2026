# QA — importação da documentação de orquestração Hermes

**Data:** 2026-08-20
**Origem:** `../dataset2026/documentacao/orquestracao/`

## Arquivos importados

- `docs/orquestracao/00-LEIA-PRIMEIRO-HERMES-ELEICOES2026.md`
- `docs/orquestracao/01-PROMPT-BOOTSTRAP-HERMES.md`
- `docs/orquestracao/02-CONTRATOS-TASK-PACKET-HANDOFF.md`

## Regra de autoridade

Os documentos importados determinam ordem de leitura, separação das trilhas,
formato de task packet/handoff e invariantes de orquestração. Eles próprios
estabelecem que código, migrations, `AGENTS.md` e contratos executáveis atuais
prevalecem sobre o texto documental.

## Divergências registradas

- os documentos mencionam snapshot histórico de 938 candidaturas; o estado atual
  validado do projeto é 1003 candidaturas no snapshot e 1002 cards visíveis;
- os documentos orientam uma fase inicial sem heartbeat/carga massiva; o estado
  atual já possui heartbeat autorizado e R0–R5 avançados;
- o contrato importado é template operacional e não substitui schemas atuais.

Nenhum código, migration, dado remoto, segredo ou snapshot foi alterado nesta
importação.
