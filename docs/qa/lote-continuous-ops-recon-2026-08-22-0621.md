# Lote continuous-ops — recon oficial e gates locais — 2026-08-22 06:21 UTC

## Objetivo
Executar um tick bounded do control plane: manter recon oficial read-only ativa,
verificar o snapshot vivo do `dataset2026`, fechar os gates locais e deixar a
publicação documental pronta sem promover dados factuais sem fonte/identidade.

## Entregue e verificado
- Lock `.orchestrator/runtime/locks/continuous-progress.lock` adquirido e liberado
  sem loop ou espera.
- Câmara: `npm run impact:camara:discover` respondeu `ok` nas 8 janelas
  trimestrais oficiais de 2025–2026 (`max_pages=1`), com `vote_ids` somente em
  memória; nenhuma reconciliação ou aplicação foi executada.
- ALRS FED-17 residual: `npm run impact:alrs:residual:repair` em dry-run,
  `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`,
  `impact_touched=false`. Os quatro votos residuais de Enio Carlos Terra seguem
  bloqueados por ausência de ID oficial e fonte exata.
- Auditoria read-only de fontes: ALRS sem fonte em 1251 versões/1647 eventos/4
  votos; Câmara em 3/2/2; Senado em 112/188/455. Nenhum registro foi promovido.
- Snapshot/dataset: `consulta_cand_2026_RS.csv` permanece com SHA-256
  `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`; snapshot
  público com 1003 candidaturas. Não houve refresh factual.

## Gates locais
- `npm run test`: **verde**, 98 arquivos / 400 testes.
- `npx tsc --noEmit`: **verde**.
- `node scripts/validate-impact-schema.mjs`: **verde**.
- `npm run data:check`: **verde**, 1003 candidaturas / 988 fotos / 1 fonte TSE.
- `npm run build`: **verde**, sitemap 1003 candidatos + 2 estáticas; `release.json`
  local gerado com `commitSha=3b1b951`.
- `npm run smoke:local`: **verde**, 1002 cards visíveis, mínimo esperado 1002,
  0 falhas HTTP, 0 erros de console online e service worker pronto.
- `git diff --check`: **verde**; worktree estava limpa antes da documentação.

## Estado e bloqueios reais
- Doctor: `OK=49 WARN=6 FAIL=2`; FAILs são shell usando Node 22 apesar de
  Node 24.19.0 disponível para os gates, e smoke da rota MCP Codex sem evidência
  (`401 invalid_refresh_token`). OpenCode ausente; Ollama não respondeu ao
  preflight. Não repetir MCP neste tick.
- Senado permanece fail-closed sem envelope nominal verificável com
  `legislator_id`, PDF e SHA estável.
- Produção existente revalidada: root HTTP 200 e `/release.json` HTTP 200,
  com release live `e925327276b82481a348d4db3e2339d075dfe9a3`, snapshot live de
  1.003 candidaturas e SHA CSV oficial igual ao checkpoint. Isso não inclui o
  commit local deste lote.
- Push/publicação nova ainda depende de permissão efetiva no GitHub; tentativa
  e retry via `gh auth setup-git` registraram HTTP 403 para
  `Snerolino/eleicao2026.git`. Nenhum deploy novo ou dado remoto foi afirmado.

## Próximo passo
Tentar publicar somente esta documentação após commit e validar `main -> main`;
se o GitHub continuar em 403, manter o bloqueio documentado e seguir no próximo
chunk com recon oficial read-only. Só aplicar fatos remotos após R0, schema/FK,
fonte oficial exata, dry-run e idempotência.
