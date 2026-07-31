# Runbook H6.1 — Observabilidade e health check

## Objetivo

Detectar produção vazia/degradada antes do usuário e apontar ação operacional sem registrar segredos, payload bruto ou PII.

## Comandos

Health de produção:

```bash
npm run health:preview -- --url https://portal-transparencia-rs.pages.dev/
```

Smoke completo de produção:

```bash
npm run smoke:preview -- --url https://portal-transparencia-rs.pages.dev/
```

Ver release publicado:

```bash
curl -fsS https://portal-transparencia-rs.pages.dev/release.json
```

## Onde consultar evidência

- GitHub Actions: workflow `Deploy`, jobs `quality` e `deploy`.
- Cloudflare Pages: projeto `portal-transparencia-rs`, deployment de produção pelo SHA exibido no `release.json`.
- Supabase: REST público de `candidates`, `claims` publicados/corrigidos e políticas RLS.
- Logs do health: saída JSON com `correlation_id`, `release_id`, `components` e `alerts`.

## Interpretação dos componentes

- `deploy: fail`: HTML da home indisponível ou inválido.
- `candidates: fail`: home abaixo da contagem mínima plausível; bloqueia release.
- `claims: warn`: editoria/claims degradadas; lista oficial segue disponível.
- `rls: warn`: RLS/REST afetou claims ou relacionamento não crítico.
- `rls: fail`: RLS bloqueou leitura pública de candidates; bloqueia release.
- `cache: warn`: service worker/cache não ficou pronto; investigar PWA/cache.
- `release: warn`: `release.json` ausente ou inválido; investigar build/deploy.
- `http: fail`: 5xx em app, Cloudflare ou Supabase; bloqueia release.

## Ações rápidas

### Produção vazia / candidates fail

1. Conferir `release.json` e SHA atual.
2. Rodar `npm run smoke:preview -- --url https://portal-transparencia-rs.pages.dev/`.
3. Conferir Cloudflare deployment do SHA.
4. Conferir Supabase REST de candidates com anon key segura, sem logar chaves.
5. Se produção está vazia e preview anterior estava OK, fazer rollback Cloudflare para deployment anterior validado.

### Claims degradadas / RLS warn

1. Confirmar que cards e navegação seguem disponíveis.
2. Revisar policies/RPCs de `claims`, `source_references` e relações públicas.
3. Não considerar app totalmente indisponível se `candidates` estiver OK.
4. Abrir correção focada se warnings persistirem.

### 4xx/5xx

1. Separar origem: app, Supabase REST, Cloudflare asset, RUM externo ignorável.
2. 5xx em app/Supabase é crítico e bloqueia release.
3. 401/403 em `candidates` é crítico.
4. 401/403 em `claims` é warning enquanto candidatos seguem públicos.

### Cache antigo / service worker

1. Confirmar `release.json` e `sw.js` atualizados.
2. Validar `clientsClaim`, `skipWaiting` e `cleanupOutdatedCaches`.
3. Rodar smoke offline.
4. Se necessário, publicar novo deploy com cache bump ou rollback.

## Segurança dos logs

O health check redige:

- `Authorization`, `apikey`, tokens, secrets, `service_role`.
- JWTs e parâmetros `token=`/`apikey=`.
- `raw_content` e payload bruto.

Nunca colar `.env`, tokens reais ou connection strings em issues/PRs/runbooks.

## Rollback

1. Selecionar último Cloudflare deployment com smoke produção OK.
2. Fazer rollback no dashboard/API Cloudflare Pages.
3. Rodar `npm run smoke:preview -- --url https://portal-transparencia-rs.pages.dev/`.
4. Rodar `npm run health:preview -- --url https://portal-transparencia-rs.pages.dev/`.
5. Registrar SHA antes/depois e `correlation_id` do health.
