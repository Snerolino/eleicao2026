# Lote continuous-ops — recon oficial e gates locais — 2026-08-22 04:51Z

## Objetivo
Executar um tick bounded do control plane com recon oficial read-only, comparação do dataset vivo, auditoria de fontes e gates locais; promover somente evidência que passe os contratos.

## Entregue e verificado

- Câmara: `scripts/discover-camara-vote-ids.mjs --start 2025-01-01 --end 2026-12-31 --max-pages 3` consultou 22 páginas em 8 janelas trimestrais oficiais; `22/22` páginas `ok`, `blocked=null`, `2.100` `vote_ids` descobertos somente em memória. Nenhuma identidade foi reconciliada e nenhum voto foi aplicado.
- Dataset oficial: `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv` tem 1.003 linhas/IDs; snapshot tem 1.003 registros/IDs; diferenças `0/0`. SHA-256 do CSV: `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.
- Auditoria estrita read-only: 1.397 proposições, 1.431 versões, 1.902 eventos e 5.007 votos. Gaps: versões ALRS/Câmara/Senado `1251/3/112`; eventos `1647/2/188`; votos `4/2/455`. Exit `2` por gaps reais; nenhuma promoção.
- Smoke local após build: 1.002 cards, mínimo esperado 1.002, 0 falhas HTTP, 0 erros de console online, service worker pronto.

## Gates locais

Executados com Node `v24.19.0`:

- `npm run test`: exit 0 — 98 arquivos, 400 testes aprovados.
- `npx tsc --noEmit`: exit 0.
- `node scripts/validate-impact-schema.mjs`: exit 0 — checkpoint do schema aprovado.
- `npm run data:check`: exit 0 — 1.003 candidaturas, 988 fotos oficiais, 1 fonte TSE.
- `npm run build`: exit 0 — sitemap 1.003 candidatos + 2 estáticas = 1.005 URLs; release local `1e293ec-20260822T045022858Z`.
- `npm run smoke:local`: exit 0 — evidência acima.
- `git diff --check`: exit 0.

## Bloqueios e estado dos dados

- ALRS FED-17 residual: reparo dry-run falhou fechado com causa real `JWT issued at future`; 4 votos residuais de Enio Carlos Terra continuam sem ID oficial/fonte exata. Nenhum voto foi inventado ou alterado.
- Senado: permanece fail-closed sem envelope nominal/PDF/`legislator_id`/SHA verificável. Nenhum voto foi promovido.
- Auditoria de fontes permanece bloqueada por lacunas substantivas; remote factual apply continua proibido sem R0, schema/FK, fonte oficial, dry-run e idempotência.
- Doctor do cron: `OK=49 WARN=6 FAIL=2`; FAIL por shell Node 22.22.2 (projeto exige Node 24) e smoke estruturado da rota MCP Codex; Codex registrou `401 invalid_refresh_token`. OpenCode ausente e Ollama sem preflight são WARNs/rotas não usadas.
- Nenhuma escrita em snapshot, Supabase, Cloudflare, identidade, FK, voto, claim ou matriz ocorreu.

## Publicação

- Produção revalidada: `https://rs.votopraquem.org` root HTTP 200 e `/release.json?cb=continuous-ops` HTTP 200.
- Worktree tinha HEAD `1e293ecf80460efc5c10cbdda5598d47d5aa3dd0`, limpa antes do tick. Este QA será commitado localmente após o registro.
- Workflows remotos confirmados ativos: backup Cloudflare `334951434`, primário `320564705`, verificador `335560210`.
- Push/publicação do lote continua condicionado à permissão Git efetiva; tentativas anteriores retornaram HTTP 403 e não se deve afirmar deploy deste novo documento sem `main -> main`, run backup concluído e `headSha` verificado.

## Próximo passo

Manter recon bounded da Câmara e ALRS/Senado fail-closed; retentar publicação documental quando o push efetivo permitir. Não executar aplicação factual remota enquanto os gates R0/schema/FK/fonte/dry-run/idempotência não estiverem verdes.
