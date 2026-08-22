# Lote continuous-ops — recon oficial e gates locais — 2026-08-22 10:42 UTC

## Objetivo
Executar um tick bounded das quatro lanes: recon oficial read-only, verificação local, publicação verificável e manutenção fail-closed das pendências remotas.

## Entregue e verificado
- Recon ALRS residual executado em dry-run: `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`. Os quatro votos residuais de Enio Carlos Terra continuam sem ID oficial e fonte exata; nenhum fato foi promovido.
- Recon Câmara executado read-only contra `https://dadosabertos.camara.leg.br/api/v2`, com 8 janelas trimestrais 2025–2026 retornando `status=ok`; IDs coletados permanecem transitórios e não foram reconciliados/aplicados.
- Auditoria de fontes executada read-only: gaps reais permanecem em versões `ALRS 1251`, `Câmara 3`, `Senado 112`; eventos `ALRS 1647`, `Câmara 2`, `Senado 188`; votos `ALRS 4`, `Câmara 2`, `Senado 455`.
- Dataset sem divergência: 1.003 IDs no CSV oficial e 1.003 no snapshot; diferença `0/0`; snapshot SHA-256 `a7db54b20bd1aa0d49003e278d48d1443617f00b772d004d711cd762d0c982cf`.
- Gates locais verdes: 400 testes em 98 arquivos; TypeScript; schema de impacto; `data:check` com 1.003 candidaturas e 988 fotos; build Vite/PWA com sitemap de 1.003 candidatos + 2 estáticas; `git diff --check`.
- Smoke local verde: 1.002 cards, 2 resultados de busca, 0 falhas HTTP, 0 erros de console online, service worker pronto, rota canônica de candidato validada.
- Produção revalidada: raiz HTTP 200 e `/release.json` HTTP 200. Payload live continua sem `commitSha`, `snapshotSha` e `builtAt`, versão `0.2.724`; não é possível provar correspondência com o HEAD local.

## Estado dos dados
Nenhuma escrita factual, Supabase, Cloudflare ou aplicação remota foi feita. O adaptador Senado permanece fail-closed porque `/tmp/senado-nominal-envelope-latest.json` não existe. A auditoria de fontes é lacuna de recuperação, não autorização para inventar URLs, hashes, UUIDs ou votos.

## Bloqueios reais
- `git push origin main` falhou HTTP 403: `Permission to Snerolino/eleicao2026.git denied to Snerolino`. Não houve novo workflow nem deploy; HEAD local `a1a12847c6422d9c7e366b06820148c88e720d77` permanece 75 commits à frente de `origin/main`.
- Doctor: Node do shell é v22.22.2 enquanto o projeto exige Node 24; smoke MCP/Codex falhou por refresh token inválido (`401 invalid_refresh_token`); OpenCode ausente; Ollama sem preflight. Os gates do projeto não dependeram dessas rotas.

## Próximo passo
Retentar publicação documental somente quando a permissão efetiva do GitHub aceitar `main -> main`; se aceitar, acompanhar o workflow backup remoto `334951434`, comparar `headSha` com o commit e validar produção. Manter ALRS/Senado fail-closed e recon Câmara read-only até identidade, fonte, dry-run e idempotência completos.
