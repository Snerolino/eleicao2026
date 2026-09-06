# QA — aceleração da cobertura de votações ALRS — 2026-09-06

## Coleta oficial

- Fonte: Portal da Transparência ALRS — Votos em Plenário.
- Parlamentares encontrados: **55**.
- Páginas anuais consultadas: **440**.
- Páginas HTTP 200: **440**.
- Páginas com `data-item`: **324**.
- Registros brutos coletados: **48.020**.
- Correspondências exatas com candidatos do snapshot: **50**.
- Nomes sem correspondência exata: **5**.

## Reconciliação contra o banco

- Registros de fonte reconciliados: **43.762**.
- Candidatos resolvidos: **43.762**.
- Versões de proposição resolvidas: **43.762**.
- Já presentes exatamente: **43.761**.
- Faltantes seguros para importar: **0**.
- Ambíguos: **0**.
- Identidade bloqueada: **0**.
- Proposição bloqueada: **0**.
- Conflitos de valor: **1**.

## Conflito preservado

- Candidato: Vilmar Zanchin.
- Matéria/número: PL 246/2020.
- Data: 22/12/2020.
- Fonte oficial ALRS: `não` para o texto do projeto.
- Valor remoto existente: `sim`.
- Causa provável identificada na fonte: a mesma matéria/data também possui uma votação de preferência; a fonte ALRS não fornece um identificador de evento suficientemente discriminante no registro atualmente reconciliado.
- Decisão: não sobrescrever e não importar até resolver a identidade exata do evento.

## Estado do universo público

- Votos ALRS materializados no snapshot: **43.762**.
- Candidatos estaduais com perfil nominal: **50 de 521**.
- Votos pertinentes a grupos populacionais canônicos: **2.315**.
- Votos pontuados: **2.166**.
- Votos pertinentes ainda sem pontuação: **149**.

## Automação

- Supervisor contínuo acelerado para `every 5m`.
- Job de relatório horário permanece `every 60m`, pinado em `openai-codex/gpt-5.6-luna`.
- Fallback global permanece vazio; não há provider alternativo validado sem crédito/estável.
- Nenhuma escrita remota foi feita por esta coleta/reconciliação.

## Próximo passo

Resolver o conflito PL 246/2020 com uma chave de evento/matéria discriminante e iniciar o writer factual somente para linhas que passem identidade, fonte, dry-run e idempotência. Os cinco nomes sem correspondência exata permanecem pendentes de identidade, sem matching heurístico.

## Backfill dos votos sem fonte

O novo dry-run `npm run impact:alrs:missing-sources:backfill` reavaliou os 4 votos sem `source_reference` usando o manifesto oficial atual:

- aplicáveis: **0**;
- bloqueados: **4**;
- causa comum: candidato TSE `210002534312` (Enio Carlos Terra) não está no catálogo oficial atual usado para gerar a evidência;
- escrita remota: **0**.

Nenhum valor foi alterado sem identidade e fonte exatas.
