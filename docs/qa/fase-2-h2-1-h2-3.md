# Fase 2 — Identidade pública, rotas e URL segura

Data: 2026-07-30
Guia: H2.1, H2.2 e H2.3

## Escopo concluído

### H2.1 — Identidade pública da candidatura

- `data/public-candidates.json` contém 69 candidaturas oficiais TSE RS.
- Cada candidatura pública tem:
  - `slug` canônico;
  - `tse_candidate_id` oficial;
  - `id` público estável.
- Slug canônico: `nome_normalizado_<SQ_CANDIDATO>`.
- `tse_candidate_id` é tratado como chave natural de integração.
- Migration remota H2.1 aplicada no Supabase com autorização explícita.
- Supabase remoto verificado com 69 candidatos, 69 slugs e 69 `tse_candidate_id` únicos.

### H2.2 — Sitemap e rotas P1

- Rotas públicas migradas para `/candidatos/:slug`.
- Sitemap publica somente URLs por slug.
- Compatibilidade temporária mantida:
  - `/candidatos/<uuid>` ainda resolve;
  - `/candidatos/<tse_candidate_id>` ainda resolve;
  - identificadores legados redirecionam para o slug canônico quando encontrados.
- Smoke local/preview/produção valida:
  - cards na home;
  - detalhe canônico por slug;
  - compatibilidade de URL legada UUID → slug.

### H2.3 — URL segura e HTML válido

- Sanitização unificada em uma política pública única:
  - `sanitizeUrl` e `getSafeUrl` apontam para a mesma implementação.
  - fontes públicas aceitam somente `http:` e `https:`.
  - `mailto:`, `tel:`, relativas, `javascript:`, `data:` e `vbscript:` são bloqueadas para referências públicas.
  - caracteres de controle são removidos antes do parse.
  - entradas inválidas retornam `undefined`, não `about:blank`.
- `SourceReferenceBadge` não produz mais `<a>` aninhado.
- Conteúdo interno da referência usa `span`; quando há URL segura, existe somente um `<a>` externo.

## Arquivos principais

- `src/utils/url.ts`
- `src/utils/sanitizeUrl.ts`
- `src/utils/sanitize.ts`
- `src/components/sources/SourceReferenceBadge.tsx`
- `src/components/sources/__tests__/SourceReferenceBadge.test.tsx`
- `src/utils/__tests__/sanitizeUrl.test.ts`
- `src/utils/__tests__/url.test.ts`
- `src/utils/__tests__/sanitize.test.ts`
- `scripts/generate-sitemap.mjs`
- `scripts/__tests__/generate-sitemap.test.mjs`
- `scripts/smoke-browser.mjs`

## Validações esperadas

- `npm run test -- --passWithNoTests`
- `npx tsc --noEmit`
- `npm run build`
- `npm run smoke:local`
- `npm run smoke:preview -- --url <preview-ou-producao>`

## Estado operacional

- Produção deve permanecer com 69 candidaturas oficiais após merge/deploy de `main`.
- Build/deploy segue consumindo `data/public-candidates.json`, sem depender de `../dataset2026`.
- Nenhum dado de `raw_documents.raw_content` é exposto ao frontend.
- Fonte pública segue por `source_references`.
