# Instruções para agentes — Portal Transparência Eleitoral RS

## Contexto

- Projeto real de transparência eleitoral do RS, não demo.
- Stack: Vite + React + TypeScript + Tailwind v4 + Supabase + Cloudflare Pages.
- Fonte oficial atual: mirror local `../dataset2026/`, incorporado ao app por snapshot público versionado em `data/public-candidates.json`.
- Produção pode ficar atrás do PR enquanto `main` não for atualizada; sempre diferencie preview/branch de produção.

## Regras de dados e segurança

- Nunca commitar `.env*`, tokens, service role, Cloudflare/GitHub tokens, connection strings ou segredos.
- `service_role` nunca entra em `VITE_*`, build, frontend ou logs.
- Dados públicos do frontend devem vir de Supabase anon ou `data/public-candidates.json`.
- `../dataset2026` só deve ser lido por comandos explícitos de ingestão/refresh, nunca silenciosamente no build.
- Campos raw/PII/documentos crus não podem ir para snapshot público.
- Claims novas entram como `pending_review`; UI pública usa somente `published`.
- `docs/context-export/` é o contrato curado exposto ao raspador por MCP. Quando
  migrations alterarem schema, FKs, status, grants ou RLS relevantes, atualizar
  `docs/context-export/SCHEMA.md` e `CHANGELOG.md` no mesmo trabalho.
- Nunca colocar credenciais, `.env`, payloads brutos ou PII em
  `docs/context-export/`.

## Fluxo de implementação

1. Ler o trecho aplicável do `../Guia_Mestre_Correcao_Finalizacao_PWA_Eleicoes2026_FINAL.md`.
2. Inspecionar símbolos/arquivos existentes antes de editar.
3. Usar TDD quando houver mudança de comportamento.
4. Manter blocos pequenos e focados no gate do Guia.
5. Usar OpenCode quando viável, mas validar tudo com ferramentas locais.
6. Não fazer merge em `main` nem deploy de produção sem autorização explícita.

## Comandos de verificação

- `npm run data:check`
- `npm run env:check`
- `npm run test -- --passWithNoTests`
- `npx tsc --noEmit`
- `npm run build`
- `npm run smoke:local`
- Para preview implantado: `npm run smoke:preview -- --url <preview-url>`

## Gates relevantes

- H0/H1: home com 69 candidatos, zero 4xx/5xx no fluxo principal, smoke local/preview verde.
- H2.1: `tse_candidate_id` único e não nulo; `slug` único, estável e não vazio; rotas `/candidatos/:slug`; URLs antigas por UUID preservadas durante transição; sitemap usa a mesma coleção de slugs.

## Convenções

- Commits em português com Conventional Commits.
- Relatórios de QA em `docs/qa/`.
- Migrations em `supabase/migrations/`, aplicadas com Supabase CLI quando autorizado.
- `opencode.jsonc` é configuração local versionada para agentes; não adicionar segredos nele.
