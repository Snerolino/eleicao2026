# QA — Coleta oficial de projetos de autoria Câmara — 2026-08-31

## Resultado factual

- Fonte: arquivos oficiais anuais `proposicoesAutores/csv` da Câmara, 2019–2026.
- Vínculos projeto–candidato: `38.456` linhas oficiais consideradas.
- Registros projeto–papel: `38.358`.
- Projetos únicos: `25.107`.
- Candidatos com autoria exata: `36`.
- Autoria principal: `25.979`.
- Coautoria: `12.379`.
- Relatorias não foram inferidas: o arquivo de autores não é prova de relatoria.
- Duplicidades por `(candidate_tse_id, project_id)`: `0`.
- URLs oficiais Câmara: `100%` dos registros.
- CPF/e-mail detectados no manifesto sanitizado: `0`.
- Fonte bruta ficou somente em `/tmp/eleicao2026-camara-authored`; não foi versionada.

## Artefatos

- Manifesto factual: `data/legislative-import/camara/candidate-authored-projects-factual-manifest-v1.json`.
- SHA-256 do manifesto: `sha256:b806530063d189f314d3ed6acc329b5832b5c22e2929f32170924c29370857bf`.
- Fila editorial: `data/legislative-import/camara/authored-project-review-batches/manifest.json`.
- Fila: `2` lotes de `20` candidatos, cobrindo `36` candidatos e `38.358` registros.

## Política fail-closed

- O manifesto contém fatos oficiais de autoria, status, identificadores e URLs.
- `content_read=false` na fila editorial; nenhum mecanismo causal, grupo populacional ou score foi inventado.
- Ementas oficiais foram preservadas somente no manifesto factual e sanitizadas; não foram convertidas automaticamente em análise causal.
- A reconciliação para o snapshot permanece separada e exige `summary_expanded`, `main_topic` e `target_groups` validados.
- Nenhuma escrita remota foi feita nesta coleta.

## Gates

- `node --check` dos coletores: aprovado.
- `npm run data:check`: aprovado (`1003` candidaturas, `988` fotos).
- `npx tsc --noEmit`: aprovado.
- `npm run test -- --passWithNoTests`: aprovado.
- `npm run build`: aprovado.
- `npm run smoke:local`: aprovado (`1002` cards, `0` falhas HTTP, `0` erros online).
- `git diff --check`: aprovado.

## Próximo passo

Executar agentes editoriais read-only em lotes de 20 candidatos sobre a fila, produzindo decisões por projeto com fonte normativa/eventual oficial. Só registros com análise causal completa e revisão fail-closed podem ser adaptados ao contrato público e aplicados incrementalmente.
