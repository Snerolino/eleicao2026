# QA — lote Senado nominal: fonte oficial e dry-run do parser

**Data:** 2026-08-19 UTC  
**Status:** preparação concluída; aplicação remota bloqueada por gate de identidade/FK/catalogação

## Objetivo

Revalidar uma trilha legislativa independente após o bloqueio anterior do Senado,
usando a rota oficial de relatórios nominais do Senado Federal e mantendo o
fluxo fail-closed antes de qualquer escrita.

## Fonte oficial verificada

Endpoint usado:

`https://legis.senado.leg.br/parlam-servicosweb/api/v1/relatorios/votacoes-nominais/ano/{ano}/parlamentar/{id}`

Foram refeitos seis GETs sequenciais para os parlamentares RS `6341`, `1186` e
`825`, nos anos 2025 e 2026. Resultado: **6/6 HTTP 200**, `application/octet-stream`,
com payloads identificados como PDF (`%PDF-1.5`).

Para o ano 2026, os três PDFs foram baixados novamente e tiveram seus hashes
registrados no artefato transitório `.orchestrator/runtime/senado-scout/`:

- `sen_6341_2026.pdf`: 97.442 bytes; SHA-256 `e0355fa25266ee5dc666a59016d113def0708a1488153bf7dec9d75902f823e0`
- `sen_1186_2026.pdf`: 97.428 bytes; SHA-256 `142695e8a4b8be5a35a295dc26bedd14357fe6047eaac35285924641cf46d6a4`
- `sen_825_2026.pdf`: 97.376 bytes; SHA-256 `1e49136339007db6c5edec93dc250d5cf0b8cd6c0c713d7b3bb77a7fe31a53bc`

Os PDFs permanecem somente em runtime transitório; não foram adicionados ao
repositório nem ao snapshot público.

## Dry-run e contrato

Conversão local com `pdftotext -layout` e execução de
`scripts/parse-senado-votes.mjs` produziram:

- 12 proposições;
- 17 eventos;
- 48 votos;
- 3 parlamentares;
- 0 votos sem `source`;
- 0 eventos sem `source`;
- 0 parlamentares sem `source`;
- 0 valores de voto fora do vocabulário permitido;
- 48 chaves únicas `(parlamentar, evento)` para 48 votos.

O contrato independente de saída passou com `CONTRACT_EXIT=0`.

## Não aplicado

Nenhuma proposição, versão, evento, voto, identidade, FK, `source_reference`,
matriz, claim, RPC, RLS, Supabase ou Cloudflare foi alterado. O envelope ainda
não é elegível para `--apply`: falta reconciliar os IDs externos com o catálogo
remoto por identidade exata, validar cargo/período/FK e catalogar as URLs
individuais dos relatórios como referências oficiais com hash. O parser atual
usa descrições textuais de fonte e deve ser adaptado para preservar URL completa
no envelope antes de qualquer writer.

## Estado dos dados

A auditoria estrita global continua bloqueada por lacunas reais de fonte:
ALRS 3.985/4.000 votos com fonte, Câmara 279/281 e Senado 0/455.

## Próximo passo bounded

Preparar um catálogo versionado dos seis endpoints oficiais (URL, parlamentar,
ano, HTTP, bytes e SHA-256), depois executar somente a reconciliação read-only
por identidade/FK remota. Manter todos os registros fora do remoto até haver
correspondência exata e `source_reference` resolvida.
