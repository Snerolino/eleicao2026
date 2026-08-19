# QA — lote Senado: catálogo idempotente de fontes oficiais

**Data:** 2026-08-19 UTC  
**Status:** preparação local concluída; aplicação factual remota permanece fail-closed

## Objetivo

Revalidar os seis relatórios nominais oficiais do Senado, versionar manifesto de URL/HTTP/bytes/SHA-256 e preparar um catálogo idempotente de `source_references` sem inventar UUID, FK, identidade ou voto.

## Entrega verificada

- Manifesto: `data/legislative-import/senado/nominal-source-manifest-2026-08-19.json`.
- Catálogo dry-run: `data/legislative-import/senado/nominal-source-catalog-input.json`.
- Revalidação final: **6/6 HTTP 200**, **6 URLs únicas**, **6 hashes únicos**, payloads oficiais com prefixo PDF.
- Uma falha DNS transitória do primeiro `urllib` para 2026/6341 foi recuperada com `curl --retry`; o manifesto final contém a resposta HTTP 200 e SHA atual, sem reutilizar hash antigo.
- `scripts/build-legislative-source-catalog.mjs` agora aceita somente prefixos oficiais Câmara/Senado e continua rejeitando UUID inválido ou ausente.
- Teste de contrato adicionado para o catálogo Senado; nenhum UUID foi fabricado.

## Gates locais

Executados com Node `v24.19.0`:

- Vitest: **78 arquivos / 367 testes aprovados**.
- TypeScript: aprovado (`npx tsc --noEmit`).
- Schema de impacto: aprovado (`node scripts/validate-impact-schema.mjs`).
- `data:check`: **1003 candidaturas / 988 fotos oficiais**; snapshot válido.
- Build Vite/PWA/sitemap: aprovado; sitemap com **1003 candidatos + 2 URLs estáticas** e `release.json` gerado.
- `git diff --check`: aprovado.

## Estado remoto e bloqueios

- Nenhuma escrita Supabase, `source_reference`, proposição, versão, evento, voto, identidade, FK, matriz, RPC/RLS/Auth/Storage ou Cloudflare foi executada neste lote.
- As seis referências ainda precisam existir no catálogo remoto e ser resolvidas por URL + `content_hash` para qualquer writer factual.
- Os votos Senado permanecem sem `candidate_id`; somente `legislator_id` exato poderá ser usado após revalidação imediata do schema/FK/identidade.
- O doctor do shell cron continua com FAIL conhecido por Node 22.22.2; os gates do projeto passaram com Node 24.19.0. Warnings opcionais: OpenCode ausente, gateway Node divergente, Ollama sem preflight e Codex MCP não exercitado no modo rápido.

## Próximo passo bounded

No próximo tick, consultar novamente o catálogo remoto por URL/hash e, se continuar ausente, preparar apenas o plano SQL/dry-run idempotente das seis referências. Não aplicar votos enquanto a resolução exata de `source_reference_id`, identidade, schema/FK e idempotência não estiver verde.
