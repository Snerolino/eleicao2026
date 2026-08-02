# H6.2 — Headers, dependências e hardening editorial

Data: 2026-08-01
Branch: `h6-2-seguranca-headers-editorial`

## Objetivo

Reduzir superfície de ataque sem quebrar Supabase, PWA, manifest, assets ou service worker, seguindo o bloco H6.2 do Guia Mestre.

## Como está sendo feito

1. Teste RED criado em `scripts/__tests__/h6-2-security-hardening.test.mjs` antes das alterações.
2. `public/_headers` recebeu headers globais com:
   - `Content-Security-Policy` em enforce, após decisão humana de 2026-08-01;
   - `X-Content-Type-Options: nosniff`;
   - `X-Frame-Options: DENY`;
   - `Referrer-Policy: strict-origin-when-cross-origin`;
   - `Permissions-Policy` restritiva.
3. CSP saiu de report-only para enforce por decisão humana registrada na Fase 7.
4. `package.json` recebeu `npm run security:audit` como auditoria sem correção automática.
5. `scripts/insert-fontes-oficiais.mjs` foi endurecido para não burlar o fluxo editorial:
   - escrita exige `SUPABASE_SERVICE_ROLE_KEY` explícito;
   - não faz fallback de escrita para anon;
   - não cria claims como `published`;
   - cria somente `pending_review`;
   - publicação continua exigindo intervenção humana: review aprovado + RPC transacional H4.2.

## CSP enforce atual

A política permite apenas o necessário para o app estático/PWA e Supabase:

- `default-src 'self'`
- `connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co wss://*.supabase.in https://cloudflareinsights.com https://*.cloudflareinsights.com`
- `script-src 'self' https://static.cloudflareinsights.com`
- `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`
- `font-src 'self' data: https://fonts.gstatic.com`
- `worker-src 'self' blob:`
- `manifest-src 'self'`
- `img-src 'self' data: blob: https:`
- `frame-ancestors 'none'`

## Validação prevista

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

## Resultado parcial validado

- Teste RED observado antes da implementação: `4 failed` em `scripts/__tests__/h6-2-security-hardening.test.mjs`.
- Teste GREEN: `4 passed`.
- `node scripts/insert-fontes-oficiais.mjs`: dry-run sem escrita; detectou `1` candidato sem summary (`FRANCISCO MARQUES NETO`).
- `npm run security:audit`: exit `0` para dependências de produção (`--omit=dev --audit-level=high`) após reconstruir a árvore com `npm install`.
- Auditoria de dev/build tools: `vitest` atualizado para `4.1.10` e `brace-expansion` vulnerável resolvido no lockfile (`filelist -> minimatch -> brace-expansion@2.1.4`).
- Auditoria ainda reporta `2` vulnerabilidades moderadas em `react-router`/`react-router-dom`; não foram atualizadas neste bloco para evitar upgrade funcional/roteamento amplo junto com H6.2.
- Suite completa local: `29` arquivos, `119` testes, OK.
- TypeScript: OK.
- Build: OK, snapshot `213`, sitemap `215` URLs.
- Smoke local: OK, `213` cards, service worker pronto, `0` HTTP failures.

## Intervenção humana registrada

CSP enforce aprovado para o MVP por decisão humana em 2026-08-01. Monitorar smoke/health e violações reais após deploy; se bloquear navegação crítica, seguir rollback do runbook H6.3.

Também não publicar automaticamente claims editoriais. Claims criadas por script administrativo ficam em `pending_review` até review aprovado e publicação via RPC.
