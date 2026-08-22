# Lote continuous-ops — recon oficial e publicação — 2026-08-22 19:35Z

## Objetivo
Executar um tick bounded do control plane: conferir o dataset vivo, manter a reconciliação oficial fail-closed, rodar os gates locais e tentar a publicação documental.

## Entregue e verificado
- Lock não bloqueante adquirido e liberado com `flock -n`.
- Dataset `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv` comparado ao snapshot: 1.003 linhas/IDs em cada lado; `missing_in_snapshot=0`; `extra_in_snapshot=0`; SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.
- `npm run impact:sources:audit` concluído em modo read-only: versões sem fonte ALRS 1.251, Câmara 3, Senado 112; eventos sem fonte ALRS 1.647, Câmara 2, Senado 188; votos sem fonte ALRS 4, Câmara 2, Senado 455. A fila ALRS residual mantém quatro eventos sem evidência vinculada.
- `npm run impact:alrs:residual:repair -- --dry-run`: `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- Gates verdes: 401 testes em 98 arquivos; TypeScript; schema de impacto; `data:check` com 1.003 candidaturas e 988 fotos; build Vite/PWA; `git diff --check`.
- Workflows remotos confirmados: backup `334951434`, primário `320564705`, verificador `335560210`.

## Estado dos dados
Nenhum fato foi promovido. Nenhuma escrita em Supabase, Cloudflare ou snapshot público ocorreu. Senado segue fail-closed sem envelope nominal verificável; os quatro casos de Enio Carlos Terra seguem sem ID oficial e fonte exata.

## Bloqueios reais
- `git push origin main` rejeitado por HTTP 403: `Permission to Snerolino/eleicao2026.git denied to Snerolino`; nenhum workflow novo foi acionado.
- Produção não pôde ser validada por DNS neste tick: raiz retornou HTTP 000 por timeout de resolução. `/release.json` ainda respondeu com release anterior `3aae2d0`, SHA `3aae2d06338f81dc0b8c5df92ecc61ed8825dda3`, versão `0.2.835`, snapshot 1.003.
- Doctor continua com FAIL por shell Node 22.22.2 incompatível com o requisito Node 24; gates foram executados explicitamente com Node 24. Codex MCP permanece com erro de autenticação 401 de refresh token inválido e OpenCode ausente; não repetidos.

## Próximo passo
Retentar publicação somente no próximo tick quando a permissão efetiva do GitHub estiver disponível; se `main -> main` passar, disparar/verificar backup Cloudflare `334951434`, comparar `headSha` e validar HTTP/release em produção. Manter recon ALRS/Senado/Câmara read-only e sem aplicação remota enquanto R0, schema/FK, fonte oficial, dry-run e idempotência não estiverem verdes.
