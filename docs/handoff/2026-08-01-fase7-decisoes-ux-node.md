# Handoff atualizado — Fase 7 decisões, UX e Node

Data: 2026-08-01 19:29 -03:00
Repositório: `/home/lourenco/Projetos/eleicao2026`
Produção: https://portal-transparencia-rs.pages.dev/
Branch verificada: `fase-7-decisoes-ux-node`
HEAD local: `90a8063 fix: proteger logs de erro em producao`

## Estado executivo

O repositório está em uma branch de trabalho **com muitas mudanças locais não commitadas**. A produção está saudável, mas a branch local contém um próximo bloco ainda não publicado/PRizado.

- `origin/main` e `main` apontam para `90a8063`.
- Branch atual: `fase-7-decisoes-ux-node`.
- Não há PR associado à branch atual segundo `gh pr status`.
- Worktree não está limpo: há 29 arquivos modificados e 7 arquivos novos antes deste handoff.
- Produção validada no Pages com release `90a8063-20260801T150839248Z`.
- Produção ainda retorna `213` cards no smoke/health.
- Snapshot local da branch de trabalho foi reduzido para `212` candidaturas públicas.

## Divergência importante: produção x branch local

### Produção atual

Validação contra `https://portal-transparencia-rs.pages.dev/`:

- Smoke produção: OK.
- `cards`: `213`.
- `expectedMinCount`: `212`.
- detalhe canônico OK: `/candidatos/naftaly_pereira_do_nascimento_210002533354`.
- offline OK.
- service worker pronto.
- `httpFailures`: `0`.
- console errors online: `0`.
- Health produção: OK.
- `status=ok`.
- `blocks_release=false`.
- `release_id=90a8063-20260801T150839248Z`.
- `candidates.count=213`.

Interpretação: produção está operacional, mas ainda expõe 213 candidatos vindos da camada pública/Supabase. A branch local trabalha para superfície pública versionada de 212.

### Branch local atual

`npm run data:check` na branch local:

- Snapshot público válido.
- `212` candidaturas públicas.
- Cargos:
  - `deputado_estadual=110`
  - `deputado_federal=88`
  - `governador=1`
  - `vice_governador=1`
  - `senador=4`
  - `outro=8`
- Fontes TSE: `2`.

Override local novo:

```json
{
  "excluded_tse_candidate_ids": ["210002533050"],
  "position_overrides": {
    "210002533354": {
      "position": "vice_governador",
      "position_label": "Vice-governador"
    }
  }
}
```

Efeito pretendido:

- `FRANCISCO MARQUES NETO` (`210002533050`) removido da superfície pública.
- `NAFTALY PEREIRA DO NASCIMENTO` (`210002533354`) classificado como `vice_governador`.

## Validações locais executadas

Comandos executados nesta verificação:

```bash
npm run data:check
npm run test -- --passWithNoTests
npx tsc --noEmit
npm run build
npm run smoke:preview -- --url https://portal-transparencia-rs.pages.dev/
npm run health:preview -- --url https://portal-transparencia-rs.pages.dev/ --correlation-id handoff-20260801-check
```

Resultados locais:

- `data:check`: OK — snapshot local `212` candidaturas, `2` fontes TSE.
- Testes: OK — `33` arquivos, `132` testes.
- TypeScript: OK.
- Build: OK.
  - Vite transformou `162` módulos.
  - Sitemap gerado com `212` candidatos + páginas estáticas = `214` URLs.
  - `release.json` local gerado como `90a8063-20260801T222824955Z`.
- Smoke produção: OK — produção ainda com `213` cards.
- Health produção: OK — `status=ok`, `blocks_release=false`.

Observação: `npm run build` modificou `tsconfig.tsbuildinfo`; não restaurei para não descartar estado da branch.

## Mudanças locais relevantes ainda não commitadas

Arquivos modificados principais:

- `.github/workflows/deploy.yml`
  - Mantém actions estáveis (`actions/checkout@v4`, `actions/setup-node@v4`, `cloudflare/wrangler-action@v3`) e atualiza o runner para Node `24`.
- `.nvmrc` novo.
- `package.json` / `package-lock.json`
  - Adiciona engines Node `>=24 <25`, npm `>=10`.
- `public/_headers`
  - Troca CSP de `Content-Security-Policy-Report-Only` para `Content-Security-Policy` enforce.
- `data/public-candidates.json`
  - Snapshot local passa para `212` candidaturas públicas.
- `data/public-candidate-overrides.json` novo.
- `data/tse-source-manifest.json`
  - Manifesto atualizado para refletir snapshot/overrides.
- `scripts/refresh-public-snapshot.mjs`
  - Passa a carregar overrides públicos e classificar `VICE-GOVERNADOR` como `vice_governador`.
- `scripts/public-candidate-snapshot.mjs`
  - Ajuste de snapshot público.
- `src/types/election.ts`, `src/utils/position.ts`
  - Incluem `vice_governador`.
- `src/services/candidates.ts`, `src/services/publicCandidates.ts`
  - Ajustes para overrides/filtro público.
- `src/pages/HomePage.tsx`
  - Atalhos por cargo/lista longa e melhorias de UX.
- `src/pages/ComparePage.tsx`
  - Comparação antes da lista completa e atalho direto para tabela.
- `src/components/PageJumpControls.tsx` novo.
  - Botões fixos “Voltar ao topo” e “Ir ao final”.
- `src/pages/AdminPage.tsx` novo.
  - Painel operacional preparatório sem escrita insegura no frontend.
- Testes novos/alterados:
  - `src/components/__tests__/PageJumpControls.test.tsx`
  - `src/pages/__tests__/AdminPage.test.tsx`
  - `src/pages/__tests__/HomePage.test.tsx`
  - `src/pages/__tests__/ComparePage.test.tsx`
  - `src/services/__tests__/candidates.test.ts`
  - `scripts/__tests__/public-snapshot.test.mjs`
  - `scripts/__tests__/h6-2-security-hardening.test.mjs`
  - `scripts/__tests__/fase-7-release-checklist.test.mjs`

## Documentação já ajustada na branch local

- `README.md`
  - Site final decidido: `https://rs.votopraquem.org`.
  - Pages fica como preview/infra Cloudflare.
  - Estado de dados passa para `212` candidaturas públicas, com manifesto preservando `213` linhas oficiais TSE.
- `docs/release/fase-7-checklist-mvp.md`
  - Registra decisões humanas finais:
    - CSP enforce aprovado.
    - domínio próprio decidido: `https://rs.votopraquem.org`.
    - responsável provisório: `admin@votopraquem.org`.
    - `FRANCISCO MARQUES NETO` removido da superfície pública em vez de publicar summary faltante.
    - acessibilidade manual ainda pendente após deploy.
- `docs/proximos-passos.md`
  - Ajustado para estado pós-Fase 7.
- `docs/qa/h6-2-seguranca-headers-editorial.md`
  - Ajustado de CSP report-only para enforce.

## Produção e release

Última produção validada:

- URL: `https://portal-transparencia-rs.pages.dev/`
- Release health: `90a8063-20260801T150839248Z`
- Commit base: `90a8063`
- Smoke/health: OK.
- Produção ainda mostra `213` cards.

Não consegui reler `/release.json` via `curl` em uma tentativa por falha momentânea de DNS, mas o health já retornou o release e componentes OK.

## Riscos / pontos de atenção

1. **Worktree sujo grande**: não criar outra implementação por cima sem revisar/stagear essas mudanças.
2. **Sem PR da branch atual**: `fase-7-decisoes-ux-node` ainda não tem PR associado.
3. **Produção x local divergente**:
   - produção: `213` cards;
   - local: snapshot público `212`.
   - Antes de declarar a remoção de `FRANCISCO` concluída, precisa PR/preview/deploy e smoke validando `212`.
4. **Supabase remoto pode continuar com 213**: o filtro público precisa cobrir também dados vindos do Supabase, não só snapshot local. Testes passam localmente, mas validar em preview é obrigatório.
5. **CSP enforce**: local mudou para enforce. Precisa preview real para garantir que Supabase, PWA, Google Fonts e Cloudflare Insights não gerem bloqueio.
6. **Node 24 no CI**: mudança deve ser validada no GitHub Actions; local atual está em Node 22 e passou, mas CI em Node 24 é gate obrigatório.
7. **Domínio próprio `rs.votopraquem.org`**: decisão documentada, mas configuração Cloudflare/custom domain ainda não foi validada neste handoff.
8. **AdminPage** é painel preparatório: não há escrita real e não deve receber service role no frontend.
9. **Acessibilidade manual**: segue pendente rodada humana final de teclado/contraste em navegador real após deploy.
10. **`tsconfig.tsbuildinfo` modificado** por build; decidir se restaura antes de commit.

## Próximo fluxo recomendado

1. Revisar diffs locais por bloco:
   - dados/overrides públicos;
   - UX/acessibilidade;
   - CSP enforce;
   - Node 24/CI;
   - AdminPage preparatório.
2. Restaurar `tsconfig.tsbuildinfo` se não for intencional.
3. Criar PR da branch `fase-7-decisoes-ux-node` ou dividir em PRs menores se o diff ficar grande.
4. Rodar no PR:
   - CI `quality` completo;
   - Cloudflare Preview;
   - smoke preview esperando `212` cards;
   - health preview `status=ok`, `blocks_release=false`;
   - checagem de headers CSP enforce no preview.
5. Só depois mergear em `main` e validar produção.
6. Após deploy, atualizar este handoff ou criar handoff final com release novo e resultado `212`/CSP enforce.

## Estado Git no momento deste handoff

- Branch: `fase-7-decisoes-ux-node`.
- HEAD: `90a8063`.
- Upstream da branch atual: não configurado.
- `main` e `origin/main`: `90a8063`.
- Worktree: sujo, com mudanças locais listadas acima.
- PR associado: nenhum.
