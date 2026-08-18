# QA — auditoria read-only do catálogo remoto Câmara histórico — 2026-08-18

## Objetivo

Verificar, antes de qualquer aplicação factual, se as 7 URLs e hashes SHA-256
oficiais do manifesto versionado `historical-resolved-source-manifest.json`
possuem correspondência exata em `public.source_references` no Supabase remoto.

## Evidência executada

- Projeto Supabase remoto confirmado pelo `supabase/.temp/project-ref`:
  `hhqxhxcfkoijevxyzfky`.
- `supabase migration list --linked`: local e remoto alinhados até
  `20260816100000`.
- Consulta SQL read-only por URL nas 7 entradas: `0/7` encontradas.
- Consulta SQL read-only independente por `content_hash`: `0/7` hashes
  encontrados; não há UUID remoto nem correspondência com URL divergente.
- As 7 URLs são as do manifesto oficial versionado, cobrindo a proposição
  `2209381` e as votações nominais `9002`, `9003`, `9224`, `9225`, `9226` e
  `9227`.

## Resultado

- Catálogo remoto: **bloqueado — 7 referências ausentes**.
- Não há resolução segura de `source_reference_id`; nenhum UUID foi inventado.
- Nenhum SQL, inserção, FK, voto, proposição, evento, matriz, RPC ou alteração
  remota foi executado.
- O envelope factual permanece somente em dry-run; os 8 registros inelegíveis
  continuam fora da carga.

## Bloqueio real

As referências precisam ser materializadas no catálogo remoto por operação
idempotente e autorizada, com revalidação de URL, hash e bytes antes da escrita.
O próximo writer deve primeiro repetir o gate de identidade/schema/FK e preparar
um plano de criação idempotente; este tick não aplicou o plano.

## Próximo passo

Preparar um plano idempotente de `source_references` para as 7 entradas, usando
somente os hashes/bytes/URLs do manifesto oficial, e validar novamente o schema
remoto antes de qualquer `--apply`. Depois resolver as FKs dos 18 candidatos por
`tse_candidate_id`; não promover os 8 bloqueados.
