# Lote continuous-ops — recon oficial e verificação — 2026-08-22 11:01 UTC

## Objetivo
Executar um tick bounded das quatro lanes, mantendo recon oficial read-only, gates locais/publicação verificável e aplicação factual remota fail-closed.

## Entregue e verificado
- ALRS FED-17 residual em dry-run: `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`. Os quatro residuais de Enio Carlos Terra continuam sem ID oficial e fonte exata; nenhum fato foi promovido.
- Câmara oficial read-only em `https://dadosabertos.camara.leg.br/api/v2`: 8/8 janelas trimestrais 2025–2026 com `status=ok`, sem bloqueios, 700 `vote_ids` transitórios. Não houve reconciliação nem aplicação.
- Senado segue fail-closed: `/tmp/senado-nominal-envelope-latest.json` não existe; não houve adaptação nem inferência de `legislator_id` para candidato.
- Auditoria de fontes read-only: lacunas reais permanecem em versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188` e votos `4/2/455`; o strict gate retorna exit 2 e não autoriza escrita.
- Dataset sem divergência: CSV oficial 1.003 IDs e snapshot 1.003 IDs, diferença `0/0`; CSV SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`; snapshot SHA-256 `a7db54b20bd1aa0d49003e278d48d1443617f00b772d004d711cd762d0c982cf`.
- Produção revalidada: raiz HTTP 200 e `/release.json` HTTP 200. Release live `e925327276b82481a348d4db3e2339d075dfe9a3`, versão `0.2.724`, `built_at=2026-08-21T14:57:42.462Z`, snapshot com 1.003 registros e SHA oficial do CSV. O release live não corresponde ao HEAD local recém-criado.
- Doctor smoke executado: gates de projeto não dependem da rota de executor. Persistem Node shell v22.22.2 incompatível com requisito 24, MCP/Codex `401 invalid_refresh_token`, OpenCode ausente e Ollama sem preflight.

## Estado dos dados
Nenhuma escrita factual, Supabase, Cloudflare ou aplicação remota foi feita. A árvore de trabalho ficou limpa antes deste documento; este QA é a única alteração intencional do tick.

## Bloqueio real
`git push origin main` falhou com HTTP 403: `Permission to Snerolino/eleicao2026.git denied to Snerolino`. Não houve workflow novo nem deploy deste HEAD.

## Próximo passo
Retentar publicação documental quando a permissão efetiva do GitHub aceitar `main -> main`; após aceitação, acompanhar workflow backup remoto `334951434`, conferir `headSha` e validar produção. Manter ALRS/Senado fail-closed e Câmara read-only até identidade, fonte, dry-run e idempotência completos.
