# Operação atual para revisores — eleicao2026

**Projeto:** Portal Transparência Eleitoral RS
**Repositório:** `Snerolino/eleicao2026`
**Produção:** <https://rs.votopraquem.org>
**Última revisão:** 2026-09-27
**Control plane:** Hermes

> Este é o resumo operacional atual. Código, migrations, schemas e leituras remotas
> verificadas têm precedência sobre qualquer documento. Números deste arquivo são
> snapshots datados; revalide antes de uma decisão editorial ou mutação remota.

## 1. Estado confirmado

### Portal público

- versão pública validada: `0.2.1407`;
- snapshot versionado: `1003` candidaturas;
- build público: `1005` URLs e `988` fotos oficiais rastreáveis;
- produção e `/admin`: HTTP 200 na última verificação;
- o painel administrativo continua protegido por Supabase Auth e papel editorial.

### ALRS — inventário remoto somente leitura

Fonte: `data/legislative-import/alrs/alrs-live-state-v1.json`, gerado em
`2026-09-26T09:20:02.500Z`, com auditoria `remote_apply=false`.

| Métrica | Valor |
|---|---:|
| eventos | 2.281 |
| votos nominais | 31.722 |
| candidatos/perfis ALRS | 52 |
| eventos sem `source_reference_id` | 1.365 |
| assessments | 66 |
| matrizes aprovadas/contestadas | 64 |
| disposições aprovadas | 1.179 |
| disposições `needs_changes` | 24 |
| atribuições evento–assessment v2 | 0 |
| atribuições v2 elegíveis para score | 0 |

O número de avaliações/matrizes não deve ser interpretado como score novo. A
cadeia v2 continua bloqueada sem vínculo do evento, fonte substantiva, assessment,
matriz e revisão exigidos.

### Recuperação de fontes ALRS

- inventário evento × assessment: `114` itens;
- estado do inventário: `114` `withheld_source`, `0` prontos para liberação;
- aquisição: `24` URLs únicas, `16` HTTP válidas e `8` bloqueadas;
- microbatch: `12` eventos elegíveis, `5` selecionados;
- status: `pending_source_recovery`;
- os cinco itens ainda exigem `version_source_reference_id`, vínculo inequívoco ao
  objeto votado, classificação do evento e revisão humana;
- `remote_apply=false` e `public_approval=false` permanecem obrigatórios.

Outros bloqueios locais: `18` chaves de colisão, `65` versões e `93` eventos
afetados; recuperação de score com `152` itens (`87` sem vínculo de evento e
`65` compostos não separáveis). Falhas de fonte continuam sendo `unknown`, nunca
zero ou voto inferido.

## 2. O que a tela `/admin` representa

### Leituras atuais

O painel de acompanhamento consulta o Supabase em tempo real e separa:

- eventos, votos e perfis por casa legislativa;
- fila editorial compartilhada;
- snapshot ALRS versionado e somente leitura;
- histórico de lotes editoriais.

As contagens por casa cobrem todos os anos materializados naquela casa. O recorte
ALRS 2022–presente é mostrado em bloco separado para não misturar uma leitura
remota geral com um inventário local datado.

### Filas e histórico

A manifestação editorial de lotes é histórica e não equivale a uma fila ativa.
O manifesto atual informa `1281` versões de entrada em `6` lotes (`5` P0, `12`
P1, `98` P2 e `26` P3). A auditoria do universo remoto/local informa, em leitura
separada, `1261` versões pendentes de entrada, `141` prontas para disposição,
`62` bloqueadas por colisão e `1058` já resolvidas. A diferença entre os dois
números deve ser reconciliada por auditoria; não deve ser escondida nem tratada
como nova pendência.

O painel não deve apresentar workers, partições, sobreposição ou “lotes
congelados” como se fossem trabalho editorial atual. Esses dados pertencem ao
runtime/QA e só devem aparecer em relatório técnico quando orientarem uma ação.

### Claims

- `pending_review` é fila ativa e não deve ser chamada de arquivo ou arquivada;
- uma claim com decisão registrada continua distinguível de uma claim publicada;
- publicar exige fonte, revisão editorial e `publish_claim()` autenticada;
- ausência de claims pendentes não significa que todo o pipeline esteja concluído.

### Impacto

- disposição editorial não publica voto, matriz ou score;
- `assess` abre revisão posterior e não publica score;
- matriz com severidade alta ou confiança baixa exige revisão externa registrada;
- somente matriz aprovada pela RPC apropriada pode alimentar score/fan-out;
- ausência de fonte, objeto votado, `defending_vote` ou revisão mantém o item fora
  do score.

## 3. Segurança e autoridade de escrita

O navegador não recebe service role, senha, token, cookie, JWT ou connection
string. O fluxo autorizado é:

```text
Supabase Auth → editor_roles → RLS/RPC → read-back remoto → atualização da fila
```

Não usar SQL direto, service role ou escrita fora das políticas RLS. A migration
local `20260913193000_harden_alrs_editorial_batch_apply.sql` e a RPC de lote são
artefatos versionados; sua aplicação remota exige gate explícito e verificação
independente. Nenhum artefato `remote_apply=false` pode ser descrito como
publicado.

Regra obrigatória de segurança:

> Credenciais, tokens, senhas, chaves, PINs, cookies, JWTs e connection strings
> não devem aparecer em arquivos versionados, logs ou relatórios; qualquer valor
> sensível deve ser substituído por `[REDACTED]`.

## 4. Planejamentos de implementação encontrados

### Plano ALRS de 2026-09-13

Arquivo: `.hermes/plans/2026-09-13_192009-resolver-fail-closed-disposicoes-alrs.md`.

Classificação: **parcialmente executado e ainda útil apenas como histórico/roadmap**.

- implementados no repositório: auditoria do universo, contrato de lote, lotes
  canônicos, workers read-only, consolidação, integração do `/admin`, migration/RPC
  transacional local e apply autenticado com read-back/idempotência;
- ainda não concluídos: fila derivada de assessment, writer autenticado de matriz
  `pending_review`, aprovação/fan-out v2 completo, rollout remoto em ondas e
  fechamento de produção;
- a baseline original do plano (`1261`, `1199`, hashes e estados antigos) não é
  fonte atual e não deve ser copiada para o painel.

O plano permanece versionado para auditoria, mas este documento e os artefatos
atuais são a referência para o próximo gate.

### Plano de propagação de 2026-08-30

Arquivo: `.hermes/plans/2026-08-30_073800-propagacao-materias-legislativas.md`.

Classificação: **não iniciado como implementação independente**. Não existem no
código atual os módulos `propagationMetrics`, `computePropagationMetrics` ou
`report-propagation-metrics` descritos no plano. A ideia continua pertinente,
mas deve ser reespecificada depois que a cadeia v2 tiver atribuições elegíveis;
não criar métricas ou fan-out com a baseline antiga do documento.

## 5. Gates atuais

Antes de publicar código:

```bash
npm run test -- --passWithNoTests
npx tsc --noEmit
node scripts/validate-impact-schema.mjs
npm run data:check
npm run build
git diff --check
npm run smoke:local
```

Para o estado ALRS, em modo read-only:

```bash
npm run alrs:editorial:audit
npm run impact:alrs:live-state
node scripts/build-alrs-editorial-batches.mjs --verify
```

A publicação normal exige `commit → push → CI/deploy → headSha confirmado →
HTTP 200 → smoke/health`. Migrations Supabase, RLS, Auth, Storage e RPCs remotas
não são aplicadas sem autorização separada.

## 6. Próximas ações seguras

1. Recuperar e vincular fontes dos cinco itens do microbatch.
2. Classificar cada evento e confirmar o objeto efetivamente votado.
3. Executar revisão humana independente; não criar score v2 antes disso.
4. Reconciliar a diferença entre manifesto histórico e auditoria atual da fila.
5. Só depois avaliar a fila de assessment e o fan-out, mantendo a matriz única por
   `proposition_version`.
6. Não reabrir lotes encerrados por falhas de leitura remota e não misturar ALRS,
   Câmara e Senado.

## 7. Referências atuais

- `src/pages/AdminPage.tsx`
- `src/components/admin/OperationalProgressPanel.tsx`
- `src/domain/impact/operationalProgress.ts`
- `data/legislative-import/alrs/alrs-live-state-v1.json`
- `data/legislative-import/alrs/alrs-attribution-source-recovery-microbatch-v1.json`
- `data/legislative-import/alrs/editorial-batches/manifest-v1.json`
- `docs/qa/2026-09-24-alrs-live-state.md`
- `docs/qa/revisao-documentacao-admin-2026-09-27.md`
- `.orchestrator/STATE.md`
