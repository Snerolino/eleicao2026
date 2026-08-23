# Lote continuous-ops — recon ALRS residual — 2026-08-23

## Objetivo
Retomar a recuperação read-only dos quatro votos ALRS sem evidência vinculada e verificar o estado de publicação após o lote P2-5.

## Entregue e verificado
- `npm run impact:sources:audit`: RC 0, auditoria read-only; filas residuais `alrs_pl134_2023`, `alrs_pl165_2025`, `alrs_pl361_2025` e `alrs_pl77_2025`, um voto sem fonte em cada.
- `node scripts/audit-legislative-source-coverage.mjs --strict`: RC 2, fail-closed pelos gaps oficiais existentes; não houve escrita.
- `npm run impact:alrs:residual:repair`: RC 0 em dry-run, `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- `npm run data:check`: RC 0; `1003` candidaturas, `988` fotos oficiais, `1` fonte TSE.
- Produção: raiz HTTP 200 e `/release.json` HTTP 200; release reportou versão `0.2.961`.
- GitHub Actions: último Deploy e backup bem-sucedidos no SHA remoto `0a1a202b503f094d18feca19dc04704c7ca46d3c`; não corresponde ao commit documental local deste tick.

## Estado dos dados
Nenhum voto, fonte, identidade, FK, claim, assessment ou matriz foi alterado. Os quatro votos continuam bloqueados porque a evidência exata não passou o gate de hash/bytes/match; não aplicar por aproximação.

## Bloqueios reais
- `git push origin main`: HTTP 403, `Permission to Snerolino/eleicao2026.git denied to Snerolino`; documentação deste tick permanece local.
- `npm run orch:doctor`: RC 1 por shell Node 22.22.2 enquanto o projeto exige Node 24; OpenCode ausente; smoke da rota MCP não exercitado no modo rápido. Codex, gh e Antigravity estão disponíveis.
- Auditoria strict permanece RC 2 pelos gaps de fontes ALRS/Câmara/Senado, conforme esperado e fail-closed.

## Próximo passo
Retentar transporte Git em novo tick; manter recon oficial read-only e repetir o dry-run residual. Só vincular os quatro votos após fonte ALRS oficial reproduzida com URL, hash, bytes e identidade/evento exatos. Não aplicar voto, assessment ou matriz automaticamente.
