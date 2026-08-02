# Portal Transparência Eleitoral RS

[![Deploy](https://github.com/Snerolino/eleicao2026/actions/workflows/deploy.yml/badge.svg)](https://github.com/Snerolino/eleicao2026/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Consulta pública a candidatos das eleições de 2026 no Rio Grande do Sul.**  
Cada informação mostra sua fonte, data de coleta e nível de confiança — um dossiê público para o eleitor decidir com transparência.

🌐 **Site final decidido:** https://rs.votopraquem.org  
🔎 **Preview/infra Cloudflare Pages:** https://portal-transparencia-rs.pages.dev

---

## Funcionalidades

- **Dossiê por candidato** — Histórico político, plataforma, reputação e escrutínio, com fonte e grau de confiança
- **Comparação lado a lado** — Selecione 2 a 4 candidatos e compare claims por seção
- **Busca e filtros** — Por nome, partido, cargo e número de urna
- **Download CSV** — Exporte a lista completa de candidatos
- **PWA (offline)** — Instalável como app, com navegação offline
- **SEO dinâmico** — OG tags, sitemap.xml, robots.txt
- **Acessibilidade** — Skip-to-content, `aria-live`, foco visível, `prefers-reduced-motion`

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19 + TypeScript |
| Build | Vite 6 + Tailwind CSS 4 |
| Roteamento | React Router v6 |
| Dados | Supabase (PostgreSQL) + snapshot público versionado |
| Cache/Estado | TanStack React Query |
| PWA | vite-plugin-pwa + Workbox |
| Deploy | Cloudflare Pages |
| CI/CD | GitHub Actions (`wrangler-action`) |

## Dados

Atualmente o portal usa **212 candidaturas públicas TSE 2026 do Rio Grande do Sul**, sanitizadas em snapshot público versionado (`data/public-candidates.json`). O manifesto preserva `213` linhas oficiais TSE; `FRANCISCO MARQUES NETO` foi removido da superfície pública por decisão humana registrada na Fase 7.

| Cargo | Candidatos | Partidos |
|-------|-----------|----------|
| Deputado Estadual | 110 | múltiplos |
| Deputado Federal | 88 | múltiplos |
| Governador | 1 | múltiplos |
| Vice-governador | 1 | múltiplos |
| Senador | 4 | múltiplos |
| Outros/suplentes | 8 | múltiplos |

Quando o Supabase público está saudável, os dados vêm do banco. Se a camada pública estiver indisponível ou defasada, o fallback lê o snapshot público versionado e sinaliza a degradação sem depender de `../dataset2026` no build.

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build
npm run build

# Atualizar snapshot público a partir do mirror TSE local (comando explícito)
npm run data:refresh

# Validar snapshot público
npm run data:check

# Preview do build
npm run preview

# Testes
npm test
```

### Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

| Variável | Obrigatória | Descrição |
|----------|------------|-----------|
| `VITE_SUPABASE_URL` | Sim (para dados reais) | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Sim (para dados reais) | Chave anônima do Supabase |

Sem as variáveis, o build ainda usa `data/public-candidates.json` como snapshot oficial versionado para manter a consulta pública íntegra em desenvolvimento/local.

### Scripts auxiliares

| Script | Descrição |
|--------|-----------|
| `scripts/refresh-public-snapshot.mjs` | Atualiza `data/public-candidates.json` a partir do espelho oficial local |
| `scripts/data-check.mjs` | Valida snapshot público, manifesto TSE e contagem de fotos oficiais antes do build |
| `scripts/build-env-check.mjs` | Preflight de build/deploy para variáveis públicas Supabase |
| `scripts/apply-official-candidate-photos.mjs` | Aplica fotos oficiais rastreáveis do TSE por match conservador nome+partido |
| `scripts/insert-fontes-oficiais.mjs` | Cria fontes/claims oficiais como `pending_review`; `--apply` exige service role explícito |
| `scripts/editorial-workflow.mjs` | Workflow editorial para curadoria de claims |
| `scripts/fetch-tse-photos.mjs` | Tentativa via API DivulgaCandContas quando fotos 2026 estiverem publicáveis |
| `scripts/tse-connector.mjs` | Conector com a API do TSE |

## Deploy

O deploy de produção é feito preferencialmente via GitHub Actions após merge em `main`:

```bash
git push origin main
gh run list --branch main --workflow Deploy --limit 3
npm run smoke:preview -- --url https://rs.votopraquem.org/
npm run health:preview -- --url https://rs.votopraquem.org/
```

Deploy manual via wrangler fica como operação excepcional/runbook:

```bash
npm run build
npx wrangler pages deploy dist --project-name=portal-transparencia-rs --branch=main
```

## Estrutura do projeto

```
src/
├── components/        # Componentes React reutilizáveis
│   ├── candidates/    # CandidateCard, CandidatePhoto, CargoSection
│   ├── sources/       # ConfidenceBadge, SourceReferenceBadge
│   └── ui/           # Componentes base (shadcn/ui)
├── hooks/            # Custom hooks (useOnlineStatus, usePageMetadata)
├── lib/              # Configurações (supabase, utils)
├── pages/            # Páginas da aplicação
├── services/         # Serviços de dados (candidates, publicCandidates)
├── types/            # Definições TypeScript
└── utils/            # Utilitários (claims, confidence, download, position)
```

## Licença

MIT
