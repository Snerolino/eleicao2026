# Runbook H6.3 — Incidentes e recuperação

## Objetivo

Permitir que uma pessoa sem o contexto do chat diagnostique incidentes comuns do Portal Transparência Eleitoral RS, colete evidência mínima, execute recuperação segura e saiba quando pedir intervenção humana.

Produção canônica: https://portal-transparencia-rs.pages.dev/
Projeto Cloudflare Pages: `portal-transparencia-rs`
Workflow GitHub Actions: `Deploy`

## Regras de segurança

- Nunca registre tokens, service role, senhas, `.env`, connection string, JWT, Authorization ou `apikey` em issue, chat, PR ou log.
- Use sempre `[REDACTED]` quando precisar documentar presença de segredo.
- Não publique claim editorial diretamente no banco; use review aprovado e RPC transacional.
- Não execute SQL remoto, merge, deploy, rollback ou publicação editorial sem autorização explícita do responsável.

## Evidência inicial comum

```bash
git status -sb
git log --oneline -5
curl -fsS https://portal-transparencia-rs.pages.dev/release.json
npm run smoke:preview -- --url https://portal-transparencia-rs.pages.dev/
npm run health:preview -- --url https://portal-transparencia-rs.pages.dev/ --correlation-id incidente-YYYYMMDD-HHMM
```

Registrar no ticket/relato:

- `release_id` e SHA.
- URL afetada.
- `correlation_id` do health.
- Componente que falhou: `deploy`, `candidates`, `claims`, `cache`, `rls`, `http` ou `release`.
- Último deployment Cloudflare saudável conhecido.
- Se há alteração recente de dados TSE, migration, headers, cache ou editorial.

## Matriz de incidentes

### 1. Produção vazia

Sintomas:

- Home mostra lista vazia indevida.
- `health.components.candidates.status = fail`.
- `cards = 0` no smoke, ou contagem abaixo de `213` quando o snapshot atual espera `213`.

Diagnóstico:

```bash
curl -fsS https://portal-transparencia-rs.pages.dev/release.json
npm run smoke:preview -- --url https://portal-transparencia-rs.pages.dev/
npm run health:preview -- --url https://portal-transparencia-rs.pages.dev/ --correlation-id prod-vazia
```

Ação:

1. Verificar se `release.json.snapshot.row_count` é compatível com `data/public-candidates.json`.
2. Verificar se o build consumiu snapshot versionado e não `../dataset2026` silenciosamente.
3. Se preview anterior estava saudável, rollback Cloudflare para o último deployment saudável.
4. Abrir PR corretivo antes de novo deploy.

Rollback primário:

- Cloudflare Pages → projeto `portal-transparencia-rs` → deployments → selecionar último SHA saudável → rollback.
- Depois rodar smoke e health produção.

### 2. 4xx / 5xx

Sintomas:

- Smoke reporta `httpFailures`.
- Health `http: fail` para 5xx.
- 401/403 em candidates significa bloqueio crítico de leitura pública.
- 401/403 em claims pode ser warning se candidates seguem OK.

Diagnóstico:

1. Separar origem do erro: HTML/app, asset Cloudflare, Supabase REST ou ruído externo.
2. Confirmar se o erro afeta `/rest/v1/candidates`, `/rest/v1/claims`, `/release.json`, `/manifest.webmanifest` ou `sw.js`.
3. Verificar RLS/grants se o erro for Supabase.

Ação:

- 5xx de app/Supabase: bloquear release e rollback para último deployment saudável.
- 401/403 em candidates: revisar grants/RLS imediatamente; não declarar produção saudável.
- 401/403 em claims com candidates OK: tratar como degradação editorial, abrir correção focada.

### 3. RLS / grants / exposição indevida

Sintomas:

- Anon não consegue ler `candidates`.
- Anon consegue ler staging/RPC/admin que deveria estar fechado.
- `raw_documents.raw_content` aparece em superfície pública.

Diagnóstico:

```bash
npm run health:preview -- --url https://portal-transparencia-rs.pages.dev/ --correlation-id rls-check
```

Probes manuais devem usar somente metadata e nunca imprimir chaves. Se precisar service role, usar ambiente local e redigir saída.

Ação:

1. Inventariar objeto/policy afetado.
2. Preparar migration de REVOKE/RLS reversível.
3. Revisar migration antes de aplicar SQL remoto.
4. Aplicar com `npx supabase db push --include-all` somente com autorização humana explícita.

Rollback:

- Migration reversa revisada.
- Nunca editar grants/RLS no improviso sem registrar o estado anterior.

### 4. Cache antigo / service worker

Sintomas:

- Usuário vê versão anterior depois de deploy.
- Offline mostra conteúdo velho ou detalhe antigo.
- `release.json` atual, mas UI aparenta bundle anterior.

Diagnóstico:

```bash
curl -fsSI https://portal-transparencia-rs.pages.dev/sw.js
curl -fsSI https://portal-transparencia-rs.pages.dev/manifest.webmanifest
npm run smoke:preview -- --url https://portal-transparencia-rs.pages.dev/
```

Ação:

1. Confirmar `skipWaiting`, `clientsClaim` e `cleanupOutdatedCaches`.
2. Publicar novo deploy com correção de cache se o SW estiver servindo payload obsoleto.
3. Se a versão nova quebrou offline, rollback para deployment saudável e registrar caches afetados.

### 5. Ingestão parcial

Sintomas:

- Snapshot ou Supabase com contagem menor que fonte oficial atual.
- Slugs/SQ_CANDIDATO não únicos.
- Candidatos ausentes foram marcados como retirados sem cobertura completa.

Diagnóstico:

```bash
npm run data:check
node scripts/insert-fontes-oficiais.mjs
```

Ação:

1. Validar encoding, delimitador, cabeçalhos, row count e SHA-256 da fonte.
2. Rodar `npm run data:refresh` somente para ingestão explícita.
3. Rodar `npm run data:check`, testes, build, smoke e health.
4. Para Supabase, usar staging/upsert com `coverage_complete=false`, salvo cobertura completa confirmada.
5. Não marcar ausentes como retirados com dataset parcial.

Rollback:

- Reprocessar snapshot anterior versionado.
- Reimportar Supabase a partir de fonte/hash anterior conhecido.
- Registrar hash do dataset e diff antes/depois.

### 6. Deploy falho

Sintomas:

- GitHub Actions `Deploy` falha.
- Cloudflare deployment não aparece ou aponta para SHA inesperado.
- `/release.json` não bate com o SHA mergeado.

Diagnóstico:

```bash
gh run list --branch main --workflow Deploy --limit 5
npx wrangler pages deployment list --project-name=portal-transparencia-rs
curl -fsS https://portal-transparencia-rs.pages.dev/release.json
```

Ação:

1. Se quality falhou: não forçar deploy; corrigir no PR.
2. Se deploy Cloudflare falhou por rede local, preferir CI quando GitHub Actions estiver saudável.
3. Se produção aponta SHA antigo saudável, não fazer rollback; apenas investigar deploy pendente.
4. Se produção aponta SHA novo quebrado, rollback para último deployment saudável.

## Decisões humanas obrigatórias

Exigem intervenção humana explícita:

- SQL remoto, grants/RLS e migrations aplicadas em produção.
- Merge em `main` de mudança sensível.
- Deploy manual fora do CI.
- Rollback de produção.
- Publicação editorial de claims, correção ou retração.
- Ativar CSP enforce no lugar de `Content-Security-Policy-Report-Only`.
- Limpeza/deleção de dados, inclusive claims `pending_review` criadas por engano.

## Exercício de mesa sem alterar produção

Objetivo: provar que o procedimento é executável sem tocar produção.

Cenário sugerido: “produção vazia simulada”.

Passos:

1. Ler `release.json` atual e anotar SHA.
2. Rodar health contra produção sem alterar nada.
3. Identificar qual componente bloquearia release se `candidates.count = 0`.
4. Localizar último deployment saudável no Cloudflare sem acionar rollback.
5. Escrever no relatório: evidência coletada, ação que seria tomada, pessoa que autorizaria rollback.
6. Encerrar confirmando: “exercício de mesa concluído sem alterar produção”.

## Modelo de relato de incidente

```text
Incidente: <produção vazia | 4xx/5xx | RLS | cache antigo | ingestão parcial | deploy falho>
Horário:
Release atual:
Correlation id:
Componente health:
Impacto público:
Evidência sem segredos:
Ação tomada:
Rollback usado? <sim/não>
Autorizador humano:
Próximo PR/correção:
```

## Checklist de recuperação

- [ ] Release/SHA identificado.
- [ ] Smoke e health executados.
- [ ] Segredos redigidos.
- [ ] Impacto público classificado.
- [ ] Último deployment saudável conhecido.
- [ ] Decisão humana registrada quando exigida.
- [ ] Rollback ou correção validado com smoke/health.
- [ ] Handoff/runbook atualizado se o procedimento mudou.
