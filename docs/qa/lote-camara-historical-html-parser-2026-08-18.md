# QA — parser HTML nominal histórico Câmara (FED-26)

- **Data:** 2026-08-18
- **Objetivo:** fechar o chunk local do parser reproduzível para tabelas nominais HTML legadas da Câmara, sem transformar a fixture em dado público ou aplicar qualquer voto remoto.

## Entregue

- `scripts/lib/camara-historical-html.mjs` implementa extração de linhas `<tr>/<td>`, decodificação de entidades HTML, normalização dos rótulos nominais oficiais e filtro exato por UF/nome.
- `scripts/__tests__/camara-historical-html.test.mjs` cobre normalização, filtro RS, reconciliação nominal sem fuzzy matching, HTML ausente e duplicidade fail-closed.
- `fixtures/legislative-import/camara-historical-nominal.html` é fixture sanitizada de contrato; não é fonte factual nem dado de produção.

## Gates verificados

- Teste direcionado: **1 arquivo / 4 testes**, passou.
- Suíte completa: **74 arquivos / 351 testes**, passou.
- TypeScript: passou (`npx tsc --noEmit`).
- Schema de impacto: passou (`node scripts/validate-impact-schema.mjs`).
- Snapshot público: passou com **1003 candidaturas / 988 fotos** (`npm run data:check`).
- Build Vite/PWA/sitemap/release: passou; sitemap com **1003 candidatos + 2 URLs estáticas**.
- `git diff --check`: passou.

## Segurança e decisão

- Nenhum voto, identidade, UUID, FK, `source_reference`, matriz, Supabase ou Cloudflare foi alterado.
- O parser exige nome/UF/voto individual normalizável e rejeita texto sem voto; não faz matching heurístico.
- Os quatro casos históricos `position=outro` continuam bloqueados até reextração oficial com proposição, data, parlamentar/UF e voto exatos.

## Próximo chunk

Refazer os quatro GETs oficiais nominais (`9002`, `9003`, `9224`, `9227`) usando o parser, preservando URL, HTTP, bytes e SHA-256 no manifesto; só preparar envelope de reconciliação se houver linha exata. Nenhum `--apply` remoto sem gate de identidade/cargo/FK.
