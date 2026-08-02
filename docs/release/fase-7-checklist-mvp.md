# Fase 7 — Checklist final de liberação do MVP

Data: 2026-08-01
Produção pública: https://rs.votopraquem.org/
Infra/preview Cloudflare Pages: https://portal-transparencia-rs.pages.dev/
Release validado mais recente antes deste checklist: `5c2f392-20260801T050727215Z`

## Status executivo

O portal está em estado de **MVP operacional**: dados oficiais aparecem em produção, smoke/health passam e há runbooks de observabilidade, segurança e incidentes.

As decisões humanas finais foram registradas em 2026-08-01. CI, deploy, smoke/health e QA final de teclado/contraste foram validados. O domínio próprio `https://rs.votopraquem.org` já responde com HTTP→HTTPS, certificado Google Trust Services e smoke/health. **Não declarar como encerrado/assinado no domínio próprio** até publicar o rebuild que troca canonical/robots/sitemap de `pages.dev` para o domínio final e revalidar SEO no domínio.

## Evidência atual

- Snapshot público versionado: `212` candidaturas públicas RS 2026 (`213` linhas oficiais TSE; `FRANCISCO MARQUES NETO` removido da superfície pública por decisão humana).
- Supabase remoto público pode manter `213` candidaturas RS; a camada pública filtra a candidatura removida.
- Slugs e `tse_candidate_id`: `212/212` únicos e não nulos no snapshot público.
- Sitemap esperado após este bloco: `212` candidatos + páginas estáticas.
- Smoke produção anterior: OK, `213` cards, offline/detalhe canônico OK, `httpFailures=0`; repetir após merge para validar `212` cards públicos.
- Health produção: OK, `status=ok`, `blocks_release=false`.
- Release produção validado H6.3: `5c2f392-20260801T050727215Z`.
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

- [x] Contagem oficial TSE atual: `213` linhas; contagem pública versionada: `212` candidaturas.
- [x] Cargos públicos validados: deputado estadual `110`, deputado federal `88`, governador `1`, vice-governador `1`, senador `4`, outro/suplentes `8`.
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
- [x] Intervenção humana: `admin@votopraquem.org` autoriza SQL remoto, merge sensível, deploy manual e rollback no momento.

### Documentação

- [x] README atualizado para candidaturas públicas versionadas e estado real atual.
- [x] Handoff atualizado com dados TSE, Supabase e riscos.
- [x] Índice de documentação referencia runbooks e checklist final.
- [x] Decisões humanas restantes separadas de evidência técnica.

## Gates humanos restantes

1. **Publicação editorial:** decidido remover `FRANCISCO MARQUES NETO` da superfície pública, sem bypass editorial.
2. **CSP enforce:** aprovado e configurado em `public/_headers`.
3. **Domínio próprio:** decidido `https://rs.votopraquem.org`.
4. **Responsáveis operacionais:** `admin@votopraquem.org` nomeado temporariamente para SQL remoto, merge sensível, deploy manual e rollback.
5. **Acessibilidade manual:** melhorias de UX implementadas; falta rodada humana final no navegador após deploy.

## Critério de assinatura

O MVP pode ser assinado quando:

- todos os checks técnicos acima permanecerem verdes em produção;
- gates humanos forem marcados como decididos;
- nenhuma publicação editorial pendente for tratada por bypass;
- smoke produção e health produção seguirem OK após o último merge.
