# Handoff — Sincronização do Supabase `candidates` com snapshot público

Data: 2026-08-14
Status: `CANDIDATES_REMOTO_SINCRONIZADO_COM_SNAPSHOT_PUBLICO`
Arco: `eleicao2026-pos-fase2-matrizes-reais`

## Resumo

Após autorização de Lourenço para atualizar tudo, Hermes sincronizou o Supabase remoto
`tabela candidates` com o snapshot público versionado `data/public-candidates.json`.

A sincronização foi feita pelo script existente:

```bash
node scripts/sync-candidates-snapshot.mjs --apply
```

Também foi adicionado o atalho:

```bash
npm run data:sync:supabase -- --apply
```

Lourenço não escreveu manualmente no Supabase. Hermes executou e validou.

## Escrita remota executada

Tabela:

- `candidates`

Estratégia:

- upsert idempotente por `tse_candidate_id`;
- payload sem `id`, preservando UUIDs existentes e FKs;
- snapshot público como fonte;
- sem tocar em `claims`, matrizes, revisões ou publicações.

Resultado do dry-run antes do apply:

```text
Snapshot: 938 candidaturas
No banco: 794 | a criar: 145 | a atualizar: 793 | só no banco (fora do snapshot): 1
```

Resultado do apply:

```text
✅ 938 candidaturas sincronizadas (upsert por tse_candidate_id).
criadas: 145 | atualizadas: 793
fora do snapshot, não removido: 210002533050
```

## Validação remota

Consulta Supabase:

```text
total_candidates: 939
has_marcel: 1
```

Comparação via REST anon contra o snapshot público:

```json
{
  "snapshot": 938,
  "remote": 939,
  "missing_from_remote": 0,
  "extra_in_remote": 1,
  "extra_in_remote_ids": ["210002533050"]
}
```

O extra `210002533050` já era registro fora do snapshot público e não foi removido por
segurança; o script não faz deletes.

## Matriz/impacto

Nenhuma matriz foi alterada.

Estado da primeira matriz real permanece:

```text
impact_matrices.id: 4c8eaec1-8ee4-4027-939c-2d391b8f9cbe
review_status: pending_review
approved_at: NULL
```

## Arquivos versionados atualizados

- `package.json` — adiciona `data:sync:supabase`.
- `.orchestrator/STATE.md` — checkpoint operacional.
- `docs/index.md` — link deste handoff.

## Próximo passo recomendado

1. Manter `210002533050` como registro remoto histórico não público até decisão específica.
2. Seguir para gate de revisão humana da matriz `4c8eaec1-8ee4-4027-939c-2d391b8f9cbe`.
3. Aprovação/publicação continua exigindo autorização separada.
