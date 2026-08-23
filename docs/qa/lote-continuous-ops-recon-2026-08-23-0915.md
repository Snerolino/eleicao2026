# QA — recon oficial e verificação de publicação (2026-08-23 09:15 UTC)

## Objetivo
Executar um tick bounded das lanes de reconhecimento oficial e publicação/verificação, sem promover fatos sem fonte exata.

## Entregue e verificado
- Dataset vivo conferido read-only: snapshot público com `1003` registros; CSV oficial `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv` com `553194` bytes e SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.
- ALRS FED-17 residual: reparo read-only falhou fechado com causa real `fetch failed`; nenhum voto, identidade ou fonte foi criado.
- Câmara: janela oficial `2026-07-01`–`2026-09-30`, `max_pages=1`, retornou `network_error`/`fetch failed`; por fail-closed, `vote_ids=[]` e nenhuma reconciliação/aplicação ocorreu.
- Auditoria regular de fontes: RC 0, preservando gaps reais: versões sem fonte ALRS/Câmara/Senado `1251/3/112`; eventos `1647/2/188`; votos `4/2/455`.
- Produção: raiz HTTP 200 e `/release.json` HTTP 200; release live `f7f1920-20260823T091434167Z`, SHA `f7f19203dee83605ab219bb49d5f6843d2b1b76b`, versão `0.2.905`, snapshot `1003`.
- Worktree estava limpa e `HEAD == origin/main` em `f7f19203dee83605ab219bb49d5f6843d2b1b76b` antes desta documentação. A documentação foi commitada localmente em `efa48dd`, mas `git push origin main` e `env -u GH_TOKEN git push origin main` falharam com HTTP 403 (`Permission to Snerolino/eleicao2026.git denied to Snerolino`); nenhum workflow novo foi acionado.

## Estado dos dados
Nenhum candidato, voto, identidade, FK, `source_reference`, claim, Supabase remoto ou Cloudflare foi alterado. ALRS residual e Senado permanecem fail-closed.

## Bloqueios reais
- ALRS: portal/fonte consultada indisponível para o reparo (`fetch failed`); os quatro casos Enio Carlos Terra continuam sem ID oficial e fonte exata.
- Câmara: API oficial indisponível nesta janela (`fetch failed`); não houve promoção de IDs transitórios.
- Doctor: shell padrão Node `22.22.2` incompatível com o requisito Node 24; Codex MCP read-only sem evidência estruturada por autenticação expirada e OpenCode ausente. Não houve leitura de segredos.

## Próximo passo
Retentar recon oficial read-only em novo tick; manter aplicação remota condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência. Após qualquer mudança funcional e gates verdes, validar backup `334951434` por `headSha` e produção.
