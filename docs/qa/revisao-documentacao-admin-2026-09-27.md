# Revisão da documentação e da tela Admin — 2026-09-27

## Escopo

Revisão cruzada entre o painel Admin, código, contratos, snapshots ALRS,
manifestos editoriais, planos versionados e produção. A análise não aplicou
migration nem alterou dados remotos.

## Estado verificado

- `alrs:editorial:audit`: `1261` entradas pendentes, `141` prontas para
  disposição, `62` bloqueadas por colisão, `1058` já resolvidas, `0` não
  classificadas.
- `impact:alrs:live-state`: `2281` eventos, `31722` votos, `52` perfis,
  `1365` eventos sem fonte, `66` assessments, `64` matrizes
  aprovadas/contestadas, `0` atribuições v2 elegíveis para score.
- `build-alrs-editorial-batches --verify`: manifesto histórico de `1281`
  versões em `6` lotes, sem aplicação remota; `0` pendências no manifesto porque
  os lotes foram congelados e sua disposição é lida separadamente.
- microbatch de fontes: `12` elegíveis, `5` selecionados,
  `pending_source_recovery`, `remote_apply=false`, `public_approval=false`.
- tentativa do auditor v2 sem variáveis de conexão: bloqueada com código 2;
  nenhum fallback ou dado inventado foi usado.

## Decisões sobre o conteúdo da tela

### Manter

- leituras atuais do Supabase por casa legislativa;
- fila editorial compartilhada com estados explícitos;
- regras de Auth, RLS e RPC;
- separação entre fatos nominais, assessment, matriz e score;
- histórico dos lotes quando rotulado como histórico;
- snapshot ALRS somente leitura, com data de geração e bloqueios.

### Remover da apresentação principal

- workers editoriais, partições e sobreposição;
- worker autenticado “ativo” sem uma leitura verificável;
- rótulo “lotes congelados” sem distinguir histórico de fila;
- “arquivo de claims arquivadas” para itens que ainda precisam de decisão;
- frases que atribuem a fila compartilhada exclusivamente ao ALRS;
- qualquer texto que trate zero pendências como conclusão do pipeline.

### Corrigir ou melhorar

- trocar “escrita direta no Supabase” por proibição explícita de SQL direto,
  service role e escrita fora de RLS;
- mostrar `—` quando uma contagem remota está indisponível, nunca zero;
- confirmar por read-back remoto antes de retirar disposição ou claim da fila;
- distinguir “confirmado remotamente” de “confirmado nesta sessão”;
- apresentar `remote_apply=false`/`public_approval=false` nos pacotes locais;
- traduzir estados técnicos do microbatch sem perder o valor original no artefato;
- identificar contagens gerais por casa como todos os anos materializados e
  separar o snapshot ALRS 2022–presente.

## Planos encontrados e validade

| Arquivo | Classificação | Ação |
|---|---|---|
| `.hermes/plans/2026-09-13_192009-resolver-fail-closed-disposicoes-alrs.md` | Parcialmente executado; baseline antiga | Mantido como histórico/roadmap, com aviso de validade atualizado |
| `.hermes/plans/2026-08-30_073800-propagacao-materias-legislativas.md` | Proposta não implementada como módulos independentes | Mantido como proposta futura, sem usar seus números antigos |
| `.hermes/plans/2026-09-24_224005-alrs-fontes-atribuicoes-release-controlado.md` | Obsoleto e já removido | Nenhuma restauração |

Os planos não são fonte de estado operacional. O estado atual está em
`docs/OPERACAO-ATUAL-PARA-REVISORES.md`, neste relatório, nos contratos e nos
artefatos versionados gerados pelos comandos atuais.

## Vestígios tratados

- referências operacionais antigas de workers, partições, lotes e claims
  arquivadas foram removidas da tela e do documento operacional;
- artefatos temporários e plano local obsoleto já removidos anteriormente foram
  mantidos fora do commit;
- relatórios QA históricos foram preservados, pois continuam sendo evidência
  auditável, mas não são usados como estado atual;
- não foram removidos dados públicos, manifestos canônicos, migrations ou
  evidências necessárias para reconstrução.

## Gates executados

- `npm run alrs:editorial:audit` — aprovado;
- `npm run impact:alrs:live-state` — aprovado em modo read-only;
- `node scripts/build-alrs-editorial-batches.mjs --verify` — aprovado;
- a auditoria v2 sem configuração de conexão falhou fechada, sem efeitos;
- testes, TypeScript, build, smoke local e `git diff --check` devem ser executados
  novamente no gate de publicação após os documentos finais.

## Resultado editorial

A tela Admin deve responder à pergunta “o que exige decisão agora?” e não
reproduzir um inventário de workers ou históricos internos. A ausência de score
v2 é um bloqueio conhecido por fonte/atribuição, não uma conclusão negativa sobre
candidatos. Nenhuma disposição, matriz, atribuição ou score foi criado por esta
revisão documental.
