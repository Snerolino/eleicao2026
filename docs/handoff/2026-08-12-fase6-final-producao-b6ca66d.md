# Handoff — Fase 6 final / produção b6ca66d

Data: 2026-08-12
Status: `PRODUCAO_VERDE`
Branch: `main`
Commit/release: `b6ca66d` / `b6ca66d-20260812T120043701Z`
Domínio público: https://rs.votopraquem.org
Cloudflare Pages: `portal-transparencia-rs`

## O que foi concluído

- Branch `feat/matriz-impacto-populacional-v1` foi integrada em `main` por fast-forward.
- `main` foi enviada ao GitHub: `a252fb0..b6ca66d`.
- Cloudflare Pages produção atualizada via `wrangler pages deploy dist --project-name=portal-transparencia-rs --branch=main`.
- GitHub Actions workflow `Deploy` run `31594399215` ficou verde:
  - `quality`: data check, env preflight, TypeScript, tests, build fallback, smoke local.
  - `deploy`: TypeScript, build, Pages deploy, smoke deployment, health deployment.
- Supabase remoto já estava com migrations da Matriz aplicadas e verificação REST anon OK.

## Evidência local pré-produção

- `npx tsc --noEmit`: OK
- `npm run test`: 186 arquivos / 935 testes passed
- `node scripts/validate-impact-schema.mjs`: OK
- `npm run data:check`: 792 candidaturas públicas / 792 fotos oficiais
- `npm run build`: OK, `release.json (b6ca66d-20260812T120005369Z)`
- `git diff --check`: OK

## Evidência de produção

Release em domínio final:

```json
{
  "release_id": "b6ca66d-20260812T120043701Z",
  "sha": "b6ca66d3f6ae350e0510c964d5832aa386695e8b",
  "short_sha": "b6ca66d",
  "version": "0.2.0",
  "snapshot": {
    "scope": "consulta_cand/2026/RS",
    "row_count": 793
  }
}
```

Smoke produção (`https://rs.votopraquem.org`):

```json
{
  "cards": 792,
  "expectedMinCount": 792,
  "searchCards": 2,
  "detailHeading": "MARCELO MARANATA SOARES REINALDO",
  "canonicalDetailUrl": "https://rs.votopraquem.org/candidatos/marcelo_maranata_soares_reinaldo_210002535802",
  "offlineDetailHeading": "MARCELO MARANATA SOARES REINALDO",
  "serviceWorkerReady": true,
  "httpFailures": 0,
  "onlineConsoleErrors": 0
}
```

Health produção (`correlation_id=fase6-final-b6ca66d`):

```json
{
  "status": "ok",
  "blocks_release": false,
  "release_id": "b6ca66d-20260812T120043701Z",
  "components": {
    "deploy": { "status": "ok" },
    "release": { "status": "ok" },
    "candidates": { "status": "ok", "count": 792 },
    "claims": { "status": "ok" },
    "cache": { "status": "ok", "service_worker_ready": true },
    "rls": { "status": "ok", "failures": [] },
    "http": { "status": "ok", "failures": [] }
  },
  "alerts": []
}
```

Headers produção verificados:

- CSP enforce presente (`content-security-policy`).
- `x-content-type-options: nosniff`.
- `x-frame-options: DENY`.
- `referrer-policy: strict-origin-when-cross-origin`.
- `permissions-policy` restritiva.

## Observações

- `release.json.snapshot.row_count = 793` representa registros no manifesto TSE.
- `smoke.cards = 792` representa a superfície pública versionada (um registro removido por decisão humana).
- A contagem pública esperada segue 792.

## Próximo arco recomendado

1. Carga real de proposições/votos públicos usando `npm run impact:dryrun` e `npm run impact:sql`.
2. Curadoria do catálogo real de FKs (`legislators`/`candidates`/`source_references`).
3. Inserção remota de dados legislativos via service_role somente após dry-run verde e revisão humana.
4. Criação de matrizes reais `pending_review`, com fontes e revisão humana; não publicar matriz sem RPC de aprovação.
