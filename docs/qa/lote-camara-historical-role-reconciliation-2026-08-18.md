# QA — reconciliação de cargo/UF nominal histórica Câmara

- Data/hora: 2026-08-18 18:36 UTC
- Objetivo: fechar o gate read-only de cargo/UF dos registros nominais históricos já reconciliados por identidade exata, sem aplicar votos.

## Evidência usada

- Entrada: `data/legislative-import/camara/historical-nominal-remote-identity-lookup.json`.
- SHA-256 da entrada: `47c8f8528e613d7377a8a87b536aa77d0d67953fe6e2db042561d98faa28c551`.
- A entrada contém 92 registros `matched_exact`, com `tse_candidate_id` e consulta remota por lotes de 20.
- Regra aplicada: uma única correspondência remota, `position=deputado_federal`, `state=RS`; proposição, data, voto e `source_url` permanecem os valores oficiais já extraídos.

## Resultado bounded

- **84 registros elegíveis em dry-run** para 18 `tse_candidate_id` únicos.
- **8 registros bloqueados**:
  - Sanderson (`210002547816`): 4 registros, remoto classificado como `senador`.
  - Henrique Fontana (`210002533583`): 4 registros, remoto classificado como `outro`.
- Artefato: `data/legislative-import/camara/historical-role-reconciliation.json`.
- `remote_apply=false`; nenhum voto, proposição, evento, FK, UUID, `source_reference`, matriz ou RPC foi criado/alterado.

## Decisão fail-closed

O conjunto de 84 é somente candidato a próximo envelope factual. Ainda não é carga remota: falta validar/produzir o envelope idempotente com proposição, evento, data, voto e fonte por registro e auditar duplicidades antes de qualquer writer. Os grupos `senador`/`outro` permanecem fora.

## Publicação verificada

- Commit `9d942c18e215c67267b013efeee45b1ceee6c194` publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32172065273`, concluiu `success` com `headSha` idêntico.
- Produção `https://rs.votopraquem.org/release.json`: HTTP 200, SHA `9d942c18e215c67267b013efeee45b1ceee6c194`, versão `0.2.344`.

## Próximo chunk bounded

Construir e auditar o envelope factual dry-run dos 84 registros elegíveis, reutilizando somente fontes oficiais e chaves exatas; depois provar idempotência local. Não aplicar Supabase até o envelope passar o gate de fontes/FK/duplicidade.
