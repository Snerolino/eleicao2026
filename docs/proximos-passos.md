# Próximos passos — Fase 7 / assinatura do MVP

Atualizado em 2026-08-01, após decisões humanas finais e início do bloco UX/admin.

## Gates humanos decididos

1. **Publicação editorial** — não publicar summary faltante de `FRANCISCO MARQUES NETO`; remover a candidatura da superfície pública por decisão humana.
   - override versionado em `data/public-candidate-overrides.json`;
   - fonte TSE permanece no manifesto com `213` linhas oficiais;
   - snapshot público passa a expor `212` candidaturas.

2. **CSP enforce** — ativar `Content-Security-Policy` bloqueante em `public/_headers`.

3. **Domínio próprio** — usar `https://rs.votopraquem.org` como domínio/caminho público final. `pages.dev` segue como preview/infra técnica enquanto DNS/Cloudflare não estiver consolidado.

4. **Responsáveis operacionais** — `admin@votopraquem.org` responde temporariamente por SQL remoto, merge sensível, deploy manual e rollback.

5. **Acessibilidade/usabilidade** — incluir antes da assinatura final:
   - botões fixos para voltar ao topo e ir ao final;
   - atalhos de cargos clicáveis na lista principal;
   - comparação visível no topo da página `/comparar`, sem exigir rolagem até o final;
   - seção própria para `Vice-governador`;
   - página `/admin` segura, sem `service_role` no navegador, para orientar ajustes/atualizações futuras.

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

- A nota antiga sobre “7 candidatos sem claims” foi superada pelo handoff atual.
- O summary faltante de `FRANCISCO MARQUES NETO` não é mais pendência editorial de publicação: a decisão vigente é removê-lo da lista pública.
- Não usar SQL manual ou bypass editorial para publicar claims. O fluxo seguro vigente é H4.2/RPC transacional.
