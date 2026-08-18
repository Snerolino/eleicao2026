# QA — FED-7B: carga factual Câmara

**Data:** 2026-08-17
**Status:** fatos nominais aplicados; impacto continua pendente de revisão

## Resolução remota

Lookup somente por `tse_candidate_id` resolveu os quatro candidatos:

- Fernanda Melchionna — `210002533902`
- Maria do Rosário — `210002534604`
- Afonso Hamm — `210002537712`
- Osmar Terra — `210002534668`

Os UUIDs remotos foram retornados pelo Supabase e versionados no catálogo remoto.
Nenhum UUID foi fabricado a partir do snapshot.

## Gate de fontes

As quatro `source_references` já existiam no remoto por `content_hash`:

- inseridas: **0**
- existentes/recuperadas: **4**
- IDs resolvidos: **4**

## Gate factual

Aplicado apenas o lote factual oficial do PLP 230/2025/SBT-1:

- proposições criadas: **1**
- versões criadas: **1**
- evento criado nesta passagem: **0** — já existia
- votos criados na primeira passagem: **4**
- votos criados na segunda passagem: **0**
- total de votos no evento após a carga: **5**
- candidatos distintos no evento: **5**

O quinto registro já existente é Marcel van Hattem, fixture federal anterior; não
houve duplicação.

## Gate de impacto

- matrizes criadas: **0**
- RPC de aprovação: **não chamado**
- matriz do FED-6: permanece `pending_review`
- scores/alinhamentos gerados: **0**

## Writer

Criado `scripts/apply-camara-fed7-factual.mjs`:

- dry-run padrão sem consulta nem escrita;
- `--apply` explícito;
- idempotência por casa/evento/candidato;
- falha fechado para candidato ou fonte ausente;
- não acessa `impact_matrices`.

## Verificação

- segunda passagem idempotente: **0 novas linhas**;
- Node usado no gate remoto: **24.19.0**;
- nenhum segredo entrou em artefatos versionados.

Próximo gate: revisar editorialmente a matriz `pending_review`; aprovação e
publicação continuam separados da carga factual.
