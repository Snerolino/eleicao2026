# QA — Lote: Índice de Perfil por Votação + Importador de Senadores

Data: 2026-08-16
Autor: Hermes (agente de implementação)
Status: INFRAESTRUTURA ENTREGUE · DADOS DE SENADOR PENDENTES DE FONTE OFICIAL

## Objetivo
Atender à diretriz: "criar indexação de votação para não precisar toda vez reavaliar
se o voto é positivo/negativo; documentos lidos uma vez e indexados para rapidez,
economia, limpeza e elegância de flow." E atualizar os votos dos senadores RS.

## O que foi entregue (verificado)

1. **Migration `20260816090000_legislator_vote_profile_index.sql`** (aplicada no Supabase remoto):
   - `legislator_vote_profile`: agregado por candidato (contagens sim/nao/abstencao/ausente/obstrucao + `profile_score` em [-1,1]).
   - `legislator_vote_index`: voto por evento já pontuado (`direction`: 1=sim, -1=nao, 0=neutro), para comparação rápida sem reavaliação.
   - RLS pública de leitura.

2. **`scripts/build-vote-profile.mjs`** — materializa o índice a partir de `legislative_votes`
   (ler uma vez). Idempotente (upsert). Testado: indexou o voto existente (1 voto → 1 perfil).

3. **`scripts/import-senator-votes.mjs`** — importador de votações de senadores RS.
   Consome envelope JSON (propositions/events/votes) com fonte oficial obrigatória,
   resolve candidato pelo `tse_candidate_id`, insere nas tabelas legislativas.

4. **Mecanismo de verificação de CLI** (lote anterior) reutilizável para validar qualquer
   saída de agente antes da entrega.

## Estado dos dados
- `legislative_votes` no banco: 1 voto (deputado, PLP 230/2025 — Câmara).
- Votos de SENADORES: 0 no banco.
- Índice materializado: 1 perfil (deputado), score calculado.

## Bloqueio (fonte oficial)
- API de dados abertos do Senado Federal NÃO respondeu neste ambiente (rede/SSL).
- `ANTIGRAVITY_API_KEY` NÃO está exportada na sessão atual → não foi possível gerar
  o lote via AGY.
- **Não foram fabricados votos de senadores sem fonte** (regra absoluta: sem fonte = boato).

## Próximo passo (quando a fonte chegar)
1. Disponibilizar `ANTIGRAVITY_API_KEY` OU fornecer JSON de votações oficiais do Senado.
2. `node scripts/import-senator-votes.mjs <arquivo.json> --apply`
3. `node scripts/build-vote-profile.mjs --apply` (reindexa incluindo senadores)
4. Documentar lote de senadores e publicar.

Prompt preparado em `.orchestrator/runtime/prompts/senator-votes-pt1.txt`.
