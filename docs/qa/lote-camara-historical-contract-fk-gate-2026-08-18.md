# QA — gate de contrato/schema/FK Câmara histórico — 2026-08-18

## Objetivo
Auditar o envelope factual histórico da Câmara antes de qualquer SQL remoto,
validando o contrato legislativo versionado e o catálogo remoto de identidade,
schema e FK dos 18 candidatos elegíveis.

## Evidência executada

- Lock bounded adquirido; worktree limpa no início; nenhum writer concorrente.
- Ambiente de gates corrigido para Node `v24.19.0` via `nvm use 24.19.0`.
- Builder determinístico executado:
  `npm run impact:camara:historical:envelope:build` → `{"propositions":2,"events":6,"votes":84,"eligible_identities":18}`.
- Teste focado: `npm run test -- scripts/__tests__/build-camara-historical-resolved-envelope.test.mjs --run` → 1 arquivo, 3 testes, todos passaram.
- Contrato geral: `node scripts/validate-impact-schema.mjs` → checkpoint OK.
- Consulta read-only Supabase `information_schema` confirmou as tabelas e colunas remotas, incluindo `candidates.tse_candidate_id`, `legislative_votes.candidate_id`, `proposition_versions.text_hash` e `source_reference_id` nas tabelas legislativas.

## Bloqueio real encontrado

`npm run impact:dryrun -- data/legislative-import/camara/historical-resolved-envelope.json` falhou fechado com 212 erros:

- as duas proposições não carregam `number` e `year`, ambos obrigatórios no schema remoto/contrato;
- as seis versões não carregam `text_hash`, obrigatório e não vazio;
- os 84 votos carregam `candidate_id`/`tse_candidate_id`, campos fora do contrato v1.0.0 do planejador (a resolução de FK deve ocorrer por catálogo, não dentro do envelope público);
- as fontes estão como URLs no envelope, mas a aplicação exige resolver `source_reference_id` por catálogo/hash antes de qualquer escrita.

O resultado é **fail-closed**. Nenhum SQL foi emitido/aplicado; nenhum voto,
proposição, versão, evento, FK, UUID, `source_reference` ou matriz foi escrito
no Supabase.

## Estado dos dados

- Envelope factual local: 2 proposições, 6 eventos, 84 votos, 18 identidades.
- Sanderson e Henrique Fontana continuam fora por cargo remoto não elegível;
  oito registros permanecem bloqueados sem inferência.
- Schema remoto consultado read-only; identidade e FK não foram alteradas.

## Gates deste chunk

- Builder: verde.
- Teste focado: verde (3/3).
- Schema de impacto: verde.
- Auditoria do planejador legislativo: vermelho esperado (212 erros de contrato).
- Doctor no shell padrão: Node `v22.22.2`, portanto `FAIL` de pré-requisito; os
  gates deste chunk foram executados com Node 24.19.0. O smoke também registrou
  falha de evidência MCP Codex, sem impacto porque não houve mutação de código.

## Próximo passo

Criar um adaptador/contrato de importação separado que derive `number`, `year`,
`text_hash` e referências de fonte a partir do catálogo oficial versionado e
resolva candidatos apenas por `tse_candidate_id` remoto. Provar novamente o
`impact:dryrun` e a idempotência local antes de qualquer SQL. Manter os oito
casos bloqueados fail-closed.
