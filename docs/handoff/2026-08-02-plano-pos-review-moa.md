# Plano pós-review + MOA — Eleição 2026 RS

Data: 2026-08-02  
Fonte externa incorporada: `../dataset2026/review-eleicao2026-2026-08-02.md`  
Padrão operacional incorporado: `docs/templates/HERMES_OPENCODE_ROUTING.template.md`  
Produção: https://rs.votopraquem.org/  
Meta operacional: fechar RS até 2026-08-15.

## 1. Síntese executiva

O review muda o foco do projeto: o MVP técnico está operacional, mas o produto editorial ainda não cumpre a promessa central do dossiê.

Estado verificado em 2026-08-02 após correção das fotos:

| Área | Estado atual | Decisão |
|---|---:|---|
| Candidaturas públicas no snapshot | 212 | manter como base pública |
| Fotos oficiais/fallback TSE 2024 aplicadas | 72 | manter; revisar 139 sem match + 1 ambígua |
| Claims públicas ou pendentes no snapshot | 0 | prioridade máxima |
| Vulnerabilidades `npm audit --omit=dev --audit-level=moderate` | 2 moderadas em `react-router`/`react-router-dom` | corrigir antes do fechamento |
| E-mail público de contato | `lourencotesta@gmail.com` em `src/config.ts` | trocar por institucional |
| `/admin` | placeholder público, botões desabilitados | não adicionar função real sem Auth + `editor_roles` |
| CSP enforce | já ativo | validar sempre em preview Cloudflare real antes de mudança sensível |

Conclusão: daqui até 15/08, a frente principal é **cobertura editorial rastreável**, não infraestrutura.

## 2. Regra de trabalho Hermes + OpenCode neste ciclo

Usar o padrão MOA do template recém-criado:

- Hermes coordena contexto, memória, validação, decisões humanas e fechamento.
- OpenCode é braço funcional para leitura, diagnóstico, revisão e plano.
- Roteamento:
  - volume/leitura/plano: `google/gemini-flash-latest`;
  - triagem barata: `opencode/deepseek-v4-flash-free`;
  - revisão crítica: `openai/gpt-5.5`.
- OpenCode não executa automaticamente: patch mutável, Supabase remoto, Cloudflare, deploy, migrations, secrets, commit, push, PR ou merge.
- Qualquer operação sensível deve virar bloco próprio com confirmação humana explícita.

Registro desta incorporação:

| Data | Tarefa | Modelo | Status | Observação |
|---|---|---|---|---|
| 2026-08-02 | Sintetizar review + MOA em plano operacional | `google/gemini-flash-latest` via OpenCode Plan | sucesso | leitura/planejamento apenas; sem mutação pelo OpenCode |
| 2026-08-02 | Revisão crítica read-only de admin/login/editorial seed | `openai/gpt-5.5` via OpenCode Plan | sucesso parcial | advisory; apontou tipos Supabase defasados para `source_references`, corrigidos localmente; sem mutação pelo OpenCode; houve erro de stream não bloqueante e tentativa de leitura fora do escopo rejeitada |
| 2026-08-03 | Fechamento E0 após revisão humana no `/admin` | Hermes/local | sucesso | 6/6 majoritários com `historico_politico` + `plataforma` publicados; evidência em `docs/qa/e0-cobertura-majoritarios.md` |

## 3. Gates novos que substituem a visão puramente técnica

### Gate Editorial E0 — cobertura mínima majoritária

Status em 2026-08-03: **fechado em produção**. Evidência: `docs/qa/e0-cobertura-majoritarios.md`.

Antes de chamar o portal de “fechado para RS”, deve haver dossiê mínimo publicado para cargos majoritários:

- Governador: 1 candidatura.
- Vice-governador: 1 candidatura.
- Senador: 4 candidaturas.

Critério de aceite:

- 6/6 candidaturas majoritárias com pelo menos:
  - 1 claim `historico_politico` publicada;
  - 1 claim `plataforma` publicada;
  - cada claim com `source_document_id` válido;
  - revisão editorial aprovada;
  - publicação via workflow `pending_review → editorial_review → publish_claim()`.

### Gate Editorial E1 — sem bypass editorial

Nenhuma claim nova deve ser publicada diretamente com `status='published'` por script ou `service_role`.

Critério de aceite:

- scripts/specs usam `pending_review` por padrão;
- publicação somente via RPC transacional;
- evidência em teste ou relatório QA.

### Gate Dados D1 — fotos rastreáveis

O bloco de fotos já foi atualizado para 72 fotos oficiais/fallback TSE 2024, mas o review recomenda aumentar cobertura.

Critério de aceite até 15/08:

- manter 72 fotos já aplicadas;
- revisar manualmente `data/public-candidate-photo-matches.json` para:
  - 1 caso ambíguo;
  - 139 sem match;
- documentar por que candidatos restantes ficaram sem foto;
- não inventar foto nem usar fonte não rastreável.

### Gate Segurança S1 — dependências e superfície pública

Critério de aceite:

- `npm audit --omit=dev --audit-level=moderate` sem vulnerabilidade moderada acionável;
- `src/config.ts` usando `admin@votopraquem.org` ou outro contato institucional aprovado;
- `/admin` continua sem função mutável ou passa a exigir Supabase Auth + checagem de `editor_roles` antes de qualquer operação real.

## 4. Plano de execução até 15/08

### Bloco 1 — Corrigir contrato editorial antes de automatizar conteúdo

Objetivo: impedir que qualquer raspador ou carga futura contradiga o fluxo H4.2.

Arquivos prováveis:

- `docs/prompt-raspador-eventos.md`
- `scripts/ingest-data.mjs`
- `scripts/insert-fontes-oficiais.mjs`
- `scripts/editorial-workflow.mjs`
- `scripts/__tests__/h4-2-claims-workflow.test.mjs`
- `scripts/__tests__/editorial-workflow.test.mjs`

Passos:

1. Atualizar `docs/prompt-raspador-eventos.md` para trocar exemplo `status: "published"` por `status: "pending_review"`.
2. Deixar explícito que `raw_documents.raw_content` não é público e que `source_references` é a superfície pública de fonte.
3. Confirmar nos scripts existentes se qualquer inserção de claim nova pode publicar direto.
4. Se houver publicação direta, adicionar teste RED cobrindo bloqueio.
5. Ajustar script para gerar `pending_review` e depender de revisão/RPC.
6. Rodar:
   - `npm test -- scripts/__tests__/h4-2-claims-workflow.test.mjs scripts/__tests__/editorial-workflow.test.mjs`
   - `npm run data:check`

Gate de saída: nenhuma spec/script recomenda ou executa publicação direta de claim nova.

### Bloco 2 — Resolver débito técnico curto antes de conteúdo pesado

Objetivo: limpar riscos fáceis apontados no review.

Arquivos prováveis:

- `package.json`
- `package-lock.json`
- `src/config.ts`
- testes que validem contato público, se existirem ou forem criados.

Passos:

1. Rodar `npm audit --omit=dev --audit-level=moderate` e confirmar versões vulneráveis.
2. Aplicar `npm audit fix` ou bump controlado de `react-router-dom`/`react-router`.
3. Trocar `CONTACT_EMAIL` pessoal por `admin@votopraquem.org`, salvo nova decisão humana.
4. Rodar:
   - `npm audit --omit=dev --audit-level=moderate`
   - `npm test -- --passWithNoTests`
   - `npm run build`

Gate de saída: audit moderado verde e contato institucional em superfície pública.

### Bloco 3 — Produzir dossiê mínimo dos 6 majoritários

Objetivo: transformar o portal de lista TSE em dossiê editorial mínimo nos cargos mais visados.

Escopo inicial:

- 1 governador;
- 1 vice-governador;
- 4 senadores.

Categorias:

- `historico_politico`;
- `plataforma`.

Regras:

- pelo menos 1 fonte pública por claim;
- fonte rastreável em `source_references`/`source_document_id`;
- inserir como `pending_review`;
- publicar só após `editorial_reviews` aprovada e RPC `publish_claim()`;
- nada de `service_role` para contornar regra editorial.

Arquivos/scripts prováveis:

- `scripts/insert-fontes-oficiais.mjs`
- `scripts/editorial-workflow.mjs`
- `data/public-candidates.json` após refresh
- documentação QA nova em `docs/qa/`

Passos:

1. Extrair lista dos 6 majoritários do snapshot público.
2. Para cada candidatura, levantar fontes oficiais ou institucionais:
   - TSE;
   - Senado/Câmara/Assembleia, quando aplicável;
   - site oficial de campanha/partido;
   - imprensa consolidada apenas como apoio, não como fonte única para reputação sensível.
3. Criar lote de claims `pending_review`.
4. Rodar revisão editorial humana.
5. Publicar via RPC.
6. Atualizar snapshot público.
7. Rodar:
   - `npm run data:refresh`
   - `npm run data:check`
   - `npm run smoke:local`

Gate de saída: 6 dossiês majoritários visíveis na UI pública local.

### Bloco 4 — Expandir para deputados federais em exercício

Objetivo: aumentar substância sem tentar cobrir todos os 212 candidatos de uma vez.

Prioridade:

1. deputados federais candidatos à reeleição;
2. deputados estaduais em exercício;
3. demais candidaturas.

Categorias:

- começar por `historico_politico`;
- depois `plataforma`;
- deixar `reputacao` para casos com fonte robusta e revisão humana explícita.

Gate de saída: relatório de cobertura por cargo e categoria, mesmo que parcial.

### Bloco 5 — Fotos: revisão dos sem match

Objetivo: aumentar confiança visual sem quebrar rastreabilidade.

Arquivos:

- `data/public-candidate-photo-matches.json`
- `scripts/apply-official-candidate-photos.mjs`
- `docs/qa/fotos-candidatos-fontes-oficiais.md`

Passos:

1. Separar os 139 `unmatched` por cargo/partido.
2. Revisar o 1 caso `ambiguous` manualmente.
3. Verificar se falta metadado 2024 ou se o candidato não concorreu em 2024.
4. Só aplicar foto quando houver match conservador por nome/CPF/SQ quando disponível.
5. Documentar os restantes como “sem foto oficial publicável disponível”.

Gate de saída: relatório atualizado; nenhuma foto sem fonte TSE ou justificativa.

### Bloco 6 — CI/Cloudflare preview real para CSP

Objetivo: evitar que CSP/headers só sejam validados depois do merge em `main`.

Arquivos prováveis:

- `.github/workflows/deploy.yml`
- `.github/workflows/*`, se houver separação futura
- `public/_headers`
- `scripts/smoke-browser.mjs`
- `scripts/health-check.mjs`

Passos:

1. Criar/ajustar job de preview Cloudflare em PR ou branch não-main.
2. Capturar URL do Pages preview.
3. Rodar smoke contra URL real do Cloudflare, não só Vite local.
4. Manter deploy produção apenas em `main`.

Gate de saída: PRs validam CSP/headers em Cloudflare antes do merge.

## 5. Backlog priorizado consolidado

### P0 — fazer primeiro

1. Corrigir contrato editorial do raspador/spec para `pending_review`.
2. Corrigir vulnerabilidades moderadas `react-router`/`react-router-dom`.
3. Trocar contato público para institucional.
4. Criar carga editorial mínima dos 6 majoritários.
5. Publicar 6 dossiês via workflow editorial completo.

### P1 — fazer em seguida

6. Revisar 139 fotos sem match + 1 ambígua.
7. Expandir histórico/plataforma para deputados federais em exercício.
8. Adicionar relatório/gate de cobertura editorial mínima em checklist de release.
9. Implementar preview Cloudflare em PR para validar CSP.

### P2 — pós-fechamento ou conforme tempo

10. Auth real para `/admin` antes de qualquer função mutável.
11. Raspador de agenda implementado de fato, depois da correção da spec.
12. `reputacao` em lote apenas com revisão humana forte.
13. Consolidar indireções `sanitize.ts` → `sanitizeUrl.ts` → `url.ts`.
14. Automatizar monitoramento de fotos 2026 com `fetch-tse-photos.mjs`.

## 6. Comandos padrão de validação

Para blocos de dados/editorial:

```bash
npm run data:check
npm test -- scripts/__tests__/h4-2-claims-workflow.test.mjs scripts/__tests__/editorial-workflow.test.mjs
npm run smoke:local
```

Para bloco técnico geral:

```bash
npm audit --omit=dev --audit-level=moderate
npm test -- --passWithNoTests
npm run build
```

Para fechamento/deploy, somente após autorização humana explícita:

```bash
npm run build
npx wrangler pages deploy dist --project-name=portal-transparencia-rs --branch=main
npm run smoke:preview -- --url https://rs.votopraquem.org/
npm run health:preview -- --url https://rs.votopraquem.org/
```

## 7. Critério de fechamento em 15/08

O projeto pode ser considerado fechado para RS quando:

- build, smoke e health estiverem verdes em produção;
- 6/6 candidaturas majoritárias tiverem dossiê mínimo publicado;
- não houver claims publicadas sem fonte pública e revisão;
- o checklist de release registrar cobertura editorial, não só infraestrutura;
- pendências restantes estiverem explicitamente marcadas como “em levantamento” ou backlog pós-MVP;
- nenhuma operação sensível tiver sido feita por bypass de `service_role`, secret no frontend ou deploy não validado.

## 8. Próxima ação recomendada

Abrir um bloco pequeno para o **P0.1 — contrato editorial do raspador + audit/contact**:

1. corrigir `docs/prompt-raspador-eventos.md`;
2. resolver `react-router`/`react-router-dom`;
3. trocar `CONTACT_EMAIL` para `admin@votopraquem.org`;
4. validar com audit, testes e build;
5. só então começar carga dos 6 majoritários.
