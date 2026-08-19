# QA — contrato histórico Câmara e dry-run factual — 2026-08-19

## Objetivo

Revalidar o envelope histórico Câmara contra as sete fontes oficiais resolvidas e
adaptá-lo ao contrato do planner legislativo sem escrever no Supabase.

## Entregue e verificado

- `scripts/adapt-camara-historical-contract.mjs` ganhou CLI bounded, mantendo
  fail-closed para hash, fonte, identidade e candidato TSE.
- `scripts/audit-camara-envelope-sources.mjs` agora possui envelope padrão,
  evitando falha por argumento ausente.
- Revalidação oficial das sete URLs: `7/7` HTTP 200; manifesto gerado em
  `data/legislative-import/camara/historical-resolved-envelope-source-manifest.json`.
- Adaptação factual: `2` proposições, `6` versões, `6` eventos, `84` votos,
  `18` candidatos elegíveis, `7` fontes oficiais e `8` registros bloqueados.
- Dry-run do contrato passou sem escrita: `2` propositions, `6` versions, `6`
  voting_events e `84` legislative_votes.
- O envelope adaptado está em
  `data/legislative-import/camara/historical-contract-envelope.json`; o relatório
  em `historical-contract-dry-run.json` registra `remote_apply` inexistente/não
  executado e as referências ainda exigem resolução remota antes de writer.

## Gates locais

- Testes: **76 arquivos / 359 testes**, exit 0.
- TypeScript: exit 0.
- Schema de impacto: exit 0.
- `data:check`: **1003 candidaturas / 988 fotos**, exit 0.
- Build Vite/PWA/sitemap/release: exit 0; sitemap **1003 candidatos + 2 estáticas**.
- `git diff --check`: exit 0.

## Bloqueios e segurança

- Nenhum Supabase, FK, voto, matriz, RPC ou Cloudflare foi alterado.
- As oito identidades exatas inelegíveis permanecem fora do envelope; nenhum
  cargo histórico foi inferido.
- As sete fontes continuam a exigir confirmação/resolução de UUID remoto no
  catálogo `source_references` antes de qualquer aplicação factual.
- O warning de chunk Vite acima de 500 kB permanece pré-existente e não bloqueia
  o build.

## Próximo passo

Revalidar identidade/schema/FK e catálogo remoto `source_references` por URL/hash;
se todas as sete referências tiverem UUIDs exatos, preparar writer idempotente em
lote seco. Não aplicar votos enquanto qualquer referência ou identidade permanecer
sem resolução.
