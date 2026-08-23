# QA — lote continuous ops recon — 2026-08-23 20:38 UTC

## Objetivo
Retomar o control plane contínuo com reconciliação read-only do dataset oficial, cobertura de fontes legislativas, fila ALRS residual, gates locais e verificação de produção. Nenhuma decisão editorial ou escrita remota foi executada.

## Entregue e verificado
- Dataset oficial `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv`: 1003 linhas/IDs, 553194 bytes, SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.
- Snapshot público: 1003 candidaturas; diferença contra os 1003 IDs oficiais: 0 ausentes e 0 extras.
- `npm run data:check`: RC 0; 1003 candidaturas, 988 fotos oficiais, 1 fonte TSE.
- Auditoria regular de fontes: RC 0. Auditoria strict: RC 2, fail-closed, preservando gaps reais: versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455` sem fonte.
- `npm run impact:alrs:residual:repair`: RC 0 em dry-run; `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- Testes: `npm run test` RC 0; 98 arquivos e 401 testes aprovados.
- TypeScript: `npx tsc --noEmit` RC 0.
- Schema: `node scripts/validate-impact-schema.mjs` RC 0.
- Build: `npm run build` RC 0; 227 módulos, sitemap com 1003 candidatos + 2 estáticas; release local gerado para `eb46664`.
- Produção: `https://rs.votopraquem.org` HTTP 200; `/release.json` HTTP 200, live ainda em SHA `0a1a202b503f094d18feca19dc04704c7ca46d3c`, versão `0.2.961`, snapshot 1003.
- Doctor: RC 1 por bloqueios de infraestrutura já conhecidos: shell Node 22.22.2 enquanto o projeto exige Node 24, OpenCode ausente e smoke MCP não exercitado no modo rápido. Codex, AGY, gh e Supabase CLI estão disponíveis.

## Estado dos dados e filas
- Quatro votos ALRS (`alrs_pl134_2023`, `alrs_pl165_2025`, `alrs_pl361_2025`, `alrs_pl77_2025`) continuam sem evidência vinculável. Não foram inventados valores, URLs, hashes ou vínculos.
- Gaps Senado/Câmara/ALRS permanecem bloqueados por fonte e não foram promovidos.
- Claims, matrizes e assessments editoriais não foram alterados; decisões humanas continuam fora do escopo automático.

## Bloqueios reais
1. Transporte Git: o commit documental `f0de0c6` deixou HEAD local 5 commits à frente de `origin/main`; três tentativas de push retornaram HTTP 403 (`Permission to Snerolino/eleicao2026.git denied to Snerolino`).
2. Strict source coverage permanece fail-closed pelos gaps acima.
3. Ambiente: Node 24 não está instalado no shell atual; OpenCode não está disponível; fallback Ollama não respondeu ao preflight anterior.

## Próximo passo
Retentar `git push origin main` sem alterar dados remotos; se o transporte continuar bloqueado, manter o lote documental local e repetir recon/read-only no próximo tick. Prosseguir com recuperação oficial dos quatro ALRS somente quando houver HTML/evidência reproduzível, URL completa, hash, bytes e match exato.
