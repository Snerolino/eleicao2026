# Handoff — Gate factual PLP 230/2025 aplicado com sucesso

Data: 2026-08-14
Status: `SQL_FACTUAL_LEGISLATIVO_APLICADO_SEM_MATRIZ`
Arco: `eleicao2026-pos-fase2-matrizes-reais`
Commit base: `9e53e4e`

## Resumo

Após autorização explícita de Lourenço para executar todos os passos necessários
1–6, Hermes sincronizou o candidato remoto ausente, regenerou o SQL factual
legislativo com UUIDs reais e aplicou o pacote factual do `PLP 230/2025` / votação
Câmara `2580259-24`.

Lourenço não escreveu manualmente no Supabase. Hermes executou e validou.

Nenhuma matriz de impacto foi criada ou publicada.

## Escritas remotas executadas

### 1. Candidato remoto mínimo/idempotente

Tabela: `candidates`

Candidato:

- Nome: `MARCEL VAN HATTEM`
- `tse_candidate_id`: `210002547819`
- Cargo: `senador`
- Partido: `NOVO`
- UUID remoto: `abdfe5f9-52ab-561f-aec5-afe475423fb9`

Arquivo temporário executado:

- `/tmp/upsert-marcel-candidate.sql`
- SHA-256: `09eb739e18ee4df81c778f151353d46639f101ee2e8c62e69bbc668dea1c7b10`

Observação: upsert por `tse_candidate_id`; se a linha já existisse, não dependeria
de UUID fabricado.

### 2. Dados factuais legislativos

Tabelas:

- `legislative_propositions`
- `proposition_versions`
- `voting_events`
- `legislative_votes`

Arquivo temporário executado:

- `/tmp/plp-230-legislative-import-resolved-sources.sql`
- SHA-256: `665e473ef9e024ff0b1fbda1a94c43455d927d114c18354ac5b5b9dc7b3c30e2`

## Validação remota

Consulta de contagem do pacote:

```text
candidate: 1
legislative_propositions: 1
proposition_versions: 1
voting_events: 1
legislative_votes: 1
```

Consulta factual do voto:

```text
proposition: camara-proposicao-2580259-plp-230-2025
version_key: sbt-1-plen-2026-08-12
voting_event: camara-votacao-2580259-24
value: nao
candidate_id: abdfe5f9-52ab-561f-aec5-afe475423fb9
vote_source: https://dadosabertos.camara.leg.br/api/v2/votacoes/2580259-24/votos
```

Consulta de matrizes:

```text
impact_matrices_total: 0
impact_matrices_approved: 0
```

Total remoto atual de `candidates` depois do upsert mínimo:

```text
total_candidates: 794
```

O snapshot público estático continua com 938 candidaturas públicas. A sincronização
remota completa de candidatos segue fora deste gate; este bloco sincronizou apenas
o candidato necessário para manter a FK factual correta.

## O que NÃO foi feito

- Nenhuma `impact_matrix` criada.
- Nenhuma matriz aprovada/publicada.
- Nenhuma RPC de aprovação chamada.
- Nenhuma migration/RLS alterada.
- Nenhuma escrita manual exigida de Lourenço.

## Próximo passo recomendado

Agora o pacote factual existe no Supabase e pode sustentar a próxima etapa:

1. Planejar/criar a primeira `impact_matrix` real em `pending_review` para a versão
   `sbt-1-plen-2026-08-12`.
2. Associar fontes via `impact_assessment_sources`.
3. Manter revisão humana antes de qualquer aprovação/publicação.
4. Continuar sem exigir escrita manual de Lourenço; Hermes executa quando autorizado.
