# Contribuindo

Obrigado pelo interesse em contribuir com o Portal Transparência Eleitoral RS.

## Princípios

- **Transparência nas fontes** — Toda informação publicada deve ter fonte identificável e nível de confiança atribuído.
- **Neutralidade** — O portal não emite avaliação política. Apresenta facts e atribui a fontes.
- **Code as data** — Prefira dados estruturados a texto livre. O conteúdo editorial é versionado junto com o código.

## Como contribuir

### Reportar problemas

Abra uma [issue](https://github.com/Snerolino/eleicao2026/issues) com:
- Descrição clara do problema
- Passos para reproduzir
- Comportamento esperado vs observado
- Screenshot (se aplicável)

### Sugerir melhorias

Issues e PRs são bem-vindos. Para mudanças significativas, abra primeiro uma issue para discutir o escopo.

### Adicionar/atualizar dados de candidatos

1. Atualize o mirror oficial TSE em `../dataset2026/` fora do repositório
2. Rode `npm run data:refresh` para regenerar `data/public-candidates.json`
3. Rode `npm run data:check` para validar schema, contagem mínima, unicidade e campos proibidos
4. Rode `npm run build` para verificar tipo, PWA e sitemap
5. Envie o PR com o snapshot público versionado

Não edite `src/services` para alterar dados eleitorais. O build deve consumir o snapshot versionado e não fazer ingestão silenciosa.

### Padrões de código

- **Idioma:** Português (BR) — nomes de componentes, funções, comentários e commits em pt-BR
- **Estilo:** TypeScript estrito, sem `any`, sem `@ts-expect-error`
- **Componentes:** Functional components com hooks, sem classes
- **CSS:** Tailwind v4 + variáveis CSS em `theme.css`
- **Commits:** Conventional commits — `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`

## Ambiente local

```bash
npm install
npm run dev     # Desenvolvimento
npm run build   # Build de produção
npm test        # Testes
```

## CI/CD

O workflow de deploy em `.github/workflows/deploy.yml` roda qualidade em PRs e só publica `main`. Requer `CLOUDFLARE_API_TOKEN` com escopo **Cloudflare Pages:Edit** e variáveis públicas `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` configuradas no GitHub.

## Código de conduta

Seja respeitoso. Este é um projeto cívico de transparência eleitoral — mantenha o foco nos dados e na qualidade técnica.
