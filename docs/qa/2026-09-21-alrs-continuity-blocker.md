# ALRS continuidade e gargalos — 2026-09-21

## Estado do supervisor

- cron `c4278be3a8a5` está habilitado, `every 5m`, `repeat=forever`, `no_agent=true`;
- lock `continuous-progress.lock`: livre;
- última execução registrada: `2026-09-21T15:28:46Z`, conclusão normal;
- quatro workers ALRS processaram `141/141` itens;
- disposições preparadas: `141/141`;
- aguardando decisão editorial externa: `141/141`;
- `remote_apply=false` nos workers de triagem.

Conclusão: o projeto não estava morto; a lane factual/triagem continuava executando. O avanço parou no gate editorial externo, corretamente, porque a triagem read-only não pode aprovar disposições, assessments ou matrizes.

## Gargalo crítico de impacto v2

A auditoria read-only `scripts/audit-impact-event-attribution-v2.mjs --dry-run` retornou:

- matrizes: `66`;
- assessments: `68`;
- eventos de votação: `132`;
- pares evento–assessment: `136`;
- votos indexados: `2.318`;
- eventos verificáveis para score: `0`;
- eventos retidos: `136`;
- candidatos afetados: `79`;
- versões com múltiplos eventos: `64`;
- máximo de eventos na mesma versão: `4`.

A migration local `20260920060000_create_impact_event_attributions_v2.sql` ainda não está aplicada no Supabase remoto. `supabase migration list` confirma `remote=""`, e a consulta REST retorna `PGRST205` para `impact_event_attributions_v2`.

Esse é o bloqueio estrutural que impede o avanço dos scores: a metodologia v2 está fail-closed e não permite reaproveitar atribuição textual da matéria como atribuição do evento. Não apliquei a migration remotamente porque esse é um gate de mutação Supabase separado e exige autorização explícita.

## Correção operacional

`continuous-progress-monitor.mjs` passou a incluir no fingerprint e no relatório:

- fila exclusiva ALRS;
- manifesto dos seis lotes;
- itens selecionados/dispostos pelos workers;
- itens aguardando decisão editorial externa.

A automação agora diferencia “tick executado sem mudança” de “fila preparada e bloqueada por gate externo”, evitando o falso diagnóstico de parada.

## Próximos gates

1. autorização explícita para aplicar a migration v2 remota;
2. verificar RPC/RLS e read-back da tabela nova;
3. construir atribuições por evento somente com fontes e revisão independente;
4. aprovar assessments/matrizes via `/admin` e RPCs;
5. materializar scores/perfis depois dos gates verdes;
6. publicar e validar produção.
