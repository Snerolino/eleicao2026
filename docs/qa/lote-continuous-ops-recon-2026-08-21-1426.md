# Lote continuous ops — recon oficial e gates locais — 2026-08-21 14:26Z

## Objetivo
Executar um tick bounded do control plane, mantendo recon oficial read-only ativa e verificando a lane local sem aplicar fatos remotamente.

## Reconhecimento oficial verificado
- **Câmara:** API oficial `https://dadosabertos.camara.leg.br/api/v2/votacoes`, janela 2026-01-01 a 2026-12-31 dividida em 4 janelas de até 3 meses, 4/4 respostas válidas, 300 `vote_ids` descobertos na primeira página de cada janela. Nenhuma reconciliação ou aplicação foi feita.
- **ALRS:** URL oficial `https://transparencia.al.rs.gov.br/parlamentares/votos-plenario`, HTTP 200, 77.442 bytes, SHA-256 `sha256:6a386d7d8b9ae17f8f5107b0cb6c90d71795a8568f08ed7c5972746a4ac0bab1`, 0 `data-item`, sem `Enio` e sem `Terra`. Os quatro votos residuais de Enio Carlos Terra continuam sem ID oficial e fonte exata.
- **Senado:** envelope verificável `/tmp/senado-nominal-envelope-latest.json` ausente; permaneceu fail-closed. Nenhum PDF, identidade, FK ou voto foi promovido.
- **dataset2026:** 3 CSVs de candidatos comparáveis, 1.003 IDs; snapshot público com 1.003 IDs; diferença 0/0. Nenhum refresh factual foi necessário.

## Entregue e verificado
- Tick executado sob `flock -n .orchestrator/runtime/locks/continuous-progress.lock`, sem loop ou espera.
- `npm run test`: 98 arquivos, 400 testes, exit 0.
- `npx tsc --noEmit`: exit 0.
- `node scripts/validate-impact-schema.mjs`: exit 0.
- `npm run data:check`: 1.003 candidaturas, 988 fotos oficiais, exit 0.
- `npm run build`: exit 0; sitemap com 1.003 candidatos + 2 estáticas; `release.json` gerado localmente.
- `npm run smoke:local`: 1.002 cards visíveis, 0 falhas HTTP, 0 erros de console online, service worker pronto, exit 0.
- `git diff --check`: exit 0.
- Auditoria estrita read-only: 1.397 proposições, 1.431 versões, 1.902 eventos e 5.007 votos; gaps de fonte versões `ALRS 1251 / Câmara 3 / Senado 112`, eventos `1647 / 2 / 188`, votos `4 / 2 / 455`; exit 2 por gaps reais.

## Estado dos dados e bloqueios
- Nenhum voto, identidade, FK, claim, source reference, migration, Supabase ou Cloudflare foi alterado neste tick.
- Bloqueio ALRS: catálogo oficial ainda não contém identidade/ID exato para Enio Carlos Terra; matching aproximado é proibido.
- Bloqueio Senado: envelope transitório ausente e deriva criptográfica registrada anteriormente; fail-closed mantido.
- Gaps de fonte legislativa continuam reais e separados da lane de implementação.
- `orch:doctor` permanece com FAIL operacional porque o shell do cron usa Node `v22.22.2` enquanto o projeto exige Node 24; WARNs opcionais incluem OpenCode ausente, Ollama sem preflight e rota Codex MCP não exercitada no modo rápido.

## Próximo passo
Manter a recon oficial bounded e iniciar o próximo chunk local independente; publicação somente após documentar as mudanças e repetir gates. Aplicação factual remota permanece condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.
