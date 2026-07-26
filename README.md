# Portal Transparência Eleitoral RS

[![Deploy](https://github.com/Snerolino/eleicao2026/actions/workflows/deploy.yml/badge.svg)](https://github.com/Snerolino/eleicao2026/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Consulta pública a candidatos das eleições de 2026 no Rio Grande do Sul.**  
Cada informação mostra sua fonte, data de coleta e nível de confiança — um dossiê público para o eleitor decidir com transparência.

🌐 **Site:** https://portal-transparencia-rs.pages.dev

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
| Dados | Supabase (PostgreSQL) + mock local |
| Cache/Estado | TanStack React Query |
| PWA | vite-plugin-pwa + Workbox |
| Deploy | Cloudflare Pages |
| CI/CD | GitHub Actions (`wrangler-action`) |

## Dados

Atualmente o portal conta com **156 pré-candidatos** baseados em fontes jornalísticas (G1, Jornal do Comércio, GZH, Correio do Povo — julho/2026):

| Cargo | Candidatos | Partidos |
|-------|-----------|----------|
| Governador | 7 | PDT, PL, MDB, PSDB, PSTU, UP, PCO |
| Vice-Governador | 1 | PT |
| Senador | 4 | PL, PT, PSB, PSD |
| Deputado Federal | 48 | PL (27), PT (21) |
| Deputado Estadual | 96 | PL (56), PT (40) |

Quando o Supabase está configurado, os dados vêm do banco. Caso contrário, o fallback é o `mockData.ts` com os mesmos candidatos.

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build
npm run build

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

Sem as variáveis, o site funciona em **modo de demonstração** com os dados do `mockData.ts` e exibe um banner identificando o modo de teste.

### Scripts auxiliares

| Script | Descrição |
|--------|-----------|
| `scripts/generate-sitemap.mjs` | Gera `sitemap.xml` e `robots.txt` a partir do mockData |
| `scripts/ingest-data.mjs` | Importa dados CSV do TSE para o Supabase |
| `scripts/editorial-workflow.mjs` | Workflow editorial para curadoria de claims |
| `scripts/fetch-tse-photos.mjs` | Baixa fotos oficiais do TSE |
| `scripts/tse-connector.mjs` | Conector com a API do TSE |

## Deploy

O deploy é feito manualmente via wrangler:

```bash
npm run build
wrangler pages deploy dist --project-name=portal-transparencia-rs --branch=main
```

Ou via CI/CD (GitHub Actions) quando `CLOUDFLARE_API_TOKEN` estiver configurado no repositório.

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
├── services/         # Serviços de dados (candidates, mockData)
├── types/            # Definições TypeScript
└── utils/            # Utilitários (claims, confidence, download, position)
```

## Licença

MIT
