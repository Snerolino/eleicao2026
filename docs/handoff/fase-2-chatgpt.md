# Handoff — Fase 2 Portal Transparência Eleitoral RS

Data: 2026-07-30

## Resumo para retomada

A Fase 2 fechou o contrato público de candidatura, rotas canônicas e segurança de links de fonte.

- Dados oficiais atuais: 69 candidaturas TSE RS 2026.
- Snapshot público versionado: `data/public-candidates.json`.
- Identidade pública canônica: `/candidatos/:slug`.
- Slug: `nome_normalizado_<SQ_CANDIDATO>`.
- Compatibilidade temporária: UUID e `tse_candidate_id` legados ainda resolvem e redirecionam para slug.
- Sitemap: somente URLs por slug.
- Sanitização de URL pública: somente `http`/`https`; inválido vira `undefined`.
- Referência de fonte: HTML válido, sem `<a>` aninhado.

## Gates concluídos nesta fase

- H2.1 — Identidade pública/canônica da candidatura.
- H2.2 — Sitemap e rotas P1 por slug com compatibilidade UUID temporária.
- H2.3 — URL segura e HTML válido em fontes públicas.

## Como validar rapidamente

```bash
npm run test -- --passWithNoTests
npx tsc --noEmit
npm run build
fuser -k 4173/tcp 2>/dev/null || true
npm run smoke:local
npm run smoke:preview -- --url https://portal-transparencia-rs.pages.dev/
```

Critérios do smoke:

- `cards`: 69.
- `searchCards`: 1 para `ADEMAR`.
- `canonicalDetailUrl`: deve estar em `/candidatos/<slug>`.
- `httpFailures`: 0.
- `onlineConsoleErrors`: 0.

## Riscos/atenções

- Não reintroduzir pré-candidatos manuais antigos.
- Não fazer build/deploy dependente de `../dataset2026`; esse diretório é fonte de ingestão explícita, não fonte silenciosa de build.
- Não expor `raw_documents.raw_content`.
- Não aceitar `mailto:`/`tel:`/relativas como URLs de fontes públicas; se forem necessários no futuro, criar função específica de contexto.
- Manter compatibilidade UUID só enquanto necessário; quando remover, criar um gate próprio e comunicar quebra de URL legada.

## Resumo para ChatGPT acompanhante

Portal Transparência Eleitoral RS avançou até Fase 2. H2.1/H2.2/H2.3 concluídos: snapshot público tem 69 candidaturas oficiais TSE RS com `slug` e `tse_candidate_id`; rotas públicas são `/candidatos/:slug`; sitemap publica apenas slugs; UUID e SQ_CANDIDATO legados ainda resolvem e redirecionam para slug; sanitização pública de URL foi unificada em uma função que aceita só http/https e retorna undefined para inválidos; `SourceReferenceBadge` não gera mais `<a>` aninhado. Build e deploy usam `data/public-candidates.json`, não `../dataset2026`. Próximos blocos devem seguir o Guia a partir de H3, preservando segurança Supabase/RLS e sem expor `raw_documents.raw_content`.
