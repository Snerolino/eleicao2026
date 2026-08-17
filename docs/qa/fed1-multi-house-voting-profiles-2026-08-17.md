# QA — FED-1: perfis de votação multi-house

**Data:** 2026-08-17
**Escopo:** correção do modelo de perfis por casa legislativa
**Commit-base:** `b0a4ec4`
**Status:** concluída

## Entregue

- `CandidateWithClaims` agora expõe `voting_profiles[]`.
- O serviço busca todos os perfis do candidato por `candidate_id`, sem `maybeSingle()`.
- O indexador agrega por `(candidate_id, house)`.
- A UI renderiza uma seção independente para cada casa legislativa.
- Metadados de fonte foram centralizados por casa:
  Câmara, ALRS, Senado e Câmara Municipal.
- O saldo continua explicitamente rotulado como **saldo nominal**; a separação
  metodológica de impacto permanece para FED-2.
- Foi criado teste de regressão para candidato com ALRS e Câmara simultâneos.

## Índice remoto

Dry-run:

- 3.481 votos factuais com candidato.
- 3.481 linhas de índice por evento.
- 14 perfis derivados.
- Nenhuma escrita no dry-run.

Aplicação autorizada:

- índice e perfis materializados com sucesso.
- 14 perfis remotos após aplicação.
- Distribuição: `camara=1`, `alrs=13`.
- Duplicidades por `(candidate_id, house)`: **0**.

## Gates locais

- Suíte completa: **60 arquivos / 305 testes passando**.
- TypeScript: **passou**.
- Schema de impacto: **passou**.
- `npm run data:check`: **passou** — 1.003 candidaturas, 434 federais, 988 fotos.
- Build Vite/PWA: **passou**.
- Smoke local: **passou** — 1.002 cards, 0 falhas HTTP, 0 erros online.
- `git diff --check`: **passou**.

## Limites preservados

- Nenhuma migration foi criada ou aplicada.
- Nenhuma alteração de RLS/RPC foi feita.
- `profile_score` não foi promovido a score de impacto.
- FED-2 continua responsável por separar saldo factual de alinhamento de impacto.
- Nenhum voto novo foi coletado ou inventado.

## Próximo passo

FED-1 está encerrada. O próximo arco é **FED-2**, com testes de contrato para
impedir que `SIM`/`NÃO` factuais sejam interpretados automaticamente como impacto.
