# QA — Execução do plano “soltar restrição ou projeto falha por falta de dados”

**Data:** 2026-08-30 (America/Sao_Paulo)
**Escopo:** itens 1, 2 e 3 do plano fornecido pelo usuário.

## Resultado executivo

O ciclo local foi executado até o limite permitido pela evidência versionada. O
pipeline terminou **fail-closed**: nenhuma votação procedimental, texto-base
composto ou destaque sem vínculo exato foi convertida em score individual.

O plano não pode ser considerado 100% concluído nos pontos que exigem dados de
DVS e 434 perfis federais, porque esses dados não estão presentes nos artefatos
atuais.

## Evidência dos itens

### Item 1 — fila federal

- Fila encontrada e processada: `30/30` decisões revisadas.
- Resultado atual: `1` matéria `assess` (PLP 41/2024), `19` sem grupo populacional
  direto, `1` gap de taxonomia e `9` procedimentais/excluídas.
- PLP 41/2024 já está no gabarito canônico com dois grupos (`mulheres` e
  `criancas_adolescentes_vulnerabilidade`), ambos `score_eligible=true` e
  `event_defending_vote=sim`.
- PL 3278/2021 não foi promovido: o evento disponível é explicitamente
  **Requerimento de Urgência (Art. 155 do RICD)**, não a votação do mérito de
  mobilidade urbana.
- PL 1743/2024 permanece `taxonomy_gap`; o evento disponível rejeita recurso
  contra parecer terminativo e não comprova o efeito setorial descrito no plano.

### Item 2 — DVS e destaques

- PEC 6/2019 está disponível apenas com os eventos globais 9002/9003; o
  gabarito mantém `compound_non_separable`, `score_eligible=false` e
  `event_defending_vote=null`.
- PLP 230/2025 está disponível como pacote/substitutivo composto; mantém
  `compound_non_separable`, `score_eligible=false` e
  `event_defending_vote=null`.
- Não há no repositório evento nominal isolado, versão vinculada ou fonte
  oficial versionada para os três DVS descritos no plano (professoras,
  mulheres e trabalhadores rurais). Portanto não foram criadas matérias,
  grupos, `defending_vote` ou scores sintéticos.

### Item 3 — reconciliação e snapshot

Comando executado:

```bash
node scripts/reconcile-all-alrs-and-federal-candidate-profiles.mjs
```

Resultado real:

- gabarito canônico carregado: `69` proposições aprovadas;
- candidatos com perfil nominal: `86`;
- candidatos com `category_scores`: `82`;
- snapshot público: `1003` candidaturas;
- fotos oficiais: `988`.

A reconciliação foi idempotente em relação ao snapshot: não houve alteração
semântica em `public-candidates.json` nem no gabarito.

## Gates executados

| Gate | Resultado |
|---|---:|
| `npm run test` | **491/491**, 117 arquivos |
| `npx tsc --noEmit` | **0** |
| `node scripts/validate-impact-schema.mjs` | **OK** |
| `npm run data:check` | **OK**, 1003 candidaturas / 988 fotos |
| `npm run build` | **OK**, 244 módulos; sitemap 1003 + 2 |
| `npm run smoke:local` | **OK**, 1002 cards, 0 falhas HTTP, 0 erros online, SW pronto |

## Bloqueio residual e próximo gate seguro

Para concluir a parte de DVS, é necessário adquirir e versionar, por fonte
oficial, para cada destaque: identificador do evento, versão/dispositivo exato,
URL, conteúdo/hash e votos nominais. Depois disso o evento pode ser adicionado
como unidade canônica e reconciliado novamente. Sem essa evidência, liberar a
restrição produziria pontuação inventada e violaria o contrato fail-closed.

O gate de 434 deputados federais também permanece limitado pela cobertura
nominal atualmente materializada (`86` candidatos com votos), não devendo ser
reportado como cobertura integral.
