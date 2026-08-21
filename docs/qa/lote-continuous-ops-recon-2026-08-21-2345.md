# Lote continuous-ops — recon oficial e gates — 2026-08-21 23:45Z

## Objetivo
Executar um tick bounded do control plane: recon oficial read-only, validação do snapshot, gates locais e verificação de publicação sem aplicar fatos remotamente.

## Entregue e verificado
- Lock não bloqueante `.orchestrator/runtime/locks/continuous-progress.lock` adquirido e liberado com `flock -n`.
- Câmara: `npm run impact:camara:discover` respondeu às 8 janelas trimestrais 2025–2026 com `status=ok`, `blocked=null`; IDs apenas descobertos em modo read-only, sem reconciliação ou aplicação.
- ALRS FED-17: `npm run impact:alrs:residual:repair` falhou fechado com `JWT issued at future`; os 4 residuais de Enio Carlos Terra continuam sem ID oficial e fonte exata.
- Snapshot: `npm run data:check` verde — 1.003 candidaturas, 988 fotos oficiais, 1 fonte TSE.
- Testes: `npm run test` verde — 98 arquivos, 400 testes aprovados.
- TypeScript: `npx tsc --noEmit` verde.
- Contrato: `node scripts/validate-impact-schema.mjs` verde.
- Build: `npm run build` verde — sitemap com 1.003 candidatos + 2 estáticas e `release.json` local para `93e1bee`.
- Smoke local: primeira execução falhou por carregamento transitório (`cards=0`, página ainda “Carregando lista de candidatos”); repetição verde com 1.002 cards, 0 falhas HTTP, 0 erros de console online e service worker pronto.
- Auditoria de fontes read-only: gaps permanecem em versões `1251/3/112`, eventos `1647/2/188` e votos `4/2/455` (ALRS/Câmara/Senado); strict continua não verde e nenhum registro foi promovido.
- `git diff --check` verde e worktree permaneceu limpa após os comandos de verificação.

## Estado de publicação
- `git push origin main` tentou publicar os 30 commits locais à frente, mas falhou com HTTP 403: `Permission to Snerolino/eleicao2026.git denied to Snerolino.` Nenhum workflow novo foi acionado.
- Produção não pôde ser confirmada neste tick: DNS `rs.votopraquem.org` não resolveu (`curl` HTTP 000). Não declarar release publicado.

## Bloqueios reais
- Doctor: FAIL porque o shell usa Node `v22.22.2`, enquanto o projeto exige Node 24; smoke obrigatório do Codex MCP não comprovado e Codex retorna token expirado/401; OpenCode ausente; Ollama sem preflight.
- ALRS: JWT emitido no futuro impede o repair; fail-closed.
- Senado: envelope oficial continua ausente; nenhuma identidade, PDF, FK ou voto promovido.
- Fontes legislativas: gaps estritos permanecem; não inventar URLs, hashes, UUIDs, votos ou identidades.
- GitHub: credencial efetiva de push retorna 403; Cloudflare não foi acionado.

## Próximo passo
Manter a Câmara em recon bounded read-only e tentar novamente a lane local independente. Retomar publicação somente quando push e DNS funcionarem; qualquer aplicação factual remota continua condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência comprovada.
