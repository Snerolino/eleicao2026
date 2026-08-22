# QA — lote continuous ops recon — 2026-08-22 18:53Z

## Objetivo
Executar um tick bounded do control plane: manter recon oficial read-only, conferir o dataset vivo, verificar gates locais e tentar publicação documental sem promover fatos sem fonte.

## Reconhecimento oficial e dados
- Lock não bloqueante adquirido/liberado em `.orchestrator/runtime/locks/continuous-progress.lock`.
- ALRS FED-17 residual executado em modo padrão dry-run, mas bloqueado por causa real `fetch failed`; nenhum voto/data/fonte foi alterado. Os quatro casos de Enio Carlos Terra continuam sem ID oficial e fonte exata.
- Câmara oficial consultada em 8 janelas trimestrais de 2025–2026, todas `ok`, sem bloqueios; `vote_ids=700` foram tratados como saída transitória de descoberta, sem reconciliação, FK ou aplicação.
- Senado permaneceu fail-closed sem envelope nominal verificável; nenhuma identidade ou voto foi inferido.
- Auditoria regular de fontes: RC 0, com 1.431 versões, 1.902 eventos e 5.007 votos; gaps: versões sem fonte ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`.
- Auditoria estrita: RC 2 pelos gaps reais acima; nenhum fato promovido.
- Dataset vivo conferido contra `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv`: CSV/snapshot `1003/1003` IDs, diferenças `0/0`, SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.

## Gates locais verificados
Executados com Node `v24.19.0`:
- `npm run test -- --passWithNoTests`: RC 0 — 401 testes em 98 arquivos.
- `npx tsc --noEmit`: RC 0.
- `node scripts/validate-impact-schema.mjs`: RC 0.
- `npm run data:check`: RC 0 — 1.003 candidaturas, 988 fotos, 1 fonte TSE.
- `npm run build`: RC 0 — sitemap 1.003 candidatos + 2 estáticas; `release.json` local `14db61c-20260822T185225287Z`.
- `git diff --check`: RC 0; worktree limpa antes desta documentação.

## Publicação e verificação externa
- `git push origin main`: RC 128, bloqueio real HTTP 403 — `Permission to Snerolino/eleicao2026.git denied to Snerolino`; nenhum workflow foi acionado.
- Consulta de workflows GitHub falhou independentemente com `error connecting to api.github.com`; por isso não foi possível confirmar o workflow backup neste tick.
- Produção verificada: raiz HTTP 200 e `/release.json` HTTP 200.
- Live permanece em `release_id=3aae2d0-20260822T180456083Z`, SHA `3aae2d06338f81dc0b8c5df92ecc61ed8825dda3`, versão `0.2.835`, snapshot 1.003 com SHA oficial. Não corresponde verificavelmente ao HEAD local `14db61c18afe4383b9dedc69ebb16dd0ac64107c` porque o push foi rejeitado.

## Bloqueios reais
- `npm run orch:doctor`: RC 1 porque o shell do cron usa Node 22.22.2, enquanto o projeto exige Node 24; os gates foram executados explicitamente com Node 24.19.0.
- Doctor confirmou OpenCode ausente, fallback Ollama sem preflight e rota Codex MCP não utilizável neste arco; não houve repetição de executor bloqueado.
- Auditoria estrita não-zero por ausência de fontes legislativas; ALRS/Senado continuam fail-closed.
- GitHub remoto rejeita publicação com HTTP 403; consulta de workflows também teve falha de rede.

## Próximo passo
Retentar `git push origin main` no próximo tick. Se aceito, acompanhar o workflow backup Cloudflare `334951434`, comparar `headSha` com o commit publicado e revalidar produção. Manter recon oficial read-only e aplicação factual remota condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.
