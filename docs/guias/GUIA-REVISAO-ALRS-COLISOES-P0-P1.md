# Guia de revisão ALRS — colisões, P0/P1, aprovação e score/fan-out

**Projeto:** Portal Transparência Eleitoral RS (`Snerolino/eleicao2026`)  
**Produção:** https://rs.votopraquem.org  
**Unidade editorial:** `proposition_version`  
**Estado do guia:** iniciado em 2026-09-12  
**Modo padrão:** read-only / fail-closed

> Este guia não substitui `AGENTS.md`, migrations, schemas, RPCs ou o código atual.
> Em caso de divergência, o código e os contratos versionados prevalecem.

## 1. Objetivo

Finalizar a revisão editorial ALRS sem transformar autoria, ementa, tramitação ou
voto factual em score automaticamente.

Fluxo obrigatório:

```text
fonte oficial
→ manifesto com bytes/SHA
→ identidade da proposition_version
→ resolução de colisão/evento
→ disposição editorial
→ assessment causal + red-team
→ matriz pending_review
→ aprovação autenticada
→ fan-out idempotente
→ score/profile recalculation
→ release verificada
```

A matriz pertence à versão votada e é reutilizada para todos os votantes ligados
ao evento. Não criar matriz local por candidato nem matrizes paralelas por casa.

## 2. Estado operacional atual

Snapshot/filas atuais:

- candidaturas públicas: `1003`;
- versões ALRS na fila de impacto: `1281`;
- votos factuais na fila: `4000`;
- linhas nominais ALRS reconciliadas: `44054/44054`;
- recuperação de score: `152` itens;
  - `87` sem binding de evento;
  - `65` compostos não separáveis;
- fila prioritária: `30` P0 + `82` P1;
- lane exclusiva: `alrs-exclusive-editorial-lane-v1.json`;
- disposição P2 externa aplicada: `15/15`, com read-back e segunda execução idempotente;
- PL-43/2019 e PL-27/2024: matrizes remotas existentes preservadas;
- PL-377/2023: proposta `assess` para `servidores_publicos`, mas
  `event_defending_vote=null` até confirmação da versão/emenda CCJ;
- nenhum fan-out ou score novo deve ser presumido como publicado sem read-back.

## 3. Colisões de `version_key`

Inventário atual:

- `18` collision keys;
- `65` proposition versions afetadas;
- `93` eventos afetados;
- `8` hipóteses `same_text_multiple_events_possible`;
- `10` hipóteses `version_identity_mismatch_possible`.

Arquivos:

```text
data/legislative-import/alrs/version-key-collision-audit-v1.json
data/legislative-import/alrs/version-key-collision-resolution-pack-v1.json
data/legislative-import/alrs/version-key-collision-resolutions-confirmed.json
```

### Regra de resolução

Para cada colisão, exigir:

- proposition/version oficial;
- evento oficial distinto, quando aplicável;
- título e texto oficial;
- hash do documento;
- data do evento;
- identificação nominal correspondente;
- nenhuma aproximação por nome, data isolada ou similaridade.

Decisões possíveis:

```text
resolve_as_distinct_event
resolve_identity_mismatch
excluded
```

Até a resolução, manter:

```json
{
  "remote_apply": false,
  "score_eligible": false,
  "public_approval": false
}
```

## 4. Fila P0/P1

Fonte canônica:

```text
data/legislative-import/alrs/impact-review-priority-p0-p1.json
```

Totais:

- P0: `30` versões;
- P1: `82` versões;
- votos factuais associados: `671`.

A lane exclusiva exclui itens já resolvidos e colisões ainda bloqueadas. O
builder produz batches de até 25 itens, ordenados por:

```text
prioridade
→ candidate_count × factual_vote_count
→ review_key
```

Comando:

```bash
npm run impact:alrs:exclusive-lane
```

Saída:

```text
data/legislative-import/alrs/alrs-exclusive-editorial-lane-v1.json
```

Invariantes obrigatórias:

- `proposition_version_id` único;
- `review_key` único;
- cardinalidade exata;
- `remote_apply=false`;
- `public_approval=false`;
- segunda execução byte-for-byte idêntica.

## 5. Disposições editoriais

Cada versão recebe exatamente uma disposição:

```text
assess
no_direct_population_group
taxonomy_gap
excluded
```

### `assess`

Exige assessment completo:

```text
group_slug
impact_direction
defending_vote
severity
structural_type
confidence
rationale >= 20 caracteres
source linkage
```

Se a versão tiver voto textual, mas o evento nominal/versão da emenda ainda não
estiver confirmado, manter separado:

```text
textual_defending_vote = sim/nao
 event_defending_vote = null
 score_eligible = false
```

### Disposições terminais

`no_direct_population_group`, `taxonomy_gap` e `excluded` encerram a análise
populacional daquela versão e não criam matriz vazia.

## 6. Contrato JSON para o revisor externo

Envelope:

```json
{
  "batch_id": "...",
  "batch_sha256": "...",
  "items": [
    {
      "proposition_version_id": "...",
      "review_key": "...",
      "decision": "approved",
      "disposition": "assess",
      "rationale": "justificativa editorial"
    }
  ]
}
```

Validações fail-closed:

- `batch_id` exato;
- hash canônico exato;
- cardinalidade exata;
- IDs exatos e sem duplicatas;
- `review_key` exato;
- disposição válida;
- rationale suficiente;
- nenhuma decisão desconhecida.

O pacote atual do revisor pendente está em:

```text
data/legislative-import/alrs/alrs-reviewer-pending-dispositions-v1.json
```

Ele contém a última fotografia conhecida de:

- `56` P0/P1 pendentes;
- `49` versões afetadas por colisões sem disposição.

## 7. Apply autenticado

Pré-requisitos:

- Supabase Auth válido;
- usuário em `editor_roles` com `editor` ou `admin`;
- RPC disponível;
- batch validado localmente.

Interface:

```text
https://rs.votopraquem.org/admin
```

RPCs de disposição:

```text
record_impact_editorial_disposition
record_impact_editorial_exception
```

O fluxo implementado no Admin e no writer CLI é:

```text
read existing
→ apply somente divergências
→ read-back exato
→ segunda passagem
→ zero novas RPCs quando já idêntico
```

A disposição aplicada não aprova matriz e não publica score.

## 8. Matriz e score

Somente depois da disposição e assessment completos:

1. criar/reusar matriz para a `proposition_version`;
2. manter `review_status='pending_review'`;
3. vincular fontes por `content_hash` real;
4. aprovar por RPC autenticada/editorial;
5. fazer fan-out aos votos/candidatos ligados;
6. recalcular perfis por `(candidate_id, house)`;
7. repetir dry-run e exigir zero novos efeitos indevidos;
8. validar produção por SHA.

Nunca aplicar score diretamente a partir da disposição `assess`.

## 9. Geração de matriz pending_review

Para assessments completos, preferir a RPC protegida:

```text
record_impact_assessment_draft
```

Contrato mínimo:

- metodologia `1.0.0`;
- severidade 1–5;
- tipo `structural|budgetary|symbolic`;
- direção válida;
- defending vote compatível;
- confidence entre 0 e 1;
- rationale >= 20 caracteres;
- `source_content_hash` existente.

A saída esperada é matriz/assessment em `pending_review`, nunca aprovação automática.

## 10. Gates de encerramento

```bash
npm run test -- --passWithNoTests
npx tsc --noEmit
node scripts/validate-impact-schema.mjs
npm run data:check
npm run build
git diff --check
npm run smoke:local
```

Após publicação:

```bash
curl -sS https://rs.votopraquem.org/release.json
curl -sS -o /dev/null -w 'HTTP %{http_code}\n' https://rs.votopraquem.org
```

Exigir:

- `HEAD == origin/main`;
- `release.json.sha == HEAD`;
- HTTP 200;
- backup Cloudflare success quando o primário falhar/cancelar;
- read-back remoto exato;
- segunda execução idempotente.

## 11. Métricas para declarar avanço real

Nunca chamar monitor `no_change` de avanço.

Reportar separadamente:

```text
versões ALRS na fila
versões P0/P1
colisões abertas/resolvidas
votos nominais reconciliados
disposições remotas aprovadas
matrizes pending_review
matrizes approved
scores/fan-out publicados
perfis efetivamente alterados
```

Uma disposição `approved` não significa que score/fan-out foi publicado.

## 12. Bloqueios atuais

- As colisões sem resolução oficial continuam fora do score.
- P0/P1 sem disposição não entram no apply plan.
- `public_approval=false` e `remote_apply=false` permanecem obrigatórios até
  cada gate correspondente.
- O doctor pode permanecer com warning E2E Codex sem impedir a lane ALRS; isso
  deve ser reportado, nunca mascarado.
