# Handoff — Gate legislativo PLP 230/2025 bloqueado por candidato remoto ausente

Data: 2026-08-14
Status: `BLOQUEADO_SEM_INSERCAO_PARCIAL`
Arco: `eleicao2026-pos-fase2-matrizes-reais`
Commit base: `76122bf`

## Resumo

Após autorização de Lourenço, Hermes tentou executar o SQL factual legislativo
resolvido do pacote real `PLP 230/2025` / votação Câmara `2580259-24`.

A aplicação foi bloqueada pelo Supabase remoto por violação de FK em
`legislative_votes.candidate_id`, porque o candidato `MARCEL VAN HATTEM`
(`tse_candidate_id=210002547819`) existe no snapshot público versionado, mas ainda
não existe na tabela remota `candidates`.

Nenhuma matriz foi publicada. Nenhuma linha factual legislativa ficou inserida.

## Evidência do erro

Comando executado:

```bash
npx supabase db query --linked < /tmp/plp-230-legislative-import-resolved-sources.sql
```

Erro retornado pelo Supabase:

```text
ERROR: 23503: insert or update on table "legislative_votes" violates foreign key constraint "legislative_votes_candidate_id_fkey"
DETAIL: Key (candidate_id)=(abdfe5f9-52ab-561f-aec5-afe475423fb9) is not present in table "candidates".
```

## Verificação de não parcialidade

Depois do erro, Hermes consultou o remoto:

```sql
select 'legislative_propositions' as table_name, count(*)::int as count
from legislative_propositions
where house='camara'
  and external_id='camara-proposicao-2580259-plp-230-2025'
union all
select 'proposition_versions', count(*)::int
from proposition_versions pv
join legislative_propositions lp on lp.id=pv.proposition_id
where lp.house='camara'
  and lp.external_id='camara-proposicao-2580259-plp-230-2025'
union all
select 'voting_events', count(*)::int
from voting_events
where house='camara'
  and external_id='camara-votacao-2580259-24'
union all
select 'legislative_votes', count(*)::int
from legislative_votes lv
join voting_events ve on ve.id=lv.voting_event_id
where ve.house='camara'
  and ve.external_id='camara-votacao-2580259-24';
```

Resultado:

```text
legislative_propositions: 0
proposition_versions: 0
voting_events: 0
legislative_votes: 0
```

Ou seja: a tentativa não deixou pacote parcial.

## Diagnóstico da causa

Consulta remota:

```sql
select count(*)::int as total_candidates,
       count(*) filter (where tse_candidate_id is not null)::int as with_tse
from candidates;
```

Resultado:

```text
total_candidates: 793
with_tse: 793
```

Consulta específica:

```sql
select count(*)::int as has_marcel
from candidates
where tse_candidate_id='210002547819';
```

Resultado:

```text
has_marcel: 0
```

O snapshot público do frontend está mais novo (`938` candidaturas públicas), mas
a tabela remota `candidates` ainda está no estado anterior (`793`).

## Por que Hermes não forçou a inserção do voto

Alternativas inseguras rejeitadas:

- usar UUID do snapshot público como se fosse UUID remoto;
- inserir `legislative_votes` com `candidate_id = null`, perdendo vínculo eleitoral;
- fabricar `legislator_id`.

Regra mantida: não fabricar UUID e não gravar dado factual incompleto.

## Próximo gate seguro

Antes de reaplicar o SQL factual legislativo, é necessário garantir que o candidato
remoto exista. Opção recomendada:

1. Hermes resolve o candidato no snapshot público por `tse_candidate_id=210002547819`.
2. Hermes faz upsert remoto mínimo/idempotente desse candidato em `candidates`, por `tse_candidate_id`, preservando os campos públicos TSE necessários.
3. Hermes consulta o `id` remoto real retornado.
4. Hermes atualiza `data/legislative-import/camara/plp-230-2025-votacao-2580259-24-catalog.json` para usar o UUID remoto real em `legislatorsToCandidateId`/`candidateByIdentifier`.
5. Hermes regenera `/tmp/plp-230-legislative-import-resolved-sources.sql`.
6. Hermes reaplica o SQL factual legislativo.
7. Hermes valida:
   - `legislative_propositions = 1`
   - `proposition_versions = 1`
   - `voting_events = 1`
   - `legislative_votes = 1`
   - nenhuma `impact_matrix` publicada.

Lourenço não precisa escrever manualmente no Supabase; se autorizar o gate de
sincronização do candidato remoto, Hermes executa e valida.

## Estado atual

- `source_references`: já aplicadas e validadas.
- SQL legislativo factual: gerado e resolvido para fontes, mas bloqueado por
  candidato remoto ausente.
- Inserção factual legislativa: não aplicada.
- Matriz de impacto: nenhuma criada/publicada.
