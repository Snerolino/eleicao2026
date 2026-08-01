# Handoff atualizado — Portal Transparência Eleitoral RS

Data: 2026-07-31 22:09 -03:00
Branch verificada: `main`
Produção: https://portal-transparencia-rs.pages.dev/
Release em produção: `fc80de1-20260731T142837653Z`

## Estado executivo

O MVP público está no ar com dados oficiais TSE 2026 RS atualizados.

- `main` está sincronizada com `origin/main`.
- Deploy GitHub Actions mais recente em `main`: sucesso.
- Cloudflare Pages produção responde OK.
- Health check produção: `status=ok`, `blocks_release=false`.
- Snapshot público versionado: `213` candidaturas.
- Supabase remoto público: `213` candidaturas RS.
- Slugs e `tse_candidate_id`: únicos e não nulos (`213/213`).

## Dados oficiais atuais

Fontes atuais incorporadas no manifesto `data/tse-source-manifest.json`:

1. `../dataset2026/candidatos/FONTE OFICIAL = sig.tse.jus.br -lista_candidatos_2026.csv`
   - Fonte principal do snapshot público.
   - SHA-256: `1947093636b1d01aadb4d310e0f365b975858a782b835d822be165a2e4c5a1d4`
   - Linhas: `213`
   - Escopo: `sig_lista_candidatos/2026/RS`

2. `../dataset2026/candidatos/FONTE OFICIAL  = dadosabertos.tse.jus.b = candidatos.csv`
   - Registrada como proveniência complementar no manifesto.
   - SHA-256: `180f14e98569982e90b392c39e499c53a71309d1c6dbc010106586fae0487292`
   - Linhas: `211`
   - Escopo: `dadosabertos_candidatos/2026/RS`

Distribuição atual de cargos no snapshot e no Supabase:

| Cargo | Total |
|---|---:|
| deputado_estadual | 111 |
| deputado_federal | 88 |
| governador | 2 |
| senador | 4 |
| outro | 8 |

Observação: os `8` em `outro` são suplentes/linhas sem bucket público próprio no app atual. Não tratá-los como titulares de Senado.

## Produção validada

Comandos executados na verificação deste handoff:

```bash
npm run data:check
npm run test -- --passWithNoTests
npx tsc --noEmit
npm run build
npm run smoke:preview -- --url https://portal-transparencia-rs.pages.dev/
npm run health:preview -- --url https://portal-transparencia-rs.pages.dev/ --correlation-id handoff-repo-check
```

Resultados:

- `data:check`: OK — snapshot público válido, `213` candidaturas, `2` fontes TSE.
- Testes: OK — `28` arquivos, `115` testes.
- TypeScript: OK.
- Build: OK — sitemap com `213` candidatos + estáticas = `215` URLs.
- Smoke produção: OK.
  - `cards`: `213`
  - `expectedMinCount`: `213`
  - detalhe canônico: `/candidatos/naftaly_pereira_do_nascimento_210002533354`
  - detalhe offline: OK
  - service worker: pronto
  - HTTP failures: `0`
  - console errors online: `0`
- Health produção: OK.
  - `status=ok`
  - `blocks_release=false`
  - `release_id=fc80de1-20260731T142837653Z`
  - `candidates.count=213`

## Supabase remoto verificado

Consulta remota em `public.candidates`:

| Métrica | Valor |
|---|---:|
| candidatos RS | 213 |
| `tse_candidate_id` preenchidos | 213 |
| `tse_candidate_id` distintos | 213 |
| `slug` preenchidos | 213 |
| `slug` distintos | 213 |

Claims editoriais atuais:

| status | category | total |
|---|---|---:|
| published | summary | 212 |

Candidatura ainda sem `summary` publicada:

- `FRANCISCO MARQUES NETO` — deputado_estadual — `210002533050`

## Histórico recente relevante

- PR #37 / merge `d06d055`: H6.1 health/observabilidade.
- PR #38 / merge `eca653a`: atualização das fontes oficiais SIG/TSE + Dados Abertos e snapshot público para `213` candidaturas.
- Commit `fc80de1`: adicionou `scripts/insert-fontes-oficiais.mjs` para inserir fontes oficiais/claims summary nos cards.

## Arquivos centrais

- `data/public-candidates.json` — snapshot público versionado, `213` candidaturas.
- `data/tse-source-manifest.json` — hashes, contagens e proveniência TSE.
- `scripts/refresh-public-snapshot.mjs` — gera snapshot a partir do SIG/TSE quando disponível; fallback para `consulta_cand_2026`.
- `scripts/data-check.mjs` — valida snapshot/manifesto/anti-PII.
- `scripts/smoke-browser.mjs` — smoke local/preview/produção, incluindo PWA/offline/comparação/manifest.
- `scripts/health-check.mjs` — health check H6.1.
- `scripts/insert-fontes-oficiais.mjs` — script recente para inserir fontes oficiais e claims summary.

## Atenções / riscos próximos

1. `scripts/insert-fontes-oficiais.mjs` foi endurecido no bloco H6.2:
   - escrita exige `SUPABASE_SERVICE_ROLE_KEY` explícito;
   - não faz fallback de escrita para anon;
   - cria claims somente como `pending_review`;
   - publicação continua exigindo fluxo transacional H4.2 (`review` aprovado + `publish_claim`).

2. Há `212` summaries publicados para `213` candidatos. Falta summary para `FRANCISCO MARQUES NETO`.

3. O build/deploy não deve ler `../dataset2026` silenciosamente. O mirror local só entra via `npm run data:refresh`/ingestões explícitas.

4. Não commitar `.env*`, service role, anon key, Cloudflare/GitHub tokens ou connection strings.

5. `raw_documents.raw_content` continua privado. Snapshot público não pode receber PII/campos raw.

6. `coverage_complete=false` foi usado na importação remota recente. Não marcar ausentes como retirados sem cobertura completa explícita.

## Próximos passos recomendados

1. Corrigir o gap de summary do candidato `FRANCISCO MARQUES NETO`, preferencialmente pelo fluxo editorial seguro:
   - criar claim como `pending_review`;
   - adicionar fonte pública;
   - criar review aprovado;
   - publicar via RPC `publish_claim`.

2. Hardening do `scripts/insert-fontes-oficiais.mjs`:
   - exigir service role quando houver escrita;
   - remover fallback para anon;
   - não publicar direto sem RPC/review;
   - adicionar teste contra regressão de bypass editorial.

3. Se novas fontes TSE chegarem:
   - validar encoding/delimitador/cabeçalhos/row count/hash;
   - rodar `npm run data:refresh`;
   - rodar `npm run data:check`, testes, build, smoke e health;
   - atualizar Supabase por staging/upsert com `coverage_complete=false`, salvo cobertura completa confirmada.

4. Se o app ganhar cargo próprio para suplentes, mapear `1º Suplente`/`2º Suplente` para bucket explícito e ajustar UI/smoke/SEO.

## Estado Git no momento do handoff

- Branch: `main`
- Relação com remoto antes deste arquivo: `main...origin/main`
- Último commit funcional verificado: `fc80de1`
- Worktree estava limpo após restaurar `tsconfig.tsbuildinfo` antes da criação deste handoff.
