# QA — patrimônio declarado TSE e fail-closed histórico — 2026-08-30

## Objetivo

Validar a sincronização local dos bens declarados a partir do CSV oficial do
`dataset2026`, com exposição no dossiê, sem publicar histórico eleitoral sem
fonte oficial versionada.

## Entregue e verificado

- Gerador executado contra `../dataset2026/candidatos/bem_candidato_2026_RS.csv`.
- CSV de origem: `257288` bytes; SHA-256
  `80eb6ee969a94058d5c839271b9ceb925875d32f85b087a81d67c61b57ab4b68`.
- Catálogo gerado: `238` candidaturas com bens declarados; snapshot público
  preserva `1003` candidaturas, `988` fotos oficiais e `1` fonte TSE.
- Histórico patrimonial manual e IPCA foram removidos do gerador por não haver
  fonte oficial versionada no repositório. A evolução permanece `null` até que
  cada pleito anterior tenha URL/hash/manifesto verificável.
- Conteúdo exibido no dossiê mantém link explícito ao DivulgaCandContas/TSE.
- JSONs do catálogo e snapshot foram parseados com sucesso.

## Gates locais

- `npm run test`: 115 arquivos, 485 testes, 0 falhas.
- `npx tsc --noEmit`: 0.
- `node scripts/validate-impact-schema.mjs`: 0.
- `npm run data:check`: 0 (`1003/988/1`).
- `npm run build`: 0; Vite 243 módulos, sitemap `1003 + 2`, PWA gerado.
- `npm run smoke:local`: 0; `1002` cards, 0 falhas HTTP, 0 erros de console
  online, service worker pronto.
- `git diff --check`: 0.

## Estado, bloqueios e escopo

- Nenhuma escrita em Supabase, Cloudflare, claims, votos ou matriz de impacto.
- A worktree já continha alterações não relacionadas nos três artefatos do lote
  editorial Câmara e o diretório `.hermes/`; foram preservados e não incluídos
  neste checkpoint.
- Doctor: RC 1 por shell Node 22 (gates executados com Node 24.19.0), além de
  avisos de OpenCode/Ollama/MCP conforme saída do doctor.
- Push/deploy ainda requer verificação de transporte Git; não executar deploy
  Cloudflare fora do caminho backup autorizado.

## Próximo passo

Retentar `git push origin main` para os commits locais; se aceito, verificar o
workflow backup `334951434`, `headSha`, HTTP 200 de produção e smoke remoto.
Manter histórico patrimonial bloqueado até fonte oficial reproduzida.
