# QA — lote continuous ops recon — 2026-08-21 20:25 UTC

## Objetivo
Executar um tick bounded do control plane: recon oficial read-only nas lanes ALRS residual FED-17, Câmara e Senado; comparar dataset/snapshot; validar gates locais; registrar publicação pendente sem aplicar fatos remotamente.

## Entregue e verificado
- Lock não bloqueante adquirido e liberado em `.orchestrator/runtime/locks/continuous-progress.lock`.
- ALRS FED-17: dry-run concluído com `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`. Nenhuma correção ou voto foi escrito.
- Câmara: API oficial `https://dadosabertos.camara.leg.br/api/v2`, 8 janelas trimestrais 2025–2026, primeira página de cada janela HTTP válida, `blocked=null`; IDs apenas descobertos em modo read-only.
- Senado: adaptação falhou fechado porque `/tmp/senado-nominal-envelope-latest.json` não existe (`ENOENT`); zero legislator IDs/FKs/votos promovidos.
- Dataset: `sync-candidates-snapshot.mjs` dry-run reportou snapshot com 1.003 candidaturas, banco 1.000, 3 a criar e 1.000 a atualizar; nenhuma escrita aplicada. `data:check` confirmou 1.003 candidaturas e 988 fotos oficiais.
- Gates locais em Node `v24.19.0`: `npm run test` — 400 testes/98 arquivos, exit 0; `npx tsc --noEmit` exit 0; schema exit 0; `data:check` exit 0; `npm run build` exit 0; `git diff --check` exit 0.
- Smoke local: primeira tentativa teve timeout transitório; repetição passou com 1.002 cards, 0 falhas HTTP, 0 erros de console online e service worker pronto.
- Auditoria estrita de fontes read-only manteve gaps reais: versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`; exit 2. Nada foi suprimido.
- Workflows GitHub confirmados: backup Cloudflare `334951434` ativo; primário `320564705` ativo; nenhum workflow foi disparado porque ainda não houve push efetivo deste tick.

## Estado dos dados
Sem alteração factual, de identidade, FK, voto, claim, `source_reference`, Supabase ou Cloudflare. O snapshot público continua com 1.003 candidaturas e 988 fotos oficiais; a coleção visível do smoke foi 1.002 cards após exclusões previstas.

## Bloqueios reais
- Quatro residuais ALRS de Enio Carlos Terra permanecem sem ID oficial e fonte exata; dry-run não encontrou plano aplicável.
- Senado segue fail-closed por envelope nominal ausente; não inferir `legislator_id`, candidato, URL, hash ou voto.
- Gaps estritos de fontes permanecem e exigem recuperação oficial com hash/identidade exatos.
- DNS de produção não resolveu durante este tick (`curl https://rs.votopraquem.org` → HTTP 000, `Could not resolve host`); portanto release live não foi afirmado.
- `orch:doctor --smoke` não fechou verde: shell Node 22.22.2 (projeto exige Node 24), smoke MCP Codex sem evidência estruturada e timeout do doctor; OpenCode ausente e Ollama sem preflight são rotas opcionais indisponíveis.

## Próximo passo
Continuar recon oficial bounded nas quatro residuais ALRS, envelope Senado e novos lotes Câmara sem escrita; resolver a permissão efetiva de push GitHub. Após push efetivo, verificar workflow backup `334951434`, `headSha`, HTTP/release e smoke de produção. Aplicação remota permanece condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.
