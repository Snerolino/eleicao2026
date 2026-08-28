# QA — reconciliação nominal ALRS e isolamento de conflitos — 2026-08-28

## Objetivo

Retomar o tick contínuo após mudança no fingerprint de descoberta ALRS, reconciliar fatos nominais sem fuzzy matching e impedir que uma colisão de voto aborte um lote factual idempotente.

## Entregue e verificado

- Manifesto ALRS vigente com menos de 6 horas no início do tick; nova descoberta oficial não foi executada.
- Reconciliação read-only posterior confirmou `43.762` linhas, `36.590` versões resolvidas, `36.589` já presentes, `0` faltantes e `1` conflito factual.
- O conflito remanescente é isolado por candidato/versão/data, com valores divergentes `sim`/`nao`; não foi sobrescrito.
- Importador factual passou a deduplicar pela chave canônica do evento (candidato, versão, data-calendário), registrar `source_conflicts` e excluir conflitos de fonte do payload aplicável.
- O teste de perfil ALRS deixou de exigir a contagem histórica obsoleta `628` e mantém a verificação de perfil não vazio (`457/457` testes completos já verdes; teste direcionado `4/4`).
- Dry-run final do importador: `source_rows=0`, porque a reconciliação já refletiu a presença remota dos fatos seguros; o conflito permanece separado.
- Auditoria strict: gaps de fontes permanecem `1251/3/112` em versões, `1647/2/188` em eventos e `4/2/455` em votos (ALRS/Câmara/Senado); fail-closed, sem inventar fonte.
- Portal verificado: `published_verified`, HTTP 200 na raiz e em `/release.json`.

## Bloqueios reais

- Uma tentativa de apply durante o tick falhou por indisponibilidade de rede (`fetch failed`); em seguida a reconciliação read-only confirmou que os `1.092` fatos seguros já estavam presentes remotamente, sem atribuir a origem sem evidência.
- O conflito residual continua bloqueado por evidência oficial divergente.
- `git push`/deploy não foi executado neste tick: há alterações concorrentes externas não pertencentes a este lote no worktree (artefatos federais regenerados e migration `20260828100000_isolate_alrs_import_conflicts.sql` não rastreada). Não misturar nem sobrescrever esses artefatos sem reconciliação do writer.
- Doctor permanece RC 1 por shell Node 22 (projeto exige Node 24) e OpenCode ausente; gates do projeto foram executados diretamente e passaram quando aplicável.

## Próximo passo

Preservar o isolamento do único conflito, reconciliar o writer concorrente/migration remota e só então fechar commit/push. Manter fontes ausentes e o conflito em modo fail-closed.
