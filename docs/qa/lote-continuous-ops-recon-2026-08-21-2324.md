# Lote continuous-ops — recon oficial e gates locais — 2026-08-21 23:24Z

## Objetivo
Executar um tick bounded do control plane: manter recon oficial read-only ativa, validar o snapshot contra `../dataset2026`, executar os gates locais e verificar se existe algum item elegível para publicação ou aplicação factual remota.

## Entregue e verificado
- Lock não bloqueante adquirido e liberado com `flock -n` em `.orchestrator/runtime/locks/continuous-progress.lock`.
- Câmara: consulta oficial `https://dadosabertos.camara.leg.br/api/v2/votacoes` em 8 janelas trimestrais de 2025–2026, 22 páginas, `blocked=null`, 2.100 `vote_ids`; somente descoberta, sem reconciliação ou escrita.
- ALRS FED-17: nenhum novo voto planejado; os 4 residuais de Enio Carlos Terra permanecem sem ID oficial e fonte exata.
- Senado: fail-closed; `/tmp/senado-nominal-envelope-latest.json` ausente, sem PDF, `legislator_id`, FK ou voto promovido.
- Dataset TSE comparado ao snapshot: CSV com SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`; 1.003 linhas/IDs no CSV e 1.003 no snapshot; diferenças 0/0.
- Sincronização Supabase em dry-run: snapshot 1.003; banco 1.000; 3 a criar, 1.000 a atualizar, 0 fora do snapshot; nenhuma escrita.

## Gates locais
- Node `v24.18.1` usado para os gates.
- `npm run test`: **400 testes/98 arquivos aprovados**.
- `npx tsc --noEmit`: **0**.
- `node scripts/validate-impact-schema.mjs`: **OK**.
- `npm run data:check`: **OK**, 1.003 candidaturas e 988 fotos oficiais.
- `npm run build`: **OK**, sitemap com 1.003 candidatos + 2 estáticas; `release.json` local `4c17188-20260821T232152939Z`.
- `npm run smoke:local`: **OK**, 1.002 cards, 0 falhas HTTP, 0 erros de console online, service worker pronto.
- `git diff --check`: **OK**.

## Estado dos dados e bloqueios
- Auditoria estrita de fontes continua bloqueada por gaps reais: versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`; comando terminou com exit 2. Nenhuma promoção factual é permitida.
- Doctor termina `OK=48 WARN=5 FAIL=1`: shell padrão usa Node 22.22.2, embora o gate tenha sido executado explicitamente com Node 24.18.1; OpenCode ausente, Ollama sem preflight e rota Hermes→Codex MCP não exercitada.
- Publicação remota segue bloqueada operacionalmente por push GitHub HTTP 403 e DNS/produção não revalidados neste tick. Nenhuma escrita Supabase ou Cloudflare ocorreu.

## Próximo passo
Repetir recon bounded da Câmara e manter ALRS/Senado fail-closed. Quando houver credencial efetiva de push e DNS resolvido, publicar o commit documental pelo backup Cloudflare `334951434`, validar HTTP 200, `release.json`/`headSha` e smoke remoto. Aplicação factual remota permanece condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.
