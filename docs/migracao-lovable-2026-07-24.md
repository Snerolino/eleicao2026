# Relatório de migração do Lovable

## Fonte extraída

Projeto Lovable: `Eleição RS Transparente`  
Project ID: `6799d40a-22e6-4efe-a735-826531719965`  
Commit lido: `6735cf06c069e8580a31c0ef2a88adf410f2ddae`

A extração foi somente leitura. Nenhuma mensagem de geração, alteração, deploy ou conexão com GitHub foi executada.

## Divergência original

O protótipo do Lovable foi criado com TanStack Start e TanStack Router. O repositório GitHub já usava React + Vite. Copiar o projeto inteiro substituiria a arquitetura correta.

## Estratégia aplicada

- Preservei Vite, React, TypeScript, Tailwind e `vite-plugin-pwa`.
- Converti as rotas para React Router.
- Mantive TanStack Query apenas para estado de rede e cache em memória.
- Removi runtime cache do Supabase no PWA.
- Reescrevi os tipos e mapeadores sem `any` evitável.
- Mantive o filtro `published` no banco e novamente no frontend.
- Mantive dados de demonstração isolados e identificados.
- Adicionei 404, status online/offline, horário da última consulta e fallback de imagem.
- Mantive o contato como placeholder explícito para não inventar um canal público.

## Arquivos Lovable deliberadamente descartados

- `src/server.ts`
- `src/start.ts`
- `src/router.tsx`
- `src/routeTree.gen.ts`
- `src/routes/*` no formato TanStack Start
- `src/lib/lovable-error-reporting.ts`
- componentes shadcn não utilizados
- `bun.lock` e configurações Bun
- `.lovable/project.json`

## Aplicação no GitHub

Recomendado criar uma branch separada:

```bash
git switch main
git pull --ff-only
git switch -c feat/portal-lovable-adaptado
unzip eleicao2026-lovable-adaptado.zip -d /tmp/eleicao2026-adaptado
rsync -av --exclude MIGRACAO_LOVABLE.md /tmp/eleicao2026-adaptado/ ./
npm install
npm run test
npm run build
git status --short
```

Não faça merge antes da revisão visual e da confirmação do schema real.
