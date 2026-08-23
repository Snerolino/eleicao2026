# Lote continuous ops — recon oficial e gates — 2026-08-23 16:28 UTC

## Objetivo
Retomar a operação contínua com reconciliação read-only das fontes oficiais, verificar o snapshot vivo do TSE, conferir filas sem decidir por humanos e validar publicação/release sem aplicar fatos legislativos não-gateados.

## Entregue e verificado
- Worktree limpa; `HEAD` e `origin/main` em `cd84a7913f28`.
- `npm run data:check`: RC 0 — 1003 candidaturas, 988 fotos oficiais, 1 fonte TSE.
- Snapshot vs CSV vivo `../dataset2026`: sem alteração detectada pela validação do snapshot; CSV oficial consultado com SHA-256 prefixo `443eac3d55aa7f67`.
- Câmara oficial read-only: `8/8` janelas trimestrais 2025–2026 OK, 700 `vote_ids` inventariados; nenhum ID reconciliado ou aplicado.
- ALRS FED-17 residual: dry-run RC 0, `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`. Os quatro casos Enio Carlos Terra seguem bloqueados sem ID oficial/fonte exata.
- Auditoria de fontes em modo estrito: RC 2 por gaps reais, sem escrita — versões sem fonte ALRS/Câmara/Senado `1251/3/112`; eventos `1647/2/188`; votos `4/2/455`. Recovery queue factual ALRS: 4 casos, 1 voto ausente em cada.
- Gates locais: `npm run test -- --passWithNoTests` RC 0 (`401` testes, `98` arquivos); `npx tsc --noEmit`/build/schema/diff-check RC 0. Build: 225 módulos; sitemap 1003 candidatos + 2 estáticas; release local gerado.
- Produção: raiz HTTP 200 e `/release.json` HTTP 200; release live `cd84a79-20260823T162442301Z`, SHA exato `cd84a7913f28`, snapshot 1003.
- Backup Cloudflare `334951434`: run `32651666506`, `completed/skipped`, `headSha=cd84a7913f28`. O deploy primário no mesmo SHA concluiu success (`32651489149`); não foi disparado novo workflow.

## Estado dos dados e segurança
Nenhum candidato, identidade, voto, FK, `source_reference`, claim, matriz, assessment, Supabase remoto ou Cloudflare foi alterado. Recon e auditoria permaneceram read-only/fail-closed. Não houve decisão editorial automática.

## Bloqueios reais
- Publicação documental: `git push origin main` foi tentado 3 vezes e retornou HTTP 403 (`Permission to Snerolino/eleicao2026.git denied to Snerolino`); o commit documental `5bf1b91` permanece apenas local. Produção já está no SHA anterior `cd84a79`.
- Gaps de fontes legislativas permanecem e impedem aplicação/publicação factual dos registros afetados.
- Quatro reparos ALRS FED-17 continuam sem identidade oficial e fonte exata.
- Doctor global RC 1: shell Node 22.22.2 enquanto o projeto exige Node 24; OpenCode ausente; smoke do MCP Codex não exercitado no modo rápido. Os gates do projeto foram executados no runtime compatível disponível para os scripts.

## Próximo passo
Retentar recon oficial read-only e monitorar o `/admin` sem decidir por humanos. Aplicar qualquer lote factual somente depois de identidade R0, schema/FK, fonte oficial com hash, dry-run e idempotência comprovados; manter lacunas em fila de recuperação.
