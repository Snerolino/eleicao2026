# Próximos passos — Fase 7 / assinatura do MVP

Atualizado em 2026-08-01, após merge do checklist final do MVP.

## Gates humanos pendentes

1. **Publicação editorial** — revisar, aprovar e publicar o `summary` faltante de `FRANCISCO MARQUES NETO` pelo fluxo H4.2:
   - claim criada como `pending_review`;
   - fonte pública válida em `source_references`;
   - review aprovado registrado;
   - publicação por RPC transacional `publish_claim`.

2. **CSP enforce** — decisão humana necessária. Recomendação técnica atual: manter CSP em `report-only` até observar relatórios reais sem violações relevantes.

3. **Domínio próprio** — decidir se o lançamento final fica em `pages.dev` ou se haverá domínio customizado.

4. **Responsáveis operacionais** — nomear quem autoriza SQL remoto, merge sensível, deploy manual e rollback.

5. **Acessibilidade manual** — rodada final de teclado/contraste em navegador real antes de anúncio público amplo.

## PRs abertos para avaliar

1. **PR #39 — logs seguros em produção**
   - Reaplicar só o patch de código.
   - Não trazer `pnpm-lock.yaml`; o projeto usa `npm`/`package-lock.json`.

2. **PR #40 + PR #41 — CandidateCard**
   - Avaliar juntos porque ambos alteram `src/components/candidates/CandidateCard.tsx`.
   - #40 é performance (`React.memo`).
   - #41 é acessibilidade visual (`focus-within`).
   - Avaliação local: as mudanças entram em conflito quando combinadas diretamente. A resolução segura é um PR manual único preservando o estilo atual do projeto, com `React.memo` e `focus-within` no mesmo `CandidateCard`.

## Observações obsoletas substituídas

- A nota antiga sobre “7 candidatos sem claims” foi superada pelo handoff atual. O estado vigente é `213` candidaturas oficiais e `1` `summary` publicado pendente: `FRANCISCO MARQUES NETO`.
- Não usar SQL manual ou bypass editorial para publicar claims. O fluxo seguro vigente é H4.2/RPC transacional.
