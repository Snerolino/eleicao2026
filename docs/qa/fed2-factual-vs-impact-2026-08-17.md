# QA — FED-2: fato legislativo separado de impacto

**Data:** 2026-08-17
**Status:** concluída localmente; publicação após CI

## Entregue

- `VotingProfile.profile_score` foi exposto no domínio público como
  `nominal_balance`, com comentário explícito de que é saldo descritivo.
- O serviço mantém compatibilidade com a coluna remota `profile_score`, mas
  normaliza o contrato frontend para `nominal_balance`.
- Criado `src/domain/impact/factual-vote.ts`.
- `interpretFactualVote` só deriva alinhamento quando recebe assessment
  metodológico; sem assessment retorna `alignment: null`.
- A UI do dossiê informa que saldo nominal não é avaliação política.
- A metodologia pública documenta as duas camadas: registro factual e Matriz
  de Impacto.

## Salvaguardas verificadas

- `sim` sem assessment permanece factual e `nao_avaliado`.
- `nao` só gera alinhamento com `defending_vote` explícito.
- `unclear`/`defending_vote=null` gera `nao_avaliavel`.
- ausência sem registro não vira voto contrário nem score zero.
- `sem_dado` e `nao_avaliavel` permanecem excluídos do score agregado.
- Nenhuma matriz nova foi criada, aprovada ou publicada automaticamente.
- Nenhuma migration ou alteração remota foi necessária.

## Testes focados

- 5 arquivos de teste.
- 59 testes passando.
- Inclui contrato de fato, alinhamento, score, persistência e serviço de perfis.

## Próximo passo

FED-2 está concluída. O próximo arco é FED-3: catálogo institucional
Câmara ↔ candidato TSE, com resolução determinística e identidades pendentes
explícitas.
