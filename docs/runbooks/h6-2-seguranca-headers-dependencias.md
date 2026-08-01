# Runbook H6.2 — Segurança, headers e dependências

## Objetivo

Reduzir superfície de ataque do PWA sem quebrar Supabase, cache/offline, manifest ou assets.

## Rotina recomendada

### 1. Verificar headers em produção

```bash
curl -I https://portal-transparencia-rs.pages.dev/
curl -I https://portal-transparencia-rs.pages.dev/manifest.webmanifest
curl -I https://portal-transparencia-rs.pages.dev/release.json
```

Esperado:

- `Content-Security-Policy-Report-Only` presente no HTML.
- `X-Content-Type-Options: nosniff`.
- `X-Frame-Options: DENY`.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `Permissions-Policy` restringindo câmera, microfone, geolocalização etc.
- `manifest.webmanifest` e `release.json` com revalidação curta.

### 2. CSP report-only

A CSP está deliberadamente em `Content-Security-Policy-Report-Only`.

Não migrar para `Content-Security-Policy` enforce sem decisão humana e sem evidência de que:

- Supabase REST/WebSocket funciona.
- Service worker registra e atende offline.
- Manifest continua instalável.
- Assets, fontes e imagens públicas carregam.
- Cloudflare Insights/RUM não gera bloqueios críticos ou foi removido/permitido conscientemente.
- Google Fonts (`fonts.googleapis.com`/`fonts.gstatic.com`) segue permitido ou foi removido do HTML antes do enforce.

### 3. Auditoria de dependências

```bash
npm run security:audit
```

Regra operacional:

- O script `npm run security:audit` audita dependências de produção com `--omit=dev --audit-level=high`; se `npm audit` retornar falso `Invalid package tree` após `npm ci`, rode `npm install` para reconstruir a árvore/lockfile e repita a auditoria.
- Para auditoria completa de dev/build tools, rode `npm install` antes de `npm audit --audit-level=high` se o lockfile acabou de ser regenerado após update de dependências transitivas.
- Corrigir vulnerabilidades altas/críticas em PR próprio.
- Não executar `npm audit fix --force` junto com PR funcional.
- Não atualizar dependências em massa sem smoke local e preview.

### 4. Script administrativo de fontes oficiais

`scripts/insert-fontes-oficiais.mjs` é administrativo e deve obedecer ao fluxo editorial H4.2.

Uso seguro:

```bash
# Diagnóstico sem escrita
node scripts/insert-fontes-oficiais.mjs

# Escrita: cria apenas claims pending_review
SUPABASE_SERVICE_ROLE_KEY='[REDACTED]' node scripts/insert-fontes-oficiais.mjs --apply
```

Garantias esperadas:

- Sem fallback de escrita para anon.
- Claims novas entram como `pending_review`.
- Publicação exige review aprovado + RPC transacional (`publish_claim`).
- Segredos nunca aparecem no stdout, commit ou documentação.

## Rollback

### Headers/CSP

1. Reverter commit de `_headers`.
2. Build/deploy.
3. Rodar smoke/health.

### Dependências

1. Reverter `package.json` e `package-lock.json` do PR problemático.
2. `npm ci`.
3. Rodar testes/build/smoke.

### Claims administrativas

1. Não deletar claims publicadas sem trilha.
2. Para publicadas, usar RPC de correção/retração H4.2.
3. Para `pending_review` criadas por engano, registrar evidência e decidir limpeza com editor/admin.

## Gates

```bash
npm run test -- scripts/__tests__/h6-2-security-hardening.test.mjs
npm run security:audit
npm run test -- --passWithNoTests
npx tsc --noEmit
npm run build
npm run smoke:local
npm run smoke:preview -- --url https://portal-transparencia-rs.pages.dev/
npm run health:preview -- --url https://portal-transparencia-rs.pages.dev/ --correlation-id h6-2-security-hardening
```
