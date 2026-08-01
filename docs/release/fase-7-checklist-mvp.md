# Fase 7 — Checklist final de liberação do MVP

Data: 2026-08-01
Produção: https://portal-transparencia-rs.pages.dev/
Release validado mais recente antes deste checklist: `5c2f392-20260801T050727215Z`

## Status executivo

O portal está em estado de **MVP operacional**: dados oficiais aparecem em produção, smoke/health passam e há runbooks de observabilidade, segurança e incidentes.

**Não declarar como encerrado/assinado** até as decisões humanas finais abaixo serem confirmadas, principalmente publicação editorial restante, CSP enforce e eventual domínio próprio.

## Evidência atual

- Snapshot público versionado: `213` candidaturas oficiais RS 2026.
- Supabase remoto público: `213` candidaturas RS.
- Slugs e `tse_candidate_id`: `213/213` únicos e não nulos.
- Sitemap: `213` candidatos + páginas estáticas.
- Smoke produção: OK, `213` cards, offline/detalhe canônico OK, `httpFailures=0`.
- Health produção: OK, `status=ok`, `blocks_release=false`.
- Release produção validado H6.3: `5c2f392-20260801T050727215Z`.
- Runbooks: H6.1 observabilidade, H6.2 segurança/headers, H6.3 incidentes/recuperação.

## Checklist final

### Security

- [x] Staging TSE e tabelas internas não são superfície pública esperada.
- [x] RPCs editoriais privilegiadas não são executáveis por `anon`/`public`.
- [x] Autorização editorial centralizada em `editor_roles`, não em `raw_user_meta_data`.
- [x] `raw_documents.raw_content` não vai ao frontend público.
- [x] Headers de segurança em produção com CSP report-only.
- [ ] Decisão humana: ativar ou não **CSP enforce** depois de observar relatórios reais.

### Data

- [x] Contagem oficial atual: `213` candidaturas.
- [x] Cargos validados: deputado estadual `111`, deputado federal `88`, governador `2`, senador `4`, outro/suplentes `8`.
- [x] `SQ_CANDIDATO`/`tse_candidate_id` preenchidos e distintos.
- [x] Slugs canônicos por `nome_normalizado_<SQ_CANDIDATO>`.
- [x] Snapshot e manifesto TSE versionados.
- [x] Importação Supabase feita por staging/upsert com `coverage_complete=false`.

### Frontend

- [x] Home pública renderiza candidatos oficiais.
- [x] Busca por nome, partido, cargo, número e acento.
- [x] Detalhe canônico em `/candidatos/:slug`.
- [x] Compatibilidade temporária de IDs antigos para redirecionamento/canonicalização.
- [x] Comparação por `/comparar?candidatos=<id1>,<id2>`.
- [x] CSV público da lista de candidatos.
- [x] Fontes públicas via `source_references`.

### Degradação

- [x] Claims indisponíveis não apagam candidatos.
- [x] Claims degradadas geram warning, não bloqueiam navegação.
- [x] Falha fatal de candidates não aparece como “nenhum candidato”.
- [x] Fallback snapshot é honesto e versionado.

### PWA

- [x] Manifest instalável com `scope`, `start_url`, `display`, `lang` e ícones.
- [x] Offline para home/detalhe visitado validado por smoke.
- [x] Workbox evita cachear 4xx/5xx.
- [x] Candidates/claims não usam `CacheFirst` longo que mascara dados editoriais.
- [x] Cache/release monitorados pelo health.

### Acessibilidade

- [x] Skip-to-content e foco visível global.
- [x] `aria-live` para estados relevantes/degradação.
- [x] Navegação por teclado nos fluxos principais coberta por smoke/testes de UI.
- [x] `prefers-reduced-motion` respeitado.
- [ ] Decisão humana recomendada: rodada manual final de teclado/contraste em navegador real antes de anúncio público amplo.

### SEO

- [x] Sitemap por slug e sem UUID divergente.
- [x] Canonical/OG coerentes.
- [x] `robots.txt` bloqueia rotas privadas/editoriais/login.
- [x] Manifest e metadados públicos sem rotas privadas.
- [ ] Decisão humana: domínio próprio, se o lançamento público não for ficar em `pages.dev`.

### CI/CD

- [x] GitHub Actions `Deploy` com quality gates.
- [x] Build reproduzível sem depender silenciosamente de `../dataset2026`.
- [x] Smoke pós-deploy.
- [x] Health pós-deploy.
- [x] Rollback documentado no runbook H6.3.

### Editorial

- [x] Claims novas devem entrar como `pending_review`.
- [x] Publicação/correção/retração por RPC transacional.
- [x] Histórico preservado; sem delete público como correção.
- [x] `scripts/insert-fontes-oficiais.mjs` endurecido para não publicar direto.
- [ ] Intervenção humana necessária: revisar/aprovar/publicar summary faltante de `FRANCISCO MARQUES NETO` pelo fluxo editorial.
- [ ] Intervenção humana necessária: nomear editores/revisores iniciais e política de correção/retração operacional.

### Operação

- [x] Health diferencia deploy, banco/candidates, claims, cache, RLS, release e HTTP.
- [x] Logs/relatórios sem segredos, tokens ou payload bruto.
- [x] Runbooks H6.1, H6.2 e H6.3 criados.
- [x] Incidente comum tem diagnóstico curto e rollback.
- [ ] Intervenção humana: confirmar responsável por autorizar SQL remoto, merge sensível, deploy manual e rollback.

### Documentação

- [x] README atualizado para `213 candidaturas oficiais` e estado real atual.
- [x] Handoff atualizado com dados TSE, Supabase e riscos.
- [x] Índice de documentação referencia runbooks e checklist final.
- [x] Decisões humanas restantes separadas de evidência técnica.

## Gates humanos restantes

1. **Publicação editorial:** criar/revisar/aprovar/publicar summary de `FRANCISCO MARQUES NETO` por fluxo H4.2.
2. **CSP enforce:** manter report-only até observar violações reais; ativar enforce só com aprovação.
3. **Domínio próprio:** decidir se o MVP público final usará domínio customizado ou `pages.dev`.
4. **Responsáveis operacionais:** nomear quem autoriza SQL remoto, merge sensível, deploy manual e rollback.
5. **Acessibilidade manual:** validação humana final de teclado/contraste em navegador real.

## Critério de assinatura

O MVP pode ser assinado quando:

- todos os checks técnicos acima permanecerem verdes em produção;
- gates humanos forem marcados como decididos;
- nenhuma publicação editorial pendente for tratada por bypass;
- smoke produção e health produção seguirem OK após o último merge.
