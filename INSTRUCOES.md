# Instrução de Frontend — Lista de Candidatos por Cargo

Template pronto para a página inicial do PWA: candidatos agrupados por cargo, cada card com foto, resumo e link para o dossiê — e toda informação com sua referência de fonte visível, priorizando fontes oficiais/institucionais.

---

## 0. Antes de começar — alteração de schema

Aplicar `migration_candidate_photos.sql` (neste pacote): adiciona `photo_url` e `photo_source_url` a `candidates`, e formaliza a convenção de que o resumo do candidato é uma `claim` com `category = 'summary'` — reaproveita o pipeline de verificação/fonte já existente em vez de criar um campo solto sem proveniência.

```bash
supabase migration new candidate_photos
# cole o conteúdo de migration_candidate_photos.sql
supabase db push
```

---

## 1. Decisões de design (por que essas escolhas)

**Paleta** — institucional, sem cair no clichê de cream+terracota nem no dark+neon genérico de UI gerada por IA:

| Token | Hex | Uso |
|---|---|---|
| `--color-paper` | `#F5F6F1` | fundo |
| `--color-ink` | `#1C2321` | texto |
| `--color-institutional` | `#2B4C3F` | fonte **oficial**, ações primárias |
| `--color-press` | `#3E5C76` | fonte **imprensa** |
| `--color-factcheck` | `#8B5E3C` | fonte **checagem de fatos** |
| `--color-unverified` | `#8A8A83` | fonte **outra** / não confirmado |

**Tipografia** — três papéis, não dois: um serifado para títulos (registro de documento oficial), um sans neutro para o corpo, e **monoespaçado só para metadados de citação** (nome da fonte, data, score) — isso separa visualmente "isto é prosa" de "isto é um dado citável", que é o próprio ponto do produto.

```css
--font-display: 'Lora', serif;
--font-body: 'IBM Plex Sans', system-ui, sans-serif;
--font-mono: 'IBM Plex Mono', ui-monospace, monospace;
```

**Layout** — seções por cargo empilhadas com divisor simples (hairline), sem numeração (01/02/03) porque cargo não é uma sequência, é uma categoria.

**Elemento-assinatura** — o selo `SourceReference`: é a única peça com cor saturada na página; todo o resto fica comedido de propósito, porque é nele que a pessoa decide se confia na informação.

---

## 2. Onde colocar cada arquivo

```
apps/web/src/
├── theme.css                       ← importar 1x em main.tsx
├── types.ts
├── lib/
│   └── queries.ts                  ← usa lib/supabase.ts (Tarefa C1)
├── components/
│   ├── SourceReference.tsx
│   ├── CandidateCard.tsx
│   └── CargoSection.tsx
└── pages/
    └── CandidateListPage.tsx
```

Em `main.tsx`, adicionar: `import './theme.css';`

---

## 3. Como a referência de fonte funciona

`SourceReference` renderiza, para qualquer informação: **categoria da fonte** (oficial / imprensa / checagem de fatos / outra) com cor própria, **nível de confiança** calculado (nunca autoatribuído — vem do `confidence_score` já calculado no backend, ver `architecture-v2.md` §6), e **nome + data de coleta**, sempre com link clicável até a fonte original quando existir URL. Fonte oficial usa a cor institucional (verde) — é a única categoria com destaque visual reforçado, de propósito, para que "governamental/instituto reconhecido" salte aos olhos sem precisar ler o texto.

Isso vale para **qualquer** claim, não só o resumo — o mesmo componente é reaproveitado na página de dossiê individual (Fase 1+).

---

## 4. Nota sobre as fotos

`photo_url` deve vir de fonte oficial sempre que possível (candidatura registrada no TSE costuma ter foto oficial associada). **O endpoint exato de fotos no catálogo de dados abertos do TSE muda a cada pleito e precisa ser confirmado na hora da implementação** — mesmo cuidado já sinalizado para o conector TSE em `plano-implementacao-fase0.md`. Guardar sempre `photo_source_url` junto, para o crédito ficar visível no card (link "fonte da foto"). Sem foto oficial disponível: usar `/placeholder-candidate.svg`, nunca deixar o layout quebrar.

---

## 5. Critérios de aceite

- [ ] Cada card mostra foto (ou placeholder), nome, partido, número, resumo (quando existir) e link para o dossiê
- [ ] Toda informação de resumo exibe `SourceReference` com categoria de fonte visível
- [ ] Fonte oficial se distingue visualmente das demais (cor institucional)
- [ ] Seção de um cargo só aparece se houver ao menos 1 candidato com dado publicado
- [ ] Candidato sem resumo publicado ainda: card funciona normalmente, sem área vazia "quebrada"
- [ ] Foco de teclado visível em todo link/card (`:focus-visible`, já incluso em `theme.css`)
- [ ] Responsivo: 1 coluna no mobile, grid no desktop

---

## 6. Importante — isto não é um atalho de conteúdo

`summary` só aparece no card quando existir uma `claim` com `category='summary'` e `status='published'` — ou seja, já passou pelo pipeline de fonte/score, e por reputação/escrutínio, pela fila editorial (Fase 2). Não criar nenhum caminho que gere ou publique resumo direto no frontend só para a home não ficar vazia — isso reabriria exatamente o problema que a v2 foi desenhada para fechar.
