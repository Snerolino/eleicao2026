# QA — continuous ops recon — 2026-08-23 02:37Z

## Objetivo
Executar um tick bounded do control plane, mantendo reconhecimento oficial read-only e tentativa de publicação após os gates locais.

## Entregue e verificado
- Lock não bloqueante adquirido/liberado com `flock`.
- ALRS FED-17 residual em dry-run: `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- Câmara consultada exclusivamente pela API oficial em 8 janelas trimestrais (`2025-01-01` a `2026-12-31`, `--max-pages 1`): páginas `ok`, `blocked=null`; IDs oficiais foram apenas inventariados, sem reconciliação ou aplicação.
- Auditoria estrita de fontes executada em modo read-only; o comando retornou RC 2 por gaps reais, preservados na fila de recuperação.
- Tentativa de `git push origin main` repetida: RC 128, HTTP 403; nenhum workflow novo foi disparado.

## Estado dos dados
- Nenhuma candidatura, foto, voto, FK, claim ou source reference foi alterado.
- Cobertura auditada: versões ALRS 31/1282 com fonte, Câmara 34/37, Senado 0/112; eventos ALRS 31/1678, Câmara 34/36, Senado 0/188; votos ALRS 3996/4000, Câmara 550/552, Senado 0/455.
- Os quatro casos residuais Enio Carlos Terra seguem bloqueados sem ID oficial e fonte exata. Senado segue fail-closed sem envelope nominal/SHA verificável.

## Bloqueios reais
- Publicação bloqueada por permissão efetiva do transporte GitHub: remoto responde `Permission to Snerolino/eleicao2026.git denied to Snerolino` (HTTP 403), embora `gh api user` identifique `Snerolino`.
- Auditoria estrita permanece RC 2 pelos gaps documentados; não houve criação de evidência.
- Doctor continua degradado conforme checkpoint anterior (Node padrão/Codex MCP/OpenCode), sem impedir a recon read-only.

## Próximo passo
Retentar a identidade/permissão efetiva do GitHub e `main -> main`; somente após push aceito validar o workflow backup `334951434`, `headSha` e produção. Manter recon ALRS/Senado/Câmara fail-closed e seguir para o próximo tick sem escrita factual remota.
