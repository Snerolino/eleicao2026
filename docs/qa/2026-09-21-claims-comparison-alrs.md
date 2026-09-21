# Auditoria de claims, comparação e ALRS

## Claims

Consulta remota autenticada realizada em 2026-09-21:

- claims totais visíveis: 2.683;
- published: 2.650;
- pending_review: 33;
- archived: 0 — `archived` não é status previsto no schema de claims;
- as 33 pendentes têm revisão editorial `needs_changes`;
- as 33 não possuem `source_document_id` nem `source_url`.

Conclusão: nenhuma das claims arquivadas/ajustadas é publicável neste momento. Publicar sem fonte oficial violaria o gate fail-closed. Elas permanecem pendentes para correção de fonte e conteúdo, não são promovidas automaticamente.

## Comparação

A tabela de recorte factual por categoria agora mostra barras horizontais empilhadas:

- verde: sim;
- vermelho: não;
- cinza: abstenção/ausência/obstrução.

A barra representa volume relativo de votos em eventos comuns aprovados. O texto explicita que não é score nem ranking. O score de impacto continua separado da contagem factual.

## ALRS 2022–2026

Contagem remota por ano, baseada em `legislative_votes` com evento `house=alrs`:

| Ano | Votos | Eventos | Candidatos |
|---|---:|---:|---:|
| 2022 | 4.510 | 382 | 29 |
| 2023 | 7.372 | 362 | 50 |
| 2024 | 7.297 | 365 | 45 |
| 2025 | 7.593 | 421 | 45 |
| 2026 | 4.950 | 750 | 52 |
| Total | 31.722 | 2.280 | 52 distintos |

Status operacional remoto:

- voting_events total (todas as casas): 7.095;
- legislative_votes total (todas as casas): 110.707;
- perfis materializados: 87;
- matrizes: 66;
- assessments: 68.

Status do corpus ALRS versionado:

- descoberta: 48.020 itens;
- reconciliação nominal: 44.054/44.054;
- faltantes: 0;
- conflitos: 0;
- versões catalogadas: 1.647;
- fonte substantiva: 1.045 versões, 643 com gate verde;
- fila editorial exclusiva: 1.281 versões de entrada, 141 pendentes distribuídas em seis lotes.

A cobertura factual de votos está reconciliada, mas a cobertura editorial/impacto ainda não é total: há versões sem fonte substantiva verde, itens em revisão e uma fila de recuperação de score com 152 casos.
