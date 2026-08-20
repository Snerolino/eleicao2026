# QA — Câmara: coleta nominal bounded, lote 04

**Data:** 2026-08-20 UTC  
**Modo:** reconhecimento oficial read-only + dry-run; nenhuma escrita remota

## Objetivo

Avançar a lane de reconhecimento da Câmara consultando exclusivamente o endpoint oficial `/votacoes/{id}/votos` para o quarto lote de 25 IDs da janela 2026-07-01 a 2026-09-30, sem inferir votos individuais a partir de listagens, placares ou respostas vazias.

## Entrega verificada

- Fonte oficial: `https://dadosabertos.camara.leg.br/api/v2`.
- Entrada: `.orchestrator/runtime/camara-discovery-current.json`, descoberta read-only com 300 IDs e páginas HTTP válidas.
- Coletor: `scripts/collect-camara-votes.mjs`, executado com Node `v24.19.0`.
- Lote processado: 25 IDs, posições 76–100 da descoberta.
- Artefatos brutos: 25 arquivos em `.orchestrator/runtime/camara-votes-batch-04/`.
- Manifesto: `6d63f3602a1f15e24d28930d99f23cd766767e7224399ea046bcbbb8a1bab64f` (SHA-256), URLs `/votacoes/{id}/votos` oficiais em 25/25 eventos.
- Resultado: 25 eventos, 0 respostas individualizadas, 0 votos brutos e 0 votos em envelope.
- Verificação independente: `verified_events=25 raw_files=25 votes_urls=25 individualized=0`.
- O coletor terminou com exit 0 e declarou nenhuma escrita remota realizada.
- Nenhuma identidade, FK, proposição, classificação nominal ou voto foi inventado ou aplicado.

## Gates locais

- `npm run test`: exit 0 — 82 arquivos, 372 testes aprovados.
- `npx tsc --noEmit`: exit 0.
- `node scripts/validate-impact-schema.mjs`: exit 0.
- `npm run data:check`: exit 0 — 1003 candidaturas, 988 fotos oficiais.
- `npm run build`: exit 0 — sitemap com 1003 candidatos + estáticas = 1005 URLs; release local `9ba709a-20260820T074540211Z`.
- `git diff --check`: exit 0.
- Worktree: limpa; nenhum arquivo versionado alterado pelo lote.

## Publicação e verificação

- Commit documental inicial: `c195d3042ad150c88112119725c4fd3de250d69a`, publicado em `origin/main`; fechamento QA/STATE: `1dc58bd2e2a855b703c197c636d39786915fbba6`, também publicado.
- Backup Cloudflare `334951434`, run final `32345680096`: `completed/success`, `headSha` completo idêntico a `1dc58bd2e2a855b703c197c636d39786915fbba6`.
- Produção `https://rs.votopraquem.org/`: raiz HTTP 200 e `/release.json?verify=1dc58bd` HTTP 200.
- `release.json` confirmou release final `1dc58bd-20260820T074830867Z`, versão `0.2.0`, SHA completo idêntico e snapshot `row_count=1003`.

## Bloqueios e escopo

- Respostas vazias no endpoint `/votos` não foram convertidas em votação simbólica; a classificação permaneceu `outro` e fail-closed.
- ALRS continua bloqueado pelo JWT `issued at future` e sem ID oficial exato para os quatro residuais de Enio Carlos Terra.
- Senado continua fail-closed pela deriva SHA-256 dos seis PDFs frente ao manifesto; nenhum hash foi atualizado.
- A lane `remote_factual_apply` não foi acionada: este lote não produziu envelope nominal, identidade/FK exata, dry-run de escrita ou prova de idempotência.
- `npm run orch:doctor -- --smoke` permanece com FAIL estrutural porque o shell cron resolve Node `v22.22.2`, enquanto o projeto exige Node 24; o tick e seus artefatos foram executados com Node `v24.19.0`. WARNs opcionais: OpenCode ausente, gateway com Node divergente e Ollama sem resposta.

## Próximo passo

Consultar o lote 05 dos IDs Câmara, bounded e read-only, preservando URLs e artefatos; manter ALRS/Senado em reconciliação fail-closed e a publicação independente da documentação após gates locais verdes.
