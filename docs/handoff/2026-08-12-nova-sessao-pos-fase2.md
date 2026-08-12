# Nova sessão Hermes — eleicao2026-pos-fase2-matrizes-reais

Data: 2026-08-12
Project Hermes: `eleicao2026-pos-fase2-matrizes-reais`
Repo: `/home/lourenco/Projetos/eleicao2026`
Branch inicial esperada: `main`
Release inicial esperado: `a5eb62f-20260812T163506342Z`

## Objetivo da nova sessão

Começar o arco pós-Fase 2 sem carregar o histórico infinito da sessão anterior:
preparar a primeira carga real de proposições/votos e os catálogos reais de
apoio para gerar matrizes de impacto em `pending_review`, sem publicação
automática.

## O que já está implementado

### Portal público / PWA

- Vite + React + TypeScript + Tailwind v4.
- Cloudflare Pages em produção no domínio final:
  - https://rs.votopraquem.org
- PWA com service worker, offline detail e sitemap público.
- Rotas canônicas por slug:
  - `/candidatos/:slug`
- URLs antigas por UUID/SQ ainda preservadas durante a transição.
- `/admin` mantido por URL direta, sem link público no header/footer.
- Busca/filtros/listagem/comparação/CSV públicos funcionando.
- Health/smoke automatizados.

### Dados públicos TSE

- Snapshot público versionado em `data/public-candidates.json`.
- Fonte oficial TSE RS 2026 atualizada em 2026-08-12.
- Manifesto TSE: 939 registros oficiais.
- Snapshot público: 938 candidaturas.
- Exclusão humana preservada: `FRANCISCO MARQUES NETO`.
- Fotos rastreáveis: 906/938.
  - 879 matches exatos TSE 2026 por `SQ_CANDIDATO`.
  - 27 fallbacks conservadores TSE 2024.
  - 31 sem match.
  - 1 ambígua mantida sem foto.
- Relatórios:
  - `docs/qa/fotos-candidatos-fontes-oficiais.md`
  - `docs/qa/fotos-pendentes-2026-08-12.md`

### Supabase / editorial

- Clients Supabase adaptados ao Vite/SPA.
- Leitura pública via anon/publishable.
- `service_role` fora do frontend/build/logs/docs.
- Workflow editorial de claims com `pending_review`, revisão humana e publicação
  por RPC.
- Dossiês importados em lotes anteriores como claims `pending_review` com testes
  de contrato.

### Matriz de Impacto Populacional v1

Fase 2 está fechada.

Implementado:

- Contrato operacional de import legislativo:
  - `propositions[]`
  - `votes[]`
- Importer dry-run:
  - `src/domain/impact/legislative-importer.ts`
- CLI:
  - `npm run impact:dryrun`
  - `npm run impact:sql`
- Gerador SQL determinístico/offline:
  - `src/domain/impact/legislative-sql-generator.ts`
- Resolver de FKs por catálogo:
  - `src/domain/impact/legislative-support-resolver.ts`
- Fixtures:
  - `fixtures/legislative-import/boa-minima.json`
  - `fixtures/legislative-import/catalogo-exemplo.json`
- Testes do domínio de impacto e import legislativo.
- Migrations remotas aplicadas no Supabase:
  - `20260810090000_create_legislative_core.sql`
  - `20260810090100_create_impact_taxonomy.sql`
  - `20260810090200_create_impact_matrix.sql`
  - `20260810090300_create_impact_review_workflow.sql`
  - `20260810090400_create_impact_rls_and_approval.sql`
  - `20260812000000_grant_public_read.sql`
- RLS/grants públicos corrigidos e validados.

## Estado esperado no início

Rodar e confirmar:

```bash
git status --short --branch
git rev-parse --short HEAD
npm run data:check
```

Esperado:

```text
branch: main
HEAD: a5eb62f
candidaturas: 938
fotos oficiais: 906
```

Depois, se for mexer em implementação:

```bash
npm run test
npx tsc --noEmit
npm run build
node scripts/validate-impact-schema.mjs
```

## Arquivos que a próxima sessão deve ler primeiro

1. `AGENTS.md`
2. `.orchestrator/STATE.md`
3. `docs/handoff/2026-08-12-fechamento-fase2-proxima-sessao.md`
4. `docs/context-export/SCHEMA.md`
5. Este guia:
   - `docs/handoff/2026-08-12-nova-sessao-pos-fase2.md`

Para implementação da carga real:

- `src/domain/impact/legislative-importer.ts`
- `src/domain/impact/legislative-sql-generator.ts`
- `src/domain/impact/legislative-support-resolver.ts`
- `scripts/import-legislative-dry-run.mjs`
- `fixtures/legislative-import/`
- `supabase/migrations/20260810090000_create_legislative_core.sql`
- `supabase/migrations/20260810090200_create_impact_matrix.sql`
- `supabase/migrations/20260810090400_create_impact_rls_and_approval.sql`

## Próximos passos de implementação

### 1. Definir a primeira fonte legislativa real

Escolher um conjunto pequeno e auditável:

- uma proposição real;
- uma versão/texto votado real;
- um evento de votação real;
- votos nominais verificáveis;
- fontes públicas para cada fato.

Não misturar muitos temas no primeiro lote.

### 2. Montar o pacote público de import

Criar um fixture/dataset versionado com envelope:

```json
{
  "propositions": [],
  "votes": []
}
```

Critérios:

- sem PII desnecessária;
- fontes públicas rastreáveis;
- IDs externos estáveis;
- texto/votação verificável;
- nenhuma matriz publicada automaticamente.

### 3. Curar catálogo real de FKs

Preparar catálogo para resolver:

- `legislator_id`;
- `candidate_id` quando aplicável;
- `source_reference_id`;
- aliases/nomes externos.

O resolver não deve fabricar UUID nem aplicar heurística silenciosa.

### 4. Rodar dry-run e SQL

Comandos esperados:

```bash
npm run impact:dryrun -- <arquivo-do-lote>.json --catalog <catalogo-real>.json
npm run impact:sql -- <arquivo-do-lote>.json --catalog <catalogo-real>.json
```

Critério: plano determinístico, sem erros, SQL revisável.

### 5. Gerar handoff para revisão humana

Antes de qualquer escrita remota, produzir:

- fonte usada;
- contagem de proposições;
- contagem de votos;
- FKs resolvidas/não resolvidas;
- SQL gerado;
- riscos;
- decisão humana necessária.

### 6. Só depois considerar escrita remota

Escrita remota Supabase exige autorização explícita nova.

Mesmo com autorização, a primeira carga deve entrar como staging/dados base e
matrizes em `pending_review`, nunca como publicadas.

## O que não deve ser refeito

Não retomar como pendente:

- Fase 2.
- Migrations da Matriz de Impacto.
- Grants públicos/RLS base.
- Deploy Cloudflare do fechamento.
- Refresh TSE para 938 candidaturas.
- Investigação das 32 fotos pendentes.

## Riscos e cuidados

- `service_role` nunca em `VITE_*`, frontend, logs ou docs.
- Não ler `.env.local` salvo necessidade operacional explícita; nunca exibir valores.
- Não publicar matriz sem revisão humana.
- Não usar número histórico 69/212/464/792 como gate atual.
- OpenCode/Antigravity só recebem snapshot sanitizado do `HEAD`.
- Um writer por worktree.
- Se Codex MCP falhar por 401, registrar e continuar localmente ou pedir ajuste de ambiente; não mascarar como sucesso.

## Definition of Done do próximo arco

Um primeiro lote real estará pronto quando houver:

- dataset/fixture público versionado;
- catálogo real de apoio versionado ou documentado;
- `impact:dryrun` verde;
- `impact:sql` verde;
- testes relevantes verdes;
- handoff de revisão humana;
- nenhuma publicação automática;
- produção ainda saudável após eventual commit/deploy documental.
