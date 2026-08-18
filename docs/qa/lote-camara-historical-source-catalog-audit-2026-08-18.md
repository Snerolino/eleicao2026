# QA — catálogo histórico Câmara e fontes oficiais

- **Data:** 2026-08-18
- **Objetivo:** revalidar o manifesto histórico Câmara por URL/HTTP/bytes/SHA-256 e cadastrar somente as `source_references` oficiais verificadas, sem aplicar proposições, eventos, votos ou FKs.

## Evidência verificada

- Manifesto versionado: `data/legislative-import/camara/historical-resolved-source-manifest.json`.
- 7/7 GETs oficiais refeitos sequencialmente com HTTP 200.
- 7/7 coincidências exatas de bytes e SHA-256, incluindo a API da proposição `2209381` e as votações nominais `9002`, `9003`, `9224`, `9225`, `9226`, `9227`.
- Catálogo remoto lido antes da escrita: 125 linhas de `source_references`; as 7 URLs não existiam.
- Primeira tentativa foi bloqueada pelo `source_references_source_category_check`; causa real confirmada no schema: categorias aceitas são `oficial`, `imprensa`, `fact_check`, `outro`. Nenhuma linha foi inserida nessa tentativa.
- Segunda execução idempotente usando `source_category=oficial`: 7 planejadas, 7 inseridas, 7/7 presentes e 7/7 hashes coincidentes na releitura remota.
- Artefatos auditáveis: `.orchestrator/runtime/camara-historical-scout/catalog-audit-2026-08-18.json` e `source-apply-2026-08-18.json`.

## Escopo e segurança

- `votes_touched=0`, `propositions_touched=0`; nenhum voto, identidade, UUID de candidato, FK, matriz ou RPC foi alterado.
- Deploy publicado pelo workflow backup `334951434`, run `32198093850`, concluído `success` com `headSha=d999496101ac7cd3a1f62e4e9b5b184c5954948f`; produção respondeu HTTP 200 e `/release.json` confirmou o mesmo SHA, versão `0.2.360` e 1003 candidaturas.
- Os 4 registros históricos de Henrique Fontana com `position=outro` permanecem fail-closed; as 8 identidades não elegíveis continuam fora do envelope.
- Nenhum segredo foi impresso ou versionado.

## Próximo passo

Revalidar o envelope histórico contra as 7 `source_references` agora resolvidas e preparar um plano de aplicação factual dry-run; não aplicar votos até o contrato remoto de proposições/versões/eventos e as FKs de candidatos passarem novamente no gate.
