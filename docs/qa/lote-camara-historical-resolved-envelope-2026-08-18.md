# QA — lote Câmara histórico envelope resolvido — 2026-08-18

## Objetivo

Construir, em dry-run local e fail-closed, o envelope factual das seis votações
nominais históricas da Câmara já catalogadas, promovendo somente identidades
exatas com cargo remoto `deputado_federal` e UF `RS`.

## Entrega verificada

- Novo CLI: `scripts/build-camara-historical-resolved-envelope.mjs`.
- Novo contrato Vitest: `scripts/__tests__/build-camara-historical-resolved-envelope.test.mjs`.
- Novo comando: `npm run impact:camara:historical:envelope:build`.
- Artefatos versionados:
  - `data/legislative-import/camara/historical-resolved-envelope.json`
  - `data/legislative-import/camara/historical-resolved-catalog.json`
  - `data/legislative-import/camara/historical-resolved-source-manifest.json`

Resultado do builder:

```json
{"propositions":2,"events":6,"votes":84,"eligible_identities":18}
```

O envelope preserva proposição, evento, data, valor do voto e URL oficial por
registro. Os oito registros bloqueados (Sanderson: cargo remoto senador; Henrique
Fontana: cargo remoto outro) não entram no envelope.

## Evidência de fontes

- Auditoria `impact:camara:sources:audit`: 7 URLs, 7 HTTP 200.
- As seis URLs nominais tiveram SHA-256 idêntico ao catálogo/dry-run oficial:
  `event_hash_matches=6 of 6`.
- A sétima URL é a ficha oficial da proposição PL 3723/2019; nenhuma fonte foi
  inventada.

## Idempotência e testes

- Builder executado duas vezes.
- `sha256sum -c /tmp/historical-before.sha`: ambos os artefatos permaneceram
  idênticos.
- Teste focado: 1 arquivo, 3 testes, todos passaram.
- Nenhuma escrita em Supabase, Cloudflare, FK remota, `source_reference`, voto
  publicado ou matriz foi realizada.

## Estado dos dados

- Fonte nominal oficial: 6 eventos, 142 registros RS no dry-run original.
- Reconciliação de cargo/UF: 84 registros elegíveis, 18 `tse_candidate_id` únicos.
- Envelope histórico resolvido: 84 votos em 2 proposições/6 eventos.
- Os oito registros bloqueados e identidades não encontradas/ambíguas continuam
  fail-closed.

## Bloqueios

- Aplicação remota não foi executada: este lote é preparação factual dry-run e
  ainda exige revisão do envelope, confirmação de catálogo de FKs e gate remoto
  de identidade/schema antes de qualquer writer.
- `npm run orch:doctor -- --smoke` no shell padrão registrou `FAIL` porque Node
  22.22.2 está ativo, embora o projeto exija Node 24. O ambiente possui Node
  24.19.0 e os gates deste lote devem ser executados com `nvm use 24`.
- OpenCode permanece indisponível (WARN), sem impacto porque Codex/local e
  verificação determinística estão disponíveis.

## Próximo passo

Auditar o envelope contra o contrato legislativo e, separadamente, validar a
identidade/schema/FK remota dos 18 candidatos antes de preparar qualquer SQL ou
aplicação. Manter os oito casos bloqueados sem inferência.
