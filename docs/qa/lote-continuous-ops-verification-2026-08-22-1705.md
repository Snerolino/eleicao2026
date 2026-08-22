# Lote continuous-ops — verificação local e produção — 2026-08-22 17:05Z

## Objetivo
Executar o tick bounded do control plane, revalidar os gates locais, auditar cobertura de fontes e confirmar a produção sem promover fatos sem evidência.

## Entregue e verificado
- Lock não bloqueante `flock -n .orchestrator/runtime/locks/continuous-progress.lock` adquirido e liberado.
- Recon ALRS residual FED-17 em dry-run: `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- Auditoria regular de fontes: RC 0, read-only.
- Gates locais: 401 testes em 98 arquivos; TypeScript RC 0; schema RC 0; `data:check` RC 0 com 1.003 candidaturas e 988 fotos; build RC 0 com sitemap de 1.005 URLs e `release.json` local `ddeaac4-20260822T170510507Z`; `git diff --check` RC 0.
- Produção: raiz HTTP 200 e `/release.json` HTTP 200. Release live `ddeaac4a38e435781027e99a0978d31c2c4746da`, snapshot TSE SHA `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`, 1.003 linhas; corresponde ao HEAD local.

## Estado dos dados e bloqueios
- Auditoria estrita permanece RC 2 por gaps reais: versões sem fonte ALRS 1.251, Câmara 3, Senado 112; eventos ALRS 1.647, Câmara 2, Senado 188; votos ALRS 4, Câmara 2, Senado 455.
- Os quatro residuais Enio Carlos Terra continuam bloqueados por ausência de ID oficial e fonte exata. Nenhum voto foi inventado, promovido ou aplicado remotamente.
- Senado segue fail-closed sem envelope nominal verificável.
- GitHub API falhou nesta janela com `error connecting to api.github.com`; não foi possível validar novos runs. O repositório local está limpo e `HEAD` já coincide com `origin/main`; não houve push necessário.
- Doctor mantém bloqueios de infraestrutura: Node 22.22.2 no shell embora o projeto exija Node 24; smoke MCP Codex sem evidência por token expirado/`401 invalid_refresh_token`; OpenCode ausente; Antigravity segue disponível.

## Próximo passo
Manter recon oficial read-only nas filas ALRS/Senado/Câmara e repetir verificação de publicação quando a API GitHub estiver acessível. Aplicação factual remota continua condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.
