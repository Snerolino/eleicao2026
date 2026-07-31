# H5.4 — Manifest, instalação e SEO

Data: 2026-07-31
Guia: Fase 5 — H5.4

## Objetivo

Fechar experiência PWA instalável e descoberta pública por URLs estáveis, sem publicar superfície privada em sitemap/robots/metadados.

## Implementado

- Manifest PWA:
  - `name`, `short_name`, `theme_color`, `background_color`, `start_url`, `display` preservados.
  - `scope: '/'` declarado explicitamente.
  - `lang: 'pt-BR'` declarado explicitamente.
  - Ícones `any`: `/icon-192.png`, `/icon-512.png`.
  - Ícones `maskable`: `/pwa-192.png`, `/pwa-512.png`.
- HTML base:
  - `link rel="manifest"` explícito para `/manifest.webmanifest`.
  - canonical da home para `https://portal-transparencia-rs.pages.dev/`.
  - `og:url` da home.
  - `apple-touch-icon` usa o ativo `any` 192×192 para evitar recorte indevido em iOS.
- Metadata runtime:
  - `usePageMetadata` cria/atualiza `link rel="canonical"`.
  - Permite canonical separado de `og:url` quando necessário.
  - Fallback usa `window.location.href`.
- Sitemap/robots:
  - `generateRobotsTxt()` centraliza robots gerado no build.
  - `robots.txt` permite público e bloqueia rotas operacionais não públicas (`/admin`, `/editorial`, `/login`).
  - Sitemap permanece só por slug canônico, sem UUID.
- Smoke:
  - valida manifest real em preview/produção.
  - exige `start_url`, `scope`, `display` e ícones `any`/`maskable` 192/512.
  - service worker agora é verificado no escopo `/`.

## Ícones

Ativos existentes verificados:

- `public/icon-192.png`: 192×192 PNG.
- `public/icon-512.png`: 512×512 PNG.
- `public/pwa-192.png`: 192×192 PNG.
- `public/pwa-512.png`: 512×512 PNG.

Inspeção visual do `pwa-512.png`: símbolo centralizado, margem ampla e sem corte aparente nas bordas da máscara.

## Validações

- RED H5.4:
  - manifest sem `scope`/maskable;
  - HTML sem canonical/manifest explícito;
  - robots sem sitemap/disallow;
  - hook sem canonical;
  - smoke sem validação de manifest/escopo.
- Focused:
  - `npm run test -- scripts/__tests__/h5-4-pwa-seo.test.mjs src/hooks/__tests__/usePageMetadata.test.ts`
- Full gate esperado:
  - `npm run test -- --passWithNoTests`
  - `npx tsc --noEmit`
  - `npm run build`
  - `npm run smoke:local`
  - smoke preview/produção.

## Decisões

- Não incluir rotas privadas no sitemap.
- Robots bloqueia rotas operacionais mesmo sem páginas públicas atuais, para evitar descoberta futura acidental.
- Canonical client-side é suficiente para o SPA atual; se previews sociais exigirem crawler sem JS, próximo passo é Worker/edge rewrite.

## Riscos residuais

- Instalação em Chrome/Edge/mobile precisa de validação manual real do navegador; smoke automatizado valida manifest, HTTPS implícito no preview/produção, service worker e escopo, mas não clica no prompt nativo de instalação.
