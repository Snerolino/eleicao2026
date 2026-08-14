# Fase 7 — Checklist final de liberação do MVP

Data: 2026-08-01
Produção pública: https://rs.votopraquem.org/
Infra/preview Cloudflare Pages: https://portal-transparencia-rs.pages.dev/
Release validado mais recente após fechamento Fase 2 + refresh TSE: `3064761-20260812T160735671Z`

## Status executivo

O portal está em estado de **MVP operacional**: dados oficiais aparecem em produção, smoke/health passam e há runbooks de observabilidade, segurança e incidentes.

As decisões humanas finais foram registradas em 2026-08-01. CI, deploy, smoke/health e QA final de teclado/contraste foram validados. O domínio próprio `https://rs.votopraquem.org` responde com HTTP→HTTPS, certificado Google Trust Services, canonical/OG, robots/sitemap, smoke, health e QA final. A implantação técnica do MVP está assinável.

## Evidência atual

- Snapshot público versionado (12/08/2026): `938` candidaturas públicas RS 2026 a partir do `consulta_cand_2026_RS.csv` oficial do TSE (`FRANCISCO MARQUES NETO` removido da superfície pública por decisão humana).
- Supabase remoto público pode manter a candidatura removida; a camada pública filtra a candidatura removida.
- Slugs e `tse_candidate_id`: `938/938` únicos e não nulos no snapshot público.
- Sitemap esperado após este bloco: `938` candidatos + páginas estáticas.
- Smoke produção atual: OK, `938` cards públicos, canonical/offline/SW sem falhas HTTP.
- Health produção atual: OK, `status=ok`, `blocks_release=false`, `correlation_id=final-cloudflare-update-3064761`.
- Release produção validado: `3064761-20260812T160735671Z`.
- Runbooks: H6.1 observabilidade, H6.2 segurança/headers, H6.3 incidentes/recuperação.

## Checklist final

### Security

- [x] Staging TSE e tabelas internas não são superfície pública esperada.
- [x] RPCs editoriais privilegiadas não são executáveis por `anon`/`public`.
- [x] Autorização editorial centralizada em `editor_roles`, não em `raw_user_meta_data`.
- [x] `raw_documents.raw_content` não vai ao frontend público.
- [x] Headers de segurança em produção com CSP enforce aprovado.
- [x] Decisão humana: ativar **CSP enforce**.

### Data

- [x] Contagem oficial TSE atual (12/08/2026): `939` registros; contagem pública versionada: `938` candidaturas.
- [x] Cargos públicos validados: deputado estadual `517`, deputado federal `375`, governador `5`, vice-governador `5`, senador `12`, outro/suplentes `24`.
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
- [x] Comparação aparece antes da lista completa de seleção e possui atalho direto para a tabela.
- [x] Lista principal tem atalhos clicáveis por cargo.
- [x] Vice-governador tem seção própria, sem ser rotulado como governador.
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
- [x] Botões fixos de voltar ao topo e ir ao final adicionados para reduzir rolagem longa.
- [x] `prefers-reduced-motion` respeitado.
- [x] Rodada final de teclado/headings/contraste em navegador real/headless concluída em `pages.dev` + build local; evidência em `docs/qa/fase-7-acessibilidade-contraste-final.md`.

### SEO

- [x] Sitemap por slug e sem UUID divergente.
- [x] Canonical/OG coerentes.
- [x] `robots.txt` bloqueia rotas privadas/editoriais/login.
- [x] Manifest e metadados públicos sem rotas privadas.
- [x] Decisão humana: domínio próprio final `https://rs.votopraquem.org`; `pages.dev` segue como preview/infra técnica.

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
- [x] Intervenção humana: `FRANCISCO MARQUES NETO` removido da superfície pública em vez de publicar summary faltante.
- [x] Intervenção humana: responsável provisório `admin@votopraquem.org` nomeado para editoria/operação inicial.

### Operação

- [x] Health diferencia deploy, banco/candidates, claims, cache, RLS, release e HTTP.
- [x] Logs/relatórios sem segredos, tokens ou payload bruto.
- [x] Runbooks H6.1, H6.2 e H6.3 criados.
- [x] Incidente comum tem diagnóstico curto e rollback.
- [x] Intervenção humana: `admin@votopraquem.org` decide/autoriza SQL remoto,
  merge sensível, deploy manual e rollback. A execução operacional, quando
  autorizada, fica a cargo do Hermes/CLI; Lourenço não precisa escrever no
  Supabase manualmente.

### Documentação

- [x] README atualizado para candidaturas públicas versionadas e estado real atual.
- [x] Handoff atualizado com dados TSE, Supabase e riscos.
- [x] Índice de documentação referencia runbooks e checklist final.
- [x] Decisões humanas restantes separadas de evidência técnica.

## Gates humanos decididos

1. **Publicação editorial:** decidido remover `FRANCISCO MARQUES NETO` da superfície pública, sem bypass editorial.
2. **CSP enforce:** aprovado e configurado em `public/_headers`.
3. **Domínio próprio:** decidido `https://rs.votopraquem.org`.
4. **Responsáveis operacionais:** `admin@votopraquem.org` nomeado temporariamente para SQL remoto, merge sensível, deploy manual e rollback.
5. **Acessibilidade/usabilidade:** rodada final técnica concluída no domínio próprio; melhorias de UX implementadas e publicadas.

## Critério de assinatura

O MVP está tecnicamente assinável porque:

- todos os checks técnicos acima permaneceram verdes em produção;
- gates humanos foram marcados como decididos;
- nenhuma publicação editorial pendente foi tratada por bypass;
- smoke produção, health produção, headers, canonical/SEO e QA a11y passaram no domínio `https://rs.votopraquem.org` após o último merge.
