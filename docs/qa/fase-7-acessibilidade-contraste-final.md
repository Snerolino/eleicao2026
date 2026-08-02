# Fase 7 — QA final de acessibilidade e contraste

Data: 2026-08-01 22:32 -03:00  
Escopo: produção atual em `pages.dev` e build local pós-ajuste de heading.  
Domínio final decidido: `https://rs.votopraquem.org` — validação HTTP/certificado ainda em andamento fora deste QA.

## Objetivo

Fechar o gate que ainda estava marcado como pendente no checklist da Fase 7: rodada final de teclado/contraste em navegador real, sem depender do domínio próprio.

## Método

Foi executada uma rodada Playwright headless com navegação real e inspeção de DOM renderizado, cobrindo:

- viewports:
  - mobile `390x844`;
  - desktop `1366x768`.
- páginas:
  - `/`;
  - `/comparar?candidatos=210002533355,210002533015`;
  - `/admin`.
- verificações:
  - ausência de erros de console por página;
  - navegação por `Tab` nos primeiros elementos focáveis;
  - foco visível e elemento focado dentro da viewport;
  - presença de heading principal (`h1`) por página;
  - contraste WCAG AA em textos visíveis na viewport, considerando texto normal `4.5:1` e texto grande `3:1`.

## Correção feita durante a rodada

A Home não tinha `h1` próprio no conteúdo principal; o título existia no metadata, mas não na árvore de headings da página.

Correção aplicada:

- `src/pages/HomePage.tsx`
  - adicionou `h1`: `Candidatos 2026 no Rio Grande do Sul`;
  - adicionou contexto público curto abaixo do título.
- `src/pages/__tests__/HomePage.test.tsx`
  - adicionou teste garantindo `h1` público para navegação por headings.
- `src/components/sources/SourceReferenceBadge.tsx` e `src/theme.css`
  - removeu texto branco fixo dos badges de fonte;
  - escureceu `--color-unverified` no tema claro para WCAG AA;
  - adicionou teste para evitar regressão do contraste dos badges.

## Evidência local pós-correção

Com build local servido em `http://127.0.0.1:4173/`:

| Viewport | Página | H1 | Foco/teclado | Contraste | Console |
| --- | --- | --- | --- | --- | --- |
| mobile | `/` | `Candidatos 2026 no Rio Grande do Sul` | 24 passos, 0 problemas | 32 textos, 0 falhas | 0 erros |
| mobile | `/comparar?...` | `Comparar candidatos` | 24 passos, 0 problemas | 29 textos, 0 falhas | 0 erros |
| mobile | `/admin` | `Administração` | 23 passos, 0 problemas | 18 textos, 0 falhas | 0 erros |
| desktop | `/` | `Candidatos 2026 no Rio Grande do Sul` | 24 passos, 0 problemas | 49 textos, 0 falhas | 0 erros |
| desktop | `/comparar?...` | `Comparar candidatos` | 24 passos, 0 problemas | 82 textos, 0 falhas | 0 erros |
| desktop | `/admin` | `Administração` | 23 passos, 0 problemas | 23 textos, 0 falhas | 0 erros |

Resultado: **sem bloqueantes de teclado/contraste no escopo testado**.

## Evidência de preview

No primeiro preview do PR, a rodada encontrou contraste insuficiente nos badges `Outra fonte`/`Não confirmado` da Home e ruído externo de Cloudflare Web Analytics em domínio preview (`cloudflareinsights.com/cdn-cgi/rum`).

A correção dos badges foi aplicada antes do merge. O ruído de Analytics não bloqueou o smoke oficial porque é externo e já é tratado como ruído conhecido em preview; o CSP enforce permite o endpoint, mas o CORS do serviço pode registrar erro em subdomínios preview.

## Validações de engenharia

Executadas após a correção:

```bash
npm run test -- src/pages/__tests__/HomePage.test.tsx
npm run test -- src/components/sources/__tests__/SourceReferenceBadge.test.tsx
npm run test -- --passWithNoTests
npx tsc --noEmit
npm run build
npm run smoke:local
```

Resultados:

- HomePage: `8/8` testes ✅
- SourceReferenceBadge: `3/3` testes ✅
- Suite completa: `33` arquivos, `134` testes ✅
- TypeScript: ✅
- Build: ✅
- Smoke local: ✅
  - `cards: 212`
  - `expectedMinCount: 212`
  - detalhe canônico OK
  - offline OK
  - `httpFailures: 0`

## Limites

- A validação visual foi automatizada/headless, não substitui uma inspeção humana subjetiva de percepção estética.
- O domínio `https://rs.votopraquem.org` foi validado após DNS/TLS/certificado Google CA, com smoke/health e QA a11y próprios.
- `pages.dev` segue como preview/infra técnica; o domínio público final é `https://rs.votopraquem.org`.

## Status

Gate de teclado/contraste em `pages.dev`/build local e no domínio próprio: **fechado tecnicamente**.
Gate de domínio próprio: **fechado tecnicamente** em `https://rs.votopraquem.org`.
