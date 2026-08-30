# QA — Projetos de autoria no dossiê — 2026-08-30

## Entrega verificada

- Contrato `CandidateAuthoredProject` adicionado em `src/types/election.ts`.
- Campo opcional `authored_projects` disponível no modelo público de candidato.
- Acordeão acessível criado em `src/components/candidates/CandidateAuthoredProjectsList.tsx`.
- Filtros de status, tema e busca textual implementados.
- Cartão expandido exibe resumo detalhado fornecido pelo dado, grupos, status, papel e link oficial sanitizado.
- Integração feita em `src/pages/CandidateDossierPage.tsx`.
- Testes em `src/components/candidates/__tests__/CandidateAuthoredProjectsList.test.tsx`.
- Pipeline `scripts/reconcile-candidate-authored-projects.mjs` criado com lotes de 20, validação por `tse_candidate_id`, URLs oficiais, grupos canônicos, sanitização de CPF/e-mail/telefone e merge incremental por `id`; comando `data:authored-projects` adicionado ao `package.json`.

## Verificação

- Teste direcionado: `3/3` passou.
- Suíte completa: `117` arquivos, `491` testes, `0` falhas.
- `npx tsc --noEmit`: passou.
- `npm run data:check`: passou (`1003` candidaturas, `988` fotos).
- `npm run build`: passou; sitemap com `1003 + 2` URLs.
- `npm run smoke:local`: passou; `1002` cards, `0` falhas HTTP, `0` erros online, service worker pronto.
- Fixture temporário do pipeline: `1` candidato, `1` projeto, `1` lote, `0` rejeições, sem escrita no snapshot.

## Ingestão de dados

- Nenhum projeto foi inserido no snapshot nesta etapa.
- O mirror `../dataset2026` não contém catálogo oficial de autoria de projetos.
- O pipeline exige entrada explícita com `--input` e falha fechado sem ela.
- Não foram inventados projetos, autoria, datas, status, resumos ou grupos.
- Próximo gate: obter manifesto oficial ALRS/Câmara por candidato, validar um lote de 20 em dry-run e só então usar `--apply`.
