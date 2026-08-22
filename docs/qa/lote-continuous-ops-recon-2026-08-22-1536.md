# Lote continuous-ops — recon oficial e gates locais — 2026-08-22 15:36Z

## Objetivo
Executar um tick bounded do control plane, manter reconciliações oficiais read-only/fail-closed, conferir o dataset vivo e validar os gates locais antes da publicação.

## Entregue e verificado
- Lock não bloqueante adquirido e liberado via `flock -n`.
- ALRS FED-17 residual em dry-run: `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`. Os quatro casos de Enio Carlos Terra continuam sem ID oficial e fonte exata.
- Câmara dos Deputados: descoberta oficial read-only em 8 janelas trimestrais 2025–2026; 7 janelas `ok`, 1 bloqueada por `network_error`/`fetch failed` (Q1/2025). Por fail-closed, `vote_ids=[]`; nenhuma reconciliação, escrita ou promoção.
- Auditoria de fontes regular RC 0; strict RC 2 pelos gaps reais: versões sem fonte ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`.
- Dataset oficial `consulta_cand_2026_RS.csv` e snapshot público: 1.003/1.003 linhas e IDs; diferença CSV→snapshot `0`, snapshot→CSV `0`; SHA CSV `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.
- Gates locais verdes com Node 24.19.0: 401 testes/98 arquivos; TypeScript; schema de impacto; `data:check` com 1.003 candidaturas, 988 fotos e 1 fonte TSE; build Vite/PWA com sitemap 1.003 + 2 e `release.json` local `7fa2afc-20260822T153633092Z`; `git diff --check`; smoke com 1.002 cards, 0 falhas HTTP, 0 erros de console online e service worker pronto.

## Estado dos dados
- Nenhuma escrita em Supabase, Cloudflare, snapshot, claims, source references, identidades, FKs, votos ou matrizes.
- Senado permanece fail-closed sem envelope nominal verificável com PDF/`legislator_id`/SHA.
- Nenhum fato legislativo foi promovido.

## Bloqueios reais
- Q1/2025 da API oficial da Câmara retornou `fetch failed`; o lote inteiro permaneceu fail-closed.
- ALRS residual continua sem identidade oficial e fonte exata; Senado continua sem envelope verificável.
- `orch:doctor --smoke` mantém FAIL pelo shell Node 22.22.2 incompatível com o requisito Node 24 e pela rota MCP Codex sem evidência estruturada; OpenCode ausente. Os gates do projeto foram executados explicitamente com Node 24.19.0.
- O repositório local está 15 commits à frente de `origin/main`; a tentativa de publicação deste tick ainda depende do retry de `git push` e da permissão efetiva do GitHub.

## Próximo passo
Retentar `main -> main`; se aceito, acompanhar o workflow backup Cloudflare `334951434`, conferir `headSha` contra o commit e validar produção. Manter ALRS/Senado fail-closed e aplicação remota condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.
