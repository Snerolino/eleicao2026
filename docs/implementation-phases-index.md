# Índice atual de fases — Matriz de Impacto Populacional

**Projeto:** Portal Transparência Eleitoral RS
**Última revisão:** 2026-09-27
**Unidade canônica:** uma matriz por `proposition_version`
**Fonte de verdade:** código, migrations, contratos, fontes oficiais e gates executados

> Este índice substitui os números históricos dos planos anteriores. Um estado
> `0` significa ausência comprovada na camada atual; `unknown`/`blocked` não deve
> ser convertido em zero editorial.

## 1. Estado resumido

| Fase | Estado atual | Evidência |
|---|---|---|
| R0 contrato, segurança e taxonomia | concluída | schemas, RLS, Auth e gates versionados |
| R1 fontes e identidade | operacional com bloqueios | auditoria ALRS e manifestos oficiais |
| R2 fatos nominais | operacional por casa | votos separados de impacto |
| R3 perfis e comparação factual | publicada | UI e snapshot público |
| R4 disposição editorial | infraestrutura pronta; decisão humana separada | auditoria, lotes, contrato e `/admin` |
| R5 assessment/matriz/score ALRS | bloqueada corretamente | `0` atribuições v2 elegíveis |
| propagação por matéria | não implementada como módulo atual | plano de 2026-08-30 preservado como proposta |

## 2. Contratos que não mudam

1. A matriz pertence à versão efetivamente votada (`proposition_version`), não à
   proposição genérica.
2. Fato nominal, fonte, assessment, matriz e score são camadas diferentes.
3. Os grupos populacionais seguem a coleção canônica fechada; não criar grupo
   genérico para preencher lacunas.
4. Impacto positivo/negativo exige `defending_vote` explícito.
5. Eventos compostos, colisões, fonte ausente e identidade ambígua ficam
   `blocked`/`unknown`.
6. Somente revisão humana autenticada e RPC protegida pode aprovar impacto.
7. Nenhuma ausência de cobertura vira score zero ou ranking negativo.

## 3. Estado atual por fase

### R0 — contrato e segurança

**Concluído.** O projeto mantém schema de impacto versionado, Auth/RLS, papéis
editoriais, separação de voto e impacto, `pending_review`, `remote_apply=false`
e proteção contra service role no navegador.

### R1 — fontes e identidade

**Operacional, com bloqueios explícitos.** O inventário ALRS atual tem `2281`
eventos e `31722` votos, mas `1365` eventos ainda não possuem
`source_reference_id`. Há `18` chaves de colisão afetando `65` versões e `93`
eventos. Não usar fuzzy matching, título aproximado ou identidade inferida.

### R2 — fatos legislativos nominais

**Operacional por casa.** Votos e eventos são contados separadamente para ALRS,
Câmara e Senado. A apresentação administrativa não agrega casas diferentes.

### R3 — perfis e comparação factual

**Publicado.** Perfis e comparação exibem fatos nominais por casa. `nominal_balance`
é estatística, não recomendação política. Quando não há avaliação populacional
aprovada, a UI informa cobertura insuficiente em vez de exibir zero artificial.

### R4 — disposição editorial

**Infraestrutura implementada; aplicação humana é outro gate.** O repositório
contém:

- auditoria do universo editorial;
- contrato canônico de lote e decisões;
- seis lotes ALRS versionados;
- workers read-only e consolidação sem aprovação;
- aplicação autenticada por RPC com validação, read-back e idempotência;
- painel `/admin` com autenticação e estado remoto.

Estado verificado em 2026-09-27:

```text
universo auditado: 1261 pendentes
prontas para disposição: 141
bloqueadas por colisão: 62
já resolvidas: 1058
não classificadas: 0
```

O manifesto histórico dos lotes contém `1281` versões (`5` P0, `12` P1,
`98` P2, `26` P3). A diferença para a auditoria corrente permanece uma
reconciliação documentada, não uma autorização para reabrir ou aplicar lotes.

### R5 — assessment, matriz e score ALRS

**Bloqueada corretamente.** O estado remoto lido em 2026-09-26 registra `66`
assessments, `64` matrizes aprovadas/contestadas, `0` atribuições
evento–assessment v2 e `0` atribuições elegíveis para score. Isso não autoriza
criar score a partir de direção presumida, autoria parlamentar ou matriz antiga.

O microbatch de recuperação factual selecionou cinco eventos, mas todos ainda
aguardam fonte da versão, vínculo ao objeto votado, classificação e revisão
humana. O pacote está em `pending_source_recovery`, com
`remote_apply=false` e `public_approval=false`.

### Propagação por matéria

**Ainda não implementada como camada independente.** O plano
`.hermes/plans/2026-08-30_073800-propagacao-materias-legislativas.md` descreve uma
proposta válida, mas seus módulos e métricas não existem no código atual. O plano
só deve ser retomado depois que existirem atribuições v2 elegíveis e contratos
atuais de fonte/assessment/matriz.

## 4. Planos de implementação revisados

### Plano ALRS de 2026-09-13

Parcialmente executado. Auditoria, contrato, lotes, workers, consolidação,
integração do Admin, migration/RPC local e apply autenticado foram incorporados.
Ainda pendem a fila derivada de assessment, o writer autenticado de matriz
`pending_review`, aprovação/fan-out v2 completo, rollout remoto em ondas e
verificação de produção. O baseline do plano é histórico.

### Plano de propagação de 2026-08-30

Proposta não iniciada como implementação independente. Mantida para futura
reformulação, sem importar os números históricos `111201`, `86`, `302`, `305` ou
`39` para o estado atual.

## 5. Próximos gates

1. Recuperar fontes e resolver o vínculo do objeto votado dos cinco eventos.
2. Classificar evento simples/composto e executar revisão humana independente.
3. Derivar assessment somente de disposição `assess` explicitamente aprovada.
4. Criar matriz `pending_review` via Auth/RPC, nunca via service role.
5. Aprovar matriz somente com fontes, reviews e `defending_vote` completos.
6. Recalcular fan-out/perfis idempotentemente e publicar apenas após read-back.
7. Só depois especificar a camada de métricas de propagação.

## 6. Gates locais de qualquer release

```bash
npm run test -- --passWithNoTests
npx tsc --noEmit
node scripts/validate-impact-schema.mjs
npm run data:check
npm run build
git diff --check
npm run smoke:local
```

Reconciliação ALRS read-only:

```bash
npm run alrs:editorial:audit
npm run impact:alrs:live-state
node scripts/build-alrs-editorial-batches.mjs --verify
```

Migrations, RPCs, RLS e dados remotos exigem autorização própria e verificação
por SHA/read-back. Publicação de código segue `commit → push → CI → deploy →
produção HTTP 200`.

## 7. Referências

- `docs/OPERACAO-ATUAL-PARA-REVISORES.md`
- `docs/qa/revisao-documentacao-admin-2026-09-27.md`
- `.orchestrator/STATE.md`
- `data/legislative-import/alrs/alrs-live-state-v1.json`
- `data/legislative-import/alrs/alrs-attribution-source-recovery-microbatch-v1.json`
- `data/legislative-import/alrs/editorial-batches/manifest-v1.json`
- `.hermes/plans/2026-09-13_192009-resolver-fail-closed-disposicoes-alrs.md`
- `.hermes/plans/2026-08-30_073800-propagacao-materias-legislativas.md`
